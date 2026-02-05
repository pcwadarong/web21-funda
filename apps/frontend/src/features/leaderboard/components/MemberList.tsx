import { css, useTheme } from '@emotion/react';

import type { Theme } from '@/styles/theme';

import type { RankingMember } from '../types';

import { RankingRow } from './RankingRow';

interface MemberListProps {
  members: RankingMember[];
  emptyMessage?: string;
  showRankZoneIcon?: boolean;
  xpLabel?: string;
  onMemberClick?: (member: RankingMember) => void;
}

export const MemberList = ({
  members,
  emptyMessage = '해당 구역에 인원이 없습니다.',
  showRankZoneIcon = true,
  xpLabel = 'XP',
  onMemberClick,
}: MemberListProps) => {
  const theme = useTheme();
  const canClickMember = typeof onMemberClick === 'function';

  if (members.length === 0)
    return (
      <div css={emptyTextStyle(theme)} role="status" aria-label={emptyMessage}>
        {emptyMessage}
      </div>
    );

  return (
    <ol css={listStyle} aria-label="랭킹 목록">
      {members.map(member => (
        <RankingRow
          key={member.userId}
          member={member}
          showRankZoneIcon={showRankZoneIcon}
          xpLabel={xpLabel}
          onClick={
            canClickMember
              ? () => {
                  onMemberClick(member);
                }
              : undefined
          }
        />
      ))}
    </ol>
  );
};

const listStyle = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
  list-style: none;
  padding: 0;
`;

const emptyTextStyle = (theme: Theme) => css`
  padding: 8px 12px;
  border-radius: ${theme.borderRadius.small};
  background: ${theme.colors.surface.default};
  color: ${theme.colors.text.weak};
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
`;
