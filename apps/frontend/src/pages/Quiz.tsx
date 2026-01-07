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
    question:
      'A와 B가 통신할 때, 데이터의 순서 보장과 오류 검출 및 재전송을 담당하는 OSI 계층은 어디인가요?',
    options: [
      '물리 계층 (Physical Layer)',
      '네트워크 계층 (Network Layer)',
      '전송 계층 (Transport Layer)',
      '세션 계층 (Session Layer)',
    ],
    correctAnswer: 2,
  },
  {
    id: 2,
    question: '다음 코드에서 빈칸에 들어갈 메서드는?',
    code: `const arr = [1, 2, 3, 4, 5];\nconst doubled = arr.{{BLANK}}(x => x * 2);\nconsole.log(doubled); // [2, 4, 6, 8, 10]`,
    options: ['filter', 'map', 'reduce', 'forEach', 'for ... of'],
    correctAnswer: 1,
    explanation: 'map() 메서드는 배열의 각 요소를 변환하여 새로운 배열을 반환합니다.',
  },
  {
    id: 3,
    question:
      '브라우저에 www.google.com을 처음 입력했을 때, IP 주소를 알아내기 위해 질의하는 순서로 올바른 것은? (캐시가 없다고 가정)',
    options: [
      'Root DNS → TLD(.com) DNS → Authoritative(google.com) DNS',
      'Authoritative DNS → Root DNS → TLD DNS',
      'TLD DNS → Root DNS → Authoritative DNS',
      'Local DNS가 임의로 IP를 생성하여 응답',
    ],
    correctAnswer: 0,
  },
  {
    id: 4,
    question: 'CSS Box Model의 구성 요소를 안쪽에서 바깥쪽 순서로 올바르게 나열한 것은?',
    options: [
      'margin → border → padding → content',
      'content → padding → border → margin',
      'padding → content → margin → border',
      'content → border → padding → margin',
    ],
    correctAnswer: 1,
  },
  {
    id: 5,
    question: 'JavaScript에서 변수 호이스팅(hoisting) 이 발생하는 이유와 가장 관련 깊은 개념은?',
    options: [
      '이벤트 루프(Event Loop)',
      '실행 컨텍스트(Execution Context)',
      '프로토타입 체인(Prototype Chain)',
      '클로저(Closure)',
    ],
    correctAnswer: 1,
  },
  {
    id: 6,
    question: '다음 중 의미(semantic) 를 가장 잘 드러내는 HTML 태그는 무엇인가요?',
    options: ['<div>', '<span>', '<section>', '<b>'],
    correctAnswer: 1,
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
