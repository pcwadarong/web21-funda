import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { ConfirmModal } from '@/components/ConfirmModal';
import { Modal } from '@/components/Modal';

interface ModalState {
  title: string;
  content: ReactNode;
  isOpen: boolean;
  maxWidth: number;
  padding: boolean;
}

interface ConfirmOptions {
  title: string;
  content: ReactNode;
  confirmText?: string;
  cancelText?: string;
}

interface ModalContextType {
  openModal: (
    title: string,
    content: ReactNode,
    options?: { maxWidth?: number; padding?: boolean },
  ) => void;
  closeModal: () => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modalState, setModalState] = useState<ModalState>({
    title: '',
    content: null,
    isOpen: false,
    maxWidth: 500,
    padding: true,
  });

  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (confirmed: boolean) => void;
  } | null>(null);

  const openModal = (
    title: string,
    content: ReactNode,
    options?: { maxWidth?: number; padding?: boolean },
  ) => {
    setModalState({
      title,
      content,
      isOpen: true,
      maxWidth: options?.maxWidth ?? 500,
      padding: options?.padding ?? true,
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>(resolve => {
        setConfirmState({ options, resolve });
      }),
    [],
  );

  const handleConfirm = () => {
    confirmState?.resolve(true);
    setConfirmState(null);
  };

  const handleCancel = () => {
    confirmState?.resolve(false);
    setConfirmState(null);
  };

  const value = useMemo(() => ({ openModal, closeModal, confirm }), [confirm]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modalState.isOpen && (
        <Modal
          title={modalState.title}
          content={modalState.content}
          onClose={closeModal}
          maxWidth={modalState.maxWidth}
          padding={modalState.padding}
        />
      )}
      {confirmState && (
        <ConfirmModal
          isOpen={!!confirmState}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          title={confirmState.options.title}
          cancelText={confirmState.options.cancelText}
          confirmText={confirmState.options.confirmText}
        >
          {confirmState.options.content}
        </ConfirmModal>
      )}
    </ModalContext.Provider>
  );
};
