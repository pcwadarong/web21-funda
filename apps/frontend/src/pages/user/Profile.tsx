import { css, useTheme } from '@emotion/react';
import { Navigate, useParams } from 'react-router-dom';

import { useAuthUser } from '@/store/authStore';
import type { Theme } from '@/styles/theme';

export const Profile = () => {
  const { userId } = useParams();
  const user = useAuthUser();
  const theme = useTheme();

  if (!userId && user?.id) return <Navigate to={`/profile/${user.id}`} replace />;
  if (!userId && !user) return <Navigate to="/login" replace />;

  return (
    <main css={pageStyle}>
      <div css={pageContentStyle}>
        <header css={headerStyle}>
          <h1 css={pageTitleStyle(theme)}>PROFILE</h1>
        </header>
        <section css={headerCardStyle(theme)}>
          <div css={headerLeftStyle}>
            <div css={avatarStyle(theme)} />
            <div css={headerInfoStyle}>
              <div css={nameRowStyle}>
                <h1 css={nameStyle(theme)}>펀다</h1>
                <span css={tierBadgeStyle(theme)}>BRONZE</span>
              </div>
              <div css={metaRowStyle(theme)}>
                <span>⚡ 1265 XP</span>
                <span>💎 15</span>
              </div>
            </div>
          </div>
          <button type="button" css={editButtonStyle(theme)} disabled>
            프로필 이미지 수정하기
          </button>
        </section>

        <div css={twoColumnGridStyle}>
          <section css={cardStyle(theme)}>
            <div css={tabRowStyle(theme)}>
              <button type="button" css={tabStyle(theme, true)}>
                팔로잉
              </button>
              <button type="button" css={tabStyle(theme, false)}>
                팔로워
              </button>
            </div>
            <div css={listStyle}>
              {['Alex Chen', 'Sarah Kim', 'Mike Jones'].map(name => (
                <div key={name} css={listItemStyle(theme)}>
                  <div css={listAvatarStyle(theme)} />
                  <div css={listTextStyle}>
                    <strong css={listNameStyle(theme)}>{name}</strong>
                    <span css={listSubStyle(theme)}>1580 XP · GOLD</span>
                  </div>
                  <span css={listRankStyle(theme)}>#1</span>
                </div>
              ))}
            </div>
            <button type="button" css={moreButtonStyle(theme)}>
              더보기
            </button>
          </section>

          <section css={cardStyle(theme)}>
            <h2 css={sectionTitleStyle(theme)}>펀다의 통계</h2>
            <div css={statListStyle}>
              <div css={statItemStyle(theme)}>
                <span css={statLabelStyle(theme)}>Total Study Time</span>
                <strong css={statValueStyle(theme)}>840 min</strong>
              </div>
              <div css={statItemStyle(theme)}>
                <span css={statLabelStyle(theme)}>Questions Solved</span>
                <strong css={statValueStyle(theme)}>159</strong>
              </div>
              <div css={statItemStyle(theme)}>
                <span css={statLabelStyle(theme)}>Current Streak</span>
                <strong css={statValueStyle(theme)}>7 days</strong>
              </div>
            </div>
          </section>
        </div>

        <div css={twoColumnGridStyle}>
          <section css={cardStyle(theme)}>
            <h2 css={sectionTitleStyle(theme)}>연간 학습</h2>
            <div css={heatmapStyle}>
              {Array.from({ length: 84 }).map((_, index) => (
                <span key={index} css={heatmapCellStyle(theme)} />
              ))}
            </div>
          </section>

          <section css={cardStyle(theme)}>
            <h2 css={sectionTitleStyle(theme)}>학습 시간</h2>
            <p css={chartCaptionStyle(theme)}>최근 한 주, 하루 평균 학습 시간은 n분 n초예요.</p>
            <div css={chartPlaceholderStyle(theme)} />
            <div css={chartAxisStyle(theme)}>
              <span>2025.12.21</span>
              <span>2025.12.21</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

const pageStyle = css`
  flex: 1;
  min-height: 100vh;
  padding: 32px 24px 120px;
`;

const pageContentStyle = css`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const headerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

const pageTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  background: linear-gradient(90deg, ${theme.colors.primary.main}, ${theme.colors.primary.light});
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  letter-spacing: 0.12em;
  padding-left: 0.5rem;
`;

const headerCardStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  border-radius: ${theme.borderRadius.large};
  border: 1px solid ${theme.colors.border.default};
  background: linear-gradient(180deg, #6559ea 0%, #8b82ff 100%);
  color: ${theme.colors.surface.strong};
`;

const headerLeftStyle = css`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const avatarStyle = (theme: Theme) => css`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${theme.colors.primary.light};
`;

const headerInfoStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const nameRowStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const nameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['24Bold'].fontSize};
  line-height: ${theme.typography['24Bold'].lineHeight};
  font-weight: ${theme.typography['24Bold'].fontWeight};
`;

const tierBadgeStyle = (theme: Theme) => css`
  padding: 4px 10px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.primary.semilight};
  color: ${theme.colors.primary.dark};
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const metaRowStyle = (theme: Theme) => css`
  display: flex;
  gap: 16px;
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const editButtonStyle = (theme: Theme) => css`
  padding: 10px 16px;
  border-radius: ${theme.borderRadius.medium};
  border: none;
  background: ${theme.colors.primary.light};
  color: ${theme.colors.primary.dark};
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  cursor: not-allowed;
`;

const twoColumnGridStyle = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const cardStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  padding: 20px 24px;
  box-shadow: 0 12px 24px rgba(20, 20, 43, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const tabRowStyle = (theme: Theme) => css`
  display: flex;
  gap: 12px;
  border-bottom: 1px solid ${theme.colors.border.default};
  padding-bottom: 8px;
`;

const tabStyle = (theme: Theme, isActive: boolean) => css`
  border: none;
  background: transparent;
  padding: 6px 0;
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${isActive ? theme.colors.primary.main : theme.colors.text.light};
  border-bottom: 2px solid ${isActive ? theme.colors.primary.main : 'transparent'};
`;

const listStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const listItemStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
`;

const listAvatarStyle = (theme: Theme) => css`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary.surface};
`;

const listTextStyle = css`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const listNameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.text.default};
`;

const listSubStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
`;

const listRankStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const moreButtonStyle = (theme: Theme) => css`
  align-self: flex-end;
  border: none;
  background: transparent;
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography['12Medium'].fontSize};
  cursor: pointer;
`;

const sectionTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.text.default};
`;

const statListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const statItemStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.primary.surface};
`;

const statLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
`;

const statValueStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.text.default};
`;

const heatmapStyle = css`
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: 6px;
`;

const heatmapCellStyle = (theme: Theme) => css`
  width: 100%;
  padding-top: 100%;
  border-radius: 6px;
  background: ${theme.colors.surface.bold};
`;

const chartCaptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
`;

const chartPlaceholderStyle = (theme: Theme) => css`
  height: 140px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
`;

const chartAxisStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;
