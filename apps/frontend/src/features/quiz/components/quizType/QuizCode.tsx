import { css, useTheme } from '@emotion/react';

import { CodeBlock } from '@/comp/CodeBlock';
import { QuizOption } from '@/feat/quiz/components/quizOptions/QuizOption';
import type { CodeContent, QuizComponentProps } from '@/feat/quiz/types';
import type { Theme } from '@/styles/theme';

export const QuizCode = ({
  content,
  selectedAnswer,
  showResult,
  correctAnswer,
  onAnswerChange,
  onSelectPosition,
  disabled = false,
}: QuizComponentProps) => {
  const theme = useTheme();

  const codeContent = content as CodeContent;
  const { code_metadata, options } = codeContent;

  const correctAnswerId = correctAnswer as string | null;
  const isCorrect = selectedAnswer === correctAnswerId;

  return (
    <div css={quizCardStyle(theme)}>
      {code_metadata && (
        <div css={codeBlockWrapperStyle}>
          <CodeBlock language={code_metadata.language}>{code_metadata.snippet}</CodeBlock>
        </div>
      )}

      <div css={optionsWrapperStyle}>
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrectOption =
            showResult && correctAnswerId !== null && option.id === correctAnswerId;
          const isWrongOption = showResult && isSelected && correctAnswerId !== null && !isCorrect;

          return (
            <QuizOption
              key={option.id}
              label={String.fromCharCode(65 + index)}
              option={option.text}
              isSelected={isSelected}
              isCorrect={isCorrectOption}
              isWrong={isWrongOption}
              onClick={event => {
                onAnswerChange(option.id);
                if (!onSelectPosition) return;
                const rect = event.currentTarget.getBoundingClientRect();
                onSelectPosition({
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                });
              }}
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
};

const quizCardStyle = (theme: Theme) => css`
  width: 100%;
  background: ${theme.colors.surface.strong};
`;

const codeBlockWrapperStyle = css`
  margin-bottom: 24px;
`;

const optionsWrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
