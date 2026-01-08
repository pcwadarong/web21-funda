import { css, useTheme } from '@emotion/react';
import { Link, useNavigate } from 'react-router-dom';

import SVGIcon from '@/comp/SVGIcon';
import { UnitCard } from '@/feat/roadmap/components/UnitCard';
import type { RoadmapUnit } from '@/feat/roadmap/types';
import { useStorage } from '@/hooks/useStorage';
import { Sidebar } from '@/layouts/Sidebar';
import type { Theme } from '@/styles/theme';

// TODO: FETCH Roadmap data (/api/fields/{fieldSlug}/roadmap)
const FIELD_INFO = {
  name: 'Frontend',
  slug: 'fe',
} as const;

const ROADMAP_UNITS: readonly RoadmapUnit[] = [
  {
    id: 1,
    title: 'HTML & CSS 기초',
    description: '웹의 기본 구조와 스타일링',
    progress: 100,
    score: 92,
    status: 'completed',
    variant: 'full',
  },
  {
    id: 2,
    title: 'JavaScript 기초',
    description: '프로그래밍의 기본 개념',
    progress: 100,
    score: 88,
    status: 'completed',
    variant: 'full',
  },
  {
    id: 3,
    title: '자료구조와 알고리즘',
    description: '컴퓨터 과학의 기초를 마스터하세요',
    progress: 45,
    score: 85,
    status: 'active',
    variant: 'full',
  },
  {
    id: 4,
    title: 'DOM 조작',
    description: '웹 페이지를 동적으로 제어하기',
    progress: 0,
    score: 0,
    status: 'normal',
    variant: 'compact',
  },
  {
    id: 5,
    title: '비동기 프로그래밍',
    description: 'Promise, async/await 마스터',
    progress: 0,
    score: 0,
    status: 'normal',
    variant: 'compact',
  },
];

const isLoggedIn = false; // TODO: 실제 로그인 상태로 변경

export const Roadmap = () => {
  const theme = useTheme();
  const completedUnits = ROADMAP_UNITS.filter(unit => unit.progress === 100).length;
  const progressPercent = Math.round((completedUnits / ROADMAP_UNITS.length) * 100);
  const navigate = useNavigate();
  const { updateUIState } = useStorage();

  const handleClick = (fieldSlug: string, unitId: number) => {
    updateUIState({
      last_viewed: {
        field_slug: fieldSlug,
        unit_id: unitId,
      },
    });
    navigate('/learn');
  };

  return (
    <div css={containerStyle}>
      <Sidebar />
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
              <span css={heroLabelStyle(theme)}>{FIELD_INFO.name} 로드맵</span>
              <span css={heroHeadingStyle(theme)}>단계별로 학습하며 전문가가 되어보세요</span>
            </div>
            {isLoggedIn && (
              <div css={progressSummaryStyle(theme)}>
                <span css={progressValueStyle(theme)}>{progressPercent}%</span>
                <span css={progressMetaStyle(theme)}>
                  {completedUnits}/{ROADMAP_UNITS.length} 완료
                </span>
              </div>
            )}
          </div>
        </section>
        <section css={gridStyle}>
          {ROADMAP_UNITS.map(unit => (
            <UnitCard
              key={unit.id}
              unit={unit}
              isLoggedIn={isLoggedIn}
              onClick={() => handleClick(FIELD_INFO.slug, unit.id)}
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
  padding: 40px 48px;
  overflow-y: auto;
  max-width: 85rem;
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

const heroTitleStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const heroLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.primary.main};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const heroHeadingStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.light};
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
