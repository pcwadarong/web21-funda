import { css } from '@emotion/react';

import { QuizOXOption } from '@/feat/quiz/components/quizOptions/QuizOXOption';
import type { DefaultContent, QuizComponentProps } from '@/feat/quiz/types';

export const QuizOX = ({
  content,
  selectedAnswer,
  onAnswerChange,
  showResult,
  disabled,
}: QuizComponentProps) => {
  const { choices } = content as DefaultContent;

  // TODO: 실제 API 데이터의 answer 필드와 매칭 필요
  const mockCorrectAnswer = 0;

  return (
    <div css={oxWrapperStyle}>
      {choices.map((option, index) => {
        const isSelected = selectedAnswer === index;
        const isCorrectOption = showResult && index === mockCorrectAnswer;
        const isWrongOption = showResult && isSelected && index !== mockCorrectAnswer;

        return (
          <QuizOXOption
            key={index}
            option={option}
            isSelected={isSelected}
            isCorrect={isCorrectOption}
            isWrong={isWrongOption}
            onClick={() => onAnswerChange(index)}
            disabled={disabled}
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
