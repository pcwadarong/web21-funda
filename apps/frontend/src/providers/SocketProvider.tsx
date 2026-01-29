import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Socket } from 'socket.io-client';

import { type SocketStatus, useSocket } from '@/hooks/useSocket';

/**
 * Socket Context의 값 타입
 * 소켓 인프라(연결, 룸 관리) 제공
 */
export interface SocketContextValue {
  socket: Socket | null;
  status: SocketStatus;
  error: Error | null;
  roomId: string | null;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: string, payload?: { userId?: number | null; displayName?: string }) => void;
  leaveRoom: (roomId: string) => void;
}

/**
 * Socket Context
 */
const SocketContext = createContext<SocketContextValue | null>(null);

/**
 * SocketProvider Props
 */
export interface SocketProviderProps {
  children: ReactNode;
  namespace?: string;
}

/**
 * Socket Provider
 *
 * - 단일 Socket 인스턴스 관리 (useSocket 훅 사용)
 * - Room 기반 연결 지원
 * - Battle 비즈니스 로직은 useBattleSocket 도메인 훅에서 관리
 */
export function SocketProvider({ children, namespace = '/battle' }: SocketProviderProps) {
  // useSocket 훅을 사용하여 물리적 연결 관리
  const {
    socket,
    status,
    error,
    connect: connectSocket,
    disconnect: disconnectSocket,
  } = useSocket(namespace, {
    autoConnect: false,
  });

  // Room 관리 상태
  const [roomId, setRoomId] = useState<string | null>(null);
  const pendingJoinRef = useRef<{
    roomId: string;
    payload?: { userId?: number | null; displayName?: string };
  } | null>(null);

  /**
   * socket이 연결되면 pending join 요청 처리
   */
  useEffect(() => {
    if (socket?.connected && pendingJoinRef.current) {
      const { roomId: pendingRoomId, payload } = pendingJoinRef.current;
      socket.emit('battle:join', {
        roomId: pendingRoomId,
        ...payload,
      });
      setRoomId(pendingRoomId);
      pendingJoinRef.current = null;
    }
  }, [socket, status]);

  /**
   * Battle 방 참가
   */
  const joinRoom = useCallback(
    (targetRoomId: string, payload?: { userId?: number | null; displayName?: string }) => {
      if (socket?.connected) {
        // 이미 연결되어 있으면 바로 join
        socket.emit('battle:join', {
          roomId: targetRoomId,
          ...payload,
        });
        setRoomId(targetRoomId);
      } else {
        // 연결되지 않았으면 연결 후 join
        pendingJoinRef.current = { roomId: targetRoomId, payload };
        connectSocket();
      }
    },
    [socket, connectSocket],
  );

  /**
   * Battle 방 퇴장
   */
  const leaveRoom = useCallback(
    (targetRoomId: string) => {
      if (socket?.connected) {
        socket.emit('battle:leave', { roomId: targetRoomId });
        setRoomId(null);
      }
    },
    [socket],
  );

  /**
   * Socket 연결 해제
   */
  const disconnect = useCallback(() => {
    disconnectSocket();
    setRoomId(null);
  }, [disconnectSocket]);

  const value: SocketContextValue = {
    socket,
    status,
    error,
    roomId,
    connect: connectSocket,
    disconnect,
    joinRoom,
    leaveRoom,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

/**
 * useSocketContext Hook
 *
 * Socket Context를 사용하는 커스텀 훅입니다.
 *
 * @throws {Error} SocketProvider 외부에서 사용 시 에러 발생
 */
export function useSocketContext(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
}
