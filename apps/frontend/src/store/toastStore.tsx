import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from 'react';

import { Toast } from '@/comp/Toast';

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; isOpen: boolean }>({
    message: '',
    isOpen: false,
  });

  // 이전 타이머를 추적하여 토스트가 연속 호출될 때 꼬이지 않게 함
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, duration = 2200) => {
    // 기존 타이머가 있다면 제거 (새로운 토스트로 갱신)
    if (timerRef.current) window.clearTimeout(timerRef.current);

    setToast({ message, isOpen: true });

    timerRef.current = window.setTimeout(() => {
      setToast(prev => ({ ...prev, isOpen: false }));
      timerRef.current = null;
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={toast.message} isOpen={toast.isOpen} />
    </ToastContext.Provider>
  );
};
