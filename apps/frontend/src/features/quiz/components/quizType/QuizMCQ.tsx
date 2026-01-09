import { css } from '@emotion/react';

import { QuizOption } from '@/feat/quiz/components/quizOptions/QuizOption';
import type { DefaultContent, QuizComponentProps } from '@/feat/quiz/types';

export const QuizMCQ = ({
  content,
  selectedAnswer,
  showResult,
  correctAnswer,
  onAnswerChange,
  disabled = false,
}: QuizComponentProps) => {
  const mcqContent = content as DefaultContent;

  const correctAnswerId = correctAnswer as string | null;
  const isCorrect = selectedAnswer === correctAnswerId;

  return (
    <div css={optionsWrapperStyle}>
      {mcqContent.options.map((option, index) => {
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
            onClick={() => onAnswerChange(option.id)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};

const optionsWrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;
