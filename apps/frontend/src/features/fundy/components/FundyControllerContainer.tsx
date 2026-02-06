import { useCallback, useEffect } from 'react';

import { type AnimKey, FACE_EXPRESSIONS } from '@/feat/fundy/constants';
import { useFundyStore } from '@/store/fundyStore';

import { FundyController } from './FundyController';

export function FundyControllerContainer() {
  const animation = useFundyStore(state => state.animation);
  const isActionLocked = useFundyStore(state => state.isActionLocked);
  const {
    setAnimation,
    triggerHello,
    triggerFall,
    triggerBattle,
    triggerTrophy,
    setForceActionRelease,
  } = useFundyStore(state => state.actions);

  useEffect(() => {
    setForceActionRelease(true);
    return () => setForceActionRelease(false);
  }, [setForceActionRelease]);

  const updateAnim = useCallback(
    (key: AnimKey, value: (typeof animation)[AnimKey]) => {
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
    triggerHello();
  }, [triggerHello]);
  const handlePlayFall = useCallback(() => {
    triggerFall();
  }, [triggerFall]);
  const handlePlayBattle = useCallback(() => {
    triggerBattle();
  }, [triggerBattle]);
  const handlePlayTrophy = useCallback(() => {
    triggerTrophy();
  }, [triggerTrophy]);

  return (
    <FundyController
      animation={animation}
      disabled={isActionLocked}
      onToggle={(key, value) => updateAnim(key, value)}
      onSetMouth={value => updateAnim('openMouth', value)}
      onSpeedChange={value => updateAnim('speedMultiplier', value)}
      onPlayHello={handlePlayHello}
      onPlayFall={handlePlayFall}
      onPlayBattle={handlePlayBattle}
      onPlayTrophy={handlePlayTrophy}
    />
  );
}
