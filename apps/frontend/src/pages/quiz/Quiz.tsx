import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import correctSound from '@/assets/audio/correct.mp3';
import wrongSound from '@/assets/audio/wrong.mp3';
import { QuizContainer } from '@/feat/quiz/components/QuizContainer';
import { QuizLoadErrorView } from '@/feat/quiz/components/QuizLoadErrorView';
import { QuizLoadingView } from '@/feat/quiz/components/QuizLoadingView';
import type {
  AnswerType,
  CorrectAnswerType,
  MatchingPair,
  QuestionStatus,
  QuizQuestion,
} from '@/feat/quiz/types';
import { useSound } from '@/hooks/useSound';
import { useStorage } from '@/hooks/useStorage';
import { shuffleQuizOptions } from '@/pages/quiz/utils/shuffleQuizOptions';
import { authService } from '@/services/authService';
import { progressService } from '@/services/progressService';
import { quizService, type QuizSubmissionRequest } from '@/services/quizService';
import { useAuthActions, useAuthUser, useIsAuthReady, useIsLoggedIn } from '@/store/authStore';
import { shuffleArray } from '@/utils/shuffleArray';

/**
 * 비로그인 사용자 결과 데이터 타입
 */
type GuestStepResult = {
  score: number;
  experience: number;
  correctCount: number;
  totalQuizzes: number;
  answeredQuizzes: number;
  successRate: number;
  durationSeconds: number;
  firstSolve: boolean;
};

/**
 * 퀴즈 풀이 페이지 컴포넌트
 * 퀴즈 데이터 로딩, 답변 상태 관리, 정답 확인 및 페이지 이동 로직을 담당합니다.
 */
export const Quiz = () => {
  const {
    uiState,
    addStepHistory,
    updateLastSolvedUnit,
    startGuestStepAttempt,
    addGuestStepAnswer,
    finalizeGuestStepAttempt,
    getGuestStepAttempt,
    progress,
    updateProgress,
  } = useStorage();

  const isLoggedIn = useIsLoggedIn();
  const user = useAuthUser();
  const isAuthReady = useIsAuthReady();
  const { setUser } = useAuthActions();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [stepAttemptId, setStepAttemptId] = useState<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // -----------------------------------------------------------------------------
  // 표시 값 / 파생 값
  /** 하트 개수 */
  const heartCount = user ? user.heartCount : progress.heart;

  /** orderIndex가 4 또는 5일 때만 heart 표시 */
  const showHeart =
    uiState.current_step_order_index === 4 || uiState.current_step_order_index === 5;

  /** 불러온 문제 배열 */
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);

  /** 각 문제별 정답 및 해설 저장 */
  const [quizSolutions, setQuizSolutions] = useState<
    Array<{ correctAnswer: CorrectAnswerType | null; explanation: string } | null>
  >([]);

  /** 사용자가 입력한 답변 배열 */
  const [selectedAnswers, setSelectedAnswers] = useState<AnswerType[]>([]);

  /** 각 문제별 풀이 완료 여부 상태 배열 */
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);

  /** 문제 하나라도 풀었을 때 */
  const hasProgress = questionStatuses.some((status: QuestionStatus) => status !== 'idle');

  /** 현재 풀이 중인 퀴즈의 인덱스 */
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  /** 현재 활성화된 퀴즈 객체 */
  const currentQuiz = quizzes[currentQuizIndex];

  /** 현재 화면에 표시된 퀴즈의 진행 상태 */
  const [currentQuestionStatus, setCurrentQuestionStatus] = useState<QuestionStatus>('idle');

  /** 현재 활성화된 퀴즈에 대해 사용자가 입력한 답변 */
  const currentAnswer = selectedAnswers[currentQuizIndex];

  /** 현재 진행할 스텝 ID */
  const step_id = uiState.current_quiz_step_id;
  const isReviewMode = searchParams.get('mode') === 'review';

  /** 리뷰 모드에서 불러온 퀴즈 데이터 */
  const reviewQuizzesFromState = useMemo(() => {
    const state = location.state as { reviewQuizzes?: QuizQuestion[] } | null;
    return state?.reviewQuizzes ?? null;
  }, [location.state]);

  /** 효과음 재생 */
  const { playSound } = useSound();

  /** 퀴즈 한 개당 기본 점수 */
  const baseScorePerQuiz = 3;

  // -----------------------------------------------------------------------------
  // 유틸 함수
  /**
   * 퀴즈 배열을 상태에 반영하는 헬퍼
   */
  const initializeQuizState = useCallback((finalQuizzes: QuizQuestion[]) => {
    setQuizzes(finalQuizzes);
    setSelectedAnswers(new Array(finalQuizzes.length).fill(null));
    setQuestionStatuses(new Array(finalQuizzes.length).fill('idle'));
    setQuizSolutions(new Array(finalQuizzes.length).fill(null));
  }, []);

  /**
   * 세션 스토리지에 저장된 가공 퀴즈를 적용
   */
  const applyCachedQuizState = useCallback((stepId: number): boolean => {
    const cachedProcessedData = sessionStorage.getItem(`processed_quizzes_${stepId}`);

    if (!cachedProcessedData) return false;

    const { quizzes, selectedAnswers, questionStatuses, quizSolutions } =
      JSON.parse(cachedProcessedData);

    setQuizzes(quizzes);
    setSelectedAnswers(selectedAnswers);
    setQuestionStatuses(questionStatuses);
    setQuizSolutions(quizSolutions);

    sessionStorage.removeItem(`processed_quizzes_${stepId}`);
    return true;
  }, []);

  /**
   * 비로그인 사용자 결과 데이터를 계산한다.
   *
   * @param stepId 스텝 ID
   * @returns 결과 데이터(기록이 없으면 null)
   */
  const buildGuestResult = useCallback(
    (stepId: number): GuestStepResult | null => {
      const guestAttempt = getGuestStepAttempt(stepId);

      if (!guestAttempt) {
        return null;
      }

      const totalQuizzes = quizzes.length;
      const answeredQuizzes = guestAttempt.answers.length;
      const correctCount = guestAttempt.answers.filter(
        (answer: { is_correct: boolean }) => answer.is_correct,
      ).length;
      const score = answeredQuizzes * baseScorePerQuiz;
      const successRate = totalQuizzes === 0 ? 0 : (correctCount / totalQuizzes) * 100;
      const finishedAt = guestAttempt.finished_at ?? Date.now();
      const durationSeconds = Math.max(
        0,
        Math.floor((finishedAt - guestAttempt.started_at) / 1000),
      );

      return {
        score,
        experience: score,
        correctCount,
        totalQuizzes,
        answeredQuizzes,
        successRate,
        durationSeconds,
        firstSolve: false,
      };
    },
    [baseScorePerQuiz, getGuestStepAttempt, quizzes.length],
  );

  /**
   * 리뷰 모드일 때 퀴즈를 준비한다.
   * 처리되면 true를 반환해 이후 로직을 생략한다.
   */
  const prepareReviewQuizzes = useCallback(async (): Promise<boolean> => {
    if (!isReviewMode) return false;

    if (!isLoggedIn) {
      navigate('/login');
      return true;
    }

    try {
      const quizzesData = reviewQuizzesFromState ?? (await progressService.getReviewQueue());
      if (quizzesData.length === 0) {
        setLoadError(true);
        return true;
      }

      const finalQuizzes = await shuffleQuizOptions(quizzesData);
      initializeQuizState(finalQuizzes);
      return true;
    } catch {
      setLoadError(true);
      return true;
    }
  }, [initializeQuizState, isLoggedIn, isReviewMode, navigate, reviewQuizzesFromState]);

  /**
   * 일반 모드에서 스텝 시도를 시작한다.
   */
  const ensureStepAttempt = useCallback(async (): Promise<boolean> => {
    if (isReviewMode) return true;

    try {
      if (isLoggedIn) {
        const startResult = await quizService.startStep(step_id);
        setStepAttemptId(startResult.stepAttemptId);
      } else {
        startGuestStepAttempt(step_id);
      }
      return true;
    } catch {
      setLoadError(true);
      return false;
    }
  }, [isLoggedIn, isReviewMode, startGuestStepAttempt, step_id]);

  /**
   * 퀴즈 데이터 가져오기
   */
  const fetchQuizzes = useCallback(async () => {
    if (!step_id && !isReviewMode) return;
    if (!isAuthReady) return;

    setIsLoading(true);
    setLoadError(false);
    setStepAttemptId(null);

    // 리뷰 모드 우선 처리
    const reviewHandled = await prepareReviewQuizzes();
    if (reviewHandled) {
      setIsLoading(false);
      return;
    }

    // 일반 모드 초기화
    const initialized = await ensureStepAttempt();
    if (!initialized) {
      setIsLoading(false);
      return;
    }

    // 완전히 가공된 캐시 사용
    const appliedCache = applyCachedQuizState(step_id);
    if (appliedCache) {
      setIsLoading(false);
      return;
    }

    // 캐시가 없으면 서버에서 가져오기
    try {
      const quizzesData = await quizService.getQuizzesByStep(step_id);
      const shuffledQuizzes = await shuffleArray(quizzesData);
      const finalQuizzes = await shuffleQuizOptions(shuffledQuizzes);

      initializeQuizState(finalQuizzes);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    applyCachedQuizState,
    ensureStepAttempt,
    initializeQuizState,
    isAuthReady,
    isReviewMode,
    prepareReviewQuizzes,
    shuffleQuizOptions,
    shuffleArray,
    step_id,
  ]);

  // -----------------------------------------------------------------------------
  // 네비게이션/이펙트
  /** 페이지 진입 시 초기 세팅 */
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  /** 새로고침 시, 한 문제라도 제출했다면 경고 */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasProgress) return;

      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasProgress]);

  // -----------------------------------------------------------------------------
  // 액션 핸들러 / 파생 상태
  // 정답 확인 버튼 활성화 여부 계산
  const isCheckDisabled = useMemo(() => {
    if (!currentQuiz || currentQuestionStatus !== 'idle' || currentAnswer === null) return true;

    // 매칭형: metadata의 left 개수와 현재 pairs의 개수가 정확히 일치해야 함
    if (currentQuiz.type === 'matching') {
      const matchingAnswer = currentAnswer as { pairs: MatchingPair[] };
      const totalRequired = currentQuiz.content.matching_metadata?.left?.length;
      return totalRequired !== (matchingAnswer.pairs?.length || 0);
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
      setSelectedAnswers((prev: AnswerType[]) => {
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
    if (isLoggedIn && stepAttemptId === null && !isReviewMode) {
      setLoadError(true);
      return;
    }
    setCurrentQuestionStatus('checking');

    try {
      const payload: QuizSubmissionRequest =
        currentQuiz.type === 'matching'
          ? {
              quiz_id: currentQuiz.id,
              type: 'MATCHING' as const,
              selection: { pairs: (currentAnswer as { pairs: MatchingPair[] }).pairs },
            }
          : {
              quiz_id: currentQuiz.id,
              type: currentQuiz.type.toUpperCase() as 'MCQ' | 'OX' | 'CODE',
              selection: { option_id: currentAnswer as string },
            };

      if (isLoggedIn && stepAttemptId !== null) {
        payload.step_attempt_id = stepAttemptId;
      }

      const result = await quizService.submitQuiz(currentQuiz.id, payload);
      const correctAnswer: CorrectAnswerType | null = result.solution?.correct_pairs
        ? { pairs: result.solution.correct_pairs }
        : (result.solution?.correct_option_id ?? null);

      // 정답/오답 효과음 재생
      if (result.is_correct) playSound({ src: correctSound, currentTime: 0.05 });
      else playSound({ src: wrongSound, currentTime: 0.05 });

      // heart 차감 처리
      if (!result.is_correct && showHeart) {
        if (isLoggedIn && result.user_heart_count !== undefined && user) {
          // 로그인 사용자: 응답받은 heart count로 user 정보 업데이트
          setUser({
            ...user,
            heartCount: result.user_heart_count,
          });
        } else if (!isLoggedIn) {
          // 미로그인 사용자: localStorage에서 heart 차감
          updateProgress({
            heart: Math.max(0, progress.heart - 1),
          });
        }
      }

      setQuizSolutions(
        (prev: Array<{ correctAnswer: CorrectAnswerType | null; explanation: string } | null>) => {
          const newSolutions = [...prev];
          newSolutions[currentQuizIndex] = {
            correctAnswer,
            explanation: result.solution?.explanation ?? '',
          };
          return newSolutions;
        },
      );
      setCurrentQuestionStatus('checked');
      setQuestionStatuses((prev: QuestionStatus[]) => {
        const newStatuses = [...prev];
        newStatuses[currentQuizIndex] = 'checked';
        return newStatuses;
      });

      if (!isLoggedIn) {
        if (!isReviewMode) {
          addGuestStepAnswer(step_id, {
            quiz_id: currentQuiz.id,
            is_correct: result.is_correct,
          });
        }
      }
    } catch {
      // 에러 발생 시에도 다음 문제로 넘어갈 수 있도록 함
      setCurrentQuestionStatus('checked');
    }
  }, [
    addGuestStepAnswer,
    currentAnswer,
    currentQuiz,
    currentQuizIndex,
    isLoggedIn,
    playSound,
    step_id,
    stepAttemptId,
    isReviewMode,
  ]);

  /** 마지막 문제 여부 */
  const isLastQuestion = currentQuizIndex === quizzes.length - 1;

  /**
   * 다음 문제로 이동하거나 결과 페이지로 이동하는 핸들러
   */
  const handleNextQuestion = useCallback(async () => {
    if (!currentQuiz) return;

    if (isLastQuestion) {
      try {
        if (isReviewMode) {
          navigate('/quiz/review-result');
          return;
        }
        if (isLoggedIn) {
          if (stepAttemptId === null) {
            navigate('/quiz/error');
            return;
          }

          const result = await quizService.completeStep(step_id, {
            stepAttemptId,
          });
          const updatedUser = await authService.getCurrentUser();
          if (updatedUser) setUser(updatedUser);

          navigate('/quiz/result', {
            state: result,
          });
        } else {
          finalizeGuestStepAttempt(step_id);
          const result = buildGuestResult(step_id);

          if (!result) {
            navigate('/quiz/error');
            return;
          }

          navigate('/quiz/result', {
            state: {
              ...result,
              guestStepId: step_id,
            },
          });
        }

        addStepHistory(step_id);

        updateLastSolvedUnit(uiState.last_viewed.field_slug, uiState.last_viewed.unit_id);
      } catch {
        navigate('/quiz/error');
      }
    } else {
      const nextIndex = currentQuizIndex + 1;
      setCurrentQuizIndex(nextIndex);
      // 다음 문제가 이미 풀었던 문제라면 해당 상태를 유지, 아니면 'idle'
      setCurrentQuestionStatus(questionStatuses[nextIndex] || 'idle');
    }
  }, [
    isLastQuestion,
    navigate,
    questionStatuses,
    currentQuizIndex,
    addStepHistory,
    currentQuiz,
    step_id,
    updateLastSolvedUnit,
    isLoggedIn,
    finalizeGuestStepAttempt,
    buildGuestResult,
    stepAttemptId,
    isReviewMode,
  ]);

  // -----------------------------------------------------------------------------
  // 렌더링
  // 조건부 렌더링은 모든 hooks 호출 후에 배치
  if (isLoading) return <QuizLoadingView />;
  if (loadError) return <QuizLoadErrorView onRetry={fetchQuizzes} />;

  return (
    <QuizContainer
      quizzes={quizzes}
      currentQuizIndex={currentQuizIndex}
      currentQuestionStatus={currentQuestionStatus}
      selectedAnswers={selectedAnswers}
      quizSolutions={quizSolutions}
      questionStatuses={questionStatuses}
      isCheckDisabled={isCheckDisabled}
      isLastQuestion={isLastQuestion}
      handleAnswerChange={handleAnswerChange}
      handleCheckAnswer={handleCheckAnswer}
      handleNextQuestion={handleNextQuestion}
      heartCount={showHeart ? heartCount : 0}
      isReviewMode={isReviewMode}
    />
  );
};
