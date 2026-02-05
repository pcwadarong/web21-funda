import { css, type CSSObject, useTheme } from '@emotion/react';
import type { ButtonHTMLAttributes } from 'react';

import type { Theme } from '@/styles/theme';
import { colors } from '@/styles/token';

type Variant = 'primary' | 'secondary';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  css?: CSSObject;
}

export const Button = ({
  variant = 'primary',
  fullWidth = false,
  children,
  type = 'button',
  css: customCss,
  ...props
}: ButtonProps) => {
  const theme = useTheme();

  return (
    <button
      css={[
        baseStyle(theme, fullWidth),
        variant === 'primary' ? primaryStyle(theme) : secondaryStyle(theme),
        props.disabled && disabledStyle,
        customCss,
      ]}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

const baseStyle = (theme: Theme, fullWidth: boolean) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${fullWidth ? '100%' : 'auto'};
  padding: 10px 12px;
  border: 0;
  border-radius: ${theme.borderRadius.medium};
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    filter 150ms ease;
  font-family:
    'SUIT',
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  background: transparent;

  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
`;

const primaryStyle = (theme: Theme) => css`
  background: ${theme.colors.primary.main};
  color: ${colors.light.grayscale[50]};
  border: 2px solid transparent;
  box-shadow: 0 0.4rem 0 ${theme.colors.primary.dark};

  &:not(:disabled):hover {
    transform: translateY(-0.125rem);
    box-shadow: 0 0.525rem 0 ${theme.colors.primary.dark};
    filter: brightness(1.02);
  }

  &:not(:disabled):active {
    transform: translateY(0.275rem);
    box-shadow: 0 0.125rem 0 ${theme.colors.primary.dark};
  }
`;

const secondaryStyle = (theme: Theme) => css`
  background: ${colors.light.grayscale[50]};
  color: ${colors.light.grayscale[700]};
  border: 2px solid ${theme.colors.primary.surface};
  box-shadow: 0 0.3rem 0 ${theme.colors.border.default};

  &:not(:disabled):hover {
    transform: translateY(-0.125rem);
    box-shadow: 0 0.425rem 0 ${theme.colors.border.default};
    filter: brightness(0.99);
  }

  &:not(:disabled):active {
    transform: translateY(0.175rem);
    box-shadow: 0 0.125rem 0 ${theme.colors.border.default};
  }
`;

const disabledStyle = css`
  opacity: 0.5;
  cursor: not-allowed;
`;
