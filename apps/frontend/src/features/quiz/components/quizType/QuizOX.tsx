import { css } from '@emotion/react';

import { QuizOXOption } from '@/feat/quiz/components/quizOptions/QuizOXOption';
import type { DefaultContent, QuizComponentProps } from '@/feat/quiz/types';

export const QuizOX = ({
  content,
  selectedAnswer,
  correctAnswer,
  onAnswerChange,
  showResult,
  disabled = false,
}: QuizComponentProps) => {
  const { options } = content as DefaultContent;

  const correctAnswerId = correctAnswer as string | null;

  return (
    <div css={oxWrapperStyle}>
      {options.map(option => {
        const isSelected = selectedAnswer === option.id;
        const isCorrectOption =
          showResult && correctAnswerId !== null && option.id === correctAnswerId;
        const isWrongOption =
          showResult && isSelected && correctAnswerId !== null && option.id !== correctAnswerId;

        return (
          <QuizOXOption
            key={option.id}
            option={option.text}
            isSelected={isSelected}
            isCorrect={isCorrectOption}
            isWrong={isWrongOption}
            onClick={() => onAnswerChange(option.id)}
            disabled={disabled || showResult}
          />
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
