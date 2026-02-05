import type { Theme } from '@emotion/react';
import { css, useTheme } from '@emotion/react';

import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { useModal } from '@/store/modalStore';

import { InfoBattleModal } from './InfoBattleModal';

interface BattleLobbyContainerProps {
  onClick: () => void;
  isLoading?: boolean;
}

export const BattleLobbyContainer = ({ onClick, isLoading = false }: BattleLobbyContainerProps) => {
  const theme = useTheme();
  const { openModal } = useModal();

  if (isLoading) {
    return <Loading text="방 생성 중" />;
  }

  return (
    <section css={contentStyle} aria-label="실시간 배틀 로비">
      <div css={logoPlaceholderStyle(theme)}></div>

      <h1 css={titleStyle(theme)}>실시간 CS 퀴즈 배틀</h1>
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

      <Button variant="primary" onClick={onClick} css={loginButtonStyle}>
        방 생성하기
      </Button>
    </section>
  );
};

const contentStyle = () => css`
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  word-break: keep-all;
  width: 100%;
  max-width: 600px;
  margin: auto;
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
  font-size: ${theme.typography['24Bold'].fontSize};
  line-height: ${theme.typography['24Bold'].lineHeight};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  color: ${theme.colors.text.light};
`;

const subtitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Medium'].fontSize};
  line-height: ${theme.typography['20Medium'].lineHeight};
  font-weight: ${theme.typography['20Medium'].fontWeight};
  color: ${theme.colors.text.weak};
`;

const loginButtonStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 70%;
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
