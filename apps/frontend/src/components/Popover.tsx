import { css, useTheme } from '@emotion/react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import type { Theme } from '@/styles/theme';

/**
 * Popover 속성
 */
export interface PopoverProps {
  /** Popover 내용 */
  children: ReactNode;
  /** X 좌표 (컨테이너 기준) */
  x: number;
  /** Y 좌표 (컨테이너 기준) */
  y: number;
  /** Popover가 표시되는지 여부 */
  isVisible: boolean;
  /** 마우스가 Popover 위에 있을 때 호출되는 함수 */
  onMouseEnter?: () => void;
  /** 마우스가 Popover를 벗어날 때 호출되는 함수 */
  onMouseLeave?: () => void;
  /** Y 오프셋 (기본값: -50px) */
  offsetY?: number;
  /** 좌표 계산에 사용할 컨테이너 위치 */
  containerRect?: DOMRect | null;
}

/**
 * Popover 컴포넌트
 *
 * 특정 위치에 표시되는 팝오버 컴포넌트입니다.
 */
export const Popover = ({
  children,
  x,
  y,
  isVisible,
  onMouseEnter,
  onMouseLeave,
  offsetY = -50,
  containerRect = null,
}: PopoverProps) => {
  const theme = useTheme();

  if (!isVisible) {
    return null;
  }

  if (typeof document === 'undefined') {
    return null;
  }

  const baseLeft = containerRect?.left ?? 0;
  const baseTop = containerRect?.top ?? 0;

  return createPortal(
    <div
      css={popoverStyle(baseLeft + x, baseTop + y, offsetY)}
      role="tooltip"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div css={popoverContentStyle(theme)}>{children}</div>
    </div>,
    document.body,
  );
};

const popoverStyle = (x: number, y: number, offsetY: number) => css`
  position: fixed;
  left: ${x}px;
  top: ${y + offsetY}px;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: auto;
`;

const popoverContentStyle = (theme: Theme) => css`
  background: ${theme.colors.grayscale[800]};
  border-radius: ${theme.borderRadius.medium};
  padding: 0.5rem 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: ${theme.colors.grayscale[50]};
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: ${theme.typography['12Medium'].fontSize};
`;
