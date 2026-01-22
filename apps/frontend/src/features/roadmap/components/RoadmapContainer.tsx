import { css, useTheme } from '@emotion/react';
import { Link } from 'react-router-dom';

import SVGIcon from '@/comp/SVGIcon';
import { UnitCard } from '@/feat/roadmap/components/UnitCard';
import type { RoadmapUnit } from '@/feat/roadmap/types';
import { useIsLoggedIn } from '@/store/authStore';
import type { Theme } from '@/styles/theme';

interface RoadmapContainerProps {
  fieldName: string | undefined;
  units: RoadmapUnit[];
  onUnitClick: (unitId: number) => void;
}

export const RoadmapContainer = ({ fieldName, units, onUnitClick }: RoadmapContainerProps) => {
  const theme = useTheme();

  const isLoggedIn = useIsLoggedIn();

  const totalUnits = units.length;
  const completedUnits = units.filter(unit => unit.progress === 100).length;
  const progressPercent = totalUnits === 0 ? 0 : Math.round((completedUnits / totalUnits) * 100);

  return (
    <div css={containerStyle}>
      <main css={mainStyle}>
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
            {isLoggedIn && (
              <div css={progressSummaryStyle(theme)}>
                <span css={progressValueStyle(theme)}>{progressPercent}%</span>
                <span css={progressMetaStyle(theme)}>
                  {completedUnits}/{totalUnits} 완료
                </span>
              </div>
            )}
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

const heroStyle = css`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 10px;
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
  margin-bottom: 1rem;
`;

const progressSummaryStyle = (theme: Theme) => css`
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: ${theme.colors.text.strong};
`;

const progressValueStyle = (theme: Theme) => css`
  font-size: ${theme.typography['24Bold'].fontSize};
  line-height: ${theme.typography['24Bold'].lineHeight};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  color: ${theme.colors.primary.main};
`;

const progressMetaStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.weak};
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
  scrollbar-width: none;
  -ms-overflow-style: none;

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
