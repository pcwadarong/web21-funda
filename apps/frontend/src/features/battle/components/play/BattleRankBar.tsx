import { css, useTheme } from '@emotion/react';
import { type RefObject, useLayoutEffect, useMemo, useRef } from 'react';

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
  scoreDelta: number;
  startPosition?: { x: number; y: number } | null;
}

type RankingWithPlace = Ranking & { place: number; profileImg?: string };

export const BattleRankBar = ({
  rankings,
  currentParticipantId,
  totalParticipants,
  maxVisible = 4,
  scoreDelta,
  startPosition,
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
  const myCardRef = useRef<HTMLDivElement | null>(null);
  const myScoreRef = useRef<HTMLDivElement | null>(null);
  const prevScoreDeltaRef = useRef<number | null>(null);

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

  useLayoutEffect(() => {
    if (scoreDelta === 0) {
      prevScoreDeltaRef.current = 0;
      return;
    }

    // 동일 결과로 여러 번 렌더링되는 경우(StrictMode/dev 포함) 중복 실행 방지
    if (prevScoreDeltaRef.current === scoreDelta) return;
    prevScoreDeltaRef.current = scoreDelta;

    const cardEl = myCardRef.current;
    const scoreEl = myScoreRef.current;
    if (!cardEl || !scoreEl) return;

    const scoreRect = scoreEl.getBoundingClientRect();

    const startX = startPosition?.x ?? window.innerWidth / 2;
    const startY = startPosition?.y ?? window.innerHeight / 2;
    const endX = scoreRect.left + scoreRect.width / 2;
    const endY = scoreRect.top + scoreRect.height / 2;

    const dx = endX - startX;
    const dy = endY - startY;

    const bubble = document.createElement('div');
    bubble.textContent = scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`;

    bubble.style.position = 'fixed';
    bubble.style.left = `${startX}px`;
    bubble.style.top = `${startY}px`;
    bubble.style.transform = 'translate(-50%, -50%)';
    bubble.style.padding = '6px 10px';
    bubble.style.color = scoreDelta > 0 ? theme.colors.success.main : theme.colors.error.main;
    bubble.style.background = 'transparent';
    bubble.style.fontWeight = String(theme.typography['32Bold'].fontWeight);
    bubble.style.fontSize = theme.typography['32Bold'].fontSize;
    bubble.style.lineHeight = '1';
    bubble.style.pointerEvents = 'none';
    bubble.style.zIndex = '9999';
    bubble.style.willChange = 'transform, opacity, filter';

    document.body.appendChild(bubble);

    const anim = bubble.animate(
      [
        {
          transform: 'translate(-50%, -50%) translate(0px, 0px) scale(2.4)',
          opacity: 1,
          filter: 'blur(0px)',
        },
        {
          transform: 'translate(-50%, -50%) translate(0px, -24px) scale(1.8)',
          opacity: 1,
          filter: 'blur(0px)',
          offset: 0.7,
        },
        {
          transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(0.6)`,
          opacity: 0,
          filter: 'blur(1px)',
        },
      ],
      {
        duration: 1500,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
      },
    );

    const cleanup = () => bubble.remove();
    anim.onfinish = cleanup;
    anim.oncancel = cleanup;

    return () => {
      anim.cancel();
    };
  }, [scoreDelta, startPosition, theme]);

  return (
    <section css={containerStyle} aria-label="실시간 순위">
      <output css={countStyle(theme)} aria-live="polite">
        {participantCount}명 참여 중
      </output>
      <section aria-label="현재 순위 막대">
        <ul css={listStyle} aria-label="참가자 순위">
          {visibleRankings.map((ranking, index) => {
            const isMine = ranking.participantId === currentParticipantId;
            const scoreColor =
              ranking.score > 0
                ? theme.colors.success.main
                : ranking.score < 0
                  ? theme.colors.error.main
                  : theme.colors.text.default;

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
                    if (isMine) myCardRef.current = node;
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
                      className={'avatar-container'}
                    />
                    <div css={infoStyle}>
                      <div css={nameStyle(theme)}>{isMine ? '나' : ranking.displayName}</div>
                      <ScoreText
                        value={ranking.score}
                        color={scoreColor}
                        theme={theme}
                        containerRef={isMine ? myScoreRef : undefined}
                      />
                    </div>
                  </div>
                </div>
                {index === 0 && <div css={verticalDividerStyle(theme)} aria-hidden="true"></div>}
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
};

const containerStyle = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 48rem;
  min-height: fit-content;
  padding-top: 16px;
  overflow: visible;

  @media (max-width: 768px) {
    gap: 0px;
    padding: 12px;
  }
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
  overflow-y: visible;

  @media (max-width: 768px) {
    gap: 8px;
    padding: 0px 4px 16px 4px;
  }
`;

const listItemStyle = css`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 0 0 calc((100% - 65px) / 4);
  min-width: 0;

  @media (max-width: 768px) {
    justify-content: center;
  }
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

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    width: 60px;
    height: 60px;
    border: none;
    box-shadow: none;
    background: transparent;

    & .avatar-container {
      position: absolute;
      top: 0;
      z-index: 0;
      width: 60px;
      height: 60px;
      border: 2px solid ${isMine ? theme.colors.primary.light : theme.colors.border.default};
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  }
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

  @media (max-width: 768px) {
    top: -6px;
    left: -6px;
    width: 24px;
    height: 24px;
    font-weight: ${theme.typography['14Bold'].fontWeight};
    font-size: ${theme.typography['14Bold'].fontSize};
    z-index: 1;
  }
`;

const infoStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  @media (max-width: 768px) {
    align-items: center;
    justify-content: center;
  }
`;

const nameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.default};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    width: 75px;
    position: absolute;
    bottom: -30px;
    font-size: ${theme.typography['14Medium'].fontSize};
    font-weight: ${theme.typography['14Medium'].fontWeight};
    color: ${theme.colors.text.default};
    text-align: center;
  }
`;

const scoreStyle = (theme: Theme, color: string) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${color};

  @media (max-width: 768px) {
    position: absolute;
    bottom: -8px;
    padding: 2px 6px;
    border-radius: ${theme.borderRadius.small};
    font-size: ${theme.typography['12Bold'].fontSize};
    font-weight: ${theme.typography['12Bold'].fontWeight};
    background: ${theme.colors.surface.strong};
    border: 1px solid ${color};
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
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

const ScoreText = ({
  value,
  color,
  theme,
  containerRef,
}: {
  value: number;
  color: string;
  theme: Theme;
  containerRef?: RefObject<HTMLDivElement | null>;
}) => {
  const displayValue = useAnimatedNumber(value);
  const text = displayValue > 0 ? `+${displayValue}` : `${displayValue}`;
  return (
    <div ref={containerRef} css={[scoreStyle(theme, color), scoreCountStyle]}>
      {text}
    </div>
  );
};
