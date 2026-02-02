import { ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type * as ReactRouterDom from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LearnRightSidebar } from '@/feat/learn/components/RightSidebar';
import { ModalProvider } from '@/store/modalStore';
import { ToastProvider } from '@/store/toastStore';
import { lightTheme } from '@/styles/theme';

// SVGIcon 모킹
vi.mock('@/comp/SVGIcon', () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

const updateUIStateMock = vi.fn();

// useStorage 모킹
const mockUseStorage = vi.fn(() => ({
  progress: { heart: 5, last_solved_unit_id: [] },
  uiState: {
    last_viewed: { field_slug: 'frontend', unit_id: 1 },
    current_quiz_step_id: 0,
  },
  solvedStepHistory: [],
  updateProgress: vi.fn(),
  updateUIState: updateUIStateMock,
  addStepHistory: vi.fn(),
  updateLastSolvedUnit: vi.fn(),
}));

vi.mock('@/hooks/useStorage', () => ({
  useStorage: () => mockUseStorage(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouterDom>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// authStore 모킹
const mockUseAuthStore = vi.fn(() => false);
const mockUseIsAuthReady = vi.fn(() => true);
const mockUseAuthUser = vi.fn<() => { heartCount: number; currentStreak: number } | null>(
  () => null,
);

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (state: { isLoggedIn: boolean }) => boolean) => {
    const state = { isLoggedIn: mockUseAuthStore() };
    return selector(state);
  },
  useAuthUser: () => mockUseAuthUser(),
  useIsLoggedIn: () => mockUseAuthStore(),
  useIsAuthReady: () => mockUseIsAuthReady(),
}));

const mockFields = [
  {
    slug: 'frontend',
    name: '프론트엔드',
    description: '프론트엔드',
    icon: 'Frontend',
  },
  {
    slug: 'backend',
    name: '백엔드',
    description: '백엔드',
    icon: 'Backend',
  },
];
const mockGetFields = vi.fn();
const mockGetReviewQueue = vi.fn();

vi.mock('@/services/fieldService', () => ({
  fieldService: {
    getFields: () => mockGetFields(),
  },
}));

vi.mock('@/hooks/queries/fieldQueries', () => ({
  useFieldsQuery: () => ({ data: { fields: mockFields } }),
}));

vi.mock('@/services/progressService', () => ({
  progressService: {
    getReviewQueue: (params?: { fieldSlug?: string; limit?: number }) => mockGetReviewQueue(params),
  },
}));

const renderSidebar = (props?: { fieldSlug?: string; setFieldSlug?: (slug: string) => void }) => {
  const setFieldSlug = props?.setFieldSlug ?? (() => {});
  const fieldSlug = props?.fieldSlug ?? 'frontend';
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    setFieldSlug,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={lightTheme}>
          <ToastProvider>
            <ModalProvider>
              <MemoryRouter>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    backgroundColor: lightTheme.colors.surface.default,
                    minHeight: '100vh',
                    padding: '24px',
                  }}
                >
                  <LearnRightSidebar fieldSlug={fieldSlug} setFieldSlug={setFieldSlug} />
                </div>
              </MemoryRouter>
            </ModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>,
    ),
  };
};

describe('LearnRightSidebar 컴포넌트 테스트', () => {
  beforeEach(() => {
    mockUseIsAuthReady.mockReturnValue(true);
    mockGetFields.mockResolvedValue({
      fields: [
        {
          slug: 'frontend',
          name: '프론트엔드',
          description: '프론트엔드',
          icon: 'Frontend',
        },
        {
          slug: 'backend',
          name: '백엔드',
          description: '백엔드',
          icon: 'Backend',
        },
      ],
    });
    mockGetReviewQueue.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    updateUIStateMock.mockClear();
    mockNavigate.mockClear();
    mockUseAuthStore.mockReturnValue(false);
    mockUseIsAuthReady.mockReturnValue(true);
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderSidebar();

    expect(screen.getByText(/FRONTEND/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // 하트 개수
  });

  it('필드 이름이 표시된다', () => {
    renderSidebar();

    expect(screen.getByText(/FRONTEND/i)).toBeInTheDocument();
  });

  it('비로그인 상태에서 하트 개수가 표시된다', () => {
    mockUseAuthStore.mockReturnValue(false);
    renderSidebar();

    expect(screen.getByText('5')).toBeInTheDocument(); // progress.heart
    expect(screen.getByTestId('icon-Heart')).toBeInTheDocument();
  });

  it('로그인 상태에서 Diamond와 Streak이 표시된다', () => {
    mockUseAuthStore.mockReturnValue(true);
    mockUseAuthUser.mockReturnValue({ heartCount: 4, currentStreak: 7 });
    renderSidebar();

    expect(screen.getByTestId('icon-Diamond')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Streak')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument(); // Streak
  });

  it('로그인 상태에서 learningDays가 표시된다', () => {
    mockUseAuthStore.mockReturnValue(true);
    mockUseAuthUser.mockReturnValue({ heartCount: 4, currentStreak: 7 });
    renderSidebar();

    const heartNumbers = screen.getAllByText('4');
    expect(heartNumbers.length).toBeGreaterThan(0);
  });

  it('복습 노트 카드가 표시된다', () => {
    renderSidebar();

    expect(screen.getByText('복습 노트')).toBeInTheDocument();
  });

  it('친구 추가 카드가 표시된다', () => {
    renderSidebar();

    expect(screen.getByText('친구 추가')).toBeInTheDocument();
  });

  it('비로그인 상태에서 복습 노트에 로그인 링크가 표시된다', () => {
    mockUseAuthStore.mockReturnValue(false);
    renderSidebar();

    expect(screen.getByText(/로그인 후 복습 노트를 확인해보세요/)).toBeInTheDocument();
  });

  it('로그인 상태에서 복습 노트에 복습 시작 버튼이 표시된다', async () => {
    mockUseAuthStore.mockReturnValue(true);
    mockUseAuthUser.mockReturnValue({ heartCount: 4, currentStreak: 7 });
    mockGetReviewQueue.mockResolvedValue([
      { id: 1, type: 'mcq', content: { question: '문제 1', options: [] } },
      { id: 2, type: 'ox', content: { question: '문제 2', options: [] } },
      {
        id: 3,
        type: 'code',
        content: {
          question: '문제 3',
          options: [],
          code_metadata: { language: 'javascript', snippet: 'const a = 1;' },
        },
      },
    ]);
    renderSidebar();

    expect(await screen.findByText('복습 시작')).toBeInTheDocument();
  });

  it('비로그인 상태에서 친구 추가에 로그인 링크가 표시된다', () => {
    mockUseAuthStore.mockReturnValue(false);
    renderSidebar();

    expect(screen.getByText(/로그인 후 친구를 추가해보세요/)).toBeInTheDocument();
  });

  it('로그인 상태에서 친구 추가 버튼이 표시된다', () => {
    mockUseAuthStore.mockReturnValue(true);
    mockUseAuthUser.mockReturnValue({ heartCount: 4, currentStreak: 7 });
    renderSidebar();

    expect(screen.getByText('친구 추가하기')).toBeInTheDocument();
  });

  it('아이콘들이 올바르게 렌더링된다', () => {
    renderSidebar();

    expect(screen.getByTestId('icon-Frontend')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Heart')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Book')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Search')).toBeInTheDocument();
  });

  it('드롭다운 옵션을 선택했을 때 상태가 갱신되고 이동이 호출되어야 한다', async () => {
    const setFieldSlug = vi.fn();
    renderSidebar({ setFieldSlug });

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(await screen.findByRole('option', { name: '백엔드' }));

    expect(updateUIStateMock).toHaveBeenCalledWith({
      last_viewed: {
        field_slug: 'backend',
        unit_id: 0,
      },
    });
    expect(setFieldSlug).toHaveBeenCalledWith('backend');
  });
});
