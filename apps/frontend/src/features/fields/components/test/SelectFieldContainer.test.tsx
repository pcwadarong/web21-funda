import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SelectFieldContainer } from '@/feat/fields/components/SelectFieldContainer';
import type { Field } from '@/services/fieldService';
import { lightTheme } from '@/styles/theme';

// SVGIcon 모킹
vi.mock('@/comp/SVGIcon', () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

const mockFields: Field[] = [
  {
    slug: 'frontend',
    name: '프론트엔드',
    description: '사용자 인터페이스와 웹 프론트엔드 개발',
    icon: 'Frontend',
  },
  {
    slug: 'backend',
    name: '백엔드',
    description: '서버와 데이터베이스, API 개발',
    icon: 'Backend',
  },
  {
    slug: 'mobile',
    name: '모바일',
    description: 'iOS와 Android 모바일 앱 개발',
    icon: 'Mobile',
  },
];

const renderContainer = (
  props: Partial<React.ComponentProps<typeof SelectFieldContainer>> = {},
) => {
  const defaultProps = {
    fields: mockFields,
    onFieldClick: vi.fn(),
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <SelectFieldContainer {...defaultProps} />
      </MemoryRouter>
    </ThemeProvider>,
  );
};

describe('SelectFieldContainer 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderContainer();

    expect(screen.getByText('학습 분야 선택')).toBeInTheDocument();
    expect(screen.getByText('어떤 분야를 선택하시겠어요?')).toBeInTheDocument();
  });

  it('필드 카드들이 올바르게 렌더링된다', () => {
    renderContainer();

    expect(screen.getByText('프론트엔드')).toBeInTheDocument();
    expect(screen.getByText('백엔드')).toBeInTheDocument();
    expect(screen.getByText('모바일')).toBeInTheDocument();
  });

  it('필드 설명이 올바르게 표시된다', () => {
    renderContainer();

    expect(screen.getByText('사용자 인터페이스와 웹 프론트엔드 개발')).toBeInTheDocument();
    expect(screen.getByText('서버와 데이터베이스, API 개발')).toBeInTheDocument();
  });

  it('필드 아이콘이 올바르게 렌더링된다', () => {
    renderContainer();

    expect(screen.getByTestId('icon-Frontend')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Backend')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Mobile')).toBeInTheDocument();
  });

  it('"로드맵 보기" 텍스트가 표시된다', () => {
    renderContainer();

    const roadmapLinks = screen.getAllByText('로드맵 보기');
    expect(roadmapLinks.length).toBe(mockFields.length);
  });

  it('필드 카드 클릭 시 onFieldClick이 올바른 slug로 호출된다', () => {
    const onFieldClick = vi.fn();
    renderContainer({ onFieldClick });

    const frontendCard = screen.getByText('프론트엔드').closest('label');
    fireEvent.click(frontendCard!);

    expect(onFieldClick).toHaveBeenCalledWith('frontend');
  });

  it('다른 필드 카드 클릭 시에도 onFieldClick이 올바르게 호출된다', () => {
    const onFieldClick = vi.fn();
    renderContainer({ onFieldClick });

    const backendCard = screen.getByText('백엔드').closest('label');
    fireEvent.click(backendCard!);

    expect(onFieldClick).toHaveBeenCalledWith('backend');
  });
});
