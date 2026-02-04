import { css, useTheme } from '@emotion/react';

import type { Theme } from '@/styles/theme';

import {
  contentGroupStyle,
  labelGroupStyle,
  rowStyle,
  sectionCardStyle,
  sectionTitleStyle,
} from './Setting.styles';

interface EmailNotificationSectionProps {
  isEmailSubscribed: boolean;
  email: string | null;
  isDisabled: boolean;
  onToggle: (checked: boolean) => void;
}

export const EmailNotificationSection = ({
  isEmailSubscribed,
  email,
  isDisabled,
  onToggle,
}: EmailNotificationSectionProps) => {
  const theme = useTheme();
  const description = email
    ? `${email}으로 이메일 알림을 발송합니다.`
    : '등록된 이메일이 없습니다. 로그인 후 자동으로 등록됩니다.';

  return (
    <section css={sectionCardStyle(theme)}>
      <h2 css={sectionTitleStyle(theme)}>알림</h2>

      <div css={contentGroupStyle}>
        <div css={rowStyle}>
          <div css={labelGroupStyle(theme)}>
            <p css={labelTitleStyle}>이메일 알림</p>
            <p css={labelDescriptionStyle(theme)}>{description}</p>
          </div>
          <label css={switchStyle(theme, isDisabled)}>
            <input
              type="checkbox"
              checked={isEmailSubscribed}
              onChange={event => onToggle(event.target.checked)}
              disabled={isDisabled}
            />
            <span className="slider" />
          </label>
        </div>
      </div>
    </section>
  );
};

const labelTitleStyle = css`
  margin: 0;
`;

const labelDescriptionStyle = (theme: Theme) => css`
  margin: 8px 0 0 0;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const switchStyle = (theme: Theme, isDisabled: boolean) => css`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  opacity: ${isDisabled ? 0.5 : 1};
  pointer-events: ${isDisabled ? 'none' : 'auto'};

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${theme.colors.surface.bold};
    transition: 0.3s;
    border-radius: 24px;
  }

  .slider:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  input:checked + .slider {
    background-color: ${theme.colors.primary.main};
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }
`;
