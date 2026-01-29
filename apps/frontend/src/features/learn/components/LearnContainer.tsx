import { css, keyframes, useTheme } from '@emotion/react';
import { Link } from 'react-router-dom';

import SVGIcon from '@/comp/SVGIcon';
import { LearnRightSidebar } from '@/feat/learn/components/RightSidebar';
import type { stepType, UnitType } from '@/feat/learn/types';
import { useThemeStore } from '@/store/themeStore';
import type { Theme } from '@/styles/theme';
import { colors } from '@/styles/token';

interface LearnContainerProps {
  fieldName: string;
  units: UnitType[];
  activeUnit: UnitType | undefined;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  headerRef: React.RefObject<HTMLDivElement | null>;
  registerUnitRef: (unitId: number) => (element: HTMLElement | null) => void;
  onStepClick: (stepId: stepType) => void;
  onStepHover?: (stepId: number) => void;
  onOverviewClick: (unitId: number) => void;
  fieldSlug: string;
  setFieldSlug: (slug: string) => void;
}

export const LearnContainer = ({
  fieldName,
  units,
  activeUnit,
  scrollContainerRef,
  headerRef,
  registerUnitRef,
  onStepClick,
  onStepHover,
  onOverviewClick,
  fieldSlug,
  setFieldSlug,
}: LearnContainerProps) => {
  const theme = useTheme();
  const { isDarkMode } = useThemeStore();
  return (
    <div css={mainStyle}>
      <div css={centerSectionStyle} ref={scrollContainerRef}>
        {activeUnit && (
          <div css={stickyHeaderWrapperStyle} ref={headerRef}>
            <div
              key={activeUnit.id}
              css={[headerSectionStyle(), stickyHeaderStyle(theme), headerPulseStyle]}
            >
              <div css={headerContentStyle}>
                <Link to="/learn/roadmap">
                  <div css={unitTextStyle(theme)}>
                    <SVGIcon icon="ArrowLeft" size="md" />
                    {fieldName} 로드맵
                  </div>
                </Link>
                <div css={titleTextStyle(theme)}>
                  <span key={activeUnit.title} css={titleFadeStyle}>
                    {activeUnit.title}
                  </span>
                </div>
              </div>
              <Link
                to={`overview/${activeUnit.id}`}
                onClick={() => onOverviewClick(activeUnit.id)}
                css={overviewButtonStyle(theme)}
              >
                학습 개요
              </Link>
            </div>
          </div>
        )}

        <div css={centerSectionInnerStyle}>
          {units.map((unit, unitIndex) => (
            <section
              key={unit.id}
              css={sectionBlockStyle}
              ref={registerUnitRef(unit.id)}
              data-unit-id={unit.id}
            >
              <div css={unitDividerStyle(theme)}>
                <span css={unitDividerLineStyle(theme)} />
                <span css={unitDividerTextStyle(theme)}>{unit.title}</span>
                <span css={unitDividerLineStyle(theme)} />
              </div>
              <div css={lessonsContainerStyle(unit.steps.length)}>
                {unit.steps.map((step, index) => {
                  const positionStyle = lessonPositionStyle(index, unitIndex);

                  if (step.isLocked) {
                    return (
                      <div key={step.id} css={positionStyle}>
                        <div css={lessonStackStyle}>
                          <div css={[lessonItemStyle(theme), lockedLessonStyle(theme)]}>
                            <SVGIcon icon="Lock" aria-hidden="true" size="lg" />
                          </div>
                          <div css={lessonNamePillStyle(theme)}>{step.title}</div>
                        </div>
                      </div>
                    );
                  }

                  const handleStepSelection = () => {
                    if (step.isLocked) {
                      return;
                    }
                    onStepClick(step);
                  };

                  return (
                    <div key={step.id} css={positionStyle}>
                      <div css={lessonStackStyle}>
                        <div
                          onClick={handleStepSelection}
                          onPointerEnter={() => onStepHover?.(Number(step.id))} // prefetch 를 위해
                          css={[
                            lessonItemStyle(theme),
                            step.isCompleted && completedLessonStyle(theme, isDarkMode),
                            step.isLocked && step.isCheckpoint && lockedLessonStyle(theme),
                            !step.isCompleted && !step.isLocked && activeLessonStyle(theme),
                          ]}
                          style={{ cursor: step.isLocked ? 'not-allowed' : 'pointer' }}
                        >
                          <SVGIcon
                            icon={step.isCompleted ? 'Check' : step.isLocked ? 'Lock' : 'Start'}
                            aria-hidden="true"
                            size="lg"
                          />
                        </div>
                        <div css={lessonNamePillStyle(theme)}>{step.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <LearnRightSidebar fieldSlug={fieldSlug} setFieldSlug={setFieldSlug} />
    </div>
  );
};

const mainStyle = css`
  display: flex;
  flex: 1;
  gap: 24px;
  padding: 24px 24px 0 24px;
  overflow: visible;
  height: 100vh;
  min-height: 0;

  @media (max-width: 768px) {
    padding-bottom: 80px;
  }
`;

const centerSectionStyle = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  position: relative;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 36px;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const centerSectionInnerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0 auto;
  width: 100%;
  max-width: clamp(28rem, 56vw, 40rem);
  padding-bottom: 24px;
  z-index: 1;
`;

const sectionBlockStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const stickyHeaderWrapperStyle = css`
  position: sticky;
  top: 0px;
  z-index: 5;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const stickyHeaderStyle = (theme: Theme) => css`
  width: 100%;
  max-width: 40rem;
  background: linear-gradient(180deg, rgb(90, 77, 232) 0%, rgba(123, 111, 249, 1) 100%);
  box-shadow: 0 12px 20px rgba(20, 20, 43, 0.12);
  border-radius: ${theme.borderRadius.large};
  overflow: hidden;
`;

const headerPulse = keyframes`
  0% {
    transform: scale(1);
  }
  60% {
    transform: scale(1.01);
  }
  100% {
    transform: scale(1);
  }
`;

const headerPulseStyle = css`
  animation: ${headerPulse} 420ms cubic-bezier(0.2, 0.7, 0.2, 1);
  will-change: transform;

  @media (max-width: 768px) {
    animation: none;
  }
`;

const unitDividerStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
  color: ${theme.colors.text.weak};
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  letter-spacing: 0.02em;
`;

const unitDividerLineStyle = (theme: Theme) => css`
  flex: 1;
  height: 1px;
  background: ${theme.colors.border.default};
  opacity: 0.8;
`;

const unitDividerTextStyle = (theme: Theme) => css`
  color: ${theme.colors.text.weak};
  white-space: nowrap;
`;

const oddLeftPositions = [410, 320, 400, 470, 380, 290, 210];
const evenLeftPositions = [220, 310, 230, 160, 250, 340, 420];

const lessonPositionStyle = (index: number, unitIndex: number) => {
  const isOddUnit = unitIndex % 2 === 0;
  const positions = isOddUnit ? oddLeftPositions : evenLeftPositions;
  const left = positions[index % positions.length] ?? positions[0] ?? 0;
  const minLeft = Math.max(150, Math.round(left * 0.65));
  const midLeft = Math.max(18, Math.round(left / 9));
  const tightMinLeft = Math.max(100, Math.round(left * 0.4));
  const tightMidLeft = Math.max(13, Math.round(left / 15));

  return css`
    position: absolute;
    top: ${index * 130}px;
    left: clamp(${minLeft}px, ${midLeft}vw, ${left}px);
    transform: translateX(-50%);

    @media (max-width: 1420px) and (min-width: 1024px) {
      left: clamp(${tightMinLeft}px, ${tightMidLeft}vw, ${left}px);
      transform: translateX(-80%);
    }
  `;
};

const headerSectionStyle = () => css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
`;

const headerContentStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const unitTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${colors.light.grayscale[400]};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const titleTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['32Bold'].fontSize};
  line-height: ${theme.typography['32Bold'].lineHeight};
  font-weight: ${theme.typography['32Bold'].fontWeight};
  color: ${colors.light.grayscale[50]};
  overflow: hidden;
`;

const titleFade = keyframes`
  0% {
    opacity: 0;
  }
  30% {
    opacity: 0.3;
  }
  60% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
`;

const titleFadeStyle = css`
  display: inline-block;
  animation: ${titleFade} 260ms ease;
`;

const overviewButtonStyle = (theme: Theme) => css`
  background: ${theme.colors.primary.light};
  color: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  padding: 8px 16px;
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  align-self: flex-end;
`;

const lessonsContainerStyle = (count: number) => css`
  position: relative;
  min-height: ${count * 130}px;
  padding: 8px 0 24px;
`;

const lessonStackStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
`;

const lessonItemStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: ${theme.colors.surface.strong};

  border-radius: 30px;
  transition: all 150ms ease;
  text-align: center;
  width: 4.5rem;
  height: 4rem;
  text-decoration: none;
  svg {
    transform: scale(clamp(0.78, 2.4vw, 1));
    transform-origin: center;
  }

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const completedLessonStyle = (theme: Theme, isDarkMode: boolean) => css`
  background: ${isDarkMode ? '#b4b5ff' : theme.colors.primary.surface};
  border-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.main};
  box-shadow: 0 8px 0 ${theme.colors.primary.main};

  &:active {
    box-shadow: 0 0.4rem 0 ${theme.colors.primary.main};
  }
`;

const activeLessonStyle = (theme: Theme) => css`
  background: ${theme.colors.primary.main};
  border-color: ${theme.colors.primary.dark};
  color: ${colors.light.grayscale[50]};
  box-shadow: 0 8px 0 ${theme.colors.primary.dark};

  &:active {
    box-shadow: 0 0.4rem 0 ${theme.colors.primary.dark};
  }
`;

const lockedLessonStyle = (theme: Theme) => css`
  background: ${colors.light.grayscale[300]};
  color: ${theme.colors.text.light};
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: 0 8px 0 ${theme.colors.text.light};

  &:active {
    box-shadow: 0 0.4rem 0 ${theme.colors.text.light};
  }
`;
const lessonNamePillStyle = (theme: Theme) => css`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: ${theme.colors.surface.strong};
  color: ${theme.colors.text.light};
  font-size: clamp(12px, 2.6vw, ${theme.typography['16Medium'].fontSize});
  line-height: clamp(16px, 3vw, ${theme.typography['16Medium'].lineHeight});
  font-weight: ${theme.typography['16Medium'].fontWeight};
  box-shadow: 0 8px 20px rgba(20, 20, 43, 0.12);
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;
