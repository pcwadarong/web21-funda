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
      return '레슨을 완료하여 리그에 참여하세요';
    default:
      return '';
  }
};

export const LeaderboardStateMessage = ({ state, message }: LeaderboardStateMessageProps) => {
  const theme = useTheme();
  const displayMessage = getStateMessage(state, message);
  const showSkeleton = state === 'unassigned' || state === 'empty';

  return (
    <>
      <div css={stateCardStyle(theme)} role="status" aria-live="polite">
        {displayMessage}
      </div>

      {showSkeleton && (
        <div css={skeletonListStyle} aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} css={skeletonRowStyle}>
              <div css={skeletonRankStyle(theme)} />
              <div css={skeletonAvatarStyle(theme)} />
              <div css={skeletonNameStyle(theme)} />
              <div css={skeletonXpStyle(theme)} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const stateCardStyle = (theme: Theme) => css`
  padding: 20px;
  color: ${theme.colors.text.weak};
`;

export const skeletonListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

const skeletonRowStyle = css`
  display: grid;
  grid-template-columns: 36px 44px 1fr 110px;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;

  @media (max-width: 768px) {
    grid-template-columns: 30px 40px 1fr auto;
    padding: 12px;
  }
`;

const skeletonRankStyle = (theme: Theme) => css`
  width: 20px;
  height: 16px;
  border-radius: ${theme.borderRadius.small};
  background: #6c6c6c33;
`;

const skeletonAvatarStyle = (theme: Theme) => css`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.large};
  background: #6c6c6c33;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

const skeletonNameStyle = (theme: Theme) => css`
  width: 60%;
  height: 20px;
  border-radius: ${theme.borderRadius.small};
  background: #6c6c6c33;
`;

const skeletonXpStyle = (theme: Theme) => css`
  width: 70px;
  height: 16px;
  border-radius: ${theme.borderRadius.small};
  background: #6c6c6c33;
  justify-self: flex-end;
`;
