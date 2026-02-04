import { css, useTheme } from '@emotion/react';

import { Avatar } from '@/components/Avatar';
import SVGIcon from '@/components/SVGIcon';
import { useThemeStore } from '@/store/themeStore';
import type { Theme } from '@/styles/theme';
import { colors } from '@/styles/token';
import { getTierIconName } from '@/utils/tier';

import type { RankingMember } from '../types';

interface RankingRowProps {
  member: RankingMember;
  showRankZoneIcon?: boolean;
  xpLabel?: string;
}

export const RankingRow = ({
  member,
  showRankZoneIcon = true,
  xpLabel = 'XP',
}: RankingRowProps) => {
  const theme = useTheme();
  const { isDarkMode } = useThemeStore();
  const { isMe, rankZone, rank, profileImageUrl, displayName, xp, tierName } = member;
  const tierIconName = getTierIconName(tierName);

  const ZONE_COLORS = {
    PROMOTION: theme.colors.success.main,
    DEMOTION: theme.colors.error.main,
    MAINTAIN: theme.colors.text.weak,
  };

  const activeColor = isMe
    ? isDarkMode
      ? colors.light.grayscale[50] // 다크모드 '나' -> 흰색 계열
      : theme.colors.primary.main // 라이트모드 '나' -> 보라색 계열
    : ZONE_COLORS[rankZone] || theme.colors.text.strong;

  const renderRankZoneIcon = () => {
    if (!showRankZoneIcon) {
      return null;
    }

    switch (rankZone) {
      case 'PROMOTION':
        return (
          <SVGIcon
            icon="ArrowLeft"
            size="sm"
            style={{ transform: 'rotate(90deg)', color: activeColor }}
            aria-hidden="true"
          />
        );
      case 'DEMOTION':
        return (
          <SVGIcon
            icon="ArrowLeft"
            size="sm"
            style={{ transform: 'rotate(270deg)', color: activeColor }}
            aria-hidden="true"
          />
        );
      case 'MAINTAIN':
        return <SVGIcon icon="Minus" size="sm" style={{ color: activeColor }} aria-hidden="true" />;
      default:
        return null;
    }
  };

  const zoneLabel =
    rankZone === 'PROMOTION' ? '승급권' : rankZone === 'DEMOTION' ? '강등권' : '유지';

  return (
    <li
      css={rankingRowStyle(theme, isMe, isDarkMode)}
      aria-label={`${displayName}${isMe ? ', 나' : ''}, ${rank}위, ${xp.toLocaleString()} ${xpLabel}, ${zoneLabel}`}
    >
      <span css={rankNumberStyle(theme, activeColor)}>{rank}</span>

      <Avatar
        src={profileImageUrl}
        name={displayName}
        size="sm"
        css={avatarStyle(theme)}
        alt={`${displayName} 프로필`}
      />

      <div css={nameBlockStyle}>
        <span css={memberNameStyle(theme, isMe, isDarkMode)}>{displayName}</span>
        {tierIconName && (
          <span css={tierIconWrapperStyle} aria-label={`티어 ${tierName}`}>
            <SVGIcon icon={tierIconName} size="md" />
          </span>
        )}
        {isMe && (
          <span css={meBadgeStyle(theme, isDarkMode)} aria-label="내 순위">
            나
          </span>
        )}
      </div>

      <div css={xpBlockStyle}>
        <output css={xpValueStyle(theme, isMe, isDarkMode)}>
          {xp.toLocaleString()} {xpLabel}
        </output>
        {renderRankZoneIcon()}
      </div>
    </li>
  );
};

const rankingRowStyle = (theme: Theme, isMe: boolean, isDarkMode: boolean) => css`
  display: grid;
  grid-template-columns: 36px 44px 1fr 110px;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: ${theme.borderRadius.medium};

  background: ${isMe
    ? isDarkMode
      ? 'rgba(101, 89, 234, 0.2)'
      : theme.colors.primary.surface
    : 'transparent'};

  transition: background 0.2s ease;

  ${isMe &&
  css`
    outline: 1.5px solid ${isDarkMode ? theme.colors.primary.light : theme.colors.primary.main};
    outline-offset: -1.5px;
  `}

  @media (max-width: 768px) {
    grid-template-columns: 30px 40px 1fr auto;
    padding: 12px;
  }
`;

const rankNumberStyle = (theme: Theme, color: string) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  line-height: ${theme.typography['12Bold'].lineHeight};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${color};
  text-align: center;
`;

const avatarStyle = (theme: Theme) => css`
  border-radius: ${theme.borderRadius.large};
  background: ${theme.colors.surface.default};

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

const nameBlockStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const memberNameStyle = (theme: Theme, isMe: boolean, isDarkMode: boolean) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  color: ${isMe && isDarkMode ? colors.light.grayscale[50] : theme.colors.text.strong};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const meBadgeStyle = (theme: Theme, isDarkMode: boolean) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  color: ${isDarkMode ? theme.colors.primary.light : theme.colors.primary.main};
  background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : theme.colors.surface.strong};
  border: 1px solid ${isDarkMode ? theme.colors.primary.light : theme.colors.primary.main};
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
`;

const tierIconWrapperStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const xpBlockStyle = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

const xpValueStyle = (theme: Theme, isMe: boolean, isDarkMode: boolean) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${isMe && isDarkMode ? colors.light.grayscale[100] : theme.colors.text.weak};
`;
