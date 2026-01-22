import { css, keyframes, useTheme } from '@emotion/react';

import { MarkdownRenderer } from '@/comp/MarkdownRenderer';
import type { AiQuestionAnswer } from '@/services/aiAskService';
import type { Theme } from '@/styles/theme';

import { getStatusLabel } from './utils';

interface ChatHistorySectionProps {
  items: AiQuestionAnswer[];
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
}

export const ChatHistorySection = ({ items, expandedIds, onToggle }: ChatHistorySectionProps) => {
  const theme = useTheme();

  return (
    <section css={listSectionStyle}>
      {items.length === 0 && <div css={emptyStyle(theme)}>등록된 질문이 없습니다.</div>}
      {items.map(item => {
        const isExpanded = expandedIds.has(item.id);
        const statusLabel = getStatusLabel(item);
        return (
          <article key={item.id} css={qaItemStyle(theme)}>
            <button css={qaQuestionStyle(theme)} onClick={() => onToggle(item.id)}>
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
  );
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
