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
  const mockCorrectAnswer = 'c1';
  const isCorrect = selectedAnswer === mockCorrectAnswer;

  return (
    <div css={optionsWrapperStyle}>
      {mcqContent.options.map((option, index) => {
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
  );
};

const optionsWrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;
