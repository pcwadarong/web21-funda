import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ModalProvider } from '@/store/modalStore';
import { ThemeStoreProvider } from '@/store/themeStore';
import { lightTheme } from '@/styles/theme';

import { QuizInfoSection } from '../QuizInfoSection';
import type { QuizPreview } from '../types';

const mockMcqPreview: QuizPreview = {
  question: '다음 중 JavaScript의 `const` 키워드에 대한 설명으로 옳은 것은?',
  options: [
    { id: 'c1', text: '변수 재할당이 가능하다' },
    { id: 'c2', text: '변수 재선언이 가능하다' },
    { id: 'c3', text: '블록 스코프를 가진다' },
    { id: 'c4', text: '호이스팅이 발생하지 않는다' },
  ],
  matching: null,
  code: null,
  type: 'mcq',
};

const mockCodePreview: QuizPreview = {
  question: '다음 코드의 실행 결과는?',
  options: [
    { id: 'c1', text: 'undefined' },
    { id: 'c2', text: 'null' },
    { id: 'c3', text: '0' },
    { id: 'c4', text: '에러 발생' },
  ],
  matching: null,
  code: {
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
  type: 'code',
};

const mockOxPreview: QuizPreview = {
  question: 'React는 프레임워크이다.',
  options: [
    { id: 'o', text: 'O' },
    { id: 'x', text: 'X' },
  ],
  matching: null,
  code: null,
  type: 'ox',
};

const mockMatchingPreview: QuizPreview = {
  question: '다음 용어와 설명을 올바르게 연결하세요.',
  options: [],
  matching: {
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
  code: null,
  type: 'matching',
};

const meta: Meta<typeof QuizInfoSection> = {
  title: 'Features/AIAsk/QuizInfoSection',
  component: QuizInfoSection,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '퀴즈 문제 정보를 표시하는 섹션 컴포넌트입니다. 문제, 코드, 정답 정보를 퀴즈 타입에 맞게 렌더링합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeStoreProvider>
        <ThemeProvider theme={lightTheme}>
          <ModalProvider>
            <div
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px',
                background: 'linear-gradient(180deg, #faf5ff 0%, #eff6ff 50%, #eef2ff 100%)',
              }}
            >
              <Story />
            </div>
          </ModalProvider>
        </ThemeProvider>
      </ThemeStoreProvider>
    ),
  ],
  args: {
    preview: mockMcqPreview,
    correctAnswer: 'c3',
  },
};

export default meta;
type Story = StoryObj<typeof QuizInfoSection>;

export const Default: Story = {
  args: {
    preview: mockMcqPreview,
    correctAnswer: 'c3',
  },
};

export const McqWithCode: Story = {
  args: {
    preview: mockCodePreview,
    correctAnswer: 'c1',
  },
};

export const OxCorrect: Story = {
  args: {
    preview: mockOxPreview,
    correctAnswer: 'x',
  },
};

export const MatchingWithAnswer: Story = {
  args: {
    preview: mockMatchingPreview,
    correctAnswer: {
      pairs: [
        { left: 'l1', right: 'r1' },
        { left: 'l2', right: 'r3' },
        { left: 'l3', right: 'r2' },
      ],
    },
  },
};

export const MatchingWithoutAnswer: Story = {
  args: {
    preview: mockMatchingPreview,
    correctAnswer: null,
  },
};

export const WithCodeBlock: Story = {
  args: {
    preview: {
      ...mockCodePreview,
      code: {
        language: 'python',
        snippet: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`,
      },
    },
    correctAnswer: 'c2',
  },
};

export const LongQuestion: Story = {
  args: {
    preview: {
      ...mockMcqPreview,
      question:
        '다음 중 JavaScript의 `const` 키워드에 대한 설명으로 옳은 것은? `const`는 ES6에서 도입된 키워드로, 블록 스코프를 가지며 선언과 동시에 초기화해야 합니다. 또한 재할당이 불가능하지만 객체나 배열의 경우 내부 속성은 변경할 수 있습니다.',
    },
    correctAnswer: 'c3',
  },
};

export const WithCodeInQuestion: Story = {
  args: {
    preview: {
      ...mockMcqPreview,
      question: '다음 코드에서 `x`의 값은? `const x = 10;`',
    },
    correctAnswer: 'c1',
  },
};

export const WithBlankInQuestion: Story = {
  args: {
    preview: {
      ...mockMcqPreview,
      question: '다음 코드의 {{BLANK}} 부분에 들어갈 키워드는?',
    },
    correctAnswer: 'c3',
  },
};
