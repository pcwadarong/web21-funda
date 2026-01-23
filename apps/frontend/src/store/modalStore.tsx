import { createContext, type ReactNode, useContext, useState } from 'react';

import { Modal } from '@/comp/Modal';

interface ModalState {
  title: string;
  content: ReactNode;
  isOpen: boolean;
  maxWidth: number;
  padding: boolean;
}

interface ModalContextType {
  openModal: (
    title: string,
    content: ReactNode,
    options?: { maxWidth?: number; padding?: boolean },
  ) => void;
  closeModal: () => void;
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

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
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
    </ModalContext.Provider>
  );
};
