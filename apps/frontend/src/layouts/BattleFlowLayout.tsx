import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { useBattleFlow } from '@/feat/battle/hooks/useBattleFlow';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import { useBattleStore } from '@/store/battleStore';

/**
 * BattleFlowLayout
 *
 * 배틀 관련 모든 라우트에서 공통으로 사용되는 소켓 이벤트 리스닝과
 * 상태 기반 라우팅을 중앙에서 관리하는 컴포넌트입니다.
 *
 * 공통 검사 로직:
 * - socket 연결 상태 검사
 * - roomId 존재 여부 검사
 * - status 기반 페이지 접근 권한 검사
 */
export function BattleFlowLayout() {
  const navigate = useNavigate();
  const roomId = useBattleStore(state => state.roomId);
  const status = useBattleStore(state => state.status);

  // 소켓 이벤트 리스닝 및 스토어 업데이트
  useBattleSocket();

  // 배틀 상태 기반 라우팅 관리
  useBattleFlow();

  // useBattleFlow에서 status 기반 라우팅을 처리하지만, roomId가 없는 경우 추가 보호
  useEffect(() => {
    // roomId가 없고 status도 null이면 배틀 관련 상태가 아니므로 리턴
    if (!roomId && !status) return;

    // roomId가 없는데 배틀 관련 페이지(quiz, result, :inviteToken)에 있다면 메인으로 리다이렉트
    const currentPath = window.location.pathname;
    const isBattleSubPage = currentPath.startsWith('/battle/') && currentPath !== '/battle';

    if (!roomId && isBattleSubPage) navigate('/battle', { replace: true });
  }, [roomId, status, navigate]);

  return <Outlet />;
}
