import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Modal } from '@/comp/Modal';
import { LearnContainer } from '@/feat/learn/components/LearnContainer';
import { useLearnUnits } from '@/feat/learn/hooks/useLearnUnits';
import type { stepType } from '@/feat/learn/types';
import { useFieldUnitsQuery } from '@/hooks/queries/fieldQueries';
import { usePrefetchQuizzesByStep } from '@/hooks/queries/quizQueries';
import { useStorage } from '@/hooks/useStorage';
import { useAuthUser, useIsLoggedIn } from '@/store/authStore';
import { useToast } from '@/store/toastStore';
import { storageUtil } from '@/utils/storage';

export const Learn = () => {
  const { showToast } = useToast();
  const { updateUIState, progress, updateProgress } = useStorage();
  const navigate = useNavigate();
  const user = useAuthUser();
  const isLoggedIn = useIsLoggedIn();
  const [showHeartModal, setShowHeartModal] = useState(false);
  const [heartModalMessage, setHeartModalMessage] = useState('');
  const {
    fieldName,
    setFieldName,
    units,
    setUnits,
    activeUnit,
    setActiveUnitId,
    scrollContainerRef,
    headerRef,
    registerUnitRef,
    fieldSlug,
    setFieldSlug,
    markSolvedSteps,
    unlockCheckpoints,
  } = useLearnUnits();

  const showInProgressToast = useCallback(() => {
    showToast('제작 중입니다');
  }, []);

  const { data } = useFieldUnitsQuery(fieldSlug);

  /**
   * field_slug를 기준으로 유닛/스텝 데이터를 요청하고 상태로 매핑합니다.
   */
  useEffect(() => {
    setFieldName(data.field.name);
    setUnits(
      isLoggedIn
        ? unlockCheckpoints(data.units ?? [])
        : unlockCheckpoints(markSolvedSteps(data.units ?? [])),
    );
    setActiveUnitId(data.units[0]?.id ?? null);
  }, [data, isLoggedIn]);

  const prefetchQuizzesByStep = usePrefetchQuizzesByStep();

  /**
   * 비로그인 사용자: Redis에서 하트 값을 동기화합니다.
   */
  useEffect(() => {
    if (!isLoggedIn) {
      const syncGuestHeart = async () => {
        try {
          const response = await fetch('/api/auth/guest-heart');
          const data = await response.json();
          const { heartCount } = data.result;

          // progress state에 Redis 하트값 업데이트 (localStorage에는 저장 안 함)
          updateProgress({
            heart: heartCount,
          });
        } catch (error) {
          console.error('Learn - failed to sync guest heart:', error);
        }
      };

      syncGuestHeart();
    }
  }, [isLoggedIn, updateProgress]);

  const handleStepHover = async (stepId: number) => {
    // 데이터 프리페치
    prefetchQuizzesByStep(stepId);
  };

  const handleStepClick = useCallback(
    (step: stepType) => {
      const stepTitle = step.title;
      const isInProgressStep = stepTitle === '제작 중';

      if (units.length === 0) return;
      const fallbackUnitId = units[0]?.id;
      if (!fallbackUnitId) return;
      const currentUnit = units.find(unit => unit.steps.some(s => s.id === step.id))?.id;

      // 제작 중 스텝은 토스트 메시지 출력
      if (isInProgressStep) {
        showInProgressToast();
        return;
      }

      // 하트 필요 스텝 (orderIndex 4, 7)인 경우 하트 체크
      if (step.orderIndex === 4 || step.orderIndex === 7) {
        const heartCount = isLoggedIn && user ? user.heartCount : progress.heart;
        if ((heartCount ?? 5) <= 0) {
          setHeartModalMessage('하트가 채워지면 다시 도전해주세요!');
          setShowHeartModal(true);
          return;
        }
      }

      updateUIState({
        current_quiz_step_id: step.id,
        current_step_order_index: step.orderIndex,
        last_viewed: {
          field_slug: storageUtil.get().ui_state.last_viewed.field_slug,
          unit_id: currentUnit ?? fallbackUnitId,
        },
      });

      navigate('/quiz');
    },
    [navigate, showInProgressToast, updateUIState, units, isLoggedIn, user, progress],
  );

  return (
    <>
      {showHeartModal && (
        <Modal
          title="알림"
          content={<div style={{ fontSize: '18px', fontWeight: '600' }}>{heartModalMessage}</div>}
          onClose={() => setShowHeartModal(false)}
        />
      )}
      <LearnContainer
        fieldName={fieldName}
        units={units}
        activeUnit={activeUnit}
        scrollContainerRef={scrollContainerRef}
        headerRef={headerRef}
        registerUnitRef={registerUnitRef}
        onStepClick={handleStepClick}
        onStepHover={handleStepHover}
        fieldSlug={fieldSlug}
        setFieldSlug={setFieldSlug}
      />
    </>
  );
};
