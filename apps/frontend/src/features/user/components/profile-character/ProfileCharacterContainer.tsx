import { css, useTheme } from '@emotion/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SVGIcon from '@/comp/SVGIcon';
import type { Theme } from '@/styles/theme';
import { palette } from '@/styles/token';

type CharacterItem = {
  id: number;
  imageUrl: string;
  priceDiamonds: number;
  isOwned: boolean;
};

interface ProfileCharacterContainerProps {
  characters?: CharacterItem[];
}

/**
 * 프로필 캐릭터 구매/적용 컨테이너
 */
export const ProfileCharacterContainer = ({ characters }: ProfileCharacterContainerProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const characterItems = useMemo(() => characters ?? defaultCharacters, [characters]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCardClick = (characterId: number) => {
    setSelectedId(characterId);
  };

  const selectedCharacter = characterItems.find(item => item.id === selectedId) ?? null;

  return (
    <main css={pageStyle}>
      <div css={contentStyle}>
        <header css={headerStyle}>
          <button type="button" css={backButtonStyle(theme)} onClick={handleBackClick}>
            <SVGIcon icon="ArrowLeft" size="sm" />내 프로필로 돌아가기
          </button>
          <h1 css={titleStyle(theme)}>캐릭터 프로필 설정하기</h1>
        </header>

        <section css={gridStyle}>
          {characterItems.map(item => {
            const isSelected = item.id === selectedId;
            const shouldShowAction = isSelected && selectedCharacter;
            const actionLabel = item.isOwned ? '적용하기' : '구매하기';

            return (
              <div key={item.id} css={cardWrapperStyle}>
                <button
                  type="button"
                  css={cardStyle(theme, isSelected)}
                  onClick={() => handleCardClick(item.id)}
                  aria-label={`캐릭터 ${item.id} 선택`}
                >
                  <div css={imageWrapperStyle}>
                    <img src={item.imageUrl} alt="캐릭터 이미지" css={imageStyle} />
                  </div>
                  <div css={priceStyle(theme)}>
                    {item.priceDiamonds === 0 ? (
                      <span css={freeLabelStyle}>FREE</span>
                    ) : (
                      <>
                        <SVGIcon icon="Diamond" size="xs" />
                        <span>{item.priceDiamonds}</span>
                      </>
                    )}
                  </div>
                </button>
                {shouldShowAction && (
                  <div css={actionWrapperStyle}>
                    <button type="button" css={actionCardStyle(theme)}>
                      {actionLabel}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
};

const defaultCharacters: CharacterItem[] = [
  {
    id: 1,
    imageUrl: 'https://placehold.co/140x140?text=01',
    priceDiamonds: 1,
    isOwned: true,
  },
  {
    id: 2,
    imageUrl: 'https://placehold.co/140x140?text=02',
    priceDiamonds: 5,
    isOwned: false,
  },
  {
    id: 3,
    imageUrl: 'https://placehold.co/140x140?text=03',
    priceDiamonds: 0,
    isOwned: false,
  },
  {
    id: 4,
    imageUrl: 'https://placehold.co/140x140?text=04',
    priceDiamonds: 1,
    isOwned: false,
  },
  {
    id: 5,
    imageUrl: 'https://placehold.co/140x140?text=05',
    priceDiamonds: 1,
    isOwned: true,
  },
  {
    id: 6,
    imageUrl: 'https://placehold.co/140x140?text=06',
    priceDiamonds: 1,
    isOwned: false,
  },
  {
    id: 7,
    imageUrl: 'https://placehold.co/140x140?text=07',
    priceDiamonds: 1,
    isOwned: true,
  },
  {
    id: 8,
    imageUrl: 'https://placehold.co/140x140?text=08',
    priceDiamonds: 1,
    isOwned: false,
  },
  {
    id: 9,
    imageUrl: 'https://placehold.co/140x140?text=09',
    priceDiamonds: 25,
    isOwned: false,
  },
  {
    id: 10,
    imageUrl: 'https://placehold.co/140x140?text=10',
    priceDiamonds: 1,
    isOwned: false,
  },
];

const pageStyle = css`
  flex: 1;
  min-height: 100vh;
  padding: 2rem 1.5rem 7.5rem;
`;

const contentStyle = css`
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const headerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  line-height: ${theme.typography['20Bold'].lineHeight};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  color: ${theme.colors.primary.main};
`;

const backButtonStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: transparent;
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  cursor: pointer;
`;

const gridStyle = css`
  display: grid;
  grid-template-columns: repeat(5, minmax(140px, 1fr));
  gap: 1.5rem;

  @media (max-width: 64rem) {
    grid-template-columns: repeat(4, minmax(140px, 1fr));
  }

  @media (max-width: 52rem) {
    grid-template-columns: repeat(3, minmax(140px, 1fr));
  }

  @media (max-width: 38rem) {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }
`;

const cardWrapperStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const cardStyle = (theme: Theme, isSelected: boolean) => css`
  width: 100%;
  border-radius: 24px;
  padding: 1.1rem 1rem 0.85rem;
  border: 2px solid ${isSelected ? theme.colors.primary.main : palette.grayscale[200]};
  background: ${palette.grayscale[100]};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  box-shadow: ${isSelected ? '0 8px 18px rgba(101, 89, 234, 0.2)' : 'none'};
  transition: all 150ms ease;

  &:hover {
    border-color: ${theme.colors.primary.light};
  }
`;

const imageWrapperStyle = css`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 18px;
  background: ${palette.grayscale[50]};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const imageStyle = css`
  width: 70%;
  height: 70%;
  object-fit: contain;
`;

const priceStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const freeLabelStyle = css`
  color: ${palette.grayscale[600]};
  letter-spacing: 0.05em;
  font-weight: 700;
`;

const actionWrapperStyle = css`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const actionCardStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  padding: 12px 24px;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.primary.main};
  color: ${theme.colors.grayscale[50]};
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  line-height: ${theme.typography['16Bold'].lineHeight};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(101, 89, 234, 0.25);

  &:hover {
    background: ${theme.colors.primary.dark};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(101, 89, 234, 0.35);
  }

  &:active {
    transform: translateY(0);
    filter: brightness(0.95);
  }

  &:disabled {
    background: ${theme.colors.grayscale[300]};
    color: ${theme.colors.grayscale[500]};
    cursor: not-allowed;
    box-shadow: none;
  }
`;
