import { css, useTheme } from '@emotion/react';

import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import type { Theme } from '@/styles/theme';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  verticalAlign?: 'center' | 'top';
  closeOnBackdropClick?: boolean;
}

/**
 * 사용자에게 특정 작업에 대한 확인을 받기 위한 모달 컴포넌트입니다.
 * 내부적으로 범용 Modal 컴포넌트를 사용합니다.
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  cancelText = '취소',
  confirmText = '확인',
  verticalAlign = 'top',
  closeOnBackdropClick = false,
}: ConfirmModalProps) => {
  const theme = useTheme();

  if (!isOpen) {
    return null;
  }

  const content = (
    <>
      <div css={modalBodyStyle(theme)}>{children}</div>
      <div css={modalFooterStyle}>
        <Button variant="secondary" css={modalButtonStyle} onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant="primary" css={modalButtonStyle} onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </>
  );

  return (
    <Modal
      title={title}
      content={content}
      onClose={onClose}
      maxWidth={400}
      verticalAlign={verticalAlign}
      closeOnBackdropClick={closeOnBackdropClick}
    />
  );
};

const modalBodyStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.default};
  margin-bottom: 24px;
`;

const modalFooterStyle = css`
  display: flex;
  gap: 12px;
`;

const modalButtonStyle = css`
  flex: 1;
`;
