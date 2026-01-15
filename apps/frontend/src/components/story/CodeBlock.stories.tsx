import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeBlock } from '@/comp/CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'text',
      description: '표시될 프로그래밍 언어 이름',
    },
    children: {
      control: 'text',
      description: '코드 내용 ({{BLANK}}를 포함할 수 있음)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

// 1. 기본 자바스크립트 코드 예시
export const Default: Story = {
  args: {
    language: 'JavaScript',
    children: `const greeting = "Hello World";\nconsole.log(greeting);`,
  },
};

// 2. {{BLANK}}가 포함된 퀴즈 형식 예시
export const QuizMode: Story = {
  args: {
    language: 'TypeScript',
    children: `interface User {\n  id: number;\n  name: string;\n}\n\nconst doubled = arr.{{BLANK}}(x => x * 2);`,
  },
};

// 3. 긴 코드와 줄바꿈 테스트
export const LongCode: Story = {
  args: {
    language: 'Python',
    children: `def calculate_sum(a, b):\n  # This is a comment\n  result = a + b\n  return result\n\nprint(calculate_sum(10, 20))`,
  },
  decorators: [
    Story => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
};
