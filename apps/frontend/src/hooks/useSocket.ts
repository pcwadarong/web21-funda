import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

/**
 * Socket.io 연결 상태
 */
export type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * useSocket 훅의 반환 타입
 */
export interface UseSocketReturn {
  socket: Socket | null;
  status: SocketStatus;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Socket.io 연결을 관리하는 커스텀 훅
 *
 * @param namespace 소켓 네임스페이스 (예: '/battle')
 * @param options 추가 소켓 옵션
 * @returns 소켓 인스턴스, 연결 상태, 에러, 연결/해제 함수
 */
export function useSocket(
  namespace: string = '',
  options?: {
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
  },
): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
  const fullUrl = namespace ? `${socketUrl}${namespace}` : socketUrl;

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    // 기존 연결이 있으면 먼저 정리
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setStatus('connecting');
    setError(null);

    const newSocket = io(fullUrl, {
      autoConnect: true,
      reconnection: options?.reconnection ?? true,
      reconnectionAttempts: options?.reconnectionAttempts ?? 5,
      reconnectionDelay: options?.reconnectionDelay ?? 1000,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      setStatus('connected');
      setError(null);
    });

    newSocket.on('disconnect', () => {
      setStatus('disconnected');
    });

    newSocket.on('connect_error', (err: Error) => {
      setStatus('error');
      setError(err);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, [fullUrl, options?.reconnection, options?.reconnectionAttempts, options?.reconnectionDelay]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setStatus('disconnected');
      setError(null);
    }
  }, []);

  useEffect(() => {
    if (options?.autoConnect !== false) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, options?.autoConnect]);

  return {
    socket,
    status,
    error,
    connect,
    disconnect,
  };
}
