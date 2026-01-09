import { css, useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import SVGIcon from '@/comp/SVGIcon';
import { UnitCard } from '@/feat/roadmap/components/UnitCard';
import type { RoadmapUnit } from '@/feat/roadmap/types';
import { useStorage } from '@/hooks/useStorage';
import { fieldService } from '@/services/fieldService';
import type { Theme } from '@/styles/theme';

// const units: readonly RoadmapUnit[] = [
//   {
//     id: 1,
//     title: 'HTML & CSS 기초',
//     description: '웹의 기본 구조와 스타일링',
//     progress: 100,
//     score: 92,
//     status: 'completed',
//     variant: 'full',
//   },
//   {
//     id: 2,
//     title: 'JavaScript 기초',
//     description: '프로그래밍의 기본 개념',
//     progress: 100,
//     score: 88,
//     status: 'completed',
//     variant: 'full',
//   },
//   {
//     id: 3,
//     title: '자료구조와 알고리즘',
//     description: '컴퓨터 과학의 기초를 마스터하세요',
//     progress: 45,
//     score: 85,
//     status: 'active',
//     variant: 'full',
//   },
//   {
//     id: 4,
//     title: 'DOM 조작',
//     description: '웹 페이지를 동적으로 제어하기',
//     progress: 0,
//     score: 0,
//     status: 'normal',
//     variant: 'compact',
//   },
//   {
//     id: 5,
//     title: '비동기 프로그래밍',
//     description: 'Promise, async/await 마스터',
//     progress: 0,
//     score: 0,
//     status: 'normal',
//     variant: 'compact',
//   },
// ];

const isLoggedIn = false; // TODO: 실제 로그인 상태로 변경

/**
 * 로드맵 페이지
 * - 선택한 분야의 학습 유닛과 진행률을 보여줍니다.
 * - 유닛 카드 클릭 시 학습 페이지로 이동하며 최근 조회 상태를 저장합니다.
 */
export const Roadmap = () => {
  const theme = useTheme();
  // const completedUnits = units.filter(unit => unit.progress === 100).length;
  // const progressPercent = Math.round((completedUnits / units.length) * 100);
  const navigate = useNavigate();
  const { updateUIState, uiState } = useStorage();

  const fieldSlug = uiState.last_viewed?.field_slug;

  const [field, setField] = useState<string>();
  const [units, setUnits] = useState<RoadmapUnit[]>([]);

  useEffect(() => {
    const fetchFields = async () => {
      if (!fieldSlug) return;
      try {
        const data = await fieldService.getFieldRoadmap(fieldSlug);
        setUnits(data.units);
        setField(data.field.name);
      } catch (error) {
        console.error('Failed to fetch fields:', error);
      }
    };

    fetchFields();
  }, [fieldSlug]);

  /**
   * 유닛 카드 클릭 처리
   * @param fieldSlug 선택한 분야의 슬러그
   * @param unitId 선택한 유닛 ID
   */
  const handleClick = (unitId: number) => {
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
              <span css={heroLabelStyle(theme)}>{field} 로드맵</span>
              <span css={heroHeadingStyle(theme)}>단계별로 학습하며 전문가가 되어보세요</span>
            </div>
            {/* {isLoggedIn && (
              <div css={progressSummaryStyle(theme)}>
                <span css={progressValueStyle(theme)}>{progressPercent}%</span>
                <span css={progressMetaStyle(theme)}>
                  {completedUnits}/{units.length} 완료
                </span>
              </div>
            )} */}
          </div>
        </section>
        <section css={gridStyle}>
          {units.map(unit => (
            <UnitCard
              key={unit.id}
              unit={unit}
              isLoggedIn={isLoggedIn}
              onClick={() => handleClick(unit.id)}
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

// const progressSummaryStyle = (theme: Theme) => css`
//   display: flex;
//   align-items: baseline;
//   gap: 10px;
//   color: ${theme.colors.text.strong};
// `;

// const progressValueStyle = (theme: Theme) => css`
//   font-size: ${theme.typography['24Bold'].fontSize};
//   line-height: ${theme.typography['24Bold'].lineHeight};
//   font-weight: ${theme.typography['24Bold'].fontWeight};
//   color: ${theme.colors.primary.main};
// `;

// const progressMetaStyle = (theme: Theme) => css`
//   font-size: ${theme.typography['12Medium'].fontSize};
//   line-height: ${theme.typography['12Medium'].lineHeight};
//   font-weight: ${theme.typography['12Medium'].fontWeight};
//   color: ${theme.colors.text.weak};
// `;

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
