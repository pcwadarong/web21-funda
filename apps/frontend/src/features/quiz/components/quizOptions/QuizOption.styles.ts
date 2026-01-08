import { css } from '@emotion/react';

import type { Theme } from '@/styles/theme';

/** 1. 선택된 상태 스타일 */
export const selectedOptionStyle = (theme: Theme) => css`
  border-color: ${theme.colors.primary.main};
  background: ${theme.colors.primary.surface};
`;

/** 2. 정답 상태 스타일 */
export const correctOptionStyle = (theme: Theme) => css`
  border-color: ${theme.colors.success.main};
  background: ${theme.colors.success.light};
`;

/** 3. 오답 상태 스타일 */
export const wrongOptionStyle = (theme: Theme) => css`
  border-color: ${theme.colors.error.main};
  background: ${theme.colors.error.surface};
`;

/** 4. 비활성화 상태 스타일 */
export const disabledOptionStyle = css`
  cursor: not-allowed;
  opacity: 0.6;
`;

/** 5. 공통 호버 효과 (공통으로 적용하고 싶을 때) */
export const commonHoverStyle = (theme: Theme) => css`
  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;
