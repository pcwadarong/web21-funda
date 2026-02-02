import { css, useTheme } from '@emotion/react';
import type { MouseEvent } from 'react';
import { useRef, useState } from 'react';

import SVGIcon from '@/comp/SVGIcon';
import { Popover } from '@/components/Popover';
import type { ProfileCharacterItem } from '@/features/profile-character/types';
import type { Theme } from '@/styles/theme';
import { palette } from '@/styles/token';

interface ProfileCharacterContainerProps {
  characters: ProfileCharacterItem[];
  selectedCharacterId: number | null;
  isLoading?: boolean;
  onSelect: (characterId: number) => void;
  onPurchase: (characterId: number) => void;
  onApply: (characterId: number) => void;
  onClear: () => void;
  onBack: () => void;
}

/**
 * 프로필 캐릭터 구매/적용 컨테이너
 */
export const ProfileCharacterContainer = ({
  characters,
  selectedCharacterId,
  isLoading = false,
  onSelect,
  onPurchase,
  onApply,
  onClear,
  onBack,
}: ProfileCharacterContainerProps) => {
  const theme = useTheme();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [hoveredCharacter, setHoveredCharacter] = useState<{
    id: number;
    description: string;
    x: number;
    y: number;
  } | null>(null);

  const handleCharacterMouseEnter = (
    event: MouseEvent<HTMLButtonElement>,
    character: ProfileCharacterItem,
  ) => {
    if (!character.description) {
      return;
    }

    if (!gridRef.current) {
      return;
    }

    const rect = gridRef.current.getBoundingClientRect();
    setHoveredCharacter({
      id: character.id,
      description: character.description,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleCharacterMouseLeave = () => {
    setHoveredCharacter(null);
  };

  return (
    <main css={pageStyle(theme)}>
      <div css={contentStyle}>
        <header css={headerStyle}>
          <div css={headerTopRowStyle}>
            <button type="button" css={backButtonStyle(theme)} onClick={onBack}>
              <SVGIcon icon="ArrowLeft" size="sm" />내 프로필로 돌아가기
            </button>
            <button type="button" css={clearButtonStyle(theme)} onClick={onClear}>
              기본 프로필로 되돌리기
            </button>
          </div>
          <h1 css={titleStyle(theme)}>캐릭터 프로필 설정하기</h1>
        </header>

        <section css={gridStyle} ref={gridRef}>
          {isLoading ? (
            <div css={loadingStyle(theme)}>캐릭터 목록을 불러오는 중입니다.</div>
          ) : (
            characters.map(item => {
              const isSelected = item.id === selectedCharacterId;
              const shouldShowAction = isSelected;
              const actionLabel = item.isOwned ? '적용하기' : '구매하기';

              const handleActionClick = () => {
                if (item.isOwned) {
                  onApply(item.id);
                  return;
                }

                onPurchase(item.id);
              };

              return (
                <div key={item.id} css={cardWrapperStyle}>
                  <button
                    type="button"
                    css={cardStyle(theme, isSelected)}
                    onClick={() => onSelect(item.id)}
                    onMouseEnter={event => handleCharacterMouseEnter(event, item)}
                    onMouseLeave={handleCharacterMouseLeave}
                    aria-label={`캐릭터 ${item.id} 선택`}
                  >
                    <div css={imageWrapperStyle}>
                      <img src={item.imageUrl} alt="캐릭터 이미지" css={imageStyle} />
                    </div>
                    <div css={priceStyle(theme)}>
                      {item.isOwned ? (
                        <span css={purchasedLabelStyle(theme)}>구매함</span>
                      ) : item.priceDiamonds === 0 ? (
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
                      <button
                        type="button"
                        css={actionCardStyle(theme)}
                        onClick={handleActionClick}
                      >
                        {actionLabel}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <Popover
            x={hoveredCharacter?.x ?? 0}
            y={hoveredCharacter?.y ?? 0}
            isVisible={hoveredCharacter !== null}
            onMouseEnter={() => hoveredCharacter && setHoveredCharacter(hoveredCharacter)}
            onMouseLeave={handleCharacterMouseLeave}
            offsetY={-40}
          >
            <p>{hoveredCharacter?.description ?? ''}</p>
          </Popover>
        </section>
      </div>
    </main>
  );
};

const pageStyle = (theme: Theme) => css`
  flex: 1;
  min-height: 100vh;
  padding: 2rem 1.5rem 7.5rem;
  background: ${theme.colors.surface.default};
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

const headerTopRowStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
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

const clearButtonStyle = (theme: Theme) => css`
  padding: 0.6rem 1rem;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.default};
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.primary.main};
    color: ${theme.colors.primary.main};
  }
`;

const gridStyle = css`
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 160px);
  row-gap: 1.5rem;
  column-gap: 1.5rem;
  justify-content: center;
  padding-bottom: 5rem;

  @media (max-width: 64rem) {
    grid-template-columns: repeat(4, 160px);
  }

  @media (max-width: 52rem) {
    grid-template-columns: repeat(3, 160px);
  }

  @media (max-width: 38rem) {
    grid-template-columns: repeat(2, 160px);
  }
`;

const loadingStyle = (theme: Theme) => css`
  grid-column: 1 / -1;
  padding: 1.5rem;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
  color: ${theme.colors.text.weak};
  text-align: center;
`;

const cardWrapperStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const cardStyle = (theme: Theme, isSelected: boolean) => css`
  width: 100%;
  max-width: 160px;
  aspect-ratio: 1 / 1.05;
  border-radius: 24px;
  padding: 0.85rem 0.8rem 0.6rem;
  border: 2px solid ${isSelected ? theme.colors.primary.main : theme.colors.border.default};
  background: ${palette.grayscale[50]};
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
  width: 56%;
  height: 56%;
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

const purchasedLabelStyle = (theme: Theme) => css`
  color: ${theme.colors.text.weak};
  font-weight: ${theme.typography['12Bold'].fontWeight};
`;

const actionWrapperStyle = css`
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
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
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 10px solid ${theme.colors.primary.main};
  }

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
