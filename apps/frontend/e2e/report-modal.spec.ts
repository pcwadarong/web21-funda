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
 * 신고 모달 표시를 위한 API 모킹.
 *
 * @param page - 테스트 페이지 객체
 */
async function applyReportModalMocks(page: Page): Promise<void> {
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

test.describe('퀴즈 신고 모달', () => {
  test.beforeEach(async ({ page }) => {
    await applyReportModalMocks(page);
  });

  test('퀴즈 오류 신고 모달이 열린다', async ({ page }) => {
    await goToQuizByStepSelection(page);

    const reportButton = page.getByRole('button', { name: '오류 신고' });
    await reportButton.click();

    await expect(page.getByRole('heading', { name: '오류 신고' })).toBeVisible();
    await expect(page.getByText('신고 유형', { exact: true })).toBeVisible();
  });
});
