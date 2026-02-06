import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import correctSound from '@/assets/audio/correct.mp3';
import wrongSound from '@/assets/audio/wrong.mp3';
import { Modal } from '@/comp/Modal';
import { Loading } from '@/components/Loading';
import { QuizContainer } from '@/feat/quiz/components/QuizContainer';
import { QuizIntermission } from '@/feat/quiz/components/QuizIntermission';
import { QuizLoadErrorView } from '@/feat/quiz/components/QuizLoadErrorView';
import type {
  AnswerType,
  CorrectAnswerType,
  MatchingPair,
  QuestionStatus,
  QuizQuestion,
} from '@/feat/quiz/types';
import { useReviewQueueQuery } from '@/hooks/queries/progressQueries';
import {
  useCompleteStepMutation,
  useQuizzesByStepQuery,
  useStartStepMutation,
  useSubmitQuizMutation,
} from '@/hooks/queries/quizQueries';
import { useSound } from '@/hooks/useSound';
import { useStorage } from '@/hooks/useStorage';
import { progressService } from '@/services/progressService';
import type { QuizSubmissionRequest } from '@/services/quizService';
import { useAuthActions, useAuthUser, useIsAuthReady, useIsLoggedIn } from '@/store/authStore';

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
 * 인터미션 메세지
 */
const QUIZ_INTERMISSION_MESSAGES = [
  '잘하고 있어요!',
  '잠깐 쉬어가요!',
  '집중력 최고예요!',
  '거의 다 왔어요!',
];

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

  const [loadError, setLoadError] = useState(false);
  const [stepAttemptId, setStepAttemptId] = useState<number | null>(null);
  const [showHeartExhaustedModal, setShowHeartExhaustedModal] = useState(false);
  const [showIntermission, setShowIntermission] = useState(false);
  const [intermissionMessage, setIntermissionMessage] = useState(QUIZ_INTERMISSION_MESSAGES[0]);
  const intermissionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // -----------------------------------------------------------------------------
  // 표시 값 / 파생 값
  /** 하트 개수 */
  const heartCount = user ? user.heartCount : (progress.heart ?? 5);

  /** orderIndex가 4 또는 7일 때만 heart 표시 */
  const showHeart =
    uiState.current_step_order_index === 4 || uiState.current_step_order_index === 7;

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
  const reviewBatchSize = 10;
  const startedStepIdRef = useRef<number | null>(null);

  /** 리뷰 모드에서 불러온 퀴즈 데이터 */
  const reviewState = useMemo(
    () => location.state as { reviewQuizzes?: QuizQuestion[]; reviewFieldSlug?: string } | null,
    [location.state],
  );

  const reviewQuizzesFromState = useMemo(() => reviewState?.reviewQuizzes ?? null, [reviewState]);

  const reviewFieldSlug = useMemo(
    () => reviewState?.reviewFieldSlug ?? uiState.last_viewed.field_slug,
    [reviewState, uiState.last_viewed.field_slug],
  );

  const queryClient = useQueryClient();

  const completeStepMutation = useCompleteStepMutation();

  const startStepMutation = useStartStepMutation();

  const submitQuizMutation = useSubmitQuizMutation();

  const reviewQuery = useReviewQueueQuery(
    { fieldSlug: reviewFieldSlug, limit: reviewBatchSize },
    {
      enabled: isReviewMode && !reviewQuizzesFromState && isLoggedIn && isAuthReady,
    },
  );

  const quizzesQuery = useQuizzesByStepQuery(step_id, {
    enabled: !isReviewMode && Boolean(step_id) && isAuthReady,
  });

  const quizzesData = isReviewMode
    ? (reviewQuizzesFromState ?? reviewQuery.data)
    : quizzesQuery.data;

  const isQueryLoading = isReviewMode
    ? !reviewQuizzesFromState && reviewQuery.isLoading
    : quizzesQuery.isLoading;

  const isQueryError = isReviewMode
    ? !reviewQuizzesFromState && reviewQuery.isError
    : quizzesQuery.isError;

  const handleRetry = () => {
    setLoadError(false);
    if (isReviewMode) {
      if (!reviewQuizzesFromState) reviewQuery.refetch();
      return;
    }
    quizzesQuery.refetch();
  };

  /** 효과음 재생 */
  const { playSound } = useSound();

  /** 퀴즈 한 개당 기본 점수 */
  const baseScorePerQuiz = 3;

  // -----------------------------------------------------------------------------
  // 유틸 함수

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
   * 퀴즈 데이터 가져오기
   */
  const fetchQuizzes = useCallback(() => {
    if (!step_id && !isReviewMode) return;
    if (!isAuthReady) return;

    if (isReviewMode && !isLoggedIn) {
      navigate('/login');
      return;
    }

    if (!quizzesData) return;

    if (quizzesData.length === 0) {
      setLoadError(true);
      return;
    }

    setLoadError(false);

    const shouldResetState =
      quizzes.length === 0 ||
      quizzesData.length !== quizzes.length ||
      quizzesData.some((quiz, index) => quiz.id !== quizzes[index]?.id);

    setQuizzes(quizzesData);

    if (shouldResetState) {
      setSelectedAnswers(new Array(quizzesData.length).fill(null));
      setQuestionStatuses(new Array(quizzesData.length).fill('idle'));
      setQuizSolutions(new Array(quizzesData.length).fill(null));
    }
  }, [step_id, isLoggedIn, isAuthReady, isReviewMode, navigate, quizzesData, quizzes]);

  // -----------------------------------------------------------------------------
  // 네비게이션/이펙트
  /** 페이지 진입 시 초기 세팅 */
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  useEffect(() => {
    if (!isAuthReady || isReviewMode || !step_id) {
      return;
    }

    if (step_id === startedStepIdRef.current) {
      return;
    }

    startedStepIdRef.current = step_id;
    setStepAttemptId(null);

    if (!isLoggedIn) {
      startGuestStepAttempt(step_id);
      return;
    }

    const startStep = async () => {
      try {
        const startResult = await startStepMutation.mutateAsync(step_id);
        setStepAttemptId(startResult.stepAttemptId);
      } catch {
        setLoadError(true);
      }
    };

    startStep();
  }, [isAuthReady, isLoggedIn, isReviewMode, startGuestStepAttempt, startStepMutation, step_id]);

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

  useEffect(
    () => () => {
      if (intermissionTimerRef.current) {
        clearTimeout(intermissionTimerRef.current);
      }
    },
    [],
  );

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

  const isDontKnowDisabled = useMemo(() => {
    if (!currentQuiz) return true;
    return currentQuestionStatus !== 'idle';
  }, [currentQuiz, currentQuestionStatus]);

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
   * 선택 정보를 서버에 제출하고 결과 상태를 반영한다.
   *
   * @param selection 사용자가 선택한 답안 정보
   */
  const submitAnswer = useCallback(
    async (params: { selection: QuizSubmissionRequest['selection']; isDontKnow?: boolean }) => {
      if (!currentQuiz) return;
      if (currentQuestionStatus !== 'idle') return;
      if (isLoggedIn && stepAttemptId === null && !isReviewMode) {
        setLoadError(true);
        return;
      }
      setCurrentQuestionStatus('checking');

      try {
        const { selection, isDontKnow } = params;
        const quizType =
          currentQuiz.type === 'matching'
            ? 'MATCHING'
            : (currentQuiz.type.toUpperCase() as 'MCQ' | 'OX' | 'CODE');

        const payload: QuizSubmissionRequest = {
          quiz_id: currentQuiz.id,
          type: quizType,
          selection,
          current_step_order_index: uiState.current_step_order_index,
        };

        if (isDontKnow) {
          payload.is_dont_know = true;
        }

        if (isLoggedIn && stepAttemptId !== null) {
          payload.step_attempt_id = stepAttemptId;
        }

        const result = await submitQuizMutation.mutateAsync({ quizId: currentQuiz.id, payload });
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
            // 하트가 모두 소진되었을 때 모달 띄우기
            if (result.user_heart_count <= 0) {
              setShowHeartExhaustedModal(true);
            }
          } else if (!isLoggedIn) {
            // 미로그인 사용자: localStorage에서 heart 차감
            const newHeartCount = Math.max(0, (progress.heart ?? 5) - 1);
            updateProgress({
              heart: newHeartCount,
            });
            // 하트가 모두 소진되었을 때 모달 띄우기
            if (newHeartCount <= 0) {
              setShowHeartExhaustedModal(true);
            }
          }
        }

        setQuizSolutions(
          (
            prev: Array<{ correctAnswer: CorrectAnswerType | null; explanation: string } | null>,
          ) => {
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
    },
    [
      addGuestStepAnswer,
      currentQuestionStatus,
      currentQuiz,
      currentQuizIndex,
      isLoggedIn,
      isReviewMode,
      playSound,
      progress.heart,
      setUser,
      showHeart,
      stepAttemptId,
      step_id,
      submitQuizMutation,
      uiState.current_step_order_index,
      updateProgress,
      user,
    ],
  );

  /**
   * 정답 확인 버튼 클릭 시 실행되는 핸들러
   * 서버 통신 후 상태를 'checked'로 변경합니다.
   */
  const handleCheckAnswer = useCallback(async () => {
    if (!currentQuiz || currentAnswer === null) return;

    const selection =
      currentQuiz.type === 'matching'
        ? { pairs: (currentAnswer as { pairs: MatchingPair[] }).pairs }
        : { option_id: currentAnswer as string };

    await submitAnswer({ selection });
  }, [currentAnswer, currentQuiz, submitAnswer]);

  /**
   * 잘 모르겠어요 버튼 클릭 시 실행되는 핸들러
   * 선택한 답변이 있더라도 제출 시에는 빈 선택지로 처리한다.
   */
  const handleDontKnowAnswer = useCallback(async () => {
    if (!currentQuiz) return;
    if (currentQuestionStatus !== 'idle') return;

    setSelectedAnswers((prev: AnswerType[]) => {
      const newAnswers = [...prev];
      newAnswers[currentQuizIndex] = null;
      return newAnswers;
    });

    await submitAnswer({ selection: {}, isDontKnow: true });
  }, [currentQuestionStatus, currentQuiz, currentQuizIndex, submitAnswer]);

  /** 마지막 문제 여부 */
  const isLastQuestion = currentQuizIndex === quizzes.length - 1;

  /**
   * 다음 문제로 이동하거나 결과 페이지로 이동하는 핸들러
   */
  const handleNextQuestion = useCallback(async () => {
    if (!currentQuiz) return;
    if (showIntermission) return;

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

          const result = await completeStepMutation.mutateAsync({
            stepId: step_id,
            payload: { stepAttemptId },
          });

          await queryClient.invalidateQueries({ queryKey: ['current-user'] });

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

          // Redis에 step_id 저장
          try {
            await progressService.completeGuestStep(step_id);
          } catch (error) {
            console.error('Failed to save guest step to Redis:', error);
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
      /** 인터미션 애니메이션 노출 */
      if (currentQuizIndex === 4) {
        const message =
          QUIZ_INTERMISSION_MESSAGES[Math.floor(Math.random() * QUIZ_INTERMISSION_MESSAGES.length)];
        setIntermissionMessage(message);
        setShowIntermission(true);

        if (intermissionTimerRef.current) clearTimeout(intermissionTimerRef.current);

        intermissionTimerRef.current = setTimeout(() => {
          setShowIntermission(false);
          setCurrentQuizIndex(nextIndex);
          setCurrentQuestionStatus(questionStatuses[nextIndex] || 'idle');
        }, 2500);
        return;
      }
      setCurrentQuizIndex(nextIndex);
      // 다음 문제가 이미 풀었던 문제라면 해당 상태를 유지, 아니면 'idle'
      setCurrentQuestionStatus(questionStatuses[nextIndex] || 'idle');
    }
  }, [
    isLastQuestion,
    navigate,
    questionStatuses,
    currentQuizIndex,
    showIntermission,
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

  // 하트 소진 모달 닫기 핸들러
  const handleHeartExhaustedModalClose = useCallback(() => {
    setShowHeartExhaustedModal(false);
    navigate('/learn');
  }, [navigate]);

  // -----------------------------------------------------------------------------
  // 렌더링
  // 조건부 렌더링은 모든 hooks 호출 후에 배치
  if (isQueryLoading) return <Loading text="퀴즈를 불러오는 중입니다" />;
  if (isQueryError || loadError) return <QuizLoadErrorView onRetry={handleRetry} />;

  return (
    <>
      {showHeartExhaustedModal && (
        <Modal
          title="알림"
          content={
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              하트를 모두 소진하였습니다. 다시 도전해주세요!
            </div>
          }
          onClose={handleHeartExhaustedModalClose}
        />
      )}
      {showIntermission && <QuizIntermission message={intermissionMessage} />}
      <QuizContainer
        quizzes={quizzes}
        currentQuizIndex={currentQuizIndex}
        currentQuestionStatus={currentQuestionStatus}
        selectedAnswers={selectedAnswers}
        quizSolutions={quizSolutions}
        questionStatuses={questionStatuses}
        isCheckDisabled={isCheckDisabled}
        isDontKnowDisabled={isDontKnowDisabled}
        isLastQuestion={isLastQuestion}
        handleAnswerChange={handleAnswerChange}
        handleCheckAnswer={handleCheckAnswer}
        handleDontKnowAnswer={handleDontKnowAnswer}
        handleNextQuestion={handleNextQuestion}
        heartCount={showHeart ? (heartCount ?? 5) : 0}
        isReviewMode={isReviewMode}
      />
    </>
  );
};
