import { css, useTheme } from '@emotion/react';
import { Link } from 'react-router-dom';

import checkIcon from '@/assets/check.svg';
import lockIcon from '@/assets/lock.svg';
import startIcon from '@/assets/start.svg';
import { LearnRightSidebar } from '@/feat/learn/components/RightSidebar';
import type { LessonItem } from '@/feat/learn/types';
import { Sidebar } from '@/layouts/Sidebar';
import type { Theme } from '@/styles/theme';
import { colors } from '@/styles/token';

// TODO: FETCH
const SECTION_INFO = {
  unit: '자료구조와 알고리즘',
  title: '자료구조',
  id: '2',
} as const;

const LESSON_ITEMS: readonly LessonItem[] = [
  { id: 'array-basics', name: '배열 기초', status: 'completed', type: 'normal' },
  { id: 'array', name: '배열', status: 'completed', type: 'normal' },
  { id: 'big-o', name: 'Big O 표기법', status: 'active', type: 'normal' },
  { id: 'mid-check', name: '중간 점검', status: 'locked', type: 'checkpoint' },
  { id: 'time-complexity', name: '시간 복잡도', status: 'active', type: 'normal' },
  { id: 'hash-table', name: '해시 테이블', status: 'active', type: 'normal' },
  { id: 'final-check', name: '최종 점검', status: 'locked', type: 'checkpoint' },
];

export const Learn = () => {
  const theme = useTheme();

  return (
    <div css={containerStyle}>
      <Sidebar />
      <main css={mainStyle}>
        <div css={centerSectionStyle}>
          <div css={centerSectionInnerStyle}>
            <div css={headerSectionStyle(theme)}>
              <div css={headerContentStyle}>
                <div css={unitTextStyle(theme)}>{SECTION_INFO.unit}</div>
                <div css={titleTextStyle(theme)}>{SECTION_INFO.title}</div>
              </div>
              <Link to={`overview/${SECTION_INFO.id}`} css={overviewButtonStyle(theme)}>
                학습 개요
              </Link>
            </div>

            <div css={lessonsContainerStyle}>
              {LESSON_ITEMS.map(lesson => {
                const isDisabled = lesson.status === 'locked' || lesson.type === 'checkpoint';

                if (isDisabled) {
                  return (
                    <div key={lesson.id} css={[lessonItemStyle(theme), lockedLessonStyle(theme)]}>
                      <span css={lessonIconStyle}>
                        <img src={lockIcon} alt="잠김" css={iconImageStyle} />
                      </span>
                      <div css={lessonNameStyle(theme)}>{lesson.name}</div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={lesson.id}
                    // TODO: 하드코딩 삭제
                    to="/quiz/1/1"
                    css={[
                      lessonItemStyle(theme),
                      lesson.status === 'completed' && completedLessonStyle(theme),
                      lesson.status === 'active' && activeLessonStyle(theme),
                    ]}
                  >
                    <span css={lessonIconStyle}>
                      {lesson.status === 'completed' && (
                        <img src={checkIcon} alt="완료" css={iconImageStyle} />
                      )}
                      {lesson.status === 'active' && (
                        <img src={startIcon} alt="활성" css={iconImageStyle} />
                      )}
                    </span>
                    <div css={lessonNameStyle(theme)}>{lesson.name}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <LearnRightSidebar />
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
  display: flex;
  flex: 1;
  gap: 24px;
  padding: 24px;
  overflow: hidden;

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
`;

const centerSectionInnerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0 auto;
  width: 100%;
  max-width: 40rem;
  overflow-y: auto;
`;

const headerSectionStyle = (theme: Theme) => css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: linear-gradient(180deg, rgb(90, 77, 232) 0%, rgba(123, 111, 249, 1) 100%);
  border-radius: ${theme.borderRadius.large};
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
`;

const titleTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['32Bold'].fontSize};
  line-height: ${theme.typography['32Bold'].lineHeight};
  font-weight: ${theme.typography['32Bold'].fontWeight};
  color: ${colors.light.grayscale[50]};
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

const lessonsContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
`;

const lessonItemStyle = (theme: Theme) => css`
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.medium};
  border: 2px solid ${theme.colors.border.default};
  transition: all 150ms ease;
  text-align: left;
  width: 100%;
  text-decoration: none;

  &:hover {
    transform: translateY(-2px);
  }
`;

const completedLessonStyle = (theme: Theme) => css`
  background: ${theme.colors.primary.surface};
  border-color: ${theme.colors.primary.main};
  color: ${theme.colors.text.strong};
`;

const activeLessonStyle = (theme: Theme) => css`
  background: ${theme.colors.primary.main};
  border-color: ${theme.colors.primary.dark};
  color: ${colors.light.grayscale[50]};
`;

const lockedLessonStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.default};
  border-color: ${theme.colors.border.default};
  color: ${theme.colors.text.strong};
  opacity: 0.6;
  cursor: not-allowed;
`;

const lessonIconStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
`;

const iconImageStyle = css`
  width: 24px;
  height: 24px;
`;

const lessonNameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  line-height: ${theme.typography['20Bold'].lineHeight};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  color: inherit;
`;
