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
    <main css={mainStyle}>
      <div css={titleWrapper}>
        <span css={title(theme)}>학습 분야 선택</span>
        <span css={subtitle(theme)}>어떤 분야를 선택하시겠어요?</span>
      </div>
      <div css={gridStyle}>
        {fields.map(field => (
          <label
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
          </label>
        ))}
      </div>
    </main>
  );
};

const mainStyle = css`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 24px;
  gap: 24px;
  max-width: 1200px;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
`;

const titleWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const title = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  color: ${theme.colors.primary.main};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  line-height: ${theme.typography['16Medium'].lineHeight};
`;

const subtitle = (theme: Theme) => css`
  font-size: ${theme.typography['20Medium'].fontSize};
  color: ${theme.colors.grayscale[600]};
  font-weight: ${theme.typography['20Medium'].fontWeight};
  line-height: ${theme.typography['20Medium'].lineHeight};
`;

const gridStyle = css`
  display: grid;
  /* 기본 1열에서 시작하여 너비에 따라 열 개수를 유연하게 조절 */
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 2rem;

  /* 태블릿 및 작은 모니터 */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 일반 데스크탑 */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  /* 대화면 데스크탑 */
  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const fieldLabelStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px; /* 카드 높이 균일화 */
  gap: 16px;
  padding: 24px;
  background: ${theme.colors.surface.strong};
  border: 2px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  transition: all 150ms ease-in-out;
  box-shadow: 0 4px 0 ${theme.colors.border.default};
  cursor: pointer;
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

  color: ${theme.colors.text.default};
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
`;

const fieldDescriptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  line-height: ${theme.typography['16Medium'].lineHeight};
  color: ${theme.colors.text.light};
  flex-grow: 1;
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
