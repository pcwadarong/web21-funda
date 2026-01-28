import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Loading } from '@/comp/Loading';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import {
  useCreateBattleRoomMutation,
  useJoinBattleRoomMutation,
} from '@/hooks/queries/battleQueries';
import { useBattleStore } from '@/store/battleStore';

export const BattleTestPage = () => {
  const { joinRoom, socket } = useBattleSocket();
  const { status, participants, roomId, actions } = useBattleStore();
  const navigate = useNavigate();
  const createBattleRoom = useCreateBattleRoomMutation();
  const joinBattleRoom = useJoinBattleRoomMutation();
  const [inviteToken, setInviteToken] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = useCallback(async () => {
    setIsCreating(true);
    try {
      const createdRoom = await createBattleRoom.mutateAsync();
      setInviteToken(createdRoom.inviteToken);

      const joinResponse = await joinBattleRoom.mutateAsync({
        inviteToken: createdRoom.inviteToken,
      });
      if (!joinResponse.canJoin) {
        return;
      }

      joinRoom(joinResponse.roomId, {});
      actions.setBattleState({
        roomId: joinResponse.roomId,
        inviteToken: createdRoom.inviteToken,
      });
    } finally {
      setIsCreating(false);
    }
  }, [createBattleRoom, joinBattleRoom, joinRoom, actions]);

  const handleJoin = useCallback(async () => {
    if (!inviteToken.trim()) {
      return;
    }

    setIsJoining(true);
    try {
      const response = await joinBattleRoom.mutateAsync({ inviteToken });
      if (!response.canJoin) {
        return;
      }

      joinRoom(response.roomId, {});
      actions.setBattleState({ roomId: response.roomId });
    } finally {
      setIsJoining(false);
    }
  }, [inviteToken, joinBattleRoom, joinRoom, actions]);

  const handleStart = useCallback(() => {
    if (!roomId) {
      return;
    }

    socket?.emit('battle:start', { roomId });
    navigate('/battle/quiz');
  }, [socket, roomId, navigate]);

  if (isJoining || isCreating) {
    return <Loading />;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>배틀 테스트 페이지</h1>

      <div style={{ marginTop: 16 }}>
        <button type="button" onClick={handleCreateRoom}>
          방 생성
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="inviteToken 입력"
          value={inviteToken}
          onChange={event => setInviteToken(event.target.value)}
          style={{ width: 240, marginRight: 8 }}
        />
        <button type="button" onClick={handleJoin}>
          방 참가
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <p>현재 상태: {status ?? '없음'}</p>
        <p>참여자 수: {participants.length}명</p>
        <p>현재 방 ID: {roomId ?? '없음'}</p>
        <p>초대 토큰: {inviteToken || '없음'}</p>
      </div>

      <button type="button" onClick={handleStart} style={{ marginTop: 12 }}>
        배틀 시작
      </button>

      <button type="button" onClick={() => navigate('/battle/quiz')} style={{ marginTop: 8 }}>
        퀴즈 화면 이동
      </button>
    </div>
  );
};
