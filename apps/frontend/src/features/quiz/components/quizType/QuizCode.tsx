import { css, useTheme } from '@emotion/react';

import { CodeBlock } from '@/comp/CodeBlock';
import { QuizOption } from '@/feat/quiz/components/quizOptions/QuizOption';
import type { CodeContent, QuizComponentProps } from '@/feat/quiz/types';
import type { Theme } from '@/styles/theme';

export const QuizCode = ({
  content,
  selectedAnswer,
  showResult,
  onAnswerChange,
  disabled = false,
}: QuizComponentProps) => {
  const theme = useTheme();

  const codeContent = content as CodeContent;
  const { code_metadata, options } = codeContent;

  // TODO: 실제 API 데이터의 answer 필드와 매칭 필요 (현재는 임시로 0번)
  const mockCorrectAnswer = 'c2';
  const isCorrect = selectedAnswer === mockCorrectAnswer;

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
          const isCorrectOption = showResult && option.id === mockCorrectAnswer;
          const isWrongOption = showResult && isSelected && !isCorrect;

          return (
            <QuizOption
              key={option.id}
              label={String.fromCharCode(65 + index)}
              option={option.text}
              isSelected={isSelected}
              isCorrect={isCorrectOption}
              isWrong={isWrongOption}
              onClick={() => onAnswerChange(option.id)}
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
  margin-bottom: 24px;
`;
