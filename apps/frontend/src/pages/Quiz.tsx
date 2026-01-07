import { css } from '@emotion/react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { QuizContentCard } from '@/feat/quiz/components/QuizContentCard';
import { QuizHeader } from '@/feat/quiz/components/QuizHeader';
import type { AnswerType, MatchingPair, QuestionStatus, QuizQuestion } from '@/feat/quiz/types';

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

/**
 * 퀴즈 풀이 페이지 컴포넌트
 * 퀴즈 데이터 로딩, 답변 상태 관리, 정답 확인 및 페이지 이동 로직을 담당합니다.
 * * @returns {JSX.Element | null} 퀴즈 화면 레이아웃
 */
export const Quiz = () => {
  const navigate = useNavigate();
  const { unitId, stepId } = useParams<{ unitId: string; stepId: string }>();

  /** 현재 풀이 중인 퀴즈의 인덱스 */
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  /** 전제 퀴즈의 사용자 선택 답변 배열 (인덱스 매칭) */
  const [selectedAnswers, setSelectedAnswers] = useState<AnswerType[]>(
    new Array(quizzes.length).fill(null),
  );

  /** 각 문제별 풀이 완료 여부 상태 배열 */
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>(
    new Array(quizzes.length).fill('idle'),
  );

  /** 현재 화면에 표시된 퀴즈의 진행 상태 */
  const [currentQuestionStatus, setCurrentQuestionStatus] = useState<QuestionStatus>('idle');

  /** 현재 활성화된 퀴즈 객체 */
  const currentQuiz = quizzes[currentQuizIndex];
  if (!currentQuiz) return null;

  /** 현재 활성화된 퀴즈에 대해 사용자가 입력한 답변 */
  const currentAnswer = selectedAnswers[currentQuizIndex];

  /**
   * 정답 확인 버튼의 비활성화 여부를 계산합니다.
   * - 정답 확인 중이거나 이미 완료된 경우 비활성화
   * - 답변이 없는 경우 비활성화
   * - 매칭형 퀴즈의 경우 모든 선지가 연결되지 않으면 비활성화
   * * @type {boolean}
   */
  const isCheckDisabled = useMemo(() => {
    if (currentQuestionStatus !== 'idle') return true;
    if (currentAnswer === null) return true;

    if (currentQuiz.type === 'matching') {
      // 매칭형: metadata의 left 개수와 현재 pairs의 개수가 정확히 일치해야 함
      const matchingAnswer = currentAnswer as { pairs: MatchingPair[] };
      const totalRequired = currentQuiz.content.matching_metadata.left.length;
      const currentPairsCount = matchingAnswer.pairs?.length || 0;

      return totalRequired !== currentPairsCount;
    }

    // 일반형(MCQ, OX, CODE): 데이터가 존재하기만 하면 활성화
    return false;
  }, [currentQuiz, currentAnswer, currentQuestionStatus]);

  /**
   * 사용자의 답변 선택 시 실행되는 핸들러
   * * @param answer 선택한 답변
   */
  const handleAnswerChange = useCallback(
    (answer: AnswerType) => {
      if (currentQuestionStatus !== 'idle') return;
      setSelectedAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentQuizIndex] = answer;
        return newAnswers;
      });
    },
    [currentQuizIndex, currentQuestionStatus],
  );

  /**
   * 정답 확인 버튼 클릭 시 실행되는 핸들러
   * 서버 통신 시뮬레이션 후 상태를 'checked'로 변경합니다.
   */
  const handleCheckAnswer = useCallback(async () => {
    setCurrentQuestionStatus('checking');

    // TODO: 실제 요청 시간으로 수정
    await new Promise(resolve => setTimeout(resolve, 800));

    setCurrentQuestionStatus('checked');
    setQuestionStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[currentQuizIndex] = 'checked';
      return newStatuses;
    });
  }, [selectedAnswers, currentQuestionStatus, currentQuizIndex]);

  /** 마지막 문제 여부 */
  const isLastQuestion = currentQuizIndex === quizzes.length - 1;

  /**
   * 다음 문제로 이동하거나 결과 페이지로 이동하는 핸들러
   */
  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion) navigate(`/quiz/result`);
    else {
      const nextIndex = currentQuizIndex + 1;
      setCurrentQuizIndex(nextIndex);
      // 다음 문제가 이미 풀었던 문제라면 해당 상태를 유지, 아니면 'idle'
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
          isSubmitDisabled={isCheckDisabled}
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
