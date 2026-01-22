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
    <div css={containerStyle}>
      <main css={mainStyle}>
        <header css={headerStyle}>
          <h1 css={title(theme)}>학습 분야 선택</h1>
          <span css={subtitle(theme)}>어떤 분야를 선택하시겠어요?</span>
        </header>
        <section css={gridStyle}>
          {fields.map(field => (
            <button
              key={field.slug}
              onClick={() => onFieldClick(field.slug)}
              css={fieldLabelStyle(theme)}
            >
              <div css={fieldNameWrapper}>
                <span css={fieldNameStyle(theme)}>{field.name}</span>
                <SVGIcon icon={field.icon} size="lg" />
              </div>
              <span css={fieldDescriptionStyle(theme)}>{field.description}</span>
              <div css={goRoadmap(theme)}>
                <span>로드맵 보기</span>
                <SVGIcon icon={'NextArrow'} size="sm" />
              </div>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
};

const containerStyle = css`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const mainStyle = css`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.5rem 0;
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 32px 20px 80px;
  }
`;

const headerStyle = css`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
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
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 20px;
  padding: 10px 0 30px;
  min-height: 0;

  overflow-y: auto;
  flex: 1;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(240px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const fieldLabelStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  gap: 16px;
  padding: 24px;
  background: ${theme.colors.surface.strong};
  border: 2px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  transition: all 150ms ease-in-out;
  box-shadow: 0 4px 0 ${theme.colors.border.default};
  color: ${theme.colors.text.default};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 0 ${theme.colors.border.default};
    border-color: ${theme.colors.primary.light};
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
