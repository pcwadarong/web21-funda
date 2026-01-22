import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import type { QuizQuestion } from '@/feat/quiz/types';
import { ModalProvider } from '@/store/modalStore';
import { ThemeStoreProvider } from '@/store/themeStore';
import { ToastProvider } from '@/store/toastStore';
import { lightTheme } from '@/styles/theme';

import { AiAskModal } from '../AiAskModal';

const mockMcqQuiz: QuizQuestion = {
  id: 1,
  type: 'mcq',
  content: {
    question: '다음 중 JavaScript의 `const` 키워드에 대한 설명으로 옳은 것은?',
    options: [
      { id: 'c1', text: '변수 재할당이 가능하다' },
      { id: 'c2', text: '변수 재선언이 가능하다' },
      { id: 'c3', text: '블록 스코프를 가진다' },
      { id: 'c4', text: '호이스팅이 발생하지 않는다' },
    ],
  },
};

const mockCodeQuiz: QuizQuestion = {
  id: 2,
  type: 'code',
  content: {
    question: '다음 코드의 실행 결과는?',
    options: [
      { id: 'c1', text: 'undefined' },
      { id: 'c2', text: 'null' },
      { id: 'c3', text: '0' },
      { id: 'c4', text: '에러 발생' },
    ],
    code_metadata: {
      language: 'javascript',
      snippet: `function test() {
  let x = 10;
  if (true) {
    let x = 20;
  }
  return x;
}
console.log(test());`,
    },
  },
};

const mockOxQuiz: QuizQuestion = {
  id: 3,
  type: 'ox',
  content: {
    question: 'React는 프레임워크이다.',
    options: [
      { id: 'o', text: 'O' },
      { id: 'x', text: 'X' },
    ],
  },
};

const mockMatchingQuiz: QuizQuestion = {
  id: 4,
  type: 'matching',
  content: {
    question: '다음 용어와 설명을 올바르게 연결하세요.',
    matching_metadata: {
      left: [
        { id: 'l1', text: '클로저' },
        { id: 'l2', text: '프로토타입' },
        { id: 'l3', text: '이벤트 루프' },
      ],
      right: [
        { id: 'r1', text: '외부 변수에 접근할 수 있는 함수' },
        { id: 'r2', text: '비동기 작업을 처리하는 메커니즘' },
        { id: 'r3', text: '객체 간 상속을 구현하는 방법' },
      ],
    },
  },
};

const meta: Meta<typeof AiAskModal> = {
  title: 'Features/AIAsk/AiAskModal',
  component: AiAskModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'AI에게 질문하고 답변을 받는 모달 컴포넌트입니다. 퀴즈 문제 정보, 질문/답변 히스토리, 질문 입력을 모두 포함합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeStoreProvider>
        <ThemeProvider theme={lightTheme}>
          <ToastProvider>
            <ModalProvider>
              <div
                style={{
                  height: '100vh',
                  background: 'linear-gradient(180deg, #faf5ff 0%, #eff6ff 50%, #eef2ff 100%)',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    maxWidth: '880px',
                    margin: '0 auto',
                    background: lightTheme.colors.surface.strong,
                    borderRadius: '12px',
                    padding: '24px',
                    height: 'calc(100vh - 40px)',
                  }}
                >
                  <Story />
                </div>
              </div>
            </ModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </ThemeStoreProvider>
    ),
  ],
  args: {
    quiz: mockMcqQuiz,
    correctAnswer: 'c3',
  },
};

export default meta;
type Story = StoryObj<typeof AiAskModal>;

export const Default: Story = {
  args: {
    quiz: mockMcqQuiz,
    correctAnswer: 'c3',
  },
};

export const WithCode: Story = {
  args: {
    quiz: mockCodeQuiz,
    correctAnswer: 'c1',
  },
};

export const OxQuiz: Story = {
  args: {
    quiz: mockOxQuiz,
    correctAnswer: 'x',
  },
};

export const MatchingQuiz: Story = {
  args: {
    quiz: mockMatchingQuiz,
    correctAnswer: {
      pairs: [
        { left: 'l1', right: 'r1' },
        { left: 'l2', right: 'r3' },
        { left: 'l3', right: 'r2' },
      ],
    },
  },
};

export const WithoutCorrectAnswer: Story = {
  args: {
    quiz: mockMcqQuiz,
    correctAnswer: null,
  },
};

export const LongQuestion: Story = {
  args: {
    quiz: {
      ...mockMcqQuiz,
      content: {
        ...mockMcqQuiz.content,
        question:
          '다음 중 JavaScript의 `const` 키워드에 대한 설명으로 옳은 것은? `const`는 ES6에서 도입된 키워드로, 블록 스코프를 가지며 선언과 동시에 초기화해야 합니다. 또한 재할당이 불가능하지만 객체나 배열의 경우 내부 속성은 변경할 수 있습니다. 이러한 특성 때문에 함수형 프로그래밍과 불변성 관점에서 중요한 역할을 합니다.',
      },
    },
    correctAnswer: 'c3',
  },
};
