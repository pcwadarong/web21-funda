import { css, useTheme } from '@emotion/react';

import type { Theme } from '@/styles/theme';

interface ModalProps {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
  maxWidth?: number;
  padding?: boolean;
  verticalAlign?: 'center' | 'top';
  closeOnBackdropClick?: boolean;
}

export const Modal = ({
  title,
  content,
  onClose,
  maxWidth = 500,
  padding = true,
  verticalAlign = 'center',
  closeOnBackdropClick = true,
}: ModalProps) => {
  const theme = useTheme();

  return (
    <div
      css={modalOverlayStyle(verticalAlign)}
      onClick={() => closeOnBackdropClick && onClose()}
      role="button"
      tabIndex={0}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div
        css={modalContentStyle(theme, maxWidth, padding)}
        role="presentation"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <div css={modalHeaderStyle}>
          <h2 css={modalTitleStyle(theme)}>{title}</h2>
          <button css={modalCloseButtonStyle} onClick={onClose}>
            ✕
          </button>
        </div>
        <div css={modalBodyStyle(theme)}>{content}</div>
      </div>
    </div>
  );
};

const modalOverlayStyle = (verticalAlign: 'center' | 'top') => css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  z-index: 1000;

  align-items: ${verticalAlign === 'top' ? 'flex-start' : 'center'};
  padding-top: ${verticalAlign === 'top' ? '10vh' : 0};
`;

const modalContentStyle = (theme: Theme, maxWidth: number, padding: boolean) => css`
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  padding: ${padding ? '24px' : '24px 24px 0'};
  width: 90%;
  max-width: ${maxWidth}px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  color: ${theme.colors.text.strong};
  position: relative;
`;

const modalHeaderStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const modalTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  line-height: ${theme.typography['20Bold'].lineHeight};
  font-weight: ${theme.typography['20Bold'].fontWeight};
`;

const modalCloseButtonStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Medium'].fontSize};
`;

const modalBodyStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
`;
