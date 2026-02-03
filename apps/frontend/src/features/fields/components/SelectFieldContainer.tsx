import { css, useTheme } from '@emotion/react';

import SVGIcon from '@/comp/SVGIcon';
import type { Field } from '@/services/fieldService';
import type { Theme } from '@/styles/theme';

interface SelectFieldContainerProps {
  fields: Field[];
  onFieldClick: (fieldSlug: string) => void;
}

export const SelectFieldContainer = ({ fields, onFieldClick }: SelectFieldContainerProps) => {
  const theme = useTheme();

  return (
    <div css={contentWrapperStyle}>
      <header css={headerStyle}>
        <h1 css={title(theme)}>학습 분야 선택</h1>
        <span css={subtitle(theme)}>어떤 분야를 선택하시겠어요?</span>
      </header>

      <section css={gridStyle}>
        {fields.map(field => (
          <button
            key={field.slug}
            onClick={() => onFieldClick(field.slug)}
            css={fieldCardStyle(theme)}
          >
            <div css={fieldNameWrapper}>
              <span css={fieldNameStyle(theme)}>{field.name}</span>
              <SVGIcon icon={field.icon} size="lg" />
            </div>
            <p css={fieldDescriptionStyle(theme)}>{field.description}</p>
            <div css={goRoadmap(theme)}>
              <span>로드맵 보기</span>
              <SVGIcon icon={'NextArrow'} size="sm" />
            </div>
          </button>
        ))}
      </section>
    </div>
  );
};

const contentWrapperStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 30px;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const headerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
`;

const title = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  color: ${theme.colors.primary.main};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  line-height: ${theme.typography['16Medium'].lineHeight};
  margin: 0;
`;

const subtitle = (theme: Theme) => css`
  font-size: ${theme.typography['20Medium'].fontSize};
  color: ${theme.colors.grayscale[600]};
  font-weight: ${theme.typography['20Medium'].fontWeight};
  line-height: ${theme.typography['20Medium'].lineHeight};
`;

const gridStyle = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding-bottom: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const fieldCardStyle = (theme: Theme) => css`
  /* 기존 fieldLabelStyle에서 버튼답게 스타일 정돈 */
  all: unset; /* 기본 버튼 스타일 초기화 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  padding: 24px;
  background: ${theme.colors.surface.strong};
  border: 2px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: all 150ms ease-in-out;
  box-shadow: 0 4px 0 ${theme.colors.border.default};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 0 ${theme.colors.border.default};
    border-color: ${theme.colors.primary.main};
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 0px 0 ${theme.colors.border.default};
  }
`;

const fieldNameWrapper = css`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const fieldNameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  line-height: ${theme.typography['20Bold'].lineHeight};
  color: ${theme.colors.text.strong};
`;

const fieldDescriptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  line-height: ${theme.typography['16Medium'].lineHeight};
  color: ${theme.colors.text.light};
  flex-grow: 1;
  text-align: left;
`;

const goRoadmap = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  line-height: ${theme.typography['16Medium'].lineHeight};
  color: ${theme.colors.primary.main};

  &:hover {
    text-decoration: underline;
  }
`;
