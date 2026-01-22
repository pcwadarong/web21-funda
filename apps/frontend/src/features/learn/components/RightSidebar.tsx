import { css, useTheme } from '@emotion/react';
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Dropdown } from '@/comp/Dropdown';
import SVGIcon from '@/comp/SVGIcon';
import { Loading } from '@/components/Loading';
import { useFieldsQuery } from '@/hooks/queries/fieldQueries';
import { useReviewQueueQuery } from '@/hooks/queries/progressQueries';
import { useStorage } from '@/hooks/useStorage';
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
  const reviewBatchSize = 10;
  const theme = useTheme();
  const user = useAuthUser();
  const { progress, updateUIState } = useStorage();
  const navigate = useNavigate();

  const isLoggedIn = useIsLoggedIn();
  const isAuthReady = useIsAuthReady();

  const heartCount = user ? user.heartCount : progress.heart;

  const { data: fieldsData } = useFieldsQuery();
  const fields = fieldsData.fields;

  const { data: reviewQueueData = [], refetch: refetchReviewQueue } = useReviewQueueQuery(
    { fieldSlug, limit: reviewBatchSize },
    {
      enabled: isLoggedIn && isAuthReady,
    },
  );

  const { showToast } = useToast();
  const [isNavigatingReview, setIsNavigatingReview] = useState(false);

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
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    let quizzes = reviewQueueData;
    if (quizzes.length === 0) {
      const result = await refetchReviewQueue();

      if (result.isError || !result.data) {
        showToast('복습 문제를 불러오지 못했습니다.');
        return;
      }
      quizzes = result.data;
    }

    if (quizzes.length === 0) {
      showToast('복습할 문제가 없습니다.');
      return;
    }

    setIsNavigatingReview(true);
    navigate('/quiz?mode=review', {
      state: {
        reviewQuizzes: quizzes,
        reviewFieldSlug: fieldSlug,
      },
    });
  }, [fieldSlug, isLoggedIn, navigate, refetchReviewQueue, reviewQueueData, showToast]);

  if (!isAuthReady) return null;
  if (isNavigatingReview) return <Loading text="복습 문제를 불러오는 중입니다" />;

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
            복습 시작
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
  /* 레이아웃: 클릭 영역 확보를 위해 좌우 패딩을 넉넉히 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;

  /* 배경 및 컬러: 시스템의 Primary Main과 Grayscale 50 활용 */
  background: ${theme.colors.primary.main};
  color: ${theme.colors.grayscale[50]};

  /* 테두리: 둥근 모서리(16px)로 버튼다움 강조 */
  border: none;
  border-radius: ${theme.borderRadius.medium};

  /* 타이포그래피: 가독성 높은 16Bold 적용 */
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  line-height: ${theme.typography['16Bold'].lineHeight};

  /* 인터랙션 및 피드백 */
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(101, 89, 234, 0.25);

  &:hover {
    background: ${theme.colors.primary.dark};
    transform: translateY(-2px); /* 부드럽게 떠오르는 효과 */
    box-shadow: 0 6px 16px rgba(101, 89, 234, 0.35);
  }

  &:active {
    transform: translateY(0);
    filter: brightness(0.95);
  }

  &:disabled {
    background: ${theme.colors.grayscale[300]};
    color: ${theme.colors.grayscale[500]};
    cursor: not-allowed;
    box-shadow: none;
  }
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
