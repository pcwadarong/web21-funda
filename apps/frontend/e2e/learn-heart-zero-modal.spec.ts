import { expect, type Page, test } from '@playwright/test';

import { buildAuthUser, createFailureResponse, createSuccessResponse } from './helpers';

const sampleFieldSlug = 'FE';
const sampleFieldName = '프론트엔드';
const sampleUnitId = 20;
const sampleUnitTitle = '운영체제 입문';
const sampleStepId = 201;
const sampleStepTitle = '프로세스 기본';

/**
 * 하트 부족 모달을 재현하기 위한 API 모킹.
 *
 * @param page - 테스트 페이지 객체
 */
async function applyHeartZeroMocks(page: Page): Promise<void> {
  await page.route('**/api/**', async route => {
    const requestUrl = new URL(route.request().url());
    const pathname = requestUrl.pathname;

    if (pathname === '/api/auth/me') {
      const body = createSuccessResponse({
        user: buildAuthUser({ heartCount: 0, maxHeartCount: 5 }),
      });
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
                orderIndex: 4,
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

    const body = createFailureResponse('mock not found');
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

test.describe('하트 부족 모달', () => {
  test.beforeEach(async ({ page }) => {
    await applyHeartZeroMocks(page);
  });

  test('하트 0 상태에서 스텝 클릭 시 모달이 열린다', async ({ page }) => {
    await page.goto('/learn');

    const stepButton = page.getByRole('button', { name: `${sampleStepTitle}, 시작 가능` });
    await expect(stepButton).toBeVisible();

    await stepButton.click();

    await expect(page.getByRole('heading', { name: '알림' })).toBeVisible();
    await expect(page.getByText('하트가 채워지면 다시 도전해주세요!')).toBeVisible();
  });
});
