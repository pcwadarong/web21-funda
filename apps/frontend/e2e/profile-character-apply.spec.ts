import { expect, type Page, test } from '@playwright/test';

import { buildAuthUser, createFailureResponse, createSuccessResponse } from './helpers';

const profileUserId = 1;
const profileDisplayName = '테스트 사용자';
const characterId = 101;
const characterImageUrl = 'https://example.com/character-101.png';

/**
 * 프로필 캐릭터 적용 흐름을 재현하기 위한 API 모킹.
 *
 * @param page - 테스트 페이지 객체
 */
async function applyProfileCharacterMocks(page: Page): Promise<void> {
  let currentProfileImageUrl: string | null = null;
  let currentSelectedCharacterId: number | null = null;

  await page.route('**/api/**', async route => {
    const requestUrl = new URL(route.request().url());
    const pathname = requestUrl.pathname;

    if (pathname === '/api/auth/me') {
      const body = createSuccessResponse({
        user: buildAuthUser({
          id: profileUserId,
          displayName: profileDisplayName,
          profileImageUrl: currentProfileImageUrl,
        }),
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
        diamondCount: 3,
        currentStreak: 2,
        tier: { id: 1, name: 'BRONZE', orderIndex: 1 },
        followerCount: 1,
        followingCount: 2,
        totalStudyTimeSeconds: 3600,
        totalStudyTimeMinutes: 60,
        solvedQuizzesCount: 10,
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

    if (pathname === '/api/profiles/me/characters') {
      const body = createSuccessResponse({
        selectedCharacterId: currentSelectedCharacterId,
        diamondCount: 3,
        characters: [
          {
            id: characterId,
            imageUrl: characterImageUrl,
            priceDiamonds: 0,
            description: '테스트 캐릭터',
            isActive: currentSelectedCharacterId === characterId,
            isOwned: true,
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

    if (pathname === `/api/profiles/me/characters/${characterId}/apply`) {
      currentSelectedCharacterId = characterId;
      currentProfileImageUrl = characterImageUrl;

      const body = createSuccessResponse({
        characterId,
        applied: true,
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

test.describe('프로필 캐릭터 적용', () => {
  test.beforeEach(async ({ page }) => {
    await applyProfileCharacterMocks(page);
  });

  test('캐릭터 적용 후 프로필 이미지가 변경된다', async ({ page }) => {
    await page.goto(`/profile/${profileUserId}`);

    const changeButton = page.getByRole('button', { name: '프로필 이미지 변경' });
    await expect(changeButton).toBeVisible();
    await changeButton.click();

    await expect(page).toHaveURL(/\/profile\/characters$/);

    const characterButton = page.getByRole('button', { name: `캐릭터 ${characterId} 선택` });
    await characterButton.click();

    const applyButton = page.getByRole('button', { name: '적용하기' });
    await applyButton.click();

    const backButton = page.getByRole('button', { name: '내 프로필로 돌아가기' });
    await backButton.click();

    await expect(page).toHaveURL(new RegExp(`/profile/${profileUserId}$`));

    const profileImage = page.getByAltText(`${profileDisplayName} 프로필`);
    await expect(profileImage).toHaveAttribute('src', characterImageUrl);
  });
});
