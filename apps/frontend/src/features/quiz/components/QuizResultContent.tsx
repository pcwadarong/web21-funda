import { css, useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import { useStorage } from '@/hooks/useStorage';
import type { Theme } from '@/styles/theme';

interface QuizResultData {
  xpGained?: number | null;
  experience?: number | null;
  successRate: number | null;
  durationMs?: string;
  durationSeconds?: string;
}

const METRIC_CONFIG = (theme: Theme) =>
  [
    {
      key: 'xp',
      title: '획득 XP',
      icon: 'Star' as const,
      getValue: (data: QuizResultData) =>
        data.experience ?? (data.xpGained != null ? data.xpGained : '-'),
      styles: {
        bg: theme.colors.primary.main,
        text: theme.colors.primary.dark,
        iconColor: theme.colors.primary.main,
      },
    },
    {
      key: 'successRate',
      title: '성공률',
      icon: 'Graph' as const,
      getValue: (data: QuizResultData) => (data.successRate != null ? `${data.successRate}%` : '-'),
      styles: {
        bg: theme.colors.success.main,
        text: theme.colors.success.main,
        iconColor: theme.colors.success.main,
      },
    },
    {
      key: 'durationMs',
      title: '소요 시간',
      icon: 'Timer' as const,
      getValue: (data: QuizResultData) => data.durationSeconds ?? data.durationMs ?? '-',
      styles: {
        bg: theme.colors.grayscale[500],
        text: theme.colors.grayscale[500],
        iconColor: theme.colors.grayscale[500],
      },
    },
  ] as const;

interface QuizResultContentProps {
  resultData: QuizResultData;
  isLogin: boolean;
  isFirstToday: boolean;
}

export const QuizResultContent = ({
  resultData,
  isLogin,
  isFirstToday,
}: QuizResultContentProps) => {
  const { uiState, updateUIState } = useStorage();
  const theme = useTheme();
  const navigate = useNavigate();
  const config = METRIC_CONFIG(theme);

  const handleMainNavigation = () => {
    if (!isLogin)
      navigate('/auth/check', {
        state: { from: '/learn' },
      });
  };
  /* 하나의 값이라도 null인 경우 체크 */
  const hasMissingData = config.some(item => {
    const value = item.getValue(resultData);
    return value === '-' || value === null;
  });

  const handleNextNavigation = () => {
    if (!isLogin)
      navigate('/auth/check', {
        state: { from: '/quiz' },
      });
    else if (isFirstToday) navigate('/streak');
    else {
      navigate('/quiz');
      updateUIState({
        current_quiz_step_id: uiState.current_quiz_step_id + 1,
      });
    }
  };

  return (
    <div css={containerStyle}>
      <h1 css={titleStyle(theme)}>LESSON COMPLETE!</h1>
      <div css={placeholderStyle(theme)} />

      <div css={metricsContainerStyle}>
        {config.map(item => (
          <div key={item.key} css={metricCardStyle(theme, item.styles.bg)}>
            <div css={metricTitleStyle(theme)}>{item.title}</div>
            <div css={metricValueContainerStyle(theme, item.styles.bg)}>
              <SVGIcon
                icon={item.icon}
                size="lg"
                css={css`
                  color: ${item.styles.iconColor};
                `}
              />
              <span css={metricValueStyle(theme, item.styles.text)}>
                {item.getValue(resultData)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {hasMissingData && (
        <p css={noticeTextStyle(theme)}>
          결과 데이터를 불러오지 못했어요. 기록은 정상 저장되었어요.
        </p>
      )}

      <div css={buttonsContainerStyle}>
        <Button variant="primary" onClick={handleNextNavigation} css={fullWidth}>
          학습 계속하기
        </Button>
        <Button variant="secondary" onClick={handleMainNavigation} css={fullWidth}>
          메인 페이지로 이동하기
        </Button>
      </div>
    </div>
  );
};

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  min-height: 100vh;
  padding: 48px 24px;
`;

const titleStyle = (theme: Theme) => css`
  ${theme.typography['32Bold']};
  color: ${theme.colors.primary.main};
  margin: 0;
  text-align: center;
`;

const placeholderStyle = (theme: Theme) => css`
  width: 200px;
  height: 200px;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.medium};
`;

const metricsContainerStyle = css`
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 35rem;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const metricCardStyle = (theme: Theme, bgColor: string) => css`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 5px;
  align-items: center;
  justify-content: space-between;
  background: ${bgColor};
  border-radius: ${theme.borderRadius.medium};
`;

const metricTitleStyle = (theme: Theme) => css`
  ${theme.typography['16Medium']};
  color: ${theme.colors.grayscale[50]};
  text-align: center;
  padding: 0.2rem 0 0.4rem;
`;

const metricValueContainerStyle = (theme: Theme, bgColor: string) => css`
  background-color: ${theme.colors.grayscale[50]};
  width: 100%;
  border-radius: ${theme.borderRadius.medium};
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid ${bgColor};
  padding: 2rem 0;
`;

const metricValueStyle = (theme: Theme, textColor: string) => css`
  font-size: ${theme.typography['24Bold'].fontSize};
  line-height: ${theme.typography['24Bold'].lineHeight};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  color: ${textColor};
`;

const noticeTextStyle = (theme: Theme) => css`
  color: ${theme.colors.text.light};
`;

const buttonsContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  max-width: 400px;
`;

const fullWidth = css`
  width: 100%;
`;
