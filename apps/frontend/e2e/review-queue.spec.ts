import { expect, type Page, test } from '@playwright/test';

import { buildAuthUser, createFailureResponse, createSuccessResponse } from './helpers';

const sampleFieldSlug = 'FE';
const sampleFieldName = '프론트엔드';
const sampleReviewQuestionText = 'HTTP는 무상태 프로토콜이다.';

/**
 * 복습 모드 진입을 재현하기 위한 API 모킹.
 *
 * @param page - 테스트 페이지 객체
 */
async function applyReviewQueueMocks(page: Page): Promise<void> {
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
        units: [],
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === '/api/progress/reviews') {
      const body = createSuccessResponse([
        {
          id: 9101,
          type: 'ox',
          content: {
            question: sampleReviewQuestionText,
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

    const body = createFailureResponse('mock not found');
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

test.describe('복습 모드 진입', () => {
  test.beforeEach(async ({ page }) => {
    await applyReviewQueueMocks(page);
  });

  test('복습 시작하기를 누르면 복습 퀴즈가 열린다', async ({ page }) => {
    await page.goto('/learn');

    const reviewButton = page.getByRole('button', { name: '복습 시작하기' });
    await expect(reviewButton).toBeEnabled();
    await reviewButton.click();

    await expect(page).toHaveURL(/\/quiz\?mode=review/);

    const reviewQuestionHeading = page.getByRole('heading', {
      name: new RegExp(sampleReviewQuestionText),
    });
    await expect(reviewQuestionHeading).toBeVisible();
  });
});
