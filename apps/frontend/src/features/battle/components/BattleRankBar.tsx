import { css, useTheme } from '@emotion/react';

import type { Ranking } from '@/feat/battle/types';
import type { Theme } from '@/styles/theme';

interface BattleRankBarProps {
  rankings: Ranking[];
  currentParticipantId?: string | null;
  totalParticipants?: number;
  maxVisible?: number;
}

export const BattleRankBar = ({
  rankings,
  currentParticipantId,
  totalParticipants,
  maxVisible = 4,
}: BattleRankBarProps) => {
  const theme = useTheme();
  const visibleRankings = rankings.slice(0, maxVisible);
  const participantCount = totalParticipants ?? rankings.length;

  return (
    <div css={containerStyle}>
      <div css={countStyle(theme)}>{participantCount}명 참여 중</div>
      <section>
        <div css={listStyle}>
          {visibleRankings.map((ranking, index) => {
            const isMine = ranking.participantId === currentParticipantId;
            const scoreText = ranking.score >= 0 ? `+${ranking.score}` : `${ranking.score}`;
            const scoreColor =
              ranking.score >= 0 ? theme.colors.success.main : theme.colors.error.main;

            return (
              <div key={ranking.participantId} css={cardStyle(theme, isMine)}>
                <div css={rankBadgeStyle(theme)}>{index + 1}</div>
                <div css={avatarStyle(theme)}>{getAvatarText(ranking.displayName)}</div>
                <div css={infoStyle}>
                  <div css={nameStyle(theme)}>{ranking.displayName}</div>
                  <div css={scoreStyle(scoreColor)}>{scoreText}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const getAvatarText = (name: string): string => name.trim().charAt(0) || '?';

const containerStyle = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  width: 100%;
  max-width: 48rem;
  min-height: fit-content;
  overflow: visible;
`;

const listStyle = css`
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  overflow-y: visible;
  padding: 12px;
`;

const cardStyle = (theme: Theme, isMine: boolean) => css`
  position: relative;
  height: 90px;
  flex: 0 0 calc((100% - 48px) / 4);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  min-width: 0;
  border-radius: ${theme.borderRadius.large};
  background: ${theme.colors.surface.strong};
  border: 2px solid ${isMine ? theme.colors.primary.light : 'transparent'};
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.1);
`;

const rankBadgeStyle = (theme: Theme) => css`
  position: absolute;
  top: -12px;
  left: -12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${theme.colors.primary.semilight};
  color: ${theme.colors.primary.main};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  font-size: ${theme.typography['16Bold'].fontSize};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const avatarStyle = (theme: Theme) => css`
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 50%;
  background: ${theme.colors.surface.bold};
  border: 1px solid ${theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.text.default};
`;

const infoStyle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const nameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.default};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const scoreStyle = (color: string) => css`
  font-size: 14px;
  font-weight: 700;
  color: ${color};
`;

const countStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  white-space: nowrap;
  text-align: right;
`;
