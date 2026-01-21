import { css, useTheme } from '@emotion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Dropdown } from '@/comp/Dropdown';
import SVGIcon from '@/comp/SVGIcon';
import type { QuizQuestion } from '@/feat/quiz/types';
import { useFieldsQuery } from '@/hooks/queries/fieldQueries';
import { useStorage } from '@/hooks/useStorage';
import { progressService } from '@/services/progressService';
import { useAuthUser, useIsAuthReady, useIsLoggedIn } from '@/store/authStore';
import { useToast } from '@/store/toastStore';
import type { Theme } from '@/styles/theme';

// TODO: 오늘의 목표 추가
const TODAY_GOALS = [
  { id: 'xp', label: '10 XP 획득하기', current: 20, target: 50 },
  { id: 'lessons', label: '2개의 완벽한 레슨 끝내기', current: 2, target: 2 },
] as const;

export const LearnRightSidebar = ({
  fieldSlug,
  setFieldSlug,
}: {
  fieldSlug: string;
  setFieldSlug: (slug: string) => void;
}) => {
  const theme = useTheme();
  const user = useAuthUser();
  const { progress, updateUIState } = useStorage();
  const navigate = useNavigate();

  const isLoggedIn = useIsLoggedIn();
  const isAuthReady = useIsAuthReady();

  const heartCount = user ? user.heartCount : progress.heart;

  const { data } = useFieldsQuery();

  const fields = data.fields;
  const [reviewQuizzes, setReviewQuizzes] = useState<QuizQuestion[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoggedIn) {
      setReviewQuizzes([]);
      setReviewCount(0);
      return;
    }

    const fetchReviewQueue = async () => {
      setIsReviewLoading(true);
      try {
        const quizzes = await progressService.getReviewQueue();
        setReviewQuizzes(quizzes);
        setReviewCount(quizzes.length);
      } catch (error) {
        console.error('Failed to fetch review queue:', error);
        setReviewQuizzes([]);
        setReviewCount(0);
      } finally {
        setIsReviewLoading(false);
      }
    };

    fetchReviewQueue();
  }, [isLoggedIn]);

  const selectedField = useMemo(
    () => fields.find(field => field.slug.toLowerCase() === fieldSlug.toLowerCase()),
    [fields, fieldSlug],
  );

  const dropdownOptions = useMemo(
    () =>
      fields.map(field => ({
        value: field.slug,
        label: field.name,
        icon: field.icon,
      })),
    [fields],
  );

  const handleChange = (option: string) => {
    const lastSolvedUnitId =
      progress.last_solved_unit_id.find(item => item.field_slug === option)?.unit_id ?? 0;

    updateUIState({
      last_viewed: {
        field_slug: option,
        unit_id: lastSolvedUnitId,
      },
    });

    setFieldSlug(option);
  };

  const handleReviewClick = useCallback(async () => {
    if (isReviewLoading) {
      return;
    }
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    let quizzes = reviewQuizzes;
    if (quizzes.length === 0) {
      setIsReviewLoading(true);
      try {
        quizzes = await progressService.getReviewQueue();
        setReviewQuizzes(quizzes);
        setReviewCount(quizzes.length);
      } catch (error) {
        console.error('Failed to fetch review queue:', error);
        showToast('복습 문제를 불러오지 못했습니다.');
        setIsReviewLoading(false);
        return;
      }
      setIsReviewLoading(false);
    }

    if (quizzes.length === 0) {
      showToast('복습할 문제가 없습니다.');
      return;
    }

    navigate('/quiz?mode=review', {
      state: {
        reviewQuizzes: quizzes,
      },
    });
  }, [isLoggedIn, isReviewLoading, navigate, reviewQuizzes, showToast]);

  if (!isAuthReady) return null;

  return (
    <aside css={rightSectionStyle}>
      <div css={statsContainerStyle(isLoggedIn)}>
        <Dropdown
          options={dropdownOptions}
          onChange={handleChange}
          value={fieldSlug}
          variant="plain"
          triggerCss={statContainerStyle(theme)}
          renderTrigger={() => (
            <>
              <span css={statIconStyle}>
                <SVGIcon icon={selectedField?.icon ?? 'Frontend'} size="md" />
              </span>
              <span css={statValueStyle(theme)}>
                {selectedField?.slug?.toUpperCase() ?? fieldSlug.toUpperCase()}
              </span>
            </>
          )}
          renderOption={option => (
            <>
              <span css={statIconStyle}>
                <SVGIcon icon={option.icon ?? 'Frontend'} size="sm" />
              </span>
              <span css={statValueStyle(theme)}>{option.label}</span>
            </>
          )}
        />
        {isLoggedIn && user && (
          <>
            <div css={statContainerStyle(theme)}>
              <span css={statIconStyle}>
                <SVGIcon icon="Diamond" size="md" />
              </span>
              {/* //TODO: 다이아 추가 */}
              {/* <span css={statValueStyle(theme)}>{user.diamond}</span> */}
            </div>
            <div css={statContainerStyle(theme)}>
              <span css={statIconStyle}>
                <SVGIcon icon="Streak" size="md" />
              </span>
              <span css={statValueStyle(theme)}>{user.currentStreak}</span>
            </div>
          </>
        )}

        <div css={statContainerStyle(theme)}>
          <span css={statIconStyle}>
            <SVGIcon icon="Heart" size="lg" />
          </span>
          <span css={statValueStyle(theme)}>{heartCount}</span>
        </div>
      </div>

      <div css={cardStyle(theme)}>
        <div css={cardHeaderStyle}>
          <span css={cardIconStyle}>
            <SVGIcon icon="Book" size="md" />
          </span>
          <span css={cardTitleStyle(theme)}>복습 노트</span>
        </div>
        {isLoggedIn && user ? (
          <button css={reviewBadgeStyle(theme)} onClick={handleReviewClick}>
            {reviewCount}개 문제 복습 필요
          </button>
        ) : (
          <Link to="/login" css={rightSidebarLinkStyle}>
            <div css={reviewBadgeStyle(theme)}>로그인 후 복습 노트를 확인해보세요!</div>
          </Link>
        )}
      </div>

      <div css={cardStyle(theme)}>
        <div css={cardHeaderStyle}>
          <span css={cardIconStyle}>
            <SVGIcon icon="Fire" size="md" />
          </span>
          <span css={cardTitleStyle(theme)}>오늘의 목표</span>
        </div>
        {isLoggedIn ? (
          <div css={goalsContentStyle}>
            {TODAY_GOALS.map(goal => (
              <div key={goal.id} css={goalItemStyle}>
                <div css={goalLabelContainerStyle}>
                  <span css={goalLabelStyle(theme)}>{goal.label}</span>
                  <span css={goalLabelStyle(theme)}>
                    {goal.current}/{goal.target}
                  </span>
                </div>
                <div css={progressBarContainerStyle(theme)}>
                  <div
                    css={progressBarStyle(theme, (goal.current / goal.target) * 100)}
                    role="progressbar"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Link to="/login" css={rightSidebarLinkStyle}>
            <div css={reviewBadgeStyle(theme)}>로그인 후 진도를 저장해보세요!</div>
          </Link>
        )}
      </div>
    </aside>
  );
};

const rightSectionStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 320px;
  min-width: 320px;
  padding-right: 8px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const statsContainerStyle = (isLoggedIn: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: ${isLoggedIn ? 'space-between' : 'flex-start'};
  gap: 8px;
`;

const statContainerStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  line-height: ${theme.typography['20Bold'].lineHeight};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.default};
  padding: 8px;
  border-radius: ${theme.borderRadius.small};

  &:hover {
    background: ${theme.colors.surface.bold};
  }
`;

const statIconStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const rightSidebarLinkStyle = css`
  text-decoration: none;
  color: inherit;

  &:visited,
  &:active {
    color: inherit;
  }
`;

const statValueStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
`;

const cardHeaderStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const cardIconStyle = css`
  display: flex;
  align-items: center;
`;

const cardTitleStyle = (theme: Theme) => css`
  flex: 1;
  font-size: ${theme.typography['16Bold'].fontSize};
  line-height: ${theme.typography['16Bold'].lineHeight};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.text.strong};
`;

const reviewBadgeStyle = (theme: Theme) => css`
  padding: 12px 16px;
  background: ${theme.colors.primary.surface};
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  text-align: center;
`;

const goalsContentStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const goalItemStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const goalLabelContainerStyle = css`
  display: flex;
  justify-content: space-between;
`;

const goalLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.default};
`;

const progressBarContainerStyle = (theme: Theme) => css`
  width: 100%;
  height: 8px;
  background: ${theme.colors.surface.default};
  border-radius: ${theme.borderRadius.small};
  overflow: hidden;
`;

const progressBarStyle = (theme: Theme, percentage: number) => css`
  width: ${percentage}%;
  height: 100%;
  background: ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.small};
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
`;
