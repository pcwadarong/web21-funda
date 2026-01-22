import { css } from '@emotion/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { CorrectAnswerType, QuizQuestion } from '@/feat/quiz/types';
import type { AiQuestionAnswer } from '@/services/aiAskService';
import { getAiQuestions } from '@/services/aiAskService';
import { BASE_URL } from '@/services/api';
import { useIsLoggedIn } from '@/store/authStore';
import { useToast } from '@/store/toastStore';

import { ChatHistorySection } from './ChatHistorySection';
import { ChatInputFooter } from './ChatInputFooter';
import { QuizInfoSection } from './QuizInfoSection';
import type { SseEvent } from './types';
import { buildQuizPreview, parseJson } from './utils';

interface AiAskModalProps {
  quiz: QuizQuestion;
  correctAnswer: CorrectAnswerType | null;
}

export const AiAskModal = ({ quiz, correctAnswer }: AiAskModalProps) => {
  const [items, setItems] = useState<AiQuestionAnswer[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const currentItemIdRef = useRef<number | null>(null);
  const isLoggedIn = useIsLoggedIn();
  const { showToast } = useToast();
  const maxQuestionLength = 1000;

  const preview = useMemo(() => buildQuizPreview(quiz), [quiz]);

  useEffect(() => {
    const load = async () => {
      const fetched = await getAiQuestions(quiz.id);
      setItems(fetched);
    };

    load();
  }, [quiz.id]);

  const handleToggle = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (trimmed.length === 0) return;
    if (isStreaming) return;

    if (!isLoggedIn) {
      showToast('AI 질문을 하시려면 로그인이 필요합니다.');
      return;
    }

    if (trimmed.length > maxQuestionLength) {
      showToast(`질문은 ${maxQuestionLength}자 이하로 입력해주세요.`);
      return;
    }

    const tempId = -Date.now();
    const pendingItem: AiQuestionAnswer = {
      id: tempId,
      quizId: quiz.id,
      question: trimmed,
      answer: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      isMine: true,
    };

    currentItemIdRef.current = tempId;
    setItems(prev => [pendingItem, ...prev]);
    setExpandedIds(prev => new Set(prev).add(tempId));
    setInput('');
    setIsStreaming(true);

    try {
      await streamAiAnswer(quiz.id, trimmed, {
        onEvent: eventPayload => handleStreamEvent(eventPayload, tempId),
      });
    } catch {
      markFailed(currentItemIdRef.current);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleStreamEvent = (eventPayload: SseEvent, tempId: number) => {
    if (eventPayload.event === 'meta') {
      const meta = parseJson<AiQuestionAnswer>(eventPayload.data);
      if (!meta) {
        return;
      }
      replaceItem(tempId, meta);
      updateExpandedId(tempId, meta.id);
      currentItemIdRef.current = meta.id;
      return;
    }

    if (eventPayload.event === 'chunk') {
      const chunkPayload = parseJson<{ chunk: string }>(eventPayload.data);
      if (!chunkPayload) {
        return;
      }
      appendAnswer(chunkPayload.chunk);
      return;
    }

    if (eventPayload.event === 'done') {
      const donePayload = parseJson<AiQuestionAnswer>(eventPayload.data);
      if (!donePayload) {
        return;
      }
      replaceItem(currentItemIdRef.current, donePayload);
      return;
    }

    if (eventPayload.event === 'error') {
      markFailed(currentItemIdRef.current);
    }
  };

  const appendAnswer = (chunk: string) => {
    const targetId = currentItemIdRef.current;
    if (targetId === null) {
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.id !== targetId) {
          return item;
        }

        const mergedAnswer = `${item.answer ?? ''}${chunk}`;
        return { ...item, answer: mergedAnswer };
      }),
    );
  };

  const replaceItem = (targetId: number | null, next: AiQuestionAnswer) => {
    if (targetId === null) {
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.id !== targetId) {
          return item;
        }
        return { ...item, ...next };
      }),
    );
  };

  const markFailed = (targetId: number | null) => {
    if (targetId === null) {
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.id !== targetId) {
          return item;
        }
        return { ...item, status: 'failed' };
      }),
    );
  };

  const updateExpandedId = (prevId: number, nextId: number) => {
    setExpandedIds(prev => {
      if (!prev.has(prevId)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(prevId);
      next.add(nextId);
      return next;
    });
  };

  return (
    <div css={modalWrapperStyle}>
      <div css={containerStyle}>
        <QuizInfoSection preview={preview} correctAnswer={correctAnswer} />
        <ChatHistorySection items={items} expandedIds={expandedIds} onToggle={handleToggle} />
      </div>
      <ChatInputFooter
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isStreaming={isStreaming}
        maxQuestionLength={maxQuestionLength}
      />
      <div style={{ height: '120px' }}></div>
    </div>
  );
};

/**
 * SSE 스트림을 받아 이벤트 단위로 분리해 전달한다.
 *
 * @param quizId 퀴즈 ID
 * @param question 사용자 질문
 * @param handlers 이벤트 핸들러
 */
const streamAiAnswer = async (
  quizId: number,
  question: string,
  handlers: {
    onEvent: (event: SseEvent) => void;
  },
) => {
  const url = `${BASE_URL.replace(/\/$/, '')}/quizzes/${quizId}/ai-questions/stream`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ question }),
  });

  if (!response.ok || !response.body) {
    throw new Error('스트리밍 요청에 실패했습니다.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  let currentEvent = 'message';
  let dataLines: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trimEnd();
      if (trimmed.length === 0) {
        if (dataLines.length > 0)
          handlers.onEvent({ event: currentEvent, data: dataLines.join('\n') });

        currentEvent = 'message';
        dataLines = [];
        continue;
      }

      if (trimmed.startsWith('event:')) {
        currentEvent = trimmed.replace('event:', '').trim() || 'message';
        continue;
      }

      if (trimmed.startsWith('data:')) dataLines.push(trimmed.replace('data:', '').trim());
    }
  }

  if (dataLines.length > 0) handlers.onEvent({ event: currentEvent, data: dataLines.join('\n') });
};

const modalWrapperStyle = css`
  height: 70vh;
  display: flex;
  flex-direction: column;
`;

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
`;
