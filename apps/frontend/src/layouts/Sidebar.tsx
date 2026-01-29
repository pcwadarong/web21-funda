import { css, useTheme } from '@emotion/react';
import { Link, useLocation } from 'react-router-dom';

import SVGIcon from '@/components/SVGIcon';
import { useRankingMe } from '@/hooks/queries/leaderboardQueries';
import { useAuthUser, useIsLoggedIn } from '@/store/authStore';
import type { Theme } from '@/styles/theme';

const NAV_ITEMS = [
  { id: 'learn', label: '학습하기', icon: 'Learn', path: '/learn' },
  { id: 'ranking', label: '랭킹', icon: 'Ranking', path: '/leaderboard' },
  { id: 'battle', label: '실시간 배틀', icon: 'Battle', path: '/battle' },
  { id: 'profile', label: '프로필', icon: 'Profile', path: '/profile' },
  { id: 'settings', label: '설정', icon: 'Setting', path: '/setting' },
] as const;

const ADMIN_NAV_ITEM = {
  id: 'admin',
  label: '관리자 도구',
  icon: 'Data',
  path: '/admin',
} as const;

export const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const user = useAuthUser();

  // 사용자 티어 조회
  const { data: rankingMe } = useRankingMe(isLoggedIn && !!user);
  const tierName = rankingMe?.tier?.name ?? null;

  // 관리자 여부 확인
  const isAdmin = user?.role === 'admin';

  // 전체 메뉴 구성
  const allNavItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  // 활성화된 네비게이션 아이템 ID 찾기 로직
  const getActiveItemId = () => {
    const currentPath = location.pathname;

    if (currentPath.startsWith('/admin')) return 'admin';
    if (currentPath.startsWith('/profile')) return 'profile';
    if (currentPath.startsWith('/learn')) return 'learn';
    if (currentPath.startsWith('/battle')) return 'battle';

    return NAV_ITEMS.find(item => currentPath === item.path)?.id;
  };

  const activeItemId = getActiveItemId();

  return (
    <aside css={sidebarStyle(theme)}>
      <Link to="/learn" css={logoSectionStyle}>
        <span css={logoIconStyle}>
          <img src="/favicon.ico" alt="Funda 로고" css={logoImageStyle} />
        </span>
        <span css={logoTextStyle(theme)}>Funda</span>
      </Link>

      <nav css={navStyle}>
        {allNavItems.map(item => {
          // 프로필의 경우 유저 ID를 포함한 경로로 설정
          const targetPath = item.id === 'profile' && user?.id ? `/profile/${user.id}` : item.path;

          return (
            <Link
              key={item.id}
              to={targetPath}
              css={[navItemStyle(theme), activeItemId === item.id && activeNavItemStyle(theme)]}
            >
              <span css={navIconStyle}>
                <SVGIcon icon={`${item.icon}`} size="md" />
              </span>
              <span css={navLabelStyle(theme)}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {isLoggedIn && user && (
        <div css={userSectionStyle(theme)}>
          <div css={avatarStyle(theme)}>
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={user.displayName} css={avatarImageStyle} />
            ) : (
              <SVGIcon icon="Profile" size="md" />
            )}
          </div>
          <div css={userInfoStyle}>
            <div css={userNameStyle(theme)}>{user.displayName}</div>
            <div css={userLevelStyle(theme)}>{buildTierLabel(tierName)}</div>
          </div>
        </div>
      )}
    </aside>
  );
};

// --- 스타일 정의 (기존과 동일하되 가독성을 위해 유지) ---

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
  text-decoration: none;

  @media (max-width: 768px) {
    display: none;
  }
`;

const logoIconStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const logoImageStyle = css`
  width: 28px;
  height: 28px;
  object-fit: contain;
`;

const logoTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  color: ${theme.colors.primary.main};

  @media (max-width: 1024px) {
    display: none;
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
    width: 3.8rem;
  }
`;

const activeNavItemStyle = (theme: Theme) => css`
  background: ${theme.colors.primary.surface};
  color: ${theme.colors.primary.dark};
  font-weight: 700;

  @media (max-width: 768px) {
    background: transparent;
    color: ${theme.colors.primary.main};
  }
`;

const navIconStyle = css`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const navLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};

  @media (max-width: 1024px) {
    display: none;
  }

  @media (max-width: 768px) {
    display: block;
    font-size: ${theme.typography['12Medium'].fontSize};
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
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    width: 32px;
    height: 32px;
  }
`;

const avatarImageStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  color: ${theme.colors.text.strong};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const userLevelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const buildTierLabel = (tierName: string | null) =>
  tierName ? `${tierName} 티어` : '티어 정보 없음';
