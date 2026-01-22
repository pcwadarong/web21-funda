import { useTheme } from '@emotion/react';
import { css, type Theme } from '@emotion/react';

type StateType = 'error' | 'empty' | 'unassigned';

interface LeaderboardStateMessageProps {
  state: StateType;
  message?: string;
}

const getStateMessage = (state: StateType, customMessage?: string): string => {
  if (customMessage) return customMessage;

  switch (state) {
    case 'error':
      return '랭킹 정보를 불러오지 못했습니다.';
    case 'empty':
      return '랭킹 데이터가 비어 있습니다.';
    case 'unassigned':
      return '리더보드 잠금 해제! 레슨을 완료하여 참여하세요';
    default:
      return '';
  }
};

export const LeaderboardStateMessage = ({ state, message }: LeaderboardStateMessageProps) => {
  const theme = useTheme();
  const displayMessage = getStateMessage(state, message);
  const showSkeleton = state === 'unassigned';

  return (
    <>
      <div css={stateCardStyle(theme)}>{displayMessage}</div>
      {showSkeleton && (
        <div css={skeletonListStyle}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} css={skeletonRowStyle(theme)} />
          ))}
        </div>
      )}
    </>
  );
};

const stateCardStyle = (theme: Theme) => css`
  padding: 20px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.strong};
  color: ${theme.colors.text.weak};
`;

export const skeletonListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const skeletonRowStyle = (theme: Theme) => css`
  height: 56px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.strong};
`;
