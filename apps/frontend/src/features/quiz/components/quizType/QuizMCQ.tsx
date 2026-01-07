import { css } from '@emotion/react';

import { QuizOption } from '@/feat/quiz/components/quizOptions/QuizOption';
import type { DefaultContent, QuizComponentProps } from '@/feat/quiz/types';

export const QuizMCQ = ({
  content,
  selectedAnswer,
  showResult,
  onAnswerChange,
  disabled = false,
}: QuizComponentProps) => {
  const mcqContent = content as DefaultContent;

  // TODO: 실제 API 데이터의 answer 필드와 매칭 필요
  const mockCorrectAnswer = 0;
  const isCorrect = selectedAnswer === mockCorrectAnswer;

  return (
    <div css={optionsWrapperStyle}>
      {mcqContent.options.map((option, index) => {
        const label = String.fromCharCode(65 + index);
        const isSelected = selectedAnswer === index;
        const isCorrectOption = showResult && index === mockCorrectAnswer;
        const isWrongOption = showResult && isSelected && !isCorrect;

        return (
          <QuizOption
            key={index}
            label={label}
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

const optionsWrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;
