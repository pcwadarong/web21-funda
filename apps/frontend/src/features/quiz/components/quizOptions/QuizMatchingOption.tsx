import { css, useTheme } from '@emotion/react';
import { forwardRef } from 'react';

import * as S from '@/feat/quiz/components/quizOptions/QuizOption.styles';
import type { QuizOptionProps } from '@/features/quiz/types';
import type { Theme } from '@/styles/theme';
import { TextWithCodeStyle } from '@/utils/textParser';

export const QuizMatchingOption = forwardRef<HTMLButtonElement, QuizOptionProps>(
  ({ option, isSelected, isMatched, isCorrect, isWrong, onClick, disabled }, ref) => {
    const theme = useTheme();

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        css={[
          matchingBaseStyle(theme),
          S.commonHoverStyle(theme),
          isSelected && S.selectedOptionStyle(theme),
          isMatched && matchedStyle(theme),
          isCorrect && S.correctOptionStyle(theme),
          isWrong && S.wrongOptionStyle(theme),
          disabled && S.disabledOptionStyle,
        ]}
      >
        <span css={matchingTextStyle(theme)}>
          <TextWithCodeStyle text={option} />
        </span>
      </button>
    );
  },
);

const matchingBaseStyle = (theme: Theme) => css`
  width: 100%;
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.surface.strong};
  border: 2px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: all 150ms ease;
  min-height: 80px;
`;

const matchingTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  color: ${theme.colors.text.strong};
  text-align: center;
`;

const matchedStyle = (theme: Theme) => css`
  opacity: 0.7;
  background: ${theme.colors.surface.default};
  border-style: dashed;
`;
