import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dropdown, type DropdownOption } from '@/comp/Dropdown';
import { lightTheme } from '@/styles/theme';

const options: DropdownOption[] = [
  { value: 'frontend', label: '프론트엔드' },
  { value: 'backend', label: '백엔드' },
];

const renderDropdown = (props: Partial<React.ComponentProps<typeof Dropdown>> = {}) => {
  const defaultProps = {
    options,
    onChange: () => {},
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <Dropdown {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('Dropdown 컴포넌트 테스트', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderDropdown({ placeholder: '분야 선택' });

    expect(screen.getByRole('button', { name: /분야 선택/ })).toBeInTheDocument();
  });

  it('클릭하면 옵션 목록이 표시된다', () => {
    renderDropdown();

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '프론트엔드' })).toBeInTheDocument();
  });

  it('옵션을 선택하면 onChange가 호출되고 목록이 닫힌다', () => {
    const handleChange = vi.fn();
    renderDropdown({ onChange: handleChange });

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: '프론트엔드' }));

    expect(handleChange).toHaveBeenCalledWith('frontend');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('외부를 클릭하면 목록이 닫힌다', () => {
    renderDropdown();

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('disabled 상태에서는 열리지 않는다', () => {
    renderDropdown({ disabled: true });

    fireEvent.click(screen.getByRole('button'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
