import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { vi } from 'vitest';

import type { ProfileSearchUser } from '@/features/user/profile/types';
import { lightTheme } from '@/styles/theme';

import { UserSearchModal } from '../UserSearchModal';

const mockUsers: ProfileSearchUser[] = [
  {
    userId: 1,
    displayName: 'Frontend_Dev',
    email: 'frontend@example.com',
    profileImageUrl: null,
    experience: 120,
    tier: { id: 1, name: 'BRONZE', orderIndex: 1 },
    isFollowing: false,
  },
  {
    userId: 2,
    displayName: 'Backend_Pro',
    email: 'backend@example.com',
    profileImageUrl: null,
    experience: 240,
    tier: { id: 2, name: 'SILVER', orderIndex: 2 },
    isFollowing: true,
  },
];

describe('UserSearchModal', () => {
  const renderWithTheme = (props?: Partial<React.ComponentProps<typeof UserSearchModal>>) => {
    const defaultProps = {
      keyword: 'Front',
      users: mockUsers,
      isLoading: false,
      onKeywordChange: vi.fn(),
      onUserClick: vi.fn(),
      onFollowToggle: vi.fn(),
    };

    return render(
      <ThemeProvider theme={lightTheme}>
        <UserSearchModal {...defaultProps} {...props} />
      </ThemeProvider>,
    );
  };

  it('검색 입력값이 변경되면 콜백이 호출되어야 한다', () => {
    const onKeywordChange = vi.fn();
    renderWithTheme({ onKeywordChange });

    const input = screen.getByPlaceholderText(/사용자 이름 또는 이메일 검색/);
    fireEvent.change(input, { target: { value: 'Front' } });

    expect(onKeywordChange).toHaveBeenCalledWith('Front');
  });

  it('팔로우 버튼 클릭 시 토글 콜백이 호출되어야 한다', () => {
    const onFollowToggle = vi.fn();
    renderWithTheme({ onFollowToggle });

    const followButton = screen.getByRole('button', { name: '팔로우하기' });
    fireEvent.click(followButton);

    expect(onFollowToggle).toHaveBeenCalledWith(1, false);
  });
});
