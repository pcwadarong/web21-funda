import { css, keyframes, useTheme } from '@emotion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/comp/Button';
import { CodeBlock } from '@/comp/CodeBlock';
import { MarkdownRenderer } from '@/comp/MarkdownRenderer';
import SVGIcon from '@/comp/SVGIcon';
import type { QuizQuestion } from '@/feat/quiz/types';
import type { AiQuestionAnswer } from '@/services/aiAskService';
import { getAiQuestions } from '@/services/aiAskService';
import { BASE_URL } from '@/services/api';
import { useIsLoggedIn } from '@/store/authStore';
import { useToast } from '@/store/toastStore';
import type { Theme } from '@/styles/theme';

type SseEvent = {
  event: string;
  data: string;
};

interface AiAskModalProps {
  quiz: QuizQuestion;
}

export const AiAskModal = ({ quiz }: AiAskModalProps) => {
  const theme = useTheme();
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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      return;
    }

    if (isStreaming) {
      return;
    }

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
    <div css={containerStyle}>
      <section css={summaryStyle(theme)}>
        <div css={summaryTitleStyle(theme)}>문제 정보</div>
        <div css={summaryQuestionStyle(theme)}>{`Q. ${preview.question}`}</div>
        {preview.options.length > 0 && (
          <div css={sectionBlockStyle}>
            <div css={sectionLabelStyle(theme)}>보기</div>
            <ul css={summaryListStyle(theme)}>
              {preview.options.map(option => (
                <li key={option}>{option}</li>
              ))}
            </ul>
          </div>
        )}
        {preview.matching && (
          <div css={sectionBlockStyle}>
            <div css={sectionLabelStyle(theme)}>매칭 항목</div>
            <div css={matchingGridStyle}>
              <div>
                <div css={matchingLabelStyle(theme)}>왼쪽</div>
                <ul css={summaryListStyle(theme)}>
                  {preview.matching.left.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div css={matchingLabelStyle(theme)}>오른쪽</div>
                <ul css={summaryListStyle(theme)}>
                  {preview.matching.right.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        {preview.code && (
          <div css={sectionBlockStyle}>
            <div css={sectionLabelStyle(theme)}>코드</div>
            <CodeBlock language={preview.code.language}>{preview.code.snippet}</CodeBlock>
          </div>
        )}
      </section>

      <section css={listSectionStyle}>
        {items.length === 0 && <div css={emptyStyle(theme)}>아직 등록된 질문이 없습니다.</div>}
        {items.map(item => {
          const isExpanded = expandedIds.has(item.id);
          const statusLabel = getStatusLabel(item);
          return (
            <article key={item.id} css={qaItemStyle(theme)}>
              <button css={qaQuestionStyle(theme)} onClick={() => handleToggle(item.id)}>
                {item.isMine && <span css={badgeStyle(theme)}>나의 질문</span>}
                <span css={questionTextStyle(theme)}>{item.question}</span>
                <span css={statusStyle(theme)}>{statusLabel}</span>
              </button>
              {isExpanded && (
                <div css={qaAnswerStyle(theme)}>
                  {item.status === 'pending' && (!item.answer || item.answer.length === 0) ? (
                    <TypingDots />
                  ) : (
                    <div css={answerTextStyle(theme)}>
                      {item.status === 'failed' ? (
                        'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.'
                      ) : (
                        <MarkdownRenderer text={item.answer ?? ''} />
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <form css={inputBarStyle(theme)} onSubmit={handleSubmit}>
        <input
          css={inputStyle(theme)}
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder="궁금한 것을 질문해보세요."
          maxLength={maxQuestionLength}
          disabled={isStreaming}
        />
        <Button
          type="submit"
          variant="primary"
          css={sendButtonStyle(theme)}
          aria-label="질문 전송"
          disabled={isStreaming || input.trim().length === 0}
        >
          <SVGIcon icon="NextArrow" size="sm" />
        </Button>
      </form>
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
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trimEnd();
      if (trimmed.length === 0) {
        if (dataLines.length > 0) {
          handlers.onEvent({ event: currentEvent, data: dataLines.join('\n') });
        }
        currentEvent = 'message';
        dataLines = [];
        continue;
      }

      if (trimmed.startsWith('event:')) {
        currentEvent = trimmed.replace('event:', '').trim() || 'message';
        continue;
      }

      if (trimmed.startsWith('data:')) {
        dataLines.push(trimmed.replace('data:', '').trim());
      }
    }
  }

  if (dataLines.length > 0) {
    handlers.onEvent({ event: currentEvent, data: dataLines.join('\n') });
  }
};

/**
 * JSON 파싱 실패를 안전하게 처리하기 위한 유틸.
 *
 * @param value JSON 문자열
 * @returns 파싱 결과 또는 null
 */
const parseJson = <T,>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

/**
 * 모달에 표시할 문제 정보를 간략하게 정리한다.
 * 보기/매칭/코드 정보를 텍스트 중심으로 전달하기 위해 분리한다.
 *
 * @param quiz 퀴즈 데이터
 * @returns 표시용 데이터
 */
const buildQuizPreview = (quiz: QuizQuestion) => {
  const baseQuestion = quiz.content.question;
  const options: string[] = [];

  if ('options' in quiz.content && quiz.content.options) {
    for (const option of quiz.content.options) {
      options.push(option.text);
    }
  }

  const matching =
    quiz.type === 'matching' && 'matching_metadata' in quiz.content
      ? {
          left: quiz.content.matching_metadata.left.map(item => item.text),
          right: quiz.content.matching_metadata.right.map(item => item.text),
        }
      : null;

  const code =
    quiz.type === 'code' && 'code_metadata' in quiz.content
      ? {
          language: quiz.content.code_metadata.language,
          snippet: quiz.content.code_metadata.snippet,
        }
      : null;

  return { question: baseQuestion, options, matching, code };
};

/**
 * 답변 상태에 맞는 라벨을 반환한다.
 *
 * @param item 질문/답변 아이템
 * @returns 상태 텍스트
 */
const getStatusLabel = (item: AiQuestionAnswer) => {
  if (item.status === 'pending') {
    return '답변 생성 중';
  }
  if (item.status === 'failed') {
    return '답변 실패';
  }
  return '답변 완료';
};

const TypingDots = () => {
  const theme = useTheme();
  return (
    <div css={dotContainerStyle(theme)}>
      <span css={dotStyle(theme)}></span>
      <span css={dotStyle(theme)}></span>
      <span css={dotStyle(theme)}></span>
    </div>
  );
};

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 70vh;
`;

const summaryStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.default};
  border-radius: 12px;
  padding: 16px;
`;

const summaryTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  line-height: ${theme.typography['12Bold'].lineHeight};
  color: ${theme.colors.text.weak};
  margin-bottom: 8px;
`;

const summaryQuestionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  line-height: ${theme.typography['16Bold'].lineHeight};
  color: ${theme.colors.text.strong};
  margin-bottom: 8px;
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const summaryListStyle = (theme: Theme) => css`
  margin: 0;
  padding-left: 18px;
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
`;

const sectionBlockStyle = css`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const sectionLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.text.light};
`;

const matchingGridStyle = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const matchingLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  margin-bottom: 4px;
`;

const listSectionStyle = css`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
`;

const emptyStyle = (theme: Theme) => css`
  color: ${theme.colors.text.weak};
  text-align: center;
  padding: 24px 0;
`;

const qaItemStyle = (theme: Theme) => css`
  border: 1px solid ${theme.colors.border.default};
  border-radius: 12px;
  padding: 12px;
  background: ${theme.colors.surface.strong};
`;

const qaQuestionStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: transparent;
  border: none;
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  text-align: left;
  cursor: pointer;
  flex-wrap: wrap;
`;

const questionTextStyle = (theme: Theme) => css`
  flex: 1;
  color: ${theme.colors.text.default};
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const badgeStyle = (theme: Theme) => css`
  padding: 2px 8px;
  border-radius: 12px;
  background: ${theme.colors.primary.surface};
  color: ${theme.colors.text.strong};
  font-size: ${theme.typography['12Bold'].fontSize};
  font-weight: ${theme.typography['12Bold'].fontWeight};
`;

const statusStyle = (theme: Theme) => css`
  margin-left: auto;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const qaAnswerStyle = (theme: Theme) => css`
  margin-top: 12px;
  border-top: 1px solid ${theme.colors.border.default};
  padding-top: 12px;
`;

const answerTextStyle = (theme: Theme) => css`
  white-space: pre-wrap;
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  color: ${theme.colors.text.default};
`;

const inputBarStyle = (theme: Theme) => css`
  display: flex;
  gap: 8px;
  align-items: center;
  position: sticky;
  bottom: 0;
  background: ${theme.colors.surface.strong};
  padding-top: 8px;
`;

const inputStyle = (theme: Theme) => css`
  flex: 1;
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${theme.colors.border.default};
  padding: 0 16px;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.default};
  background: ${theme.colors.surface.default};
`;

const sendButtonStyle = (theme: Theme) => css`
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 999px;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.primary.main};

  &:hover {
    transform: none;
    filter: brightness(1.03);
    box-shadow: none;
  }

  &:active {
    transform: scale(0.98);
    box-shadow: none;
  }
`;

const dotPulse = keyframes`
  0% {
    opacity: 0.3;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-2px);
  }
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
`;

const dotContainerStyle = (theme: Theme) => css`
  display: flex;
  gap: 6px;
  align-items: center;
  color: ${theme.colors.text.weak};

  span:nth-of-type(2) {
    animation-delay: 0.15s;
  }

  span:nth-of-type(3) {
    animation-delay: 0.3s;
  }
`;

const dotStyle = (theme: Theme) => css`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${theme.colors.text.weak};
  animation: ${dotPulse} 1s infinite ease-in-out;
`;
