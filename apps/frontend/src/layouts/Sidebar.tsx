import { css, useTheme } from '@emotion/react';
import { Link, useLocation } from 'react-router-dom';

import SVGIcon from '@/comp/SVGIcon';
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

const ADMIN_NAV_ITEMS = [
  { id: 'admin-leaderboard', label: '랭킹 관리', icon: 'Ranking', path: '/admin/leaderboard' },
  { id: 'reports', label: '퀴즈 리포트', icon: 'Report', path: '/admin/quizzes/reports' }, // 아이콘은 적절한 것으로 변경 가능
  { id: 'upload', label: '퀴즈 업로드', icon: 'Star', path: '/admin/quizzes/upload' },
] as const;

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

  // 전체 메뉴 구성 (관리자일 경우 관리자 메뉴 추가)
  const allNavItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  // 활성화된 네비게이션 아이템 찾기
  const activeItemId = NAV_ITEMS.find(item => {
    const currentPath = location.pathname;

    // 프로필의 경우 동적 경로 처리
    if (item.id === 'profile') return currentPath.startsWith('/profile');

    // 학습하기의 경우 하위 경로도 포함
    if (item.id === 'learn') return currentPath.startsWith('/learn');

    // 실시간 배틀의 경우 하위 경로도 포함
    if (item.id === 'battle') return currentPath.startsWith('/battle');

    // 나머지는 정확히 일치하는지 확인
    return currentPath === item.path;
  })?.id;

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

const logoImageStyle = css`
  width: 28px;
  height: 28px;
  object-fit: contain;
`;

const logoTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  line-height: ${theme.typography['20Bold'].lineHeight};
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
    font-size: ${theme.typography['12Medium'].fontSize};
    line-height: ${theme.typography['12Medium'].lineHeight};
    font-weight: ${theme.typography['12Medium'].fontWeight};
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

const avatarImageStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
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
  overflow: hidden;

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

const buildTierLabel = (tierName: string | null) => {
  if (!tierName) {
    return '티어 정보 없음';
  }

  return `${tierName} 티어`;
};
