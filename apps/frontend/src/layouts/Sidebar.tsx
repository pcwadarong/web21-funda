import { css, useTheme } from '@emotion/react';
import { Link } from 'react-router-dom';

import SVGIcon from '@/comp/SVGIcon';
import { useAuthUser, useIsLoggedIn } from '@/store/authStore';
import type { Theme } from '@/styles/theme';

const NAV_ITEMS = [
  { id: 'learn', label: '학습하기', icon: 'Learn', path: '/learn' },
  { id: 'ranking', label: '랭킹', icon: 'Ranking', path: '/leaderboard' },
  { id: 'profile', label: '프로필', icon: 'Profile', path: '/profile' },
  { id: 'settings', label: '설정', icon: 'Setting', path: '/setting' },
] as const;

export const Sidebar = () => {
  const theme = useTheme();
  // TODO: 현재 페이지에 따라 활성화된 메뉴 아이템 추가
  const activeItemId = 'learn'; // 하드코딩
  const isLoggedIn = useIsLoggedIn();
  const user = useAuthUser();

  return (
    <aside css={sidebarStyle(theme)}>
      <Link to="/learn" css={logoSectionStyle}>
        <span css={logoIconStyle}>
          <SVGIcon icon="Logo" size="xl" />
        </span>
        <span css={logoTextStyle(theme)}>Funda</span>
      </Link>

      <nav css={navStyle}>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.id}
            to={item.path}
            css={[navItemStyle(theme), activeItemId === item.id && activeNavItemStyle(theme)]}
          >
            <span css={navIconStyle}>
              <SVGIcon icon={`${item.icon}`} size="md" />
            </span>
            <span css={navLabelStyle(theme)}>{item.label}</span>
          </Link>
        ))}
      </nav>
      {isLoggedIn && user && (
        <div css={userSectionStyle(theme)}>
          <div css={avatarStyle(theme)}>
            <SVGIcon icon="Profile" size="md" />
          </div>
          <div css={userInfoStyle}>
            <div css={userNameStyle(theme)}>{user.displayName}</div>
            <div css={userLevelStyle(theme)}>{user.experience} XP</div>
          </div>
        </div>
      )}
    </aside>
  );
};

const sidebarStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  width: 280px;
  min-width: 280px;
  height: 100vh;
  padding: 24px;
  background: ${theme.colors.surface.strong};
  border-right: 1px solid ${theme.colors.border.default};

  @media (max-width: 1024px) {
    width: 80px;
    min-width: 80px;
    padding: 24px 16px;
  }

  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    flex-direction: row;
    justify-content: space-around;
    padding: 12px;
    border-right: none;
    border-top: 1px solid ${theme.colors.border.default};
    z-index: 100;
  }
`;

const logoSectionStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const logoIconStyle = css`
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  @media (max-width: 1024px) {
    flex: 1;
    text-align: center;
  }
`;

const logoTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  line-height: ${theme.typography['20Bold'].lineHeight};
  color: ${theme.colors.primary.main};

  @media (max-width: 1024px) {
    display: none;
  }

  @media (max-width: 768px) {
    display: block;
    font-size: 10px;
  }
`;

const navStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: row;
    flex: none;
    gap: 0;
    width: 100%;
    justify-content: space-around;
  }
`;

const navItemStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: ${theme.borderRadius.medium};
  text-decoration: none;
  color: ${theme.colors.text.default};
  transition: background-color 150ms ease;

  &:hover {
    background: ${theme.colors.surface.default};
  }

  @media (max-width: 1024px) {
    justify-content: center;
    padding: 12px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
    padding: 8px;
  }
`;

const activeNavItemStyle = (theme: Theme) => css`
  background: ${theme.colors.primary.surface};
  color: ${theme.colors.primary.dark};
  font-weight: 700;
`;

const navIconStyle = css`
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const navLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};

  @media (max-width: 1024px) {
    display: none;
  }

  @media (max-width: 768px) {
    display: block;
    font-size: 10px;
  }
`;

const userSectionStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 12px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const avatarStyle = (theme: Theme) => css`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
`;

const userInfoStyle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const userNameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  line-height: ${theme.typography['16Bold'].lineHeight};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.text.strong};
`;

const userLevelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.weak};
`;
