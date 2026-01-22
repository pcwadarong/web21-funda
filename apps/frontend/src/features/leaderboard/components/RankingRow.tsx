import { css, useTheme } from '@emotion/react';

import type { Theme } from '@/styles/theme';

import type { RankingMember } from '../types';

interface RankingRowProps {
  member: RankingMember;
}

const getAvatarLabel = (displayName: string) => {
  const trimmedName = displayName.trim();
  if (!trimmedName) return '알수없음';

  return trimmedName.slice(0, 2).toUpperCase();
};

export const RankingRow = ({ member }: RankingRowProps) => {
  const theme = useTheme();

  let meBadge = null;
  if (member.isMe) meBadge = <span css={meBadgeStyle(theme)}>나</span>;

  return (
    <li css={rankingRowStyle(theme, member.isMe)}>
      <span css={rankNumberStyle(theme, member.isMe)}>{member.rank}</span>
      <div css={avatarStyle(theme)}>
        {member.profileImageUrl ? (
          <img
            src={member.profileImageUrl}
            alt={`${member.displayName} 프로필`}
            css={avatarImageStyle}
          />
        ) : (
          <span css={avatarTextStyle(theme)}>{getAvatarLabel(member.displayName)}</span>
        )}
      </div>
      <div css={nameBlockStyle}>
        <span css={memberNameStyle(theme)}>{member.displayName}</span>
        {meBadge}
      </div>
      <div css={xpBlockStyle}>
        <span css={xpValueStyle(theme)}>{member.xp.toLocaleString()} XP</span>
      </div>
    </li>
  );
};

const rankingRowStyle = (theme: Theme, isMe: boolean) => {
  let rowBackground = 'transparent';

  if (isMe) rowBackground = theme.colors.primary.surface;

  return css`
    display: grid;
    grid-template-columns: 36px 44px 1fr 110px;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: ${theme.borderRadius.medium};
    background: ${rowBackground};
    border: 1px solid ${theme.colors.border.default};

    @media (max-width: 768px) {
      grid-template-columns: 30px 40px 1fr auto;
      padding: 12px;
    }
  `;
};

const rankNumberStyle = (theme: Theme, isMe: boolean) => {
  let rankColor = theme.colors.text.strong;

  if (isMe) rankColor = theme.colors.primary.main;

  return css`
    font-size: ${theme.typography['16Bold'].fontSize};
    line-height: ${theme.typography['16Bold'].lineHeight};
    font-weight: ${theme.typography['16Bold'].fontWeight};
    color: ${rankColor};
    text-align: center;
  `;
};

const avatarStyle = (theme: Theme) => css`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: ${theme.colors.surface.default};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

const avatarImageStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const avatarTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  line-height: ${theme.typography['12Bold'].lineHeight};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.primary.dark};
`;

const nameBlockStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const memberNameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.strong};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const meBadgeStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  line-height: ${theme.typography['12Bold'].lineHeight};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.primary.main};
  background: ${theme.colors.surface.strong};
  border: 1px solid ${theme.colors.primary.main};
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
`;

const xpBlockStyle = css`
  display: flex;
  justify-content: flex-end;
`;

const xpValueStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  color: ${theme.colors.text.default};
`;
