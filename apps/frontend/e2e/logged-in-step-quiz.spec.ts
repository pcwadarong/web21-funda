import { expect, type Page, test } from '@playwright/test';

type ApiResponse<T> = {
  success: boolean;
  code: number;
  message: string;
  result: T;
};

type AuthUser = {
  id: number;
  displayName: string;
  email?: string | null;
  profileImageUrl?: string | null;
  role: 'user' | 'admin';
  isEmailSubscribed: boolean;
  heartCount: number;
  maxHeartCount: number;
  experience: number;
  diamondCount: number;
  currentStreak: number;
  provider: 'github' | 'google';
};

const sampleFieldSlug = 'FE';
const sampleFieldName = '프론트엔드';
const sampleUnitId = 10;
const sampleUnitTitle = '네트워크 기초';
const sampleStepId = 101;
const sampleStepTitle = '전송 계층 입문';
const sampleQuizId = 9001;
const sampleQuestionText = '네트워크에서 TCP는 신뢰성을 제공한다.';
const sampleExplanation = 'TCP는 순서 보장과 재전송으로 신뢰성을 제공합니다.';

function createSuccessResponse<T>(result: T): ApiResponse<T> {
  return {
    success: true,
    code: 200,
    message: 'OK',
    result,
  };
}

function createFailureResponse(message: string): ApiResponse<null> {
  return {
    success: false,
    code: 400,
    message,
    result: null,
  };
}

function buildAuthUser(): AuthUser {
  return {
    id: 1,
    displayName: '테스트 사용자',
    email: 'test@example.com',
    profileImageUrl: null,
    role: 'user',
    isEmailSubscribed: false,
    heartCount: 5,
    maxHeartCount: 5,
    experience: 1200,
    diamondCount: 3,
    currentStreak: 2,
    provider: 'github',
  };
}

/**
 * 로그인 사용자 기준으로 학습 흐름을 안정적으로 재현하기 위해 API를 고정한다.
 *
 * @param page - 테스트 페이지 객체
 */
async function applyLoggedInApiMocks(page: Page): Promise<void> {
  await page.route('**/api/**', async route => {
    const requestUrl = new URL(route.request().url());
    const pathname = requestUrl.pathname;

    if (pathname === '/api/auth/me') {
      const body = createSuccessResponse({ user: buildAuthUser() });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === '/api/fields') {
      const body = createSuccessResponse({
        fields: [
          {
            slug: sampleFieldSlug,
            name: sampleFieldName,
            description: '테스트용 필드',
            icon: 'Frontend',
          },
        ],
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === `/api/fields/${sampleFieldSlug}/units`) {
      const body = createSuccessResponse({
        field: {
          name: sampleFieldName,
          slug: sampleFieldSlug,
        },
        units: [
          {
            id: sampleUnitId,
            title: sampleUnitTitle,
            orderIndex: 1,
            steps: [
              {
                id: sampleStepId,
                title: sampleStepTitle,
                orderIndex: 1,
                quizCount: 1,
                isCheckpoint: false,
                isCompleted: false,
                isLocked: false,
              },
            ],
          },
        ],
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === '/api/progress/reviews') {
      const body = createSuccessResponse([]);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === '/api/progress/goals') {
      const body = createSuccessResponse({
        perfectScore: {
          id: 'perfectScore',
          label: '퍼펙트',
          current: 0,
          target: 1,
        },
        totalXP: {
          id: 'totalXP',
          label: 'XP',
          current: 0,
          target: 10,
        },
        rewardGranted: false,
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === `/api/steps/${sampleStepId}/quizzes`) {
      const body = createSuccessResponse([
        {
          id: sampleQuizId,
          type: 'ox',
          content: {
            question: sampleQuestionText,
            options: [
              { id: 'o', text: 'O' },
              { id: 'x', text: 'X' },
            ],
          },
        },
      ]);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === `/api/progress/steps/${sampleStepId}/start`) {
      const body = createSuccessResponse({ stepAttemptId: 555 });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === `/api/quizzes/${sampleQuizId}/submissions`) {
      const body = createSuccessResponse({
        is_correct: true,
        solution: {
          explanation: sampleExplanation,
          correct_option_id: 'o',
        },
        user_heart_count: 5,
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    const body = createFailureResponse('mock not found');
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

test.describe('로그인 사용자 스텝 풀이', () => {
  test.beforeEach(async ({ page }) => {
    await applyLoggedInApiMocks(page);
  });

  test('스텝 선택 후 정답 제출까지 진행된다', async ({ page }) => {
    await page.goto('/learn');

    const stepButton = page.getByRole('button', { name: `${sampleStepTitle}, 시작 가능` });
    await expect(stepButton).toBeVisible();

    await stepButton.click();

    await expect(page).toHaveURL(/\/quiz$/);

    const questionHeading = page.getByRole('heading', {
      name: new RegExp(sampleQuestionText),
    });
    await expect(questionHeading).toBeVisible();

    const optionButton = page.getByRole('button', { name: 'O' });
    await optionButton.click();

    const submitButton = page.getByRole('button', { name: '정답 확인' });
    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    const explanationRegion = page.getByRole('region', { name: '해설' });
    await expect(explanationRegion).toBeVisible();
    await expect(page.getByText(sampleExplanation, { exact: true })).toBeVisible();

    const resultButton = page.getByRole('button', { name: '결과 보기' });
    await expect(resultButton).toBeVisible();
  });
});
