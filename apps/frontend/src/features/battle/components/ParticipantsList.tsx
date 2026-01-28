import { css, useTheme } from '@emotion/react';

import { useSocketContext } from '@/providers/SocketProvider';
import type { Theme } from '@/styles/theme';

interface Participant {
  id: number;
  name: string;
  avatar: string;
  participantId: string;
  profileImageUrl?: string; // 로그인 사용자 프로필 이미지
}

interface ParticipantsListProps {
  participants: Participant[];
}

export const ParticipantsList = ({ participants }: ParticipantsListProps) => {
  const theme = useTheme();
  const { socket } = useSocketContext();

  return (
    <div css={containerStyle}>
      <h2 css={titleStyle(theme)}>참여 인원</h2>
      <div css={gridWrapperStyle}>
        <div css={gridStyle}>
          {participants.map((participant, index) => {
            const isCurrentUser = participant.participantId === socket?.id;
            return (
              <div key={participant.id} css={cardStyle(theme, isCurrentUser)}>
                <div css={leftInfoStyle}>
                  <span css={numberStyle(theme)}>{index + 1}</span>
                  <div css={avatarStyle}>
                    {participant.profileImageUrl ? (
                      <img
                        css={abatarImgStyle}
                        src={participant.profileImageUrl}
                        alt={participant.name}
                      />
                    ) : (
                      participant.avatar
                    )}
                  </div>
                  <div css={nameStyle(theme)}>{participant.name}</div>
                </div>
                {index === 0 && <span css={crownStyle}>👑</span>}
              </div>
            );
          })}
        </div>
      </div>
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
  flex: 1; /* 남은 공간을 다 차지함 */
  overflow-y: auto; /* 위아래 스크롤 허용 */
  padding-right: 15px;
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
`;

const cardStyle = (theme: Theme, isFirst: boolean) => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  height: 102px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${isFirst ? theme.colors.primary.main : theme.colors.border.default};
  background: ${theme.colors.surface.strong};
  transition: transform 0.2s;
  width: 100%;
  &:hover {
    background: ${theme.colors.surface.default};
  }
`;

const crownStyle = css`
  font-size: 14px;
`;

const titleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.typography['24Medium'].fontSize};
  font-weight: ${theme.typography['24Medium'].fontWeight};
  color: ${theme.colors.primary.main};
`;

const numberStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.light};
`;

const nameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.default};
`;

const leftInfoStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const avatarStyle = css`
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
`;
const abatarImgStyle = css`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;
