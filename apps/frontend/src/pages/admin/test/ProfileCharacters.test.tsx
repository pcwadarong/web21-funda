import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AdminProfileCharacters } from '@/pages/admin/ProfileCharacters';
import { lightTheme } from '@/styles/theme';

const createProfileCharacter = vi.fn().mockResolvedValue({ id: 1, created: true, updated: false });
const uploadProfileCharacters = vi.fn();

vi.mock('@/services/adminService', () => ({
  adminService: {
    createProfileCharacter,
    uploadProfileCharacters,
  },
}));

describe('AdminProfileCharacters', () => {
  it('필수 입력이 없으면 등록 버튼이 비활성화된다', () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <AdminProfileCharacters />
        </ThemeProvider>
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole('button', { name: '등록하기' });
    expect(submitButton).toBeDisabled();
  });

  it('필수 입력을 채우면 단일 등록 요청이 전송된다', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <AdminProfileCharacters />
        </ThemeProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('이미지 URL'), {
      target: { value: 'https://example.com/character.png' },
    });
    fireEvent.change(screen.getByLabelText('다이아 가격'), {
      target: { value: '3' },
    });

    const submitButton = screen.getByRole('button', { name: '등록하기' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createProfileCharacter).toHaveBeenCalledWith({
        imageUrl: 'https://example.com/character.png',
        priceDiamonds: 3,
        description: null,
        isActive: true,
      });
    });
  });
});
