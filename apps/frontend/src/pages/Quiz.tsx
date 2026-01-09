import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { QuizContentCard } from '@/feat/quiz/components/QuizContentCard';
import { QuizHeader } from '@/feat/quiz/components/QuizHeader';
import type {
  AnswerType,
  CorrectAnswerType,
  MatchingPair,
  QuestionStatus,
  QuizQuestion,
} from '@/feat/quiz/types';
import { useStorage } from '@/hooks/useStorage';
// import { quizService } from '@/services/quizService';

/**
 * 퀴즈 풀이 페이지 컴포넌트
 * 퀴즈 데이터 로딩, 답변 상태 관리, 정답 확인 및 페이지 이동 로직을 담당합니다.
 * * @returns {JSX.Element | null} 퀴즈 화면 레이아웃
 */
export const Quiz = () => {
  const { uiState, addStepHistory } = useStorage();
  const navigate = useNavigate();
  const { unitId, stepId } = useParams<{ unitId: string; stepId: string }>();
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  /** 현재 풀이 중인 퀴즈의 인덱스 */
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<AnswerType[]>([]);
  /** 각 문제별 풀이 완료 여부 상태 배열 */
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
  /** 현재 화면에 표시된 퀴즈의 진행 상태 */
  const [currentQuestionStatus, setCurrentQuestionStatus] = useState<QuestionStatus>('idle');
  /** 각 문제별 정답 및 해설 저장 */
  const [quizSolutions, setQuizSolutions] = useState<
    Array<{ correctAnswer: CorrectAnswerType; explanation: string } | null>
  >(new Array(quizzes.length).fill(null));

  // localStorage에서 필드 슬러그 가져오기
  const step_id = uiState.current_quiz_step_id;

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!step_id) {
        console.error('step_id 없습니다');
        return;
      }
      try {
        // units 데이터 가져오기
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
        // quizzes 데이터 가져오기
        const quizzesResponse = await fetch(`${API_BASE_URL}/steps/${step_id}/quizzes`);
        if (!quizzesResponse.ok) throw new Error('Quizzes 데이터 로드 실패');

        const quizzesData = await quizzesResponse.json();

        setQuizzes(quizzesData);

        setSelectedAnswers(new Array(quizzesData.length).fill(null));
        setQuestionStatuses(new Array(quizzesData.length).fill('idle'));

        setQuizSolutions(new Array(quizzesData.length).fill(null));
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchQuizzes();
  }, [step_id]);

  /** 현재 활성화된 퀴즈 객체 */
  const currentQuiz = quizzes[currentQuizIndex];

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
    if (!currentQuiz) return true;
    if (currentQuestionStatus !== 'idle') return true;
    if (currentAnswer === null) return true;

    if (currentQuiz.type === 'matching') {
      // 매칭형: metadata의 left 개수와 현재 pairs의 개수가 정확히 일치해야 함
      const matchingAnswer = currentAnswer as { pairs: MatchingPair[] };
      const totalRequired = currentQuiz.content.matching_metadata?.left?.length;
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
   * 서버 통신 후 상태를 'checked'로 변경합니다.
   */
  const handleCheckAnswer = useCallback(async () => {
    if (!currentQuiz || !currentAnswer) return;
    setCurrentQuestionStatus('checking');

    try {
      const payload =
        currentQuiz.type === 'matching'
          ? {
              quiz_id: currentQuiz.id,
              type: 'MATCHING',
              selection: { pairs: (currentAnswer as { pairs: MatchingPair[] }).pairs },
            }
          : {
              quiz_id: currentQuiz.id,
              type: currentQuiz.type.toUpperCase(),
              selection: { option_id: currentAnswer as string },
            };

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
      const res = await fetch(`${API_BASE_URL}/quizzes/${currentQuiz.id}/submissions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('정답 확인 실패');

      const result = await res.json();
      const correctAnswer = result.solution?.correct_pairs
        ? { pairs: result.solution.correct_pairs }
        : (result.solution?.correct_option_id ?? null);

      setQuizSolutions(prev => {
        const newSolutions = [...prev];
        newSolutions[currentQuizIndex] = {
          correctAnswer,
          explanation: result.solution?.explanation ?? '',
        };
        return newSolutions;
      });

      setCurrentQuestionStatus('checked');
      setQuestionStatuses(prev => {
        const newStatuses = [...prev];
        newStatuses[currentQuizIndex] = 'checked';
        return newStatuses;
      });
    } catch (_error) {
      // 에러 발생 시에도 상태를 checked로 변경하여 사용자가 다음 문제로 넘어갈 수 있도록 함
      setCurrentQuestionStatus('checked');
      setQuestionStatuses(prev => {
        const newStatuses = [...prev];
        newStatuses[currentQuizIndex] = 'checked';
        return newStatuses;
      });
    }

    setCurrentQuestionStatus('checked');
    setQuestionStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[currentQuizIndex] = 'checked';
      return newStatuses;
    });
  }, [currentAnswer, currentQuiz, currentQuizIndex]);

  /** 마지막 문제 여부 */
  const isLastQuestion = currentQuizIndex === quizzes.length - 1;

  /**
   * 다음 문제로 이동하거나 결과 페이지로 이동하는 핸들러
   */
  const handleNextQuestion = useCallback(() => {
    if (!currentQuiz) return;
    if (isLastQuestion) {
      navigate(`/quiz/result`);
      addStepHistory(currentQuiz.id);
    } else {
      const nextIndex = currentQuizIndex + 1;
      setCurrentQuizIndex(nextIndex);
      // 다음 문제가 이미 풀었던 문제라면 해당 상태를 유지, 아니면 'idle'
      setCurrentQuestionStatus(questionStatuses[nextIndex] || 'idle');
    }
  }, [isLastQuestion, navigate, unitId, stepId, questionStatuses, currentQuizIndex]);
  if (!quizzes || quizzes.length === 0 || !currentQuiz) {
    return (
      <div css={containerStyle}>
        <div style={{ padding: '20px' }}>데이터를 불러오는 중입니다...</div>
      </div>
    );
  }
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
          selectedAnswer={selectedAnswers[currentQuizIndex] ?? null}
          correctAnswer={quizSolutions[currentQuizIndex]?.correctAnswer ?? null}
          explanation={quizSolutions[currentQuizIndex]?.explanation ?? ''}
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
