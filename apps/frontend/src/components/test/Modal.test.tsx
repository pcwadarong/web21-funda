import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Modal } from '@/comp/Modal';
import { lightTheme } from '@/styles/theme';

const renderModal = (props: Partial<React.ComponentProps<typeof Modal>> = {}) => {
  const defaultProps = {
    title: '테스트 모달',
    content: <div>모달 내용</div>,
    onClose: vi.fn(),
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <Modal {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('Modal 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderModal();

    expect(screen.getByText('테스트 모달')).toBeInTheDocument();
    expect(screen.getByText('모달 내용')).toBeInTheDocument();
  });

  it('제목이 올바르게 표시된다', () => {
    renderModal({ title: '새로운 제목' });

    expect(screen.getByText('새로운 제목')).toBeInTheDocument();
  });

  it('내용이 올바르게 표시된다', () => {
    renderModal({ content: <div>새로운 내용</div> });

    expect(screen.getByText('새로운 내용')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('오버레이 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    const overlay =
      screen.getByText('테스트 모달').closest('[class*="modalOverlayStyle"]') ||
      document.querySelector('[style*="position: fixed"]');

    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('모달 내용 클릭 시 onClose가 호출되지 않는다', () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    const modalContent = screen.getByText('모달 내용');
    fireEvent.click(modalContent);

    // stopPropagation이 작동하므로 onClose가 호출되지 않아야 함
    expect(onClose).not.toHaveBeenCalled();
  });

  it('복잡한 content가 올바르게 렌더링된다', () => {
    const complexContent = (
      <div>
        <h3>제목</h3>
        <p>설명</p>
        <button>버튼</button>
      </div>
    );
    renderModal({ content: complexContent });

    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('설명')).toBeInTheDocument();
    expect(screen.getByText('버튼')).toBeInTheDocument();
  });
});
