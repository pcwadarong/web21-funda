import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ProfileCharacterContainer } from '@/feat/user/profile-character/ProfileCharacterContainer';
import { lightTheme } from '@/styles/theme';

vi.mock('@/comp/SVGIcon', () => ({
  default: () => <span data-testid="svg-icon" />,
}));

const TestWrapper = ({
  activeCharacterId,
  activeCharacterImageUrl,
}: {
  activeCharacterId?: number | null;
  activeCharacterImageUrl?: string | null;
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  return (
    <ThemeProvider theme={lightTheme}>
      <ProfileCharacterContainer
        characters={[
          {
            id: 1,
            imageUrl: 'https://placehold.co/140x140?text=01',
            priceDiamonds: 1,
            description: '첫 번째 캐릭터 설명입니다.',
            isActive: false,
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
        activeCharacterId={activeCharacterId}
        activeCharacterImageUrl={activeCharacterImageUrl}
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

  it('구매한 캐릭터는 카드 하단에 구매함 문구가 표시된다', () => {
    render(<TestWrapper />);

    const ownedCharacterCard = screen.getByRole('button', { name: '캐릭터 2 선택' });

    expect(within(ownedCharacterCard).getByText('구매함')).toBeInTheDocument();
    expect(within(ownedCharacterCard).queryByText('1')).not.toBeInTheDocument();
  });

  it('캐릭터 카드에 마우스를 올리면 설명이 Popover로 표시된다', () => {
    render(<TestWrapper />);

    const characterCard = screen.getByRole('button', { name: '캐릭터 1 선택' });

    fireEvent.mouseEnter(characterCard, { clientX: 120, clientY: 80 });

    expect(screen.getByText('첫 번째 캐릭터 설명입니다.')).toBeInTheDocument();
  });

  it('현재 적용된 캐릭터는 적용됨이 표시되고 적용 버튼이 비활성화된다', () => {
    render(<TestWrapper activeCharacterId={2} />);

    fireEvent.click(screen.getByRole('button', { name: '캐릭터 2 선택' }));

    const actionButton = screen.getByRole('button', { name: '적용됨' });

    expect(actionButton).toBeDisabled();
    expect(screen.getByText('적용됨')).toBeInTheDocument();
  });
});
