import { css } from '@emotion/react';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { QuizContentCard } from '@/feat/quiz/components/QuizContentCard';
import { QuizHeader } from '@/feat/quiz/components/QuizHeader';
import type { QuestionStatus, QuizQuestion } from '@/feat/quiz/types';

// TODO: 실제 데이터는 MSW 또는 API 호출로 대체
const quizzes: QuizQuestion[] = [
  {
    id: 1,
    type: 'ox',
    content: {
      question: ':nth-child(2)는 같은 타입(type)의 두 번째 요소만 선택한다.',
      options: [
        { id: 'o', text: 'O' },
        { id: 'x', text: 'X' },
      ],
    },
  },
  {
    id: 2,
    type: 'mcq',
    content: {
      question: ':not(.active)는 어떤 요소를 선택하는가?',
      options: [
        { id: 'c1', text: 'active 클래스를 가진 요소' },
        { id: 'c2', text: 'active 클래스를 가지지 않은 요소' },
        { id: 'c3', text: 'active 클래스를 가진 자식 요소' },
        { id: 'c4', text: 'active 클래스를 가진 형제 요소' },
      ],
    },
  },
  {
    id: 3,
    type: 'matching',
    content: {
      question: '선택자와 의미를 올바르게 연결하세요.',
      matching_metadata: {
        left: ['div p', 'div > p', 'h1 + p', 'h1 ~ p'],
        right: ['div의 모든 자손 p', 'div의 직계 자식 p', 'h1 바로 다음 p', 'h1 뒤의 모든 형제 p'],
      },
    },
  },
  {
    id: 4,
    type: 'code',
    content: {
      question: 'data-state가 "open"인 요소만 선택하려고 합니다. 빈칸에 들어갈 선택자를 고르세요.',
      options: [
        { id: 'c1', text: '[data-state="open"]' },
        { id: 'c2', text: '[data-state^="open"]' },
        { id: 'c3', text: '[data-state*="open"]' },
        { id: 'c4', text: '[data-state$="open"]' },
      ],
      code_metadata: {
        language: 'css',
        snippet: '{{BLANK}} {\n  opacity: 1;\n}',
      },
    },
  },
  {
    id: 5,
    type: 'mcq',
    content: {
      question: '가상 요소(pseudo-element)로 올바른 것은?',
      options: [
        { id: 'c1', text: ':hover' },
        { id: 'c2', text: '::before' },
        { id: 'c3', text: ':nth-child(2)' },
        { id: 'c4', text: ':not(.a)' },
      ],
    },
  },
];

export const Quiz = () => {
  const navigate = useNavigate();
  const { unitId, stepId } = useParams<{ unitId: string; stepId: string }>();

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<any[]>(
    new Array(quizzes.length).fill(null),
  );
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>(
    new Array(quizzes.length).fill('idle'),
  );
  const [currentQuestionStatus, setCurrentQuestionStatus] = useState<QuestionStatus>('idle');

  const currentQuiz = quizzes[currentQuizIndex];
  if (!currentQuiz) return null;

  const isLastQuestion = currentQuizIndex === quizzes.length - 1;

  const handleAnswerChange = useCallback(
    (answer: any) => {
      if (currentQuestionStatus !== 'idle') return;
      setSelectedAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentQuizIndex] = answer;
        return newAnswers;
      });
    },
    [currentQuizIndex, currentQuestionStatus],
  );

  const handleCheckAnswer = useCallback(async () => {
    if (selectedAnswers[currentQuizIndex] === null || currentQuestionStatus !== 'idle') return;
    setCurrentQuestionStatus('checking');

    // 정답 확인 시뮬레이션 (Second Request 대용)
    await new Promise(resolve => setTimeout(resolve, 800));

    setCurrentQuestionStatus('checked');
    setQuestionStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[currentQuizIndex] = 'checked';
      return newStatuses;
    });
  }, [selectedAnswers, currentQuestionStatus, currentQuizIndex]);

  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion) navigate(`/quiz/${unitId}/${stepId}/result`);
    else {
      const nextIndex = currentQuizIndex + 1;
      setCurrentQuizIndex(nextIndex);
      setCurrentQuestionStatus(questionStatuses[nextIndex] || 'idle');
    }
  }, [isLastQuestion, navigate, unitId, stepId, questionStatuses, currentQuizIndex]);

  return (
    <div css={containerStyle}>
      <QuizHeader
        currentStep={currentQuizIndex + 1}
        totalSteps={quizzes.length}
        completedSteps={questionStatuses.filter(s => s === 'checked').length}
      />
      <main css={mainStyle}>
        <QuizContentCard
          question={currentQuiz}
          status={currentQuestionStatus}
          selectedAnswer={selectedAnswers[currentQuizIndex]}
          onAnswerChange={handleAnswerChange}
          onCheck={handleCheckAnswer}
          onNext={handleNextQuestion}
          isLast={isLastQuestion}
        />
      </main>
    </div>
  );
};

const containerStyle = css`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;
const mainStyle = css`
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;
`;
