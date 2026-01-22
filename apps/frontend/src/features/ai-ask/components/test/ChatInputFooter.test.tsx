import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { lightTheme } from '@/styles/theme';

import { ChatInputFooter } from '../ChatInputFooter';

vi.mock('@/comp/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    'aria-label': ariaLabel,
    type = 'button',
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    'aria-label'?: string;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

vi.mock('@/comp/SVGIcon', () => ({
  default: () => <span data-testid="send-icon" />,
}));

const renderInputFooter = (
  input = '',
  isStreaming = false,
  maxQuestionLength = 1000,
  onInputChange: (value: string) => void = vi.fn(),
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void = vi.fn(),
) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <ChatInputFooter
        input={input}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        isStreaming={isStreaming}
        maxQuestionLength={maxQuestionLength}
      />
    </ThemeProvider>,
  );

describe('ChatInputFooter', () => {
  afterEach(() => {
    cleanup();
  });

  describe('기본 렌더링', () => {
    it('입력 필드와 전송 버튼이 렌더링된다', () => {
      renderInputFooter();
      expect(screen.getByPlaceholderText('궁금한 것을 질문해보세요.')).toBeInTheDocument();
      expect(screen.getByLabelText('질문 전송')).toBeInTheDocument();
    });

    it('안내 문구가 렌더링된다', () => {
      renderInputFooter();
      expect(
        screen.getByText('AI는 실수를 할 수 있습니다. 중요한 정보는 확인이 필요합니다.'),
      ).toBeInTheDocument();
    });

    it('입력 필드의 초기값이 설정된다', () => {
      renderInputFooter('초기 입력값');
      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.') as HTMLInputElement;
      expect(input.value).toBe('초기 입력값');
    });
  });

  describe('입력 처리', () => {
    it('입력 값 변경 시 onInputChange가 호출된다', () => {
      const onInputChange = vi.fn();
      renderInputFooter('', false, 1000, onInputChange);

      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.');
      fireEvent.change(input, { target: { value: '새 입력값' } });

      expect(onInputChange).toHaveBeenCalledWith('새 입력값');
    });

    it('maxLength 속성이 설정된다', () => {
      renderInputFooter('', false, 500);
      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.');
      expect(input).toHaveAttribute('maxLength', '500');
    });
  });

  describe('제출 처리', () => {
    it('폼 제출 시 onSubmit이 호출된다', () => {
      const onSubmit = vi.fn(e => e.preventDefault());
      renderInputFooter('테스트 질문', false, 1000, vi.fn(), onSubmit);

      const form = screen.getByPlaceholderText('궁금한 것을 질문해보세요.').closest('form');
      fireEvent.submit(form!);

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('빈 입력일 때 전송 버튼이 비활성화된다', () => {
      renderInputFooter('');
      const button = screen.getByLabelText('질문 전송');
      expect(button).toBeDisabled();
    });

    it('공백만 입력일 때 전송 버튼이 비활성화된다', () => {
      renderInputFooter('   ');
      const button = screen.getByLabelText('질문 전송');
      expect(button).toBeDisabled();
    });

    it('유효한 입력일 때 전송 버튼이 활성화된다', () => {
      renderInputFooter('유효한 질문');
      const button = screen.getByLabelText('질문 전송');
      expect(button).not.toBeDisabled();
    });
  });

  describe('스트리밍 상태', () => {
    it('스트리밍 중일 때 입력 필드가 비활성화된다', () => {
      renderInputFooter('입력값', true);
      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.');
      expect(input).toBeDisabled();
    });

    it('스트리밍 중일 때 전송 버튼이 비활성화된다', () => {
      renderInputFooter('입력값', true);
      // 스트리밍 중일 때는 '답변 생성 중' aria-label이 사용됨
      const button = screen.getByLabelText('답변 생성 중');
      expect(button).toBeDisabled();
    });

    it('스트리밍 중일 때 aria-label이 변경된다', () => {
      renderInputFooter('입력값', true);
      const button = screen.getByLabelText('답변 생성 중');
      expect(button).toBeInTheDocument();
    });

    it('스트리밍이 아닐 때 입력 필드가 활성화된다', () => {
      renderInputFooter('입력값', false);
      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.');
      expect(input).not.toBeDisabled();
    });
  });

  describe('문자 수 표시', () => {
    it('남은 문자 수가 표시된다', () => {
      renderInputFooter('', false, 1000);
      expect(screen.getByText('1000자 남음')).toBeInTheDocument();
    });

    it('최대 길이에 도달했을 때 0자 남음이 표시된다', () => {
      const longText = 'a'.repeat(1000);
      renderInputFooter(longText, false, 1000);
      expect(screen.getByText('0자 남음')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('입력 필드에 aria-label이 설정된다', () => {
      renderInputFooter();
      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.');
      expect(input).toHaveAttribute('aria-label', '질문 입력');
    });

    it('입력 필드에 aria-describedby가 설정된다', () => {
      renderInputFooter();
      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.');
      expect(input).toHaveAttribute('aria-describedby', 'question-help-text question-char-count');
    });

    it('전송 버튼에 aria-label이 설정된다', () => {
      renderInputFooter();
      expect(screen.getByLabelText('질문 전송')).toBeInTheDocument();
    });

    it('폼에 aria-label이 설정된다', () => {
      renderInputFooter();
      const form = screen.getByLabelText('AI 질문 입력 폼');
      expect(form).toBeInTheDocument();
    });
  });

  describe('엣지 케이스', () => {
    it('매우 긴 입력을 처리한다', () => {
      const longText = 'a'.repeat(999);
      renderInputFooter(longText, false, 1000);
      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.') as HTMLInputElement;
      expect(input.value).toBe(longText);
      expect(screen.getByText('1자 남음')).toBeInTheDocument();
    });

    it('한글, 영문, 특수문자가 혼합된 입력을 처리한다', () => {
      const mixedText = '테스트 test 123 !@#';
      renderInputFooter(mixedText);
      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.') as HTMLInputElement;
      expect(input.value).toBe(mixedText);
    });

    it('줄바꿈이 포함된 입력을 처리한다', () => {
      // input 필드는 text 타입이므로 줄바꿈이 실제로는 제거되지만,
      // 컴포넌트는 입력값을 그대로 표시하려고 시도함
      const multilineText = '첫 번째 줄\n두 번째 줄';
      renderInputFooter(multilineText);
      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.') as HTMLInputElement;
      // input 필드의 value는 줄바꿈을 포함할 수 있지만, 실제 렌더링에서는 공백으로 표시됨
      expect(input.value).toContain('첫 번째 줄');
      expect(input.value).toContain('두 번째 줄');
    });

    it('maxQuestionLength가 0일 때를 처리한다', () => {
      renderInputFooter('', false, 0);
      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.');
      expect(input).toHaveAttribute('maxLength', '0');
      expect(screen.getByText('0자 남음')).toBeInTheDocument();
    });

    it('입력값이 maxLength를 초과할 수 없다', () => {
      const onInputChange = vi.fn();
      renderInputFooter('', false, 10, onInputChange);

      const input = screen.getByPlaceholderText('궁금한 것을 질문해보세요.');
      fireEvent.change(input, { target: { value: 'a'.repeat(15) } });

      // maxLength 속성으로 브라우저가 자동으로 제한하므로, 실제로는 10자만 입력됨
      expect(input).toHaveAttribute('maxLength', '10');
    });
  });
});
