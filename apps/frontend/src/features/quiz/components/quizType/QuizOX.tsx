import { css, useTheme } from '@emotion/react';

import type { DefaultContent, QuizComponentProps } from '@/feat/quiz/types';
import type { Theme } from '@/styles/theme';

export const QuizOX = ({
  content,
  selectedAnswer,
  onAnswerChange,
  showResult,
  disabled,
}: QuizComponentProps) => {
  const theme = useTheme();
  const { choices } = content as DefaultContent;

  // 정답 확인 로직 (임시)
  const mockCorrectAnswer = 0; // "O"가 정답이라고 가정

  return (
    <div css={oxWrapperStyle}>
      {choices.map((option, index) => {
        const isSelected = selectedAnswer === index;
        const isCorrect = showResult && index === mockCorrectAnswer;
        const isWrong = showResult && isSelected && index !== mockCorrectAnswer;

        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onAnswerChange(index)}
            css={[
              oxCardStyle(theme),
              isSelected && selectedOptionStyle(theme),
              isCorrect && correctOptionStyle(theme),
              isWrong && wrongOptionStyle(theme),
              disabled && disabledOptionStyle,
            ]}
          >
            <span css={oxTextStyle}>{option}</span>
          </button>
        );
      })}
    </div>
  );
};

const oxWrapperStyle = css`
  display: flex;
  gap: 20px;
  width: 100%;
  margin-top: 24px;
`;

const oxCardStyle = (theme: Theme) => css`
  flex: 1;
  aspect-ratio: 1 / 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.surface.strong};
  border: 2px solid ${theme.colors.primary.surface};
  border-radius: ${theme.borderRadius.large};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const selectedOptionStyle = (theme: Theme) => css`
  border-color: ${theme.colors.primary.main};
  background: ${theme.colors.primary.surface};
`;

const correctOptionStyle = (theme: Theme) => css`
  border-color: ${theme.colors.success.main};
  background: ${theme.colors.success.light};
`;

const wrongOptionStyle = (theme: Theme) => css`
  border-color: ${theme.colors.error.main};
  background: ${theme.colors.error.surface};
`;

const disabledOptionStyle = css`
  cursor: not-allowed;
  opacity: 0.6;
`;

const oxTextStyle = css`
  font-size: 5rem;
`;
