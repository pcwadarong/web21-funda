import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ProfileCharacterContainer } from '@/feat/user/components/profile-character/ProfileCharacterContainer';
import { lightTheme } from '@/styles/theme';

vi.mock('@/comp/SVGIcon', () => ({
  default: () => <span data-testid="svg-icon" />,
}));

const TestWrapper = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  return (
    <ThemeProvider theme={lightTheme}>
      <ProfileCharacterContainer
        characters={[
          {
            id: 1,
            imageUrl: 'https://placehold.co/140x140?text=01',
            priceDiamonds: 1,
            description: null,
            isActive: true,
            isOwned: false,
          },
          {
            id: 2,
            imageUrl: 'https://placehold.co/140x140?text=02',
            priceDiamonds: 1,
            description: null,
            isActive: true,
            isOwned: true,
          },
        ]}
        selectedCharacterId={selectedId}
        onSelect={setSelectedId}
        onPurchase={vi.fn()}
        onApply={vi.fn()}
        onClear={vi.fn()}
        onBack={vi.fn()}
      />
    </ThemeProvider>
  );
};

describe('ProfileCharacterContainer', () => {
  it('선택한 캐릭터가 구매 상태에 따라 버튼 문구가 달라진다', () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByRole('button', { name: '캐릭터 1 선택' }));
    expect(screen.getByRole('button', { name: '구매하기' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '캐릭터 2 선택' }));
    expect(screen.getByRole('button', { name: '적용하기' })).toBeInTheDocument();
  });
});
