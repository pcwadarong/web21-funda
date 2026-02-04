import { css, useTheme } from '@emotion/react';

import { Button } from '@/comp/Button';
import type { Theme } from '@/styles/theme';

interface ErrorViewProps {
  title: string;
  description: string | React.ReactNode;
  primaryButtonText?: string;
  onPrimaryButtonClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
}

export const ErrorView = ({
  title,
  description,
  primaryButtonText = '메인 페이지로 이동',
  onPrimaryButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
}: ErrorViewProps) => {
  const theme = useTheme();

  return (
    <div css={containerStyle()} role="alert" aria-live="assertive" aria-label="오류 안내">
      <h1 css={titleStyle(theme)} id="error-title">
        {title}
      </h1>
      <p css={descriptionStyle(theme)}>{description}</p>
      <div css={buttonGroupStyle} role="group" aria-label="오류 후 액션">
        {onSecondaryButtonClick && (
          <div css={buttonWrapperStyle}>
            <Button variant="secondary" onClick={onSecondaryButtonClick} fullWidth>
              {secondaryButtonText || '다시 시도'}
            </Button>
          </div>
        )}
        {onPrimaryButtonClick && (
          <div css={buttonWrapperStyle}>
            <Button variant="primary" onClick={onPrimaryButtonClick} fullWidth>
              {primaryButtonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const containerStyle = () => css`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 32px;
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['32Bold'].fontSize};
  line-height: ${theme.typography['32Bold'].lineHeight};
  font-weight: ${theme.typography['32Bold'].fontWeight};
  color: ${theme.colors.text.default};
  text-align: center;
`;

const descriptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.light};
  text-align: center;
  max-width: 400px;
`;

const buttonGroupStyle = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
`;

const buttonWrapperStyle = css`
  width: 100%;
  max-width: 300px;
`;
