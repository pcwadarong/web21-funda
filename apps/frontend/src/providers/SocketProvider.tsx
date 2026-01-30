import { createContext, type ReactNode, useCallback, useContext } from 'react';
import type { Socket } from 'socket.io-client';

import { type SocketStatus, useSocket } from '@/hooks/useSocket';

/**
 * Socket Context의 값 타입
 * 범용 소켓 인프라 제공 (도메인 로직 제외)
 */
export interface SocketContextValue {
  socket: Socket | null;
  status: SocketStatus;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  emitEvent: (event: string, data?: any) => void;
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
 * 범용 소켓 인프라 제공 (도메인 로직 제외)
 * - 단일 Socket 인스턴스 관리 (useSocket 훅 사용)
 * - 지연 연결(Lazy Connection) 방식 채택 (autoConnect: false)
 * - 도메인별 비즈니스 로직은 각 도메인 훅에서 관리
 */
export function SocketProvider({ children, namespace = '/' }: SocketProviderProps) {
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

  /**
   * 범용 이벤트 emit 함수
   */
  const emitEvent = useCallback(
    (event: string, data?: any) => {
      if (socket?.connected) {
        socket.emit(event, data);
      }
    },
    [socket],
  );

  /**
   * Socket 연결 해제
   */
  const disconnect = useCallback(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  const value: SocketContextValue = {
    socket,
    status,
    error,
    connect: connectSocket,
    disconnect,
    emitEvent,
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
