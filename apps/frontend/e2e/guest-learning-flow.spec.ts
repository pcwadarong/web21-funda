import { expect, type Page, test } from '@playwright/test';

type ApiResponse<T> = {
  success: boolean;
  code: number;
  message: string;
  result: T;
};

const sampleFieldSlug = 'frontend';
const sampleFieldName = '프론트엔드';
const sampleStepId = 101;
const sampleQuizQuestion = '네트워크에서 TCP는 신뢰성을 제공한다.';

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

/**
 * 백엔드 의존 없이 화면 흐름만 검증하기 위해 API 응답을 고정한다.
 *
 * @param page - 테스트 페이지 객체
 */
async function applyGuestApiMocks(page: Page): Promise<void> {
  await page.route('**/api/**', async route => {
    const requestUrl = new URL(route.request().url());
    const pathname = requestUrl.pathname;

    if (pathname === '/api/auth/me') {
      const body = createSuccessResponse({ user: null });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === '/api/auth/refresh') {
      const body = createFailureResponse('refresh failed');
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    if (pathname === '/api/auth/guest-id') {
      const body = createSuccessResponse({});
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
            description: '게스트 테스트용 필드',
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

    if (pathname === `/api/fields/${sampleFieldSlug}/units/first`) {
      const body = createSuccessResponse({
        field: {
          name: sampleFieldName,
          slug: sampleFieldSlug,
        },
        unit: {
          id: 1,
          title: '네트워크 기초',
          orderIndex: 1,
          steps: [
            {
              id: sampleStepId,
              title: '전송 계층',
              orderIndex: 1,
              quizCount: 1,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
          ],
        },
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
          id: 9001,
          type: 'ox',
          content: {
            question: sampleQuizQuestion,
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

    const body = createFailureResponse('mock not found');
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

test.describe('비로그인 학습 시작 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await applyGuestApiMocks(page);
  });

  test('랜딩에서 퀴즈 진입까지 진행된다', async ({ page }) => {
    await page.goto('/');

    const startButton = page.getByRole('button', { name: '사용해 보기' });
    await expect(startButton).toBeVisible();

    await startButton.click();

    await expect(page).toHaveURL(/\/initial-fields$/);

    const completeButton = page.getByRole('button', { name: '선택 완료하고 시작하기' });
    await expect(completeButton).toBeDisabled();

    await page.getByText(sampleFieldName, { exact: true }).click();
    await expect(completeButton).toBeEnabled();

    await completeButton.click();

    await expect(page).toHaveURL(/\/quiz$/);
    await expect(page.getByRole('heading', { name: new RegExp(sampleQuizQuestion) })).toBeVisible();
  });
});
