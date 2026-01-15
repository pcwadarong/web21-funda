import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button } from '@/comp/Button';
import { lightTheme } from '@/styles/theme';

const renderButton = (props: Partial<React.ComponentProps<typeof Button>> = {}) => {
  const defaultProps = {
    children: '버튼',
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <Button {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('Button 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderButton();

    const button = screen.getByRole('button', { name: '버튼' });
    expect(button).toBeInTheDocument();
  });

  it('primary variant가 기본값으로 적용된다', () => {
    renderButton();

    const button = screen.getByRole('button', { name: '버튼' });
    expect(button).toHaveStyle({ background: lightTheme.colors.primary.main });
  });

  it('secondary variant가 적용된다', () => {
    renderButton({ variant: 'secondary' });

    const button = screen.getByRole('button', { name: '버튼' });
    expect(button).toBeInTheDocument();
  });

  it('disabled 상태일 때 비활성화된다', () => {
    renderButton({ disabled: true });

    const button = screen.getByRole('button', { name: '버튼' });
    expect(button).toBeDisabled();
  });

  it('fullWidth가 true일 때 전체 너비를 가진다', () => {
    renderButton({ fullWidth: true });

    const button = screen.getByRole('button', { name: '버튼' });
    expect(button).toHaveStyle({ width: '100%' });
  });

  it('onClick 핸들러가 호출된다', () => {
    const handleClick = vi.fn();
    renderButton({ onClick: handleClick });

    const button = screen.getByRole('button', { name: '버튼' });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서는 onClick이 호출되지 않는다', () => {
    const handleClick = vi.fn();
    renderButton({ disabled: true, onClick: handleClick });

    const button = screen.getByRole('button', { name: '버튼' });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('children이 올바르게 렌더링된다', () => {
    renderButton({ children: '클릭하세요' });

    expect(screen.getByText('클릭하세요')).toBeInTheDocument();
  });
});
