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
  const { options } = content as DefaultContent;

  // TODO: 실제 API 데이터의 answer 필드와 매칭 필요
  const mockCorrectAnswer = 'x';

  return (
    <div css={oxWrapperStyle}>
      {options.map(option => {
        const isSelected = selectedAnswer === option.id;
        const isCorrectOption = showResult && option.id === mockCorrectAnswer;
        const isWrongOption = showResult && isSelected && option.id !== mockCorrectAnswer;

        return (
          <QuizOXOption
            key={option.id}
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

const oxWrapperStyle = css`
  display: flex;
  gap: 20px;
  width: 100%;
  margin-top: 24px;
`;
