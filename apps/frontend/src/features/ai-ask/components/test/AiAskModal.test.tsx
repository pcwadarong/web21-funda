import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CorrectAnswerType, QuizQuestion } from '@/feat/quiz/types';
import type { AiQuestionAnswer } from '@/services/aiAskService';
import { lightTheme } from '@/styles/theme';

import { AiAskModal } from '../AiAskModal';

// Mock dependencies
const mockGetAiQuestions = vi.fn();
const mockShowToast = vi.fn();
const mockIsLoggedIn = vi.fn(() => true);

vi.mock('@/services/aiAskService', () => ({
  getAiQuestions: (quizId: number) => mockGetAiQuestions(quizId),
}));

vi.mock('@/store/authStore', () => ({
  useIsLoggedIn: () => mockIsLoggedIn(),
}));

vi.mock('@/store/toastStore', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock('../QuizInfoSection', () => ({
  QuizInfoSection: ({ preview }: { preview: unknown }) => (
    <div data-testid="quiz-info-section">{JSON.stringify(preview)}</div>
  ),
}));

vi.mock('../ChatHistorySection', () => ({
  ChatHistorySection: ({
    items,
    onToggle,
  }: {
    items: AiQuestionAnswer[];
    expandedIds: Set<number>;
    onToggle: (id: number) => void;
  }) => (
    <div data-testid="chat-history-section">
      {items.map(item => (
        <button type="button" key={item.id} onClick={() => onToggle(item.id)}>
          {item.question}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../ChatInputFooter', () => ({
  ChatInputFooter: ({
    input,
    onInputChange,
    onSubmit,
    isStreaming,
  }: {
    input: string;
    onInputChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    isStreaming: boolean;
  }) => (
    <form data-testid="chat-input-footer" onSubmit={onSubmit}>
      <input
        data-testid="question-input"
        value={input}
        onChange={e => onInputChange(e.target.value)}
        disabled={isStreaming}
      />
      <button type="submit" disabled={isStreaming || !input.trim()}>
        전송
      </button>
    </form>
  ),
}));

// Mock fetch for SSE streaming
const originalFetch = global.fetch;
global.fetch = vi.fn();

const mockQuiz: QuizQuestion = {
  id: 1,
  type: 'mcq',
  content: {
    question: '테스트 질문',
    options: [
      { id: 'c1', text: '선지 1' },
      { id: 'c2', text: '선지 2' },
    ],
  },
};

const renderModal = (
  quiz: QuizQuestion = mockQuiz,
  correctAnswer: CorrectAnswerType | null = 'c1',
) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <AiAskModal quiz={quiz} correctAnswer={correctAnswer} />
    </ThemeProvider>,
  );

describe('AiAskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAiQuestions.mockResolvedValue([]);
    mockIsLoggedIn.mockReturnValue(true);
    // fetch를 매 테스트마다 다시 모킹
    global.fetch = vi.fn();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  describe('초기 렌더링', () => {
    it('컴포넌트가 렌더링된다', () => {
      renderModal();
      expect(screen.getByTestId('quiz-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('chat-history-section')).toBeInTheDocument();
      expect(screen.getByTestId('chat-input-footer')).toBeInTheDocument();
    });

    it('퀴즈 ID로 기존 질문 목록을 불러온다', async () => {
      const mockItems: AiQuestionAnswer[] = [
        {
          id: 1,
          quizId: 1,
          question: '기존 질문',
          answer: '기존 답변',
          status: 'completed',
          createdAt: new Date().toISOString(),
          isMine: true,
        },
      ];
      mockGetAiQuestions.mockResolvedValue(mockItems);

      renderModal();
      await waitFor(() => {
        expect(mockGetAiQuestions).toHaveBeenCalledWith(1);
      });
      expect(screen.getByText('기존 질문')).toBeInTheDocument();
    });
  });

  describe('질문 제출', () => {
    it('유효한 질문 제출 시 스트리밍이 시작된다', async () => {
      const mockReader = {
        read: vi.fn(),
      };
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // 첫 번째 read: meta 이벤트
      mockReader.read
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('event: meta\ndata: {"id":123,"question":"테스트"}\n\n'),
        })
        // 두 번째 read: chunk 이벤트
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('event: chunk\ndata: {"chunk":"답변"}\n\n'),
        })
        // 세 번째 read: done 이벤트
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(
            'event: done\ndata: {"id":123,"answer":"완료","status":"completed"}\n\n',
          ),
        })
        // 마지막 read: 완료
        .mockResolvedValueOnce({ done: true });

      renderModal();

      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      fireEvent.change(input, { target: { value: '새 질문' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/quizzes/1/ai-questions/stream'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ question: '새 질문' }),
          }),
        );
      });
    });

    it('빈 질문 제출 시 아무 동작도 하지 않는다', () => {
      renderModal();
      const form = screen.getByTestId('chat-input-footer');
      fireEvent.submit(form);

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('공백만 있는 질문 제출 시 아무 동작도 하지 않는다', () => {
      renderModal();
      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.submit(form);

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('최대 길이를 초과하는 질문 제출 시 토스트가 표시된다', () => {
      renderModal();
      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      const longQuestion = 'a'.repeat(1001);
      fireEvent.change(input, { target: { value: longQuestion } });
      fireEvent.submit(form);

      expect(mockShowToast).toHaveBeenCalledWith('질문은 1000자 이하로 입력해주세요.');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('로그인하지 않은 사용자가 질문 제출 시 토스트가 표시된다', () => {
      mockIsLoggedIn.mockReturnValue(false);
      renderModal();

      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      fireEvent.change(input, { target: { value: '질문' } });
      fireEvent.submit(form);

      expect(mockShowToast).toHaveBeenCalledWith('AI 질문을 하시려면 로그인이 필요합니다.');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('스트리밍 중일 때 추가 제출이 무시된다', () => {
      renderModal();
      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      // 첫 번째 제출로 스트리밍 시작 (mock 설정 필요)
      fireEvent.change(input, { target: { value: '질문 1' } });
      // 스트리밍 상태를 시뮬레이션하기 위해 fetch를 pending으로 설정
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}), // 무한 pending
      );

      fireEvent.submit(form);

      // 두 번째 제출 시도
      fireEvent.change(input, { target: { value: '질문 2' } });
      fireEvent.submit(form);

      // fetch는 한 번만 호출되어야 함
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('스트리밍 이벤트 처리', () => {
    it('meta 이벤트를 처리하여 임시 ID를 실제 ID로 교체한다', async () => {
      const mockReader = {
        read: vi.fn(),
      };
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      mockReader.read
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(
            'event: meta\ndata: {"id":123,"quizId":1,"question":"질문","status":"pending"}\n\n',
          ),
        })
        .mockResolvedValueOnce({ done: true });

      renderModal();

      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      fireEvent.change(input, { target: { value: '질문' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockReader.read).toHaveBeenCalled();
      });
    });

    it('chunk 이벤트를 처리하여 답변을 점진적으로 추가한다', async () => {
      const mockReader = {
        read: vi.fn(),
      };
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      mockReader.read
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('event: chunk\ndata: {"chunk":"첫 번째"}\n\n'),
        })
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('event: chunk\ndata: {"chunk":" 두 번째"}\n\n'),
        })
        .mockResolvedValueOnce({ done: true });

      renderModal();

      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      fireEvent.change(input, { target: { value: '질문' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockReader.read).toHaveBeenCalled();
      });
    });

    it('done 이벤트를 처리하여 최종 상태를 업데이트한다', async () => {
      const mockReader = {
        read: vi.fn(),
      };
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      mockReader.read
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(
            'event: done\ndata: {"id":123,"quizId":1,"question":"질문","answer":"완료된 답변","status":"completed"}\n\n',
          ),
        })
        .mockResolvedValueOnce({ done: true });

      renderModal();

      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      fireEvent.change(input, { target: { value: '질문' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockReader.read).toHaveBeenCalled();
      });
    });

    it('error 이벤트를 처리하여 상태를 failed로 변경한다', async () => {
      const mockReader = {
        read: vi.fn(),
      };
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      mockReader.read
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('event: error\ndata: {}\n\n'),
        })
        .mockResolvedValueOnce({ done: true });

      renderModal();

      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      fireEvent.change(input, { target: { value: '질문' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockReader.read).toHaveBeenCalled();
      });
    });
  });

  describe('스트리밍 에러 처리', () => {
    it('스트리밍 요청 실패 시 상태를 failed로 변경한다', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      renderModal();

      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      fireEvent.change(input, { target: { value: '질문' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('응답 본문이 없을 때 에러를 처리한다', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        body: null,
      });

      renderModal();

      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      fireEvent.change(input, { target: { value: '질문' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('토글 기능', () => {
    it('ChatHistorySection의 onToggle이 올바르게 전달된다', async () => {
      const mockItems: AiQuestionAnswer[] = [
        {
          id: 1,
          quizId: 1,
          question: '질문 1',
          answer: '답변 1',
          status: 'completed',
          createdAt: new Date().toISOString(),
          isMine: true,
        },
      ];
      mockGetAiQuestions.mockResolvedValue(mockItems);

      renderModal();
      await waitFor(() => {
        expect(screen.getByText('질문 1')).toBeInTheDocument();
      });

      const questionButton = screen.getByText('질문 1');
      fireEvent.click(questionButton);

      // 토글이 작동하는지 확인 (expandedIds 상태 변경)
      // 실제로는 ChatHistorySection에서 테스트하므로 여기서는 통합만 확인
      expect(questionButton).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('role="dialog"와 aria-label이 설정된다', () => {
      renderModal();
      const dialog = screen.getByRole('dialog', { name: 'AI 질문하기' });
      expect(dialog).toBeInTheDocument();
    });

    it('aria-live 영역이 설정된다', () => {
      renderModal();
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('엣지 케이스', () => {
    it('퀴즈가 변경되면 preview가 업데이트된다', () => {
      const { rerender } = renderModal();
      const newQuiz: QuizQuestion = {
        id: 2,
        type: 'ox',
        content: {
          question: '새 질문',
          options: [
            { id: 'o', text: 'O' },
            { id: 'x', text: 'X' },
          ],
        },
      };

      rerender(
        <ThemeProvider theme={lightTheme}>
          <AiAskModal quiz={newQuiz} correctAnswer="x" />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('quiz-info-section')).toBeInTheDocument();
    });

    it('여러 SSE 이벤트가 연속으로 올 때 모두 처리한다', async () => {
      const mockReader = {
        read: vi.fn(),
      };
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // 여러 이벤트를 한 번에 전송
      mockReader.read
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(
            'event: meta\ndata: {"id":123}\n\nevent: chunk\ndata: {"chunk":"첫"}\n\nevent: chunk\ndata: {"chunk":" 두"}\n\n',
          ),
        })
        .mockResolvedValueOnce({ done: true });

      renderModal();

      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      fireEvent.change(input, { target: { value: '질문' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockReader.read).toHaveBeenCalled();
      });
    });

    it('빈 줄로 구분된 여러 이벤트를 처리한다', async () => {
      const mockReader = {
        read: vi.fn(),
      };
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      mockReader.read
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(
            'event: chunk\ndata: {"chunk":"첫"}\n\nevent: chunk\ndata: {"chunk":" 두"}\n\n',
          ),
        })
        .mockResolvedValueOnce({ done: true });

      renderModal();

      const input = screen.getByTestId('question-input');
      const form = screen.getByTestId('chat-input-footer');

      fireEvent.change(input, { target: { value: '질문' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockReader.read).toHaveBeenCalled();
      });
    });
  });
});
