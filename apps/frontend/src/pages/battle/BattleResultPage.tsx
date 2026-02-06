import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import fanfareSound from '@/assets/audio/fanfare.mp3';
import { BattleResultContainer } from '@/feat/battle/components/result/BattleResultContainer';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import { useSound } from '@/hooks/useSound';

export const BattleResultPage = () => {
  const navigate = useNavigate();
  const { battleState, restartBattle, leaveBattle, disconnect } = useBattleSocket({
    listen: false,
  });

  const { rankings, participants, rewards, roomId, inviteToken } = battleState;

  const { playSound, stopSound } = useSound();

  // 15초 타이머
  const [timeLeft, setTimeLeft] = useState(15);

  // 사운드 이펙트 재생 (한 번만 실행)
  useEffect(() => {
    void playSound({ src: fanfareSound, volume: 0.5 });
    return () => {
      stopSound(fanfareSound);
    };
  }, []);

  // 타이머 로직: 1초마다 감소
  useEffect(() => {
    if (timeLeft <= 0) {
      // 타이머 종료 시 대기실로 이동
      if (roomId && inviteToken) {
        restartBattle(roomId);
        navigate(`/battle/${inviteToken}`);
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, roomId, inviteToken, navigate, restartBattle]);

  // 한 번 더 하기: battle:restart 이벤트 emit + 상태 초기화 + 대기실로 이동
  const handleRestart = () => {
    if (roomId && inviteToken) {
      restartBattle(roomId);
      navigate(`/battle/${inviteToken}`);
    }
  };

  // 게임 종료하기: battle:leave emit + disconnect + 메인으로 이동
  const handleLeave = () => {
    if (roomId) {
      leaveBattle(roomId);
    }
    disconnect();
    navigate('/battle');
  };

  return (
    <BattleResultContainer
      rankings={rankings}
      participants={participants}
      rewards={rewards}
      timeLeft={timeLeft}
      onRestart={handleRestart}
      onLeave={handleLeave}
    />
  );
};
