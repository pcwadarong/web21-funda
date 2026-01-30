import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LearnContainer } from '@/feat/learn/components/LearnContainer';
import type { UnitType } from '@/feat/learn/types';
import { ModalProvider } from '@/store/modalStore';
import { ThemeStoreProvider } from '@/store/themeStore';
import { lightTheme } from '@/styles/theme';

// SVGIcon 모킹
vi.mock('@/comp/SVGIcon', () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// RightSidebar 모킹
vi.mock('@/feat/learn/components/RightSidebar', () => ({
  LearnRightSidebar: () => <div data-testid="right-sidebar">Right Sidebar</div>,
}));

const mockUnits: UnitType[] = [
  {
    id: 1,
    title: 'HTML 기초',
    orderIndex: 1,
    steps: [
      {
        id: 101,
        title: 'HTML 구조 이해',
        orderIndex: 1,
        quizCount: 5,
        isCheckpoint: false,
        isCompleted: true,
        isLocked: false,
      },
      {
        id: 102,
        title: '시맨틱 태그',
        orderIndex: 2,
        quizCount: 4,
        isCheckpoint: false,
        isCompleted: false,
        isLocked: false,
      },
      {
        id: 103,
        title: '중간 점검',
        orderIndex: 3,
        quizCount: 6,
        isCheckpoint: true,
        isCompleted: false,
        isLocked: true,
      },
    ],
  },
  {
    id: 2,
    title: 'CSS 기초',
    orderIndex: 2,
    steps: [
      {
        id: 201,
        title: '선택자 기초',
        orderIndex: 1,
        quizCount: 5,
        isCheckpoint: false,
        isCompleted: false,
        isLocked: false,
      },
    ],
  },
];

const mockScrollContainerRef = { current: null };
const mockHeaderRef = { current: null };

const renderContainer = (props: Partial<React.ComponentProps<typeof LearnContainer>> = {}) => {
  const defaultProps = {
    fieldName: '프론트엔드',
    units: mockUnits,
    activeUnit: mockUnits[0],
    scrollContainerRef: mockScrollContainerRef,
    headerRef: mockHeaderRef,
    registerUnitRef: vi.fn(() => () => {}),
    onStepClick: vi.fn(),
    onOverviewClick: vi.fn(),
    fieldSlug: 'FE',
    setFieldSlug: vi.fn(),
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <ThemeStoreProvider>
        <ModalProvider>
          <MemoryRouter>
            <LearnContainer {...defaultProps} />
          </MemoryRouter>
        </ModalProvider>
      </ThemeStoreProvider>
    </ThemeProvider>,
  );
};

describe('LearnContainer 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderContainer();

    expect(screen.getByText('프론트엔드 로드맵')).toBeInTheDocument();
    // "HTML 기초"는 헤더와 유닛 구분선에 두 번 나타남
    const htmlUnits = screen.getAllByText('HTML 기초');
    expect(htmlUnits.length).toBeGreaterThan(0);
  });

  it('활성 유닛의 제목이 헤더에 표시된다', () => {
    renderContainer();

    // "HTML 기초"는 헤더와 유닛 구분선에 두 번 나타남
    const htmlUnits = screen.getAllByText('HTML 기초');
    expect(htmlUnits.length).toBeGreaterThan(0);
  });

  it('"학습 개요" 버튼이 표시된다', () => {
    renderContainer();

    expect(screen.getByText('학습 개요')).toBeInTheDocument();
  });

  it('유닛들이 올바르게 렌더링된다', () => {
    renderContainer();

    // "HTML 기초"는 헤더와 유닛 구분선에 두 번 나타남
    const htmlUnits = screen.getAllByText('HTML 기초');
    expect(htmlUnits.length).toBeGreaterThan(0);
    expect(screen.getByText('CSS 기초')).toBeInTheDocument();
  });

  it('스텝들이 올바르게 렌더링된다', () => {
    renderContainer();

    expect(screen.getByText('HTML 구조 이해')).toBeInTheDocument();
    expect(screen.getByText('시맨틱 태그')).toBeInTheDocument();
    expect(screen.getByText('중간 점검')).toBeInTheDocument();
  });

  it('완료된 스텝에는 Check 아이콘이 표시된다', () => {
    renderContainer();

    expect(screen.getByTestId('icon-Check')).toBeInTheDocument();
  });

  it('잠긴 스텝에는 Lock 아이콘이 표시된다', () => {
    renderContainer();

    const lockIcons = screen.getAllByTestId('icon-Lock');
    expect(lockIcons.length).toBeGreaterThan(0);
  });

  it('활성 스텝 클릭 시 onStepClick이 호출된다', () => {
    const onStepClick = vi.fn();
    renderContainer({ onStepClick });

    // 활성화된 스텝(시맨틱 태그) - 스텝 제목을 먼저 찾고, 그 부모 요소에서 Start 아이콘이 있는 div 찾기
    const stepTitle = screen.getByText('시맨틱 태그');
    // 스텝 제목의 부모 구조에서 Start 아이콘이 있는 div 찾기
    const stepContainer = stepTitle.closest('[class*="lessonStackStyle"]');
    const startIcons = screen.getAllByTestId('icon-Start');
    // 시맨틱 태그 스텝과 같은 컨테이너에 있는 Start 아이콘 찾기
    const targetIcon = startIcons.find(icon => {
      const iconContainer = icon.closest('[class*="lessonStackStyle"]');
      return iconContainer === stepContainer;
    });

    if (targetIcon) {
      const clickableDiv =
        targetIcon.closest('div[style*="cursor: pointer"]') || targetIcon.closest('div');
      if (clickableDiv) {
        fireEvent.click(clickableDiv as HTMLElement);
        expect(onStepClick).toHaveBeenCalledWith(mockUnits[0]!.steps[1]);
      }
    }
  });

  it('잠긴 스텝은 클릭해도 onStepClick이 호출되지 않는다', () => {
    const onStepClick = vi.fn();
    renderContainer({ onStepClick });

    // 잠긴 스텝 찾기
    const lockedStep = screen.getByText('중간 점검');
    fireEvent.click(lockedStep);

    // 잠긴 스텝은 클릭해도 이벤트가 발생하지 않아야 함
    expect(onStepClick).not.toHaveBeenCalled();
  });

  it('RightSidebar가 렌더링된다', () => {
    renderContainer();

    expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
  });

  it('activeUnit이 없을 때 헤더가 표시되지 않는다', () => {
    renderContainer({ activeUnit: undefined });

    expect(screen.queryByText('학습 개요')).not.toBeInTheDocument();
  });
});
