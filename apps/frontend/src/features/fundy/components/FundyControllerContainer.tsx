import { useCallback } from 'react';

import { type AnimKey, FACE_EXPRESSIONS } from '@/feat/fundy/constants';
import type { FundyAnimationConfig } from '@/feat/fundy/types';

import { FundyController } from './FundyController';

type FundyControllerContainerProps = {
  animation: FundyAnimationConfig;
  setAnimation: React.Dispatch<React.SetStateAction<FundyAnimationConfig>>;
};

export function FundyControllerContainer({
  animation,
  setAnimation,
}: FundyControllerContainerProps) {
  const updateAnim = useCallback(
    (key: AnimKey, value: FundyAnimationConfig[AnimKey]) => {
      setAnimation(prev => {
        const next = { ...prev, [key]: value };
        const setFaceExpression = (k: AnimKey, val: boolean) => {
          (next as Record<AnimKey, number | boolean>)[k] = val;
        };

        if (FACE_EXPRESSIONS.includes(key) && value === true) {
          FACE_EXPRESSIONS.forEach(k => {
            setFaceExpression(k, k === key);
          });
          next.openMouth = false;
          next.blink = false;
        }

        if (key === 'openMouth' && value !== false)
          FACE_EXPRESSIONS.forEach(k => setFaceExpression(k, false));

        if (key === 'blink' && value === true)
          FACE_EXPRESSIONS.forEach(k => setFaceExpression(k, false));

        return next;
      });
    },
    [setAnimation],
  );

  const handlePlayHello = useCallback(() => {
    setAnimation(prev => ({
      ...prev,
      helloAction: (prev.helloAction ?? 0) + 1,
    }));
  }, [setAnimation]);

  return (
    <FundyController
      animation={animation}
      onToggle={(key, value) => updateAnim(key, value)}
      onSetMouth={value => updateAnim('openMouth', value)}
      onSpeedChange={value => updateAnim('speedMultiplier', value)}
      onPlayHello={handlePlayHello}
    />
  );
}
