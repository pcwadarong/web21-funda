import { css, type CSSObject, useTheme } from '@emotion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { IconMapTypes } from '@/constants/icons';
import type { Theme } from '@/styles/theme';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: IconMapTypes;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  active?: boolean;
  variant?: 'default' | 'plain';
  disabled?: boolean;
  width?: number | string;
  triggerContent?: React.ReactNode;
  triggerCss?: CSSObject;
  renderOption?: (option: DropdownOption, isSelected: boolean) => React.ReactNode;
  renderTrigger?: (selectedOption?: DropdownOption) => React.ReactNode;
}

export const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  active = false,
  variant = 'default',
  disabled = false,
  width,
  triggerContent,
  triggerCss,
  renderOption,
  renderTrigger,
}: DropdownProps) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(
    () => options.find(option => option.value === value),
    [options, value],
  );
  const selectedLabel = useMemo(
    () => selectedOption?.label ?? placeholder,
    [placeholder, selectedOption],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setIsPinned(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(prev => {
      const next = !prev;
      setIsPinned(next);
      return next;
    });
  };

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
    setIsPinned(false);
  };

  const handleMouseEnter = () => {
    if (disabled || isPinned) return;
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    setIsOpen(false);
  };

  return (
    <div
      ref={rootRef}
      css={wrapperStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        css={[
          variant === 'plain'
            ? plainTriggerStyle(theme, active, disabled)
            : triggerStyle(theme, active, disabled, width),
          triggerCss,
        ]}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleToggle}
        disabled={disabled}
      >
        {triggerContent ?? renderTrigger?.(selectedOption) ?? (
          <>
            <span>{selectedLabel}</span>
            <span css={caretStyle(isOpen)}>▾</span>
          </>
        )}
      </button>

      {isOpen && (
        <div css={menuStyle(theme)} role="listbox" aria-label="dropdown options">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              css={optionStyle(theme, option.value === value)}
              onClick={() => handleSelect(option.value)}
            >
              {renderOption?.(option, option.value === value) ?? option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const wrapperStyle = css`
  position: relative;
  display: inline-flex;
`;

const triggerStyle = (
  theme: Theme,
  active: boolean,
  disabled: boolean,
  width?: number | string,
) => css`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: ${width ?? 'auto'};
  padding: 10px 14px;
  border-radius: ${theme.borderRadius.medium};
  border: 2px solid ${active ? theme.colors.primary.main : theme.colors.border.default};
  background: ${theme.colors.surface.strong};
  color: ${theme.colors.text.strong};
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease;

  &:hover {
    border-color: ${theme.colors.primary.main};
  }

  ${disabled &&
  css`
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  `}
`;

const plainTriggerStyle = (theme: Theme, active: boolean, disabled: boolean) => css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: ${theme.colors.text.default};
  padding: 0;

  ${active &&
  css`
    color: ${theme.colors.text.strong};
  `}

  ${disabled &&
  css`
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

const caretStyle = (isOpen: boolean) => css`
  font-size: 12px;
  transition: transform 150ms ease;
  transform: rotate(${isOpen ? '180deg' : '0deg'});
`;

const menuStyle = (theme: Theme) => css`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 100%;
  width: max-content;
  background: ${theme.colors.surface.strong};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  padding: 8px;
  z-index: 10;
`;

const optionStyle = (theme: Theme, isSelected: boolean) => css`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: ${theme.borderRadius.small};
  background: ${isSelected ? theme.colors.primary.surface : 'transparent'};
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};

  &:hover {
    background: ${theme.colors.surface.bold};
  }
`;
