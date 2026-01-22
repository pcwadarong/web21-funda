import { css, useTheme } from '@emotion/react';

import * as S from '@/feat/quiz/components/quizOptions/QuizOption.styles';
import type { QuizOptionProps } from '@/features/quiz//types';
import type { Theme } from '@/styles/theme';
import { TextWithCodeStyle } from '@/utils/textParser';

export const QuizOption = ({
  label,
  option,
  isSelected,
  isCorrect,
  isWrong,
  onClick,
  disabled = false,
}: QuizOptionProps) => {
  const theme = useTheme();

  return (
    <button
      css={[
        optionBaseStyle(theme),
        S.commonHoverStyle(theme),
        isSelected && S.selectedOptionStyle(theme),
        isCorrect && S.correctOptionStyle(theme),
        isWrong && S.wrongOptionStyle(theme),
        disabled && S.disabledOptionStyle,
      ]}
      onClick={onClick}
      disabled={disabled}
    >
      <span css={optionLabelStyle(theme, isSelected, isCorrect, isWrong)}>{label}</span>
      <span css={optionTextStyle(theme)}>
        <TextWithCodeStyle text={option} />
      </span>
    </button>
  );
};

const optionBaseStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: ${theme.colors.surface.strong};
  border: 2px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: all 150ms ease;
  text-align: left;
  width: 100%;
`;

const optionLabelStyle = (
  theme: Theme,
  isSelected: boolean,
  isCorrect?: boolean,
  isWrong?: boolean,
) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  flex-shrink: 0;

  ${isSelected &&
  !isCorrect &&
  !isWrong &&
  css`
    background: ${theme.colors.primary.main};
    color: ${theme.colors.surface.strong};
  `}

  ${isCorrect &&
  css`
    background: ${theme.colors.success.main};
    color: ${theme.colors.surface.strong};
  `}

  ${isWrong &&
  css`
    background: ${theme.colors.error.main};
    color: ${theme.colors.surface.strong};
  `}

  ${!isSelected &&
  !isCorrect &&
  !isWrong &&
  css`
    background: ${theme.colors.surface.default};
    color: ${theme.colors.text.default};
    border: 2px solid ${theme.colors.border.default};
  `}
`;

const optionTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.strong};
`;
