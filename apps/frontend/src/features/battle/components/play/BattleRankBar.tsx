import { css, useTheme } from '@emotion/react';
import { useLayoutEffect, useMemo, useRef } from 'react';

import { Avatar } from '@/components/Avatar';
import type { Ranking } from '@/feat/battle/types';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumbers';
import { useBattleStore } from '@/store/battleStore';
import { useThemeStore } from '@/store/themeStore';
import type { Theme } from '@/styles/theme';

interface BattleRankBarProps {
  rankings: Ranking[];
  currentParticipantId?: string | null;
  totalParticipants?: number;
  maxVisible?: number;
}

type RankingWithPlace = Ranking & { place: number; profileImg?: string };

export const BattleRankBar = ({
  rankings,
  currentParticipantId,
  totalParticipants,
  maxVisible = 4,
}: BattleRankBarProps) => {
  const theme = useTheme();
  const { isDarkMode } = useThemeStore();
  const participants = useBattleStore(state => state.participants);

  const { visibleRankings, participantCount } = useMemo(() => {
    const baseRankings = rankings.map(ranking => ({
      ...ranking,
      profileImg: participants.find(p => p.participantId === ranking.participantId)?.avatar,
    }));

    const rankingsWithPlace: RankingWithPlace[] = [];

    baseRankings.forEach((ranking, index) => {
      let place = index + 1;

      if (index > 0) {
        const prevRanking = baseRankings[index - 1];
        const prevPlace = rankingsWithPlace[index - 1];

        if (prevRanking && prevPlace && prevRanking.score === ranking.score) {
          place = prevPlace.place;
        }
      }

      rankingsWithPlace.push({ ...ranking, place });
    });

    const myRankingIndex = rankingsWithPlace.findIndex(
      ranking => ranking.participantId === currentParticipantId,
    );

    if (myRankingIndex > -1) {
      const myRanking = rankingsWithPlace.splice(myRankingIndex, 1)[0];
      if (myRanking) {
        rankingsWithPlace.unshift(myRanking);
      }
    }

    return {
      visibleRankings: rankingsWithPlace.slice(0, maxVisible),
      participantCount: totalParticipants ?? rankings.length,
    };
  }, [rankings, currentParticipantId, maxVisible, totalParticipants, participants]);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevPositionsRef = useRef<Map<string, DOMRect>>(new Map());

  useLayoutEffect(() => {
    const nextPositions = new Map<string, DOMRect>();

    visibleRankings.forEach((ranking, index) => {
      if (index === 0) return;
      const node = cardRefs.current[ranking.participantId];
      if (!node) return;
      nextPositions.set(ranking.participantId, node.getBoundingClientRect());
    });

    if (prevPositionsRef.current.size === 0) {
      prevPositionsRef.current = nextPositions;
      return;
    }

    nextPositions.forEach((nextRect, participantId) => {
      const prevRect = prevPositionsRef.current.get(participantId);
      const node = cardRefs.current[participantId];
      if (!prevRect || !node) return;

      const deltaX = prevRect.left - nextRect.left;
      if (deltaX === 0) return;

      node.style.transition = 'none';
      node.style.transform = `translate(${deltaX}px, -6px)`;
      window.requestAnimationFrame(() => {
        node.style.transition = 'transform 360ms ease';
        node.style.transform = '';
      });
    });

    prevPositionsRef.current = nextPositions;
  }, [visibleRankings]);

  return (
    <div css={containerStyle} role="region" aria-label="실시간 순위">
      <div css={countStyle(theme)} role="status" aria-live="polite">
        {participantCount}명 참여 중
      </div>
      <section aria-label="현재 순위 막대">
        <ul css={listStyle} aria-label="참가자 순위">
          {visibleRankings.map((ranking, index) => {
            const isMine = ranking.participantId === currentParticipantId;
            const scoreColor =
              ranking.score >= 0 ? theme.colors.success.main : theme.colors.error.main;

            return (
              <li
                key={ranking.participantId}
                css={listItemStyle}
                aria-label={
                  isMine
                    ? `나, ${ranking.place}등, 점수 ${ranking.score}`
                    : `${ranking.displayName}, ${ranking.place}등, 점수 ${ranking.score}`
                }
              >
                <div
                  ref={node => {
                    cardRefs.current[ranking.participantId] = node;
                  }}
                  css={cardWrapperStyle}
                >
                  <div css={cardStyle(theme, isMine)}>
                    <div css={rankBadgeStyle(theme, isMine, isDarkMode)} aria-hidden="true">
                      {ranking.place}
                    </div>
                    <Avatar
                      src={ranking.profileImg}
                      name={isMine ? '나' : ranking.displayName}
                      size="sm"
                      alt={ranking.displayName}
                    />
                    <div css={infoStyle}>
                      <div css={nameStyle(theme)}>{isMine ? '나' : ranking.displayName}</div>
                      <ScoreText value={ranking.score} color={scoreColor} />
                    </div>
                  </div>
                </div>
                {index === 0 && <div css={verticalDividerStyle(theme)} aria-hidden="true"></div>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

const containerStyle = css`
  position: sticky;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 48rem;
  min-height: fit-content;
  overflow: visible;
`;

const verticalDividerStyle = (theme: Theme) => css`
  width: 1px;
  height: 80%;
  border-left: 1px solid ${theme.colors.border.default};
`;

const listStyle = css`
  list-style: none;
  margin: 0;
  padding: 12px;
  height: 114px;
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  overflow-y: visible;
`;

const listItemStyle = css`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 0 0 calc((100% - 65px) / 4);
  min-width: 0;
`;

const cardWrapperStyle = css`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-width: 0;
`;

const cardStyle = (theme: Theme, isMine: boolean) => css`
  position: relative;
  height: 90px;
  width: 100%;
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

const rankBadgeStyle = (theme: Theme, isMine: boolean, isDarkMode: boolean) => css`
  position: absolute;
  top: -12px;
  left: -12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${isMine
    ? isDarkMode
      ? theme.colors.primary.main
      : theme.colors.primary.light
    : isDarkMode
      ? theme.colors.grayscale['600']
      : theme.colors.grayscale['500']};
  color: white;
  font-weight: ${theme.typography['16Bold'].fontWeight};
  font-size: ${theme.typography['16Bold'].fontSize};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const infoStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
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

const scoreCountStyle = css`
  font-variant-numeric: tabular-nums;
`;

const countStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  white-space: nowrap;
  text-align: right;
`;

const ScoreText = ({ value, color }: { value: number; color: string }) => {
  const displayValue = useAnimatedNumber(value);
  const text = displayValue >= 0 ? `+${displayValue}` : `${displayValue}`;
  return <output css={[scoreStyle(color), scoreCountStyle]}>{text}</output>;
};
