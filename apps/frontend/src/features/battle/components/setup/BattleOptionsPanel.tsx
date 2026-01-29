import { css, useTheme } from '@emotion/react';
import { useState } from 'react';

import { Button } from '@/components/Button';
import SVGIcon from '@/components/SVGIcon';
import type { BattleRoomSettings } from '@/feat/battle/types';
import { useBattleSocket } from '@/features/battle/hooks/useBattleSocket';
import { useToast } from '@/store/toastStore';
import type { Theme } from '@/styles/theme';

export const BATTLE_CONFIG: Record<
  keyof BattleRoomSettings,
  { label: string; options: { label: string; value: any }[] }
> = {
  maxPlayers: {
    label: '최대 인원 수',
    options: [2, 5, 10, 25, 30].map(v => ({ label: `${v}명`, value: v })),
  },
  timeLimitType: {
    label: '제한 시간',
    options: [
      { label: '10초', value: 'fast' },
      { label: '15초', value: 'recommended' },
      { label: '25초', value: 'relaxed' },
    ],
  },
  fieldSlug: {
    label: '필드 선택',
    options: [
      { label: '프론트엔드', value: 'fe' },
      { label: '백엔드', value: 'be' },
      { label: '모바일', value: 'mo' },
      { label: 'CS 기초', value: 'cs' },
      { label: '알고리즘', value: 'algo' },
      { label: '데브옵스', value: 'devops' },
    ],
  },
};

export const BattleOptionsPanel = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const { battleState, socket, updateRoom, startBattle } = useBattleSocket();
  const { roomId, participants, settings } = battleState;
  const isHost = participants.find(p => p.participantId === socket?.id)?.isHost ?? false;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('초대 링크가 복사되었습니다. 친구에게 공유해보세요! 🚀');
    } catch {
      showToast('링크 복사에 실패했습니다. 주소창의 링크를 직접 복사해주세요.');
    }
  };

  return (
    <div css={containerStyle}>
      <div css={headerWrapper}>
        <h2 css={titleStyle(theme)}>SETTING</h2>
        <button css={toggleButtonStyle(theme)} onClick={() => setIsExpanded(!isExpanded)}>
          <span css={toggleTextStyle(theme)}>{isExpanded ? '접기' : '펼치기'}</span>
          <div css={iconWrapperStyle(isExpanded)}>
            <SVGIcon icon="ArrowLeft" size="sm" />
          </div>
        </button>
      </div>

      {/* 1. 설정 카드 영역: isExpanded에 따라 노출 여부 결정 */}
      <div css={collapsibleStyle(isExpanded)}>
        <div css={contentCardStyle(theme)}>
          {Object.entries(BATTLE_CONFIG).map(([key, config]) => (
            <section key={key} css={sectionStyle}>
              <div css={sectionLabelStyle(theme)}>{config.label}</div>
              <div css={buttonGroupStyle}>
                {config.options.map(opt => (
                  <button
                    key={opt.value}
                    css={pillButtonStyle(
                      theme,
                      settings?.[key as keyof typeof settings] === opt.value,
                    )}
                    disabled={!isHost}
                    onClick={() => updateRoom(roomId!, { ...settings!, [key]: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* 2. 버튼 영역: 설정창의 상태와 상관없이 항상 노출 */}
      <div css={actionButtonsStyle}>
        <Button variant="secondary" fullWidth onClick={handleCopyLink} css={flexBtn}>
          <SVGIcon icon="Copy" size="md" /> 초대 링크 복사
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={!isHost}
          onClick={() => startBattle(roomId!)}
          css={flexBtn}
        >
          {isHost ? '게임 시작' : '호스트 대기 중'}
        </Button>
      </div>
    </div>
  );
};

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
`;

const collapsibleStyle = (isExpanded: boolean) => css`
  display: flex;
  flex-direction: column;
  @media (max-width: 1200px) {
    display: ${isExpanded ? 'flex' : 'none'};
  }
`;

const actionButtonsStyle = css`
  display: flex;
  gap: 12px;
  margin-top: auto;
`;

const headerWrapper = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const titleStyle = (theme: Theme) => css`
  font-size: 14px;
  color: ${theme.colors.primary.main};
  font-weight: 600;
`;

const toggleButtonStyle = (theme: Theme) => css`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  gap: 6px;
  align-items: center;
  color: ${theme.colors.text.weak};

  @media (max-width: 1200px) {
    display: flex;
  }
`;

const toggleTextStyle = (theme: Theme) => css`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.text.weak};
`;

const iconWrapperStyle = (isExpanded: boolean) => css`
  display: flex;
  transition: transform 0.3s ease-in-out;
  transform: ${isExpanded ? 'rotate(90deg)' : 'rotate(-90deg)'};
`;

const contentCardStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 1px solid ${theme.colors.border.default};
`;

const sectionStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const sectionLabelStyle = (theme: Theme) => css`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.text.weak};
`;

const buttonGroupStyle = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const pillButtonStyle = (theme: Theme, active: boolean) => css`
  padding: 10px;
  border-radius: ${theme.borderRadius.large};
  border: 1px solid ${active ? theme.colors.primary.main : theme.colors.border.default};
  background: ${active ? theme.colors.grayscale[50] : theme.colors.surface.default};
  color: ${active ? theme.colors.primary.main : theme.colors.text.default};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const flexBtn = css`
  height: 48px;
  gap: 8px;
`;
