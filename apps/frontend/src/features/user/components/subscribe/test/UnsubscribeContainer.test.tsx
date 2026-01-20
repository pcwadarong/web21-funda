import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { lightTheme } from '@/styles/theme'; // 실제 테마 경로로 확인 필요

import { UnsubscribeContainer, type UnsubscribeContainerProps } from '../UnsubscribeContainer';

describe('UnsubscribeContainer', () => {
  const defaultProps = {
    email: 'test@example.com',
    onUnsubscribe: vi.fn(),
  };

  const renderWithTheme = (props: UnsubscribeContainerProps = defaultProps) =>
    render(
      <ThemeProvider theme={lightTheme}>
        <UnsubscribeContainer {...props} />
      </ThemeProvider>,
    );

  it('Props로 전달된 이메일을 화면에 표시해야 한다', () => {
    const email = 'chaewon@funda.com';
    renderWithTheme({ ...defaultProps, email });

    expect(screen.getByText(new RegExp(email))).toBeInTheDocument();
  });

  it('이메일이 null일 경우 기본 메시지를 표시해야 한다', () => {
    renderWithTheme({ ...defaultProps, email: null });

    expect(screen.getByText(/이메일 정보 없음/)).toBeInTheDocument();
  });

  it('버튼 클릭 시 onUnsubscribe 함수가 호출되어야 한다', () => {
    const onUnsubscribeMock = vi.fn();
    renderWithTheme({ ...defaultProps, onUnsubscribe: onUnsubscribeMock });

    const button = screen.getByRole('button', { name: /수신 거부 완료/ });
    fireEvent.click(button);

    expect(onUnsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
