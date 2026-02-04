import { css, useTheme } from '@emotion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import dingSound from '@/assets/audio/ding.mp3';
import startSound from '@/assets/audio/start.mp3';
import { Button } from '@/components/Button';
import SVGIcon from '@/components/SVGIcon';
import { BattleStartCountdown } from '@/feat/battle/components/play/BattleStartCountdown';
import { useBattleStartCountdown } from '@/feat/battle/hooks/useBattleStartCountdown';
import type { BattleRoomSettings } from '@/feat/battle/types';
import { useSound } from '@/hooks/useSound';
import type { Theme } from '@/styles/theme';

export const BATTLE_CONFIG: Record<
  keyof BattleRoomSettings,
  { label: string; options: { label: string; value: number | string }[] }
> = {
  maxPlayers: {
    label: '최대 인원 수',
    options: [2, 5, 10, 15].map(v => ({ label: `${v}명`, value: v })),
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
      { label: '게임 개발', value: 'game' },
      { label: '데이터/ AI기초', value: 'da' },
      { label: '데브옵스', value: 'devops' },
    ],
  },
};

export interface BattleOptionsPanelProps {
  isHost: boolean;
  roomId: string | null;
  settings: BattleRoomSettings | null;
  participantCount: number;
  countdownEndsAt: number | null;
  onUpdateRoom: (roomId: string, settings: BattleRoomSettings) => void;
  onStartBattle: (roomId: string) => void;
  onCopyLink: () => void;
}

export const BattleOptionsPanel = ({
  isHost,
  roomId,
  settings,
  participantCount,
  countdownEndsAt,
  onUpdateRoom,
  onStartBattle,
  onCopyLink,
}: BattleOptionsPanelProps) => {
  const theme = useTheme();
  const { playSound } = useSound();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1200px)').matches : false,
  );
  const startSoundTimerRef = useRef<number | null>(null);
  const startSoundPlayedRef = useRef(false);
  const canStartBattle = isHost && participantCount > 1;
  const hasCountdownStarted = countdownEndsAt !== null;
  const startButtonLabel = !isHost
    ? '호스트 대기 중'
    : canStartBattle
      ? '게임 시작'
      : '참가자 대기 중';

  const handleCountdownTick = useCallback(
    (label: string) => {
      // 시작 효과음을 START 라벨보다 살짝 빠르게 재생한다.
      if (startSoundTimerRef.current) {
        window.clearTimeout(startSoundTimerRef.current);
        startSoundTimerRef.current = null;
      }

      if (label === 'START') {
        if (startSoundPlayedRef.current) {
          return;
        }

        playSound({ src: startSound, currentTime: 0 });
        startSoundPlayedRef.current = true;
        return;
      }

      if (label === '1') {
        if (startSoundPlayedRef.current) {
          playSound({ src: dingSound, currentTime: 0 });
          return;
        }

        startSoundTimerRef.current = window.setTimeout(() => {
          playSound({ src: startSound, currentTime: 0 });
          startSoundTimerRef.current = null;
          startSoundPlayedRef.current = true;
        }, 500);
      }

      playSound({ src: dingSound, currentTime: 0 });
    },
    [playSound],
  );

  const { isVisible: isStartCountdownVisible, label: startCountdownLabel } =
    useBattleStartCountdown({
      endsAt: countdownEndsAt,
      onTick: handleCountdownTick,
    });

  useEffect(() => {
    // 새 카운트다운이 시작되면 재생 플래그와 타이머를 초기화한다.
    startSoundPlayedRef.current = false;
    if (startSoundTimerRef.current) {
      window.clearTimeout(startSoundTimerRef.current);
      startSoundTimerRef.current = null;
    }
  }, [countdownEndsAt]);

  useEffect(
    () => () => {
      if (startSoundTimerRef.current) {
        window.clearTimeout(startSoundTimerRef.current);
        startSoundTimerRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1200px)');
    const handler = () => setIsDesktop(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const handleStartBattleClick = useCallback(() => {
    if (!roomId || !canStartBattle || hasCountdownStarted) {
      return;
    }

    onStartBattle(roomId);
  }, [canStartBattle, hasCountdownStarted, onStartBattle, roomId]);

  const collapsibleId = 'battle-settings-panel';

  return (
    <section css={containerStyle} aria-label="배틀 설정">
      <BattleStartCountdown isVisible={isStartCountdownVisible} label={startCountdownLabel} />
      <div css={headerWrapper}>
        <h2 css={titleStyle(theme)} id="battle-settings-heading">
          SETTING
        </h2>
        <button
          type="button"
          css={toggleButtonStyle(theme)}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={collapsibleId}
          aria-label={isExpanded ? '설정 접기' : '설정 펼치기'}
        >
          <span css={toggleTextStyle(theme)}>{isExpanded ? '접기' : '펼치기'}</span>
          <div css={iconWrapperStyle(isExpanded)} aria-hidden="true">
            <SVGIcon icon="ArrowLeft" size="sm" />
          </div>
        </button>
      </div>

      {/* 1. 설정 카드 영역: isExpanded에 따라 노출 여부 결정 */}
      <div
        id={collapsibleId}
        css={collapsibleStyle(isExpanded)}
        aria-hidden={isDesktop ? false : !isExpanded}
      >
        <div css={contentCardStyle(theme)} aria-labelledby="battle-settings-heading">
          {Object.entries(BATTLE_CONFIG).map(([key, config]) => (
            <fieldset key={key} css={fieldsetStyle}>
              <legend id={`setting-${key}-label`} css={legendStyle(theme)}>
                {config.label}
              </legend>
              <div css={buttonGroupStyle}>
                {config.options.map(opt => {
                  const isMaxPlayers = key === 'maxPlayers';
                  const isLowerThanCurrent =
                    isMaxPlayers && typeof opt.value === 'number' && participantCount > opt.value;
                  const isDisabled = !isHost || isLowerThanCurrent;
                  const isSelected = settings?.[key as keyof typeof settings] === opt.value;

                  return (
                    <button
                      key={opt.value}
                      css={pillButtonStyle(theme, isSelected)}
                      disabled={isDisabled}
                      aria-pressed={isSelected}
                      aria-label={`${config.label}: ${opt.label}${isSelected ? ', 선택됨' : ''}`}
                      onClick={() =>
                        roomId &&
                        settings &&
                        !isDisabled &&
                        onUpdateRoom(roomId, { ...settings, [key]: opt.value })
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </div>

      {/* 2. 버튼 영역: 설정창의 상태와 상관없이 항상 노출 */}
      <section css={actionButtonsStyle} aria-label="배틀 액션">
        <Button
          variant="secondary"
          fullWidth
          onClick={onCopyLink}
          css={flexBtn}
          aria-label="초대 링크 복사"
        >
          <SVGIcon icon="Copy" size="md" aria-hidden="true" /> 초대 링크 복사
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={!canStartBattle || hasCountdownStarted}
          onClick={handleStartBattleClick}
          css={flexBtn}
          aria-label={startButtonLabel}
          aria-disabled={!canStartBattle || hasCountdownStarted}
        >
          {startButtonLabel}
        </Button>
      </section>
    </section>
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

const fieldsetStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  border: none;
`;

const legendStyle = (theme: Theme) => css`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.text.weak};
  padding: 0;
`;

const buttonGroupStyle = css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
