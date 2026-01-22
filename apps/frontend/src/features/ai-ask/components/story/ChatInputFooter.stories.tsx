import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ModalProvider } from '@/store/modalStore';
import { ThemeStoreProvider } from '@/store/themeStore';
import { lightTheme } from '@/styles/theme';

import { ChatInputFooter } from '../ChatInputFooter';

const meta: Meta<typeof ChatInputFooter> = {
  title: 'Features/AIAsk/ChatInputFooter',
  component: ChatInputFooter,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'AI 질문 입력 폼과 안내 문구를 포함하는 푸터 컴포넌트입니다. 질문 입력, 전송, 스트리밍 상태를 처리합니다.',
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
                maxWidth: '800px',
                margin: '0 auto',
                padding: '20px',
                background: 'linear-gradient(180deg, #faf5ff 0%, #eff6ff 50%, #eef2ff 100%)',
                position: 'relative',
                minHeight: '200px',
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
    input: '',
    isStreaming: false,
    maxQuestionLength: 1000,
  },
};

export default meta;
type Story = StoryObj<typeof ChatInputFooter>;

// Interactive wrapper to handle state
const InteractiveWrapper = (args: {
  input: string;
  isStreaming: boolean;
  maxQuestionLength: number;
}) => {
  const [input, setInput] = useState(args.input || '');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Submit:', input);
  };

  return (
    <ChatInputFooter
      input={input}
      onInputChange={setInput}
      onSubmit={handleSubmit}
      isStreaming={args.isStreaming}
      maxQuestionLength={args.maxQuestionLength}
    />
  );
};

export const Default: Story = {
  render: args => <InteractiveWrapper {...args} />,
  args: {
    input: '',
    isStreaming: false,
    maxQuestionLength: 1000,
  },
};

export const WithInput: Story = {
  render: args => <InteractiveWrapper {...args} />,
  args: {
    input: '이 문제의 핵심 개념을 설명해주세요.',
    isStreaming: false,
    maxQuestionLength: 1000,
  },
};

export const Streaming: Story = {
  render: args => <InteractiveWrapper {...args} />,
  args: {
    input: '이 문제의 핵심 개념을 설명해주세요.',
    isStreaming: true,
    maxQuestionLength: 1000,
  },
};

export const LongInput: Story = {
  render: args => <InteractiveWrapper {...args} />,
  args: {
    input:
      '이 문제의 핵심 개념을 설명해주세요. 특히 클로저와 스코프의 관계, 그리고 호이스팅이 어떻게 작동하는지 자세히 알려주세요. 또한 이 문제에서 사용된 패턴이 실제 프로젝트에서 어떻게 활용될 수 있는지 예시를 들어주세요.',
    isStreaming: false,
    maxQuestionLength: 1000,
  },
};

export const NearMaxLength: Story = {
  render: args => {
    const longText = 'a'.repeat(950);
    return <InteractiveWrapper {...args} input={longText} />;
  },
  args: {
    input: '',
    isStreaming: false,
    maxQuestionLength: 1000,
  },
};

export const AtMaxLength: Story = {
  render: args => {
    const longText = 'a'.repeat(1000);
    return <InteractiveWrapper {...args} input={longText} />;
  },
  args: {
    input: '',
    isStreaming: false,
    maxQuestionLength: 1000,
  },
};

export const EmptyInput: Story = {
  render: args => <InteractiveWrapper {...args} />,
  args: {
    input: '',
    isStreaming: false,
    maxQuestionLength: 1000,
  },
};

export const WithCodeInInput: Story = {
  render: args => <InteractiveWrapper {...args} />,
  args: {
    input: '이 코드에서 `const x = 10;`의 의미는 무엇인가요?',
    isStreaming: false,
    maxQuestionLength: 1000,
  },
};

export const WithBlankInInput: Story = {
  render: args => <InteractiveWrapper {...args} />,
  args: {
    input: '다음 코드의 {{BLANK}} 부분에 들어갈 키워드는?',
    isStreaming: false,
    maxQuestionLength: 1000,
  },
};

export const StreamingWithInput: Story = {
  render: args => <InteractiveWrapper {...args} />,
  args: {
    input: '이 문제의 해설을 알려주세요.',
    isStreaming: true,
    maxQuestionLength: 1000,
  },
};
