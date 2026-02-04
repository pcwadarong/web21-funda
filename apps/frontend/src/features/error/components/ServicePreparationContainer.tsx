import { css, useTheme } from '@emotion/react';

import { Button } from '@/comp/Button';
import type { Theme } from '@/styles/theme';

export interface ServicePreparationContainerProps {
  onGoMain: () => void;
}

export const ServicePreparationContainer = ({ onGoMain }: ServicePreparationContainerProps) => {
  const theme = useTheme();

  return (
    <section css={containerStyle()} aria-label="서비스 준비 안내" aria-live="polite">
      <div css={placeholderStyle(theme)} aria-hidden="true" />
      <h1 css={titleStyle(theme)} id="service-prep-title">
        서비스 준비 중입니다.
      </h1>
      <p css={descriptionStyle(theme)}>
        보다 나은 서비스 제공을 위하여 페이지 준비 중에 있습니다.
        <br />
        가능한 빠른 시일 내에 준비하여 찾아 뵙겠습니다.
      </p>
      <div css={buttonWrapperStyle}>
        <Button variant="primary" onClick={onGoMain} fullWidth>
          메인 페이지로 이동
        </Button>
      </div>
    </section>
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

const placeholderStyle = (theme: Theme) => css`
  width: 200px;
  height: 200px;
  background: ${theme.colors.surface.bold};
  border-radius: ${theme.borderRadius.large};
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

const buttonWrapperStyle = css`
  width: 100%;
  max-width: 300px;
`;
