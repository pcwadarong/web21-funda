import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { lightTheme } from '@/styles/theme';

import { EmailNotificationSection } from '../EmailNotificationSection';

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

describe('EmailNotificationSection', () => {
  it('토글이 활성화된 상태에서 클릭하면 onToggle이 호출된다', () => {
    const handleToggle = vi.fn();

    renderWithTheme(
      <EmailNotificationSection
        isEmailSubscribed
        email="user@example.com"
        isDisabled={false}
        onToggle={handleToggle}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('비활성화 상태에서는 onToggle이 호출되지 않는다', () => {
    const handleToggle = vi.fn();

    renderWithTheme(
      <EmailNotificationSection
        isEmailSubscribed
        email={null}
        isDisabled
        onToggle={handleToggle}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleToggle).not.toHaveBeenCalled();
  });
});
