import { css, useTheme } from '@emotion/react';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import type { BattleRoomSettings, BattleTimeLimitType } from '@/feat/battle/types';
import { useBattleSocket } from '@/features/battle/hooks/useBattleSocket';
import { useToast } from '@/store/toastStore';
import type { Theme } from '@/styles/theme';

// UI 문자열과 백엔드 데이터 타입 매핑 상수
const BUILD_OPTIONS = [
  { label: '프론트엔드', value: 'fe' },
  { label: '백엔드', value: 'be' },
  { label: '모바일', value: 'mo' },
  { label: 'CS 기초', value: 'cs' },
  { label: '알고리즘', value: 'algo' },
  { label: '게임 개발', value: 'game' },
  { label: '데이터/ AI기초', value: 'da' },
  { label: '데브옵스', value: 'devops' },
];

const TIME_OPTIONS = [
  { label: '신속하게(10초)', value: 'fast' as BattleTimeLimitType },
  { label: '적절하게(15초)', value: 'recommended' as BattleTimeLimitType },
  { label: '여유롭게(25초)', value: 'relaxed' as BattleTimeLimitType },
];

const MAX_PLAYER_OPTIONS = [2, 5, 10, 25, 30];

export const GameSettingsPanel = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const { battleState, socket, updateRoom, startBattle } = useBattleSocket();

  const { roomId, participants, settings } = battleState;

  // 호스트 여부 확인 (socket.id 기반)
  const isHost = participants.find(p => p.participantId === socket?.id)?.isHost ?? false;

  /**
   * 서버에 설정 변경 요청을 보냅니다.
   * 로컬 state를 바꾸지 않고 서버의 응답을 기다립니다.
   */
  const emitRoomUpdate = (updates: Partial<BattleRoomSettings>) => {
    if (!roomId || !socket || !isHost) return;

    // 백엔드의 검증과 브로드캐스트를 기다린다 (로컬 state는 socket 이벤트로 업데이트)
    updateRoom(roomId, {
      fieldSlug: updates.fieldSlug ?? settings?.fieldSlug ?? 'be',
      maxPlayers: updates.maxPlayers ?? settings?.maxPlayers ?? 5,
      timeLimitType: updates.timeLimitType ?? settings?.timeLimitType ?? 'recommended',
    });
  };
  const handleCopyInviteLink = async () => {
    try {
      // 1. 현재 브라우저에 표시된 전체 URL을 가져옵니다.
      const currentUrl = window.location.href;

      // 2. 클립보드에 복사합니다.
      await navigator.clipboard.writeText(currentUrl);

      // 3. 사용자 피드백
      showToast('초대 링크가 복사되었습니다. 친구에게 공유해보세요! 🚀');
    } catch {
      showToast('링크 복사에 실패했습니다. 주소창의 링크를 직접 복사해주세요.');
    }
  };
  const handleStartGame = () => {
    if (!isHost || !roomId) {
      alert('호스트만 게임을 시작할 수 있습니다.');
      return;
    }
    startBattle(roomId);
  };

  return (
    <div css={containerStyle}>
      <h2 css={titleStyle(theme)}>게임 세팅</h2>

      <div css={contentCardStyle(theme)}>
        {/* 최대 인원 수 설정 */}
        <section css={sectionStyle}>
          <div css={sectionLabelStyle(theme)}>
            최대 인원 수 {!isHost && <span css={hostOnlyLabelStyle}>(호스트만 변경 가능)</span>}
          </div>
          <div css={buttonGroupStyle}>
            {MAX_PLAYER_OPTIONS.map(option => (
              <button
                key={option}
                css={pillButtonStyle(theme, settings?.maxPlayers === option)}
                disabled={!isHost}
                onClick={() => emitRoomUpdate({ maxPlayers: option })}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        {/* 제한 시간 설정 */}
        <section css={sectionStyle}>
          <div css={sectionLabelStyle(theme)}>
            제한 시간 {!isHost && <span css={hostOnlyLabelStyle}>(호스트만 변경 가능)</span>}
          </div>
          <div css={buttonGroupStyle}>
            {TIME_OPTIONS.map(option => (
              <button
                key={option.value}
                css={pillButtonStyle(theme, settings?.timeLimitType === option.value)}
                disabled={!isHost}
                onClick={() => emitRoomUpdate({ timeLimitType: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* 필드 선택 설정 */}
        <section css={sectionStyle}>
          <div css={sectionLabelStyle(theme)}>
            필드 선택 {!isHost && <span css={hostOnlyLabelStyle}>(호스트만 변경 가능)</span>}
          </div>
          <div css={buildGridStyle}>
            {BUILD_OPTIONS.map(option => (
              <button
                key={option.value}
                css={pillButtonStyle(theme, settings?.fieldSlug === option.value)}
                disabled={!isHost}
                onClick={() => emitRoomUpdate({ fieldSlug: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div css={actionButtonsStyle}>
        <Button variant="secondary" css={flexBtn} onClick={handleCopyInviteLink}>
          <SVGIcon icon={'Copy'} size="md" />
          초대 링크 복사
        </Button>
        <Button
          variant="primary"
          css={flexBtn}
          disabled={!isHost}
          onClick={handleStartGame}
          style={{
            opacity: isHost ? 1 : 0.5,
            cursor: isHost ? 'pointer' : 'not-allowed',
          }}
        >
          {isHost ? '게임시작' : '게임시작 (호스트만)'}
        </Button>
      </div>
    </div>
  );
};

// --- Styles ---

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['24Medium'].fontSize};
  font-weight: ${theme.typography['24Medium'].fontWeight};
  color: ${theme.colors.primary.main};
`;

const contentCardStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const sectionStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const sectionLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.weak};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const hostOnlyLabelStyle = css`
  color: #999;
  font-size: 12px;
  font-weight: 400;
`;

const buttonGroupStyle = css`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const pillButtonStyle = (theme: Theme, isActive: boolean) => css`
  flex: 1;
  min-width: 80px;
  padding: 12px 16px;
  border-radius: 50px;
  border: none;
  background: ${isActive ? theme.colors.primary.main : theme.colors.surface.bold};
  color: ${isActive ? theme.colors.surface.strong : theme.colors.text.default};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:hover:not(:disabled) {
    filter: brightness(0.95);
  }
`;

const buildGridStyle = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
`;

const actionButtonsStyle = css`
  display: flex;
  gap: 16px;
  margin-top: 10px;
`;

const flexBtn = css`
  flex: 1;
  gap: 8px;
  height: 52px;
`;
