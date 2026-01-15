import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InitialFieldsContainer } from '@/feat/fields/components/InitialFieldsContainer';
import type { Field } from '@/services/fieldService';
import { lightTheme } from '@/styles/theme';

// SVGIcon 모킹 (vite-plugin-svgr 환경 문제 회피)
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
  {
    slug: 'cs',
    name: 'CS 기초',
    description: '컴퓨터 과학 기초 지식',
    icon: 'ComputerScience',
  },
];

const renderContainer = (
  props: Partial<React.ComponentProps<typeof InitialFieldsContainer>> = {},
) => {
  const defaultProps = {
    fields: mockFields,
    selectedField: null,
    onFieldChange: vi.fn(),
    onComplete: vi.fn(),
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <InitialFieldsContainer {...defaultProps} />
      </MemoryRouter>
    </ThemeProvider>,
  );
};

describe('InitialFieldsContainer 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
  });

  it('필드 버튼들이 렌더링된다', () => {
    renderContainer();

    expect(screen.getByText('프론트엔드')).toBeInTheDocument();
    expect(screen.getByText('백엔드')).toBeInTheDocument();
    expect(screen.getByText('모바일')).toBeInTheDocument();
    expect(screen.getByText('CS 기초')).toBeInTheDocument();
  });

  it('필드 라벨 클릭 시 선택된다', () => {
    const onFieldChange = vi.fn();
    renderContainer({ onFieldChange });

    const frontendLabel = screen.getByText('프론트엔드').closest('label');
    const frontendRadio = frontendLabel?.querySelector('input[type="radio"]') as HTMLInputElement;

    expect(frontendRadio.checked).toBe(false);

    fireEvent.click(frontendLabel!);
    expect(onFieldChange).toHaveBeenCalledWith('frontend');
  });

  it('선택 전에는 "선택 완료하고 시작하기" 버튼이 비활성화된다', () => {
    renderContainer();

    const completeButton = screen.getByText('선택 완료하고 시작하기');
    expect(completeButton).toBeDisabled();
  });

  it('필드 선택 후 버튼이 활성화되고 클릭 시 onComplete가 호출된다', () => {
    const onComplete = vi.fn();
    renderContainer({ selectedField: 'frontend', onComplete });

    const completeButton = screen.getByText('선택 완료하고 시작하기');
    expect(completeButton).not.toBeDisabled();

    fireEvent.click(completeButton);
    expect(onComplete).toHaveBeenCalled();
  });

  it('필드를 변경하면 이전 선택은 해제된다 (radio 동작)', () => {
    const onFieldChange = vi.fn();
    renderContainer({ selectedField: 'frontend', onFieldChange });

    const frontendLabel = screen.getByText('프론트엔드').closest('label');
    const backendLabel = screen.getByText('백엔드').closest('label');
    const frontendRadio = frontendLabel?.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(frontendRadio.checked).toBe(true);

    fireEvent.click(backendLabel!);
    expect(onFieldChange).toHaveBeenCalledWith('backend');
  });
});
