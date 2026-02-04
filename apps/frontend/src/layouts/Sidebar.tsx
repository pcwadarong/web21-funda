import { css, useTheme } from '@emotion/react';
import { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Avatar } from '@/components/Avatar';
import { Dropdown } from '@/components/Dropdown';
import { Loading } from '@/components/Loading';
import SVGIcon from '@/components/SVGIcon';
import { useLogoutMutation } from '@/hooks/queries/authQueries';
import { useRankingMe } from '@/hooks/queries/leaderboardQueries';
import { useAuthProfileImageUrl, useAuthUser, useIsLoggedIn } from '@/store/authStore';
import { useModal } from '@/store/modalStore';
import { useThemeStore } from '@/store/themeStore';
import { useToast } from '@/store/toastStore';
import type { Theme } from '@/styles/theme';
import { getTierIconName } from '@/utils/tier';

const NAV_ITEMS = [
  { id: 'learn', label: '학습하기', icon: 'Learn', path: '/learn' },
  { id: 'ranking', label: '랭킹', icon: 'Ranking', path: '/leaderboard' },
  { id: 'battle', label: '퀴즈배틀', icon: 'Battle', path: '/battle' },
  { id: 'profile', label: '프로필', icon: 'Profile', path: '/profile' },
  { id: 'settings', label: '설정', icon: 'Setting', path: '/setting' },
] as const;

const ADMIN_NAV_ITEM = {
  id: 'admin',
  label: '관리자',
  icon: 'Data',
  path: '/admin',
} as const;

export const Sidebar = () => {
  const theme = useTheme();
  const { isDarkMode } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();
  const user = useAuthUser();
  const profileImageUrl = useAuthProfileImageUrl();

  const { showToast } = useToast();
  const { confirm } = useModal();
  const logoutMutation = useLogoutMutation();

  // 사용자 티어 조회
  const { data: rankingMe } = useRankingMe(isLoggedIn && !!user);
  const tierName = rankingMe?.tier?.name ?? null;
  const tierIconName = getTierIconName(tierName);

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

  const handleLogout = useCallback(async () => {
    const isConfirmed = await confirm({
      title: '로그아웃',
      content: '정말 로그아웃 하시겠습니까?',
      confirmText: '로그아웃',
    });

    if (!isConfirmed) return;

    try {
      navigate('/learn', { replace: true });
      await logoutMutation.mutateAsync();
    } catch {
      showToast('로그아웃 중 오류가 발생했습니다.');
    }
  }, [confirm, logoutMutation, navigate, showToast]);

  const dropdownOptions = [{ value: 'logout', label: '로그아웃' }];

  const handleLinkClick = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    itemId: string,
    targetPath: string,
  ) => {
    event.preventDefault();

    if (!isLoggedIn && !user && (itemId === 'ranking' || itemId === 'profile')) {
      const isConfirmed = await confirm({
        title: '로그인 필요',
        content: (
          <>
            해당 페이지는 로그인 하셔야 확인하실 수 있습니다.
            <br />
            로그인 하시겠습니까?
          </>
        ),
        confirmText: '로그인',
      });

      if (!isConfirmed) return;

      try {
        sessionStorage.setItem('loginRedirectPath', targetPath);
        navigate('/login');
      } catch {
        showToast('오류가 발생했습니다.');
      }

      return;
    }

    navigate(targetPath);
  };

  return (
    <>
      {logoutMutation.isPending && <Loading />}
      <aside css={sidebarStyle(theme)}>
        <Link to="/learn" css={logoSectionStyle}>
          <img src="/favicon.ico" alt="Funda 로고" css={logoImageStyle} />
          <span css={logoTextStyle(theme)}>Funda</span>
        </Link>

        <nav css={navStyle}>
          {allNavItems.map(item => {
            // 프로필의 경우 유저 ID를 포함한 경로로 설정
            const targetPath =
              item.id === 'profile' && user?.id ? `/profile/${user.id}` : item.path;

            return (
              <Link
                key={item.id}
                onClick={event => handleLinkClick(event, item.id, targetPath)}
                to={targetPath}
                css={[
                  navItemStyle(theme),
                  activeItemId === item.id && activeNavItemStyle(theme, isDarkMode),
                ]}
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
          <Dropdown
            options={dropdownOptions}
            onChange={handleLogout}
            variant="plain"
            placement="top"
            triggerCss={userSectionTriggerStyle}
            triggerContent={
              <div css={userSectionStyle(theme)}>
                <Avatar
                  src={profileImageUrl}
                  name={user.displayName}
                  size="sm"
                  alt={user.displayName}
                />
                <div css={userInfoStyle}>
                  <div css={userNameStyle(theme)}>{user.displayName}</div>
                  <div css={userTierRowStyle}>
                    {tierIconName && <SVGIcon icon={tierIconName} size="sm" />}
                    <span css={userLevelStyle(theme)}>{buildTierLabel(tierName)}</span>
                  </div>
                </div>
              </div>
            }
            triggerAction="click"
          />
        )}
      </aside>
    </>
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
    order: 2;
    z-index: 99;

    width: 100%;
    height: 96px;
    flex-shrink: 0;

    flex-direction: row;
    padding: 12px;
    background: ${theme.colors.surface.strong};
    border-top: 1px solid ${theme.colors.border.default};
    align-items: center;
    justify-content: space-around;
  }
`;

const logoSectionStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
  text-decoration: none;

  @media (max-width: 1024px) {
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 768px) {
    display: none;
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
  text-align: center;

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

const activeNavItemStyle = (theme: Theme, isDarkMode: boolean) => css`
  background: ${theme.colors.primary.surface};
  color: ${isDarkMode ? theme.colors.surface.default : theme.colors.primary.main};
  font-weight: 700;

  &:hover {
    color: ${isDarkMode ? theme.colors.primary.light : theme.colors.primary.main};
  }

  @media (max-width: 768px) {
    background: transparent;
    color: ${isDarkMode ? theme.colors.primary.light : theme.colors.primary.main};
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
  text-align: left;
`;

const userLevelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  text-align: left;
`;

const userTierRowStyle = css`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const buildTierLabel = (tierName: string | null) =>
  tierName ? `${tierName} 티어` : '티어 정보 없음';

const userSectionTriggerStyle = css`
  width: 100%;
  padding: 0 !important;
  border: none !important;

  & > div {
    width: 100%;
    transition: background-color 150ms ease;
    cursor: pointer;

    :hover {
      filter: brightness(0.97);
    }
  }
`;
