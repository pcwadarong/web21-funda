import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { action } from 'storybook/actions';

import type { AiQuestionAnswer } from '@/services/aiAskService';
import { ModalProvider } from '@/store/modalStore';
import { ThemeStoreProvider } from '@/store/themeStore';
import { lightTheme } from '@/styles/theme';

import { ChatHistorySection } from '../ChatHistorySection';

const mockPendingItem: AiQuestionAnswer = {
  id: 1,
  quizId: 1,
  question: '이 문제의 핵심 개념을 설명해주세요.',
  answer: '',
  status: 'pending',
  createdAt: new Date().toISOString(),
  isMine: true,
};

const mockCompletedItem: AiQuestionAnswer = {
  id: 2,
  quizId: 1,
  question: '왜 이 답이 정답인가요?',
  answer:
    '이 문제는 **클로저(Closure)** 개념을 다루고 있습니다. 클로저는 외부 함수의 변수에 접근할 수 있는 내부 함수를 의미합니다.\n\n```javascript\nfunction outer() {\n  let x = 10;\n  function inner() {\n    console.log(x); // 외부 변수 접근\n  }\n  return inner;\n}\n```',
  status: 'completed',
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  isMine: true,
};

const mockFailedItem: AiQuestionAnswer = {
  id: 3,
  quizId: 1,
  question: '이 문제의 해설을 알려주세요.',
  answer: null,
  status: 'failed',
  createdAt: new Date(Date.now() - 7200000).toISOString(),
  isMine: false,
};

const mockLongAnswerItem: AiQuestionAnswer = {
  id: 4,
  quizId: 1,
  question: 'JavaScript의 비동기 처리에 대해 자세히 설명해주세요.',
  answer: `# JavaScript 비동기 처리

JavaScript는 **단일 스레드** 환경에서 동작하지만, 비동기 처리를 통해 논블로킹 작업을 수행할 수 있습니다.

## 주요 개념

### 1. 이벤트 루프 (Event Loop)
- 콜 스택, 힙, 큐로 구성
- 콜백 함수를 관리하고 실행 순서를 제어

### 2. Promise
\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('완료'), 1000);
});

promise.then(result => console.log(result));
\`\`\`

### 3. async/await
\`\`\`javascript
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}
\`\`\`

## 실행 순서
1. 동기 코드 실행
2. 마이크로태스크 큐 처리 (Promise)
3. 매크로태스크 큐 처리 (setTimeout)`,
  status: 'completed',
  createdAt: new Date(Date.now() - 10800000).toISOString(),
  isMine: true,
};

const mockStreamingItem: AiQuestionAnswer = {
  id: 5,
  quizId: 1,
  question: 'React의 렌더링 최적화 방법을 알려주세요.',
  answer: 'React에서 렌더링을 최적화하는 방법은 여러 가지가 있습니다. ',
  status: 'pending',
  createdAt: new Date().toISOString(),
  isMine: true,
};

const meta: Meta<typeof ChatHistorySection> = {
  title: 'Features/AIAsk/ChatHistorySection',
  component: ChatHistorySection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeStoreProvider>
        <ThemeProvider theme={lightTheme}>
          <ModalProvider>
            <div
              style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', minHeight: '400px' }}
            >
              <Story />
            </div>
          </ModalProvider>
        </ThemeProvider>
      </ThemeStoreProvider>
    ),
  ],
  // 공통 action 설정
  argTypes: {
    onToggle: { action: 'toggled' },
  },
};

export default meta;
type Story = StoryObj<typeof ChatHistorySection>;

// ✅ 상태 변화가 필요한 대화형 래퍼
const InteractiveWrapper = ({ items }: { items: AiQuestionAnswer[] }) => {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set([items[0]?.id]));

  const handleToggle = (id: number) => {
    // Action 패널에 로그 기록
    action('onToggle')(id);

    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return <ChatHistorySection items={items} expandedIds={expandedIds} onToggle={handleToggle} />;
};

export const Default: Story = {
  render: args => <InteractiveWrapper items={args.items || [mockCompletedItem]} />,
  args: {
    items: [mockCompletedItem],
  },
};

export const Empty: Story = {
  render: args => <InteractiveWrapper items={args.items || []} />,
  args: {
    items: [],
  },
};

export const Pending: Story = {
  render: args => <InteractiveWrapper items={args.items || [mockPendingItem]} />,
  args: {
    items: [mockPendingItem],
  },
};

export const Streaming: Story = {
  render: args => <InteractiveWrapper items={args.items || [mockStreamingItem]} />,
  args: {
    items: [mockStreamingItem],
  },
};

export const Failed: Story = {
  render: args => <InteractiveWrapper items={args.items || [mockFailedItem]} />,
  args: {
    items: [mockFailedItem],
  },
};

export const LongContent: Story = {
  render: args => <InteractiveWrapper items={args.items || [mockLongAnswerItem]} />,
  args: {
    items: [mockLongAnswerItem],
  },
};

export const MultipleItems: Story = {
  render: args => (
    <InteractiveWrapper
      items={
        args.items || [
          mockCompletedItem,
          mockPendingItem,
          mockFailedItem,
          mockLongAnswerItem,
          mockStreamingItem,
        ]
      }
    />
  ),
  args: {
    items: [
      mockCompletedItem,
      mockPendingItem,
      mockFailedItem,
      mockLongAnswerItem,
      mockStreamingItem,
    ],
  },
};

export const AllExpanded: Story = {
  render: args => {
    const [expandedIds] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));

    const handleToggle = (id: number) => {
      console.log('Toggle:', id);
    };

    return (
      <ChatHistorySection
        items={args.items || [mockCompletedItem, mockPendingItem, mockFailedItem]}
        expandedIds={expandedIds}
        onToggle={handleToggle}
      />
    );
  },
  args: {
    items: [mockCompletedItem, mockPendingItem, mockFailedItem],
  },
};

export const AllCollapsed: Story = {
  render: args => {
    const [expandedIds] = useState<Set<number>>(new Set());

    const handleToggle = (id: number) => {
      console.log('Toggle:', id);
    };

    return (
      <ChatHistorySection
        items={args.items || [mockCompletedItem, mockPendingItem, mockFailedItem]}
        expandedIds={expandedIds}
        onToggle={handleToggle}
      />
    );
  },
  args: {
    items: [mockCompletedItem, mockPendingItem, mockFailedItem],
  },
};

export const NotMine: Story = {
  render: args => (
    <InteractiveWrapper items={args.items || [{ ...mockCompletedItem, isMine: false }]} />
  ),
  args: {
    items: [{ ...mockCompletedItem, isMine: false }],
  },
};
