import { css, useTheme } from '@emotion/react';

import { Avatar } from '@/components/Avatar';
import type { Participant } from '@/feat/battle/types';
import { useSocketContext } from '@/providers/SocketProvider';
import type { Theme } from '@/styles/theme';

interface ParticipantsListProps {
  participants: Participant[];
}

export const ParticipantsList = ({ participants }: ParticipantsListProps) => {
  const theme = useTheme();
  const { socket } = useSocketContext();

  return (
    <div css={containerStyle}>
      <h2 css={titleStyle(theme)}>PARTICIPANTS</h2>
      {!Array.isArray(participants) ? (
        <div css={containerStyle}>참여자 목록을 불러오는 중...</div>
      ) : (
        <div css={gridWrapperStyle}>
          <div css={gridStyle}>
            {participants.map((participant, index) => {
              const isCurrentUser = participant.participantId === socket?.id;
              return (
                <div key={participant.id} css={cardStyle(theme, isCurrentUser)}>
                  <div css={leftInfoStyle}>
                    <span css={numberStyle(theme)}>{index + 1}</span>
                    <Avatar
                      src={participant.profileImageUrl}
                      name={participant.name}
                      size="sm"
                      css={avatarStyle}
                      alt={participant.name}
                    />
                    <div css={nameStyle(theme)}>{participant.name}</div>
                  </div>
                  {index === 0 && <span css={crownStyle}>👑</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
`;

const gridWrapperStyle = css`
  flex: 1;
  overflow-y: auto;
  padding-right: 12px;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e5e5e5;
    border-radius: 2px;
  }
`;

const gridStyle = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const cardStyle = (theme: Theme, isCurrent: boolean) => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  height: 102px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${isCurrent ? theme.colors.primary.main : theme.colors.border.default};
  background: ${theme.colors.surface.strong};
  flex-shrink: 0;
`;

const titleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.primary.main};
  letter-spacing: 0.12em;
`;

const numberStyle = (theme: Theme) => css`
  font-size: 12px;
  color: ${theme.colors.text.weak};
`;

const nameStyle = (theme: Theme) => css`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.text.default};
`;

const leftInfoStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const avatarStyle = css`
  width: 40px;
  height: 40px;
`;
const crownStyle = css`
  font-size: 16px;
`;
