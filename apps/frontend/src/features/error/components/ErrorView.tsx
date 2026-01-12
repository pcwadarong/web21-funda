import { css, useTheme } from '@emotion/react';

import { Button } from '@/comp/Button';
import type { Theme } from '@/styles/theme';

interface ErrorViewProps {
  title: string;
  description: string | React.ReactNode;
  primaryButtonText?: string;
  onButtonClick?: () => void;
}

export const ErrorView = ({
  title,
  description,
  primaryButtonText = '메인 페이지로 이동',
  onButtonClick,
}: ErrorViewProps) => {
  const theme = useTheme();

  return (
    <div css={containerStyle()}>
      <h1 css={titleStyle(theme)}>{title}</h1>
      <p css={descriptionStyle(theme)}>{description}</p>
      <div css={buttonGroupStyle}>
        {onButtonClick && (
          <div css={buttonWrapperStyle}>
            <Button variant="primary" onClick={onButtonClick} fullWidth>
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
  margin: 0;
  text-align: center;
`;

const descriptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.light};
  margin: 0;
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
