import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BattleResultContainer } from '@/features/battle/components/BattleResultContainer';
import { useSocketContext } from '@/providers/SocketProvider';
import { useBattleStore } from '@/store/battleStore';

export const BattleResultPage = () => {
  const navigate = useNavigate();
  const { socket, disconnect } = useSocketContext();

  // 스토어에서 데이터 가져오기
  const status = useBattleStore(state => state.status);
  const rankings = useBattleStore(state => state.rankings);
  const participants = useBattleStore(state => state.participants);
  const rewards = useBattleStore(state => state.rewards);
  const roomId = useBattleStore(state => state.roomId);
  const inviteToken = useBattleStore(state => state.inviteToken);
  const { reset: resetBattleStore } = useBattleStore(state => state.actions);
  // status가 finished가 아니면 리다이렉트
  // (useBattleFlow에서 이미 처리하지만, 페이지 진입 시점 보호를 위해 유지)
  useEffect(() => {
    if (status !== 'finished' && roomId) {
      navigate('/battle', { replace: true });
    }
  }, [status, roomId, navigate]);

  // 15초 타이머
  const [timeLeft, setTimeLeft] = useState(8);

  // 타이머 로직: 1초마다 감소
  useEffect(() => {
    if (timeLeft <= 0) {
      // 타이머 종료 시 대기실로 이동
      // socket과 roomId는 BattleFlowManager에서 검사하므로 여기서는 기본 검사만
      if (socket && roomId && inviteToken) {
        socket.emit('battle:restart', { roomId });
        resetBattleStore();
        navigate(`/battle/${inviteToken}`);
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, socket, roomId, inviteToken, navigate, resetBattleStore]);

  // 한 번 더 하기: battle:restart 이벤트 emit + 상태 초기화 + 대기실로 이동
  const handleRestart = () => {
    // socket과 roomId는 BattleFlowManager에서 검사하므로 여기서는 기본 검사만
    if (socket && roomId && inviteToken) {
      socket.emit('battle:restart', { roomId });
      resetBattleStore();
      navigate(`/battle/${inviteToken}`);
    }
  };

  // 게임 종료하기: battle:leave emit + disconnect + 메인으로 이동
  const handleLeave = () => {
    // socket과 roomId는 BattleFlowManager에서 검사하므로 여기서는 기본 검사만
    if (socket && roomId) {
      socket.emit('battle:leave', { roomId });
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
