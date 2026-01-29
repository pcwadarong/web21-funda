import type { Theme } from '@emotion/react';
import { css, useTheme } from '@emotion/react';

import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { useModal } from '@/store/modalStore';

import { InfoBattleModal } from './InfoBattleModal';

interface BattleContainerProps {
  onClick: () => void;
  isLoading?: boolean;
}

export const BattleContainer = ({ onClick, isLoading = false }: BattleContainerProps) => {
  const theme = useTheme();
  const { openModal } = useModal();

  if (isLoading) {
    return <Loading text="방 생성 중" />;
  }

  return (
    <div css={containerStyle()}>
      <div css={contentStyle()}>
        <div css={logoPlaceholderStyle(theme)}></div>

        <h1 css={titleStyle(theme)}>바로 시작되는 실시간 CS 퀴즈 배틀</h1>
        <p css={subtitleStyle(theme)}>방을 만들고 친구를 초대해 바로 대결해보세요!</p>

        <button
          type="button"
          aria-label="실시간 배틀 설명서 열기"
          css={infoButtonStyle(theme)}
          onClick={() =>
            openModal('실시간 배틀이란?', <InfoBattleModal />, {
              maxWidth: 880,
            })
          }
        >
          <span>실시간 배틀이란 무엇인가요?</span>
        </button>

        <div css={buttonGroupStyle}>
          <Button variant="primary" onClick={onClick} fullWidth css={loginButtonStyle}>
            <span>방 생성하기</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

const containerStyle = () => css`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
`;

const contentStyle = () => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  word-break: keep-all;
`;

const logoPlaceholderStyle = (theme: Theme) => css`
  width: 300px;
  height: 300px;
  background: ${theme.colors.surface.bold};
  border-radius: ${theme.borderRadius.large};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 36px;
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['36ExtraBold'].fontSize};
  line-height: ${theme.typography['36ExtraBold'].lineHeight};
  font-weight: ${theme.typography['36ExtraBold'].fontWeight};
  color: ${theme.colors.text.light};
`;

const subtitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['24Medium'].fontSize};
  line-height: ${theme.typography['24Medium'].lineHeight};
  font-weight: ${theme.typography['24Medium'].fontWeight};
  color: ${theme.colors.text.weak};
`;

const buttonGroupStyle = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 70%;
  margin-top: 8px;
`;

const loginButtonStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const infoButtonStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.primary.main};
  text-decoration: underline;
  margin-top: 36px;

  &:hover {
    opacity: 80%;
  }
`;
