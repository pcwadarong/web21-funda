import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { lightTheme } from '@/styles/theme';

// SVGIcon 모킹 (vite-plugin-svgr 환경 문제 회피)
vi.mock('@/comp/SVGIcon', () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

// useStorage 모킹
vi.mock('@/hooks/useStorage', () => ({
  useStorage: () => ({ updateUIState: vi.fn() }),
}));

// useNavigate 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 모킹 후 컴포넌트 import (hoisting 문제 방지)
const { InitialFields } = await import('@/pages/InitialFields');

const renderFields = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <InitialFields />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('InitialFields 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
    mockNavigate.mockClear();
  });

  it('필드 버튼들이 렌더링된다', () => {
    renderFields();

    expect(screen.getByText('프론트엔드')).toBeInTheDocument();
    expect(screen.getByText('백엔드')).toBeInTheDocument();
    expect(screen.getByText('모바일')).toBeInTheDocument();
    expect(screen.getByText('CS 기초')).toBeInTheDocument();
  });

  it('필드 라벨 클릭 시 선택된다', () => {
    renderFields();

    const frontendLabel = screen.getByText('프론트엔드').closest('label');
    const frontendRadio = frontendLabel?.querySelector('input[type="radio"]') as HTMLInputElement;

    expect(frontendRadio.checked).toBe(false);

    fireEvent.click(frontendLabel!);
    expect(frontendRadio.checked).toBe(true);
  });

  it('선택 전에는 "선택 완료하고 시작하기" 버튼이 비활성화된다', () => {
    renderFields();

    const completeButton = screen.getByText('선택 완료하고 시작하기');
    expect(completeButton).toBeDisabled();
  });

  it('필드 선택 후 버튼이 활성화되고 클릭 시 /quiz으로 이동한다', () => {
    renderFields();

    const frontendLabel = screen.getByText('프론트엔드').closest('label');
    const completeButton = screen.getByText('선택 완료하고 시작하기');

    fireEvent.click(frontendLabel!);
    expect(completeButton).not.toBeDisabled();

    fireEvent.click(completeButton);
    expect(mockNavigate).toHaveBeenCalledWith('/quiz');
  });

  it('필드를 변경하면 이전 선택은 해제된다 (radio 동작)', () => {
    renderFields();

    const frontendLabel = screen.getByText('프론트엔드').closest('label');
    const backendLabel = screen.getByText('백엔드').closest('label');
    const frontendRadio = frontendLabel?.querySelector('input[type="radio"]') as HTMLInputElement;
    const backendRadio = backendLabel?.querySelector('input[type="radio"]') as HTMLInputElement;

    fireEvent.click(frontendLabel!);
    expect(frontendRadio.checked).toBe(true);

    fireEvent.click(backendLabel!);
    expect(backendRadio.checked).toBe(true);
    expect(frontendRadio.checked).toBe(false);
  });
});
