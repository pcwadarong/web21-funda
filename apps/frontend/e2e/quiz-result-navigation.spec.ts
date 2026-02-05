import { expect, type Page, test } from '@playwright/test';

import { buildAuthUser, createFailureResponse, createSuccessResponse } from './helpers';

const sampleFieldSlug = 'FE';
const sampleFieldName = '프론트엔드';
const sampleUnitId = 10;
const sampleUnitTitle = '네트워크 기초';
const sampleStepId = 101;
const sampleStepTitle = '전송 계층 입문';
const sampleQuizId = 9001;
const sampleQuestionText = '네트워크에서 TCP는 신뢰성을 제공한다.';

/**
 * 결과 화면 이동 흐름을 재현하기 위한 API 모킹.
 *
 * @param page - 테스트 페이지 객체
 */
async function applyQuizResultMocks(page: Page): Promise<void> {
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

    if (pathname === '/api/ranking/me') {
      const body = createSuccessResponse({
        tier: { id: 1, name: 'BRONZE', orderIndex: 1 },
        diamondCount: 3,
      });
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
        field: { name: sampleFieldName, slug: sampleFieldSlug },
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
        perfectScore: { id: 'perfectScore', label: '퍼펙트', current: 0, target: 1 },
        totalXP: { id: 'totalXP', label: 'XP', current: 0, target: 10 },
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
        solution: { explanation: '정답입니다.', correct_option_id: 'o' },
        user_heart_count: 5,
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === `/api/progress/steps/${sampleStepId}/complete`) {
      const body = createSuccessResponse({
        successRate: 100,
        xpGained: 0,
        durationMs: 12000,
        currentStreak: 3,
        isFirstSolveToday: false,
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

async function goToQuizByStepSelection(page: Page): Promise<void> {
  await page.goto('/learn');
  const stepButton = page.getByRole('button', { name: `${sampleStepTitle}, 시작 가능` });
  await expect(stepButton).toBeVisible();
  await stepButton.click();
  await expect(page).toHaveURL(/\/quiz$/);
}

test.describe('퀴즈 결과 화면 이동', () => {
  test.beforeEach(async ({ page }) => {
    await applyQuizResultMocks(page);
  });

  test('정답 제출 후 결과 화면으로 이동된다', async ({ page }) => {
    await goToQuizByStepSelection(page);

    await page.getByRole('button', { name: 'O' }).click();

    const submitButton = page.getByRole('button', { name: '정답 확인' });
    await submitButton.click();

    await page.getByRole('button', { name: '결과 보기' }).click();

    await expect(page).toHaveURL(/\/quiz\/result$/);
    await expect(page.getByRole('button', { name: '학습 계속하기' })).toBeVisible();
  });
});
