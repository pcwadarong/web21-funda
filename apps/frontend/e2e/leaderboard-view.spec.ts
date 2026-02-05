import { expect, type Page, test } from '@playwright/test';

import { buildAuthUser, createFailureResponse, createSuccessResponse } from './helpers';

const sampleWeekKey = '2026-06';

/**
 * 랭킹 화면을 재현하기 위한 API 모킹.
 *
 * @param page - 테스트 페이지 객체
 */
async function applyLeaderboardMocks(page: Page): Promise<void> {
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

    if (pathname === '/api/ranking/weekly') {
      const body = createSuccessResponse({
        weekKey: sampleWeekKey,
        tier: { id: 1, name: 'BRONZE', orderIndex: 1 },
        groupIndex: 1,
        totalMembers: 2,
        myRank: 1,
        myWeeklyXp: 1200,
        members: [
          {
            rank: 1,
            userId: 1,
            displayName: '테스트 사용자',
            profileImageUrl: null,
            xp: 1200,
            isMe: true,
            rankZone: 'PROMOTION',
            tierName: 'BRONZE',
            tierOrderIndex: 1,
          },
          {
            rank: 2,
            userId: 2,
            displayName: '다른 사용자',
            profileImageUrl: null,
            xp: 800,
            isMe: false,
            rankZone: 'MAINTAIN',
            tierName: 'BRONZE',
            tierOrderIndex: 1,
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

    if (pathname === '/api/ranking/overall') {
      const body = createSuccessResponse({
        weekKey: sampleWeekKey,
        totalMembers: 2,
        myRank: 1,
        myWeeklyXp: 1200,
        members: [
          {
            rank: 1,
            userId: 1,
            displayName: '테스트 사용자',
            profileImageUrl: null,
            xp: 1200,
            isMe: true,
            rankZone: 'MAINTAIN',
            tierName: 'BRONZE',
            tierOrderIndex: 1,
          },
          {
            rank: 2,
            userId: 3,
            displayName: '세 번째 사용자',
            profileImageUrl: null,
            xp: 700,
            isMe: false,
            rankZone: 'MAINTAIN',
            tierName: 'BRONZE',
            tierOrderIndex: 1,
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

    const body = createFailureResponse('mock not found');
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

test.describe('랭킹 화면', () => {
  test.beforeEach(async ({ page }) => {
    await applyLeaderboardMocks(page);
  });

  test('랭킹 목록이 표시된다', async ({ page }) => {
    await page.goto('/leaderboard');

    await expect(page.getByRole('heading', { name: 'LEADERBOARD' })).toBeVisible();

    const promotionRegion = page.getByRole('region', { name: '승급권 구역' });
    const maintainRegion = page.getByRole('region', { name: '유지 구역' });

    await expect(promotionRegion.getByText('테스트 사용자')).toBeVisible();
    await expect(maintainRegion.getByText('다른 사용자')).toBeVisible();
  });

  test('전체 순위 탭으로 전환된다', async ({ page }) => {
    await page.goto('/leaderboard');

    const overallTab = page.getByRole('tab', { name: '전체 순위' });
    await overallTab.click();

    await expect(page.getByText('세 번째 사용자')).toBeVisible();
  });
});
