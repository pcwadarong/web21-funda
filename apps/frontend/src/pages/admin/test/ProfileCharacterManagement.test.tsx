import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AdminProfileCharacterManagement } from '@/pages/admin/ProfileCharacterManagement';
import { lightTheme } from '@/styles/theme';

const getProfileCharacters = vi.fn().mockResolvedValue([]);
const updateProfileCharacter = vi.fn();

vi.mock('@/services/adminService', () => ({
  adminService: {
    getProfileCharacters,
    updateProfileCharacter,
  },
}));

describe('AdminProfileCharacterManagement', () => {
  it('캐릭터 목록이 렌더링된다', async () => {
    getProfileCharacters.mockResolvedValueOnce([
      {
        id: 1,
        name: '캐릭터1',
        imageUrl: 'https://example.com/character.png',
        priceDiamonds: 3,
        description: null,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <AdminProfileCharacterManagement />
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('character-row-1')).toBeInTheDocument();
  });

  it('캐릭터 정보 저장 요청을 보낸다', async () => {
    getProfileCharacters.mockResolvedValueOnce([
      {
        id: 1,
        name: '캐릭터1',
        imageUrl: 'https://example.com/character.png',
        priceDiamonds: 3,
        description: null,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <AdminProfileCharacterManagement />
        </ThemeProvider>
      </MemoryRouter>,
    );

    await screen.findByTestId('character-row-1');

    fireEvent.change(screen.getByLabelText('캐릭터 1 다이아 가격'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByLabelText('캐릭터 1 활성 상태'));

    fireEvent.click(screen.getByRole('button', { name: '캐릭터 1 저장' }));

    await waitFor(() => {
      expect(updateProfileCharacter).toHaveBeenCalledWith(1, {
        priceDiamonds: 5,
        isActive: false,
      });
    });
  });
});
