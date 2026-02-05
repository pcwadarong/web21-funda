import { expect, type Page, test } from '@playwright/test';

import { buildAuthUser, createFailureResponse, createSuccessResponse } from './helpers';

const profileUserId = 1;
const profileDisplayName = '테스트 사용자';
const profileDiamondCount = 3333;
const profileSolvedQuizCount = 77;

/**
 * 프로필 화면을 재현하기 위한 API 모킹.
 *
 * @param page - 테스트 페이지 객체
 */
async function applyProfileMocks(page: Page): Promise<void> {
  await page.route('**/api/**', async route => {
    const requestUrl = new URL(route.request().url());
    const pathname = requestUrl.pathname;

    if (pathname === '/api/auth/me') {
      const body = createSuccessResponse({
        user: buildAuthUser({ id: profileUserId, displayName: profileDisplayName }),
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

    if (pathname === `/api/profiles/${profileUserId}`) {
      const body = createSuccessResponse({
        userId: profileUserId,
        displayName: profileDisplayName,
        profileImageUrl: null,
        experience: 1200,
        diamondCount: profileDiamondCount,
        currentStreak: 2,
        tier: { id: 1, name: 'BRONZE', orderIndex: 1 },
        followerCount: 1,
        followingCount: 2,
        totalStudyTimeSeconds: 3600,
        totalStudyTimeMinutes: 60,
        solvedQuizzesCount: profileSolvedQuizCount,
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === `/api/profiles/${profileUserId}/followers`) {
      const body = createSuccessResponse([]);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === `/api/profiles/${profileUserId}/following`) {
      const body = createSuccessResponse([]);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === `/api/profiles/${profileUserId}/streaks`) {
      const body = createSuccessResponse([]);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === `/api/profiles/${profileUserId}/daily-stats`) {
      const body = createSuccessResponse({
        dailyData: [],
        periodMaxSeconds: 0,
        periodAverageSeconds: 0,
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === `/api/profiles/${profileUserId}/field-daily-stats`) {
      const body = createSuccessResponse({ fields: [] });
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

test.describe('프로필 화면', () => {
  test.beforeEach(async ({ page }) => {
    await applyProfileMocks(page);
  });

  test('프로필 요약 정보가 표시된다', async ({ page }) => {
    await page.goto(`/profile/${profileUserId}`);

    await expect(page.getByRole('heading', { name: 'PROFILE' })).toBeVisible();
    await expect(page.getByRole('heading', { name: profileDisplayName, level: 1 })).toBeVisible();
    await expect(page.getByText('1200 XP')).toBeVisible();
    await expect(page.getByText(String(profileDiamondCount), { exact: true })).toBeVisible();
    await expect(page.getByText(`${profileDisplayName}의 통계`)).toBeVisible();
    await expect(page.getByText('60 min')).toBeVisible();
    await expect(page.getByText(String(profileSolvedQuizCount), { exact: true })).toBeVisible();
  });
});
