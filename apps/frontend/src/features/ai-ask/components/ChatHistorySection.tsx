import { css, keyframes, useTheme } from '@emotion/react';
import React from 'react';

import { MarkdownRenderer } from '@/comp/MarkdownRenderer';
import type { AiQuestionAnswer } from '@/services/aiAskService';
import type { Theme } from '@/styles/theme';

import { getStatusLabel } from './utils';

/**
 * 채팅 히스토리 섹션 컴포넌트 Props
 */
interface ChatHistorySectionProps {
  /** 질문/답변 아이템 배열 */
  items: AiQuestionAnswer[];
  /** 현재 확장된(열린) 질문 ID 집합 */
  expandedIds: Set<number>;
  /** 질문 토글 핸들러 (질문 클릭 시 답변 표시/숨김) */
  onToggle: (id: number) => void;
}

/**
 * AI 질문/답변 히스토리를 표시하는 섹션 컴포넌트
 *
 * @description
 * - 질문 목록을 표시하고 클릭 시 답변을 확장/축소
 * - 스트리밍 중인 답변은 타이핑 애니메이션 표시
 * - 실패한 답변은 에러 메시지 표시
 * - 완료된 답변은 Markdown으로 렌더링
 *
 * @param props - 컴포넌트 props
 * @returns 채팅 히스토리 섹션 JSX 요소
 */
export const ChatHistorySection = ({ items, expandedIds, onToggle }: ChatHistorySectionProps) => {
  const theme = useTheme();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, id: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle(id);
    }
  };

  return (
    <section css={listSectionStyle} aria-label="질문 및 답변 목록">
      {items.length === 0 && (
        <div css={emptyStyle(theme)} role="status" aria-live="polite">
          등록된 질문이 없습니다.
        </div>
      )}
      {items.map(item => {
        const isExpanded = expandedIds.has(item.id);
        const statusLabel = getStatusLabel(item);
        const answerId = `answer-${item.id}`;
        const questionId = `question-${item.id}`;

        return (
          <article
            key={item.id}
            css={qaItemStyle(theme)}
            aria-labelledby={questionId}
            aria-describedby={isExpanded ? answerId : undefined}
          >
            <button
              id={questionId}
              css={qaQuestionStyle(theme)}
              onClick={() => onToggle(item.id)}
              onKeyDown={e => handleKeyDown(e, item.id)}
              aria-expanded={isExpanded}
              aria-controls={answerId}
              aria-label={`${item.question}. 상태: ${statusLabel}. 답변 ${isExpanded ? '숨기기' : '보기'}`}
            >
              {item.isMine && (
                <span css={badgeStyle(theme)} aria-label="내가 작성한 질문">
                  나의 질문
                </span>
              )}
              <span css={questionTextStyle(theme)}>{item.question}</span>
              <span css={statusStyle(theme)} aria-label={`답변 상태: ${statusLabel}`}>
                {statusLabel}
              </span>
            </button>
            {isExpanded && (
              <div
                id={answerId}
                css={qaAnswerStyle(theme)}
                role="region"
                aria-label="AI 답변"
                aria-live={item.status === 'pending' ? 'polite' : 'off'}
                aria-atomic="true"
              >
                {item.status === 'pending' && (!item.answer || item.answer.length === 0) ? (
                  <TypingDots />
                ) : (
                  <div css={answerTextStyle(theme)}>
                    {item.status === 'failed' ? (
                      <p role="alert">AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.</p>
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
  );
};

/**
 * 타이핑 중임을 나타내는 애니메이션 컴포넌트
 *
 * @description 스트리밍 중일 때 시각적 피드백을 제공하는 점 3개의 펄스 애니메이션
 * @returns 타이핑 애니메이션 JSX 요소
 */
const TypingDots = () => {
  const theme = useTheme();
  return (
    <div css={dotContainerStyle(theme)} role="status" aria-label="답변 생성 중">
      <span css={dotStyle(theme)} aria-hidden="true"></span>
      <span css={dotStyle(theme)} aria-hidden="true"></span>
      <span css={dotStyle(theme)} aria-hidden="true"></span>
    </div>
  );
};

const listSectionStyle = css`
  flex: 1;
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
