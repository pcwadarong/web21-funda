import { css, useTheme } from '@emotion/react';
import { Link } from 'react-router-dom';

import SVGIcon from '@/comp/SVGIcon';
import { UnitCard } from '@/feat/roadmap/components/UnitCard';
import type { RoadmapUnit } from '@/feat/roadmap/types';
import type { Theme } from '@/styles/theme';

interface RoadmapContainerProps {
  fieldName: string | undefined;
  units: RoadmapUnit[];
  isLoggedIn: boolean;
  onUnitClick: (unitId: number) => void;
}

export const RoadmapContainer = ({
  fieldName,
  units,
  isLoggedIn,
  onUnitClick,
}: RoadmapContainerProps) => {
  const theme = useTheme();

  return (
    <div css={containerStyle}>
      <main css={mainStyle(theme)}>
        <section css={heroStyle}>
          <div css={heroTopStyle}>
            <Link to="/learn/select-field" css={backLinkStyle(theme)}>
              <SVGIcon icon="ArrowLeft" size="sm" />
              분야 선택으로 돌아가기
            </Link>
          </div>
          <div css={heroTopStyle}>
            <div css={heroTitleStyle}>
              <span css={heroLabelStyle(theme)}>{fieldName} 로드맵</span>
              <span css={heroHeadingStyle(theme)}>단계별로 학습하며 전문가가 되어보세요</span>
            </div>
          </div>
        </section>
        <section css={gridStyle}>
          {units.map(unit => (
            <UnitCard
              key={unit.id}
              unit={unit}
              isLoggedIn={isLoggedIn}
              onClick={() => onUnitClick(unit.id)}
            />
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

const mainStyle = (theme: Theme) => css`
  position: relative;
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;

  &:before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(${theme.colors.surface.bold} 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.4;
  }

  @media (max-width: 768px) {
    padding: 32px 20px 80px;
  }
`;

const heroStyle = css`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
`;

const heroTopStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const backLinkStyle = (theme: Theme) => css`
  color: ${theme.colors.text.light};
  text-decoration: none;
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const heroTitleStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const heroLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.primary.main};
`;

const heroHeadingStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Medium'].fontSize};
  line-height: ${theme.typography['20Medium'].lineHeight};
  font-weight: ${theme.typography['20Medium'].fontWeight};
  color: ${theme.colors.grayscale[600]};
`;

const gridStyle = css`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(240px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
