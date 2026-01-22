import type { Meta, StoryObj } from '@storybook/react-vite';

import { MarkdownRenderer } from '@/comp/MarkdownRenderer';

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'Components/MarkdownRenderer',
  component: MarkdownRenderer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '마크다운 텍스트를 렌더링하는 공통 컴포넌트입니다. 제목, 리스트, 테이블, 코드 블록 등을 지원합니다. `<br/>`로 줄바꿈이 가능합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: '렌더링할 마크다운 텍스트',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MarkdownRenderer>;

// 기본 예시 - 간단한 텍스트
export const Default: Story = {
  args: {
    text: `# 제목 1\n\n이것은 일반 텍스트입니다.\n\n## 제목 2\n\n**굵은 텍스트**와 *기울임 텍스트*를 사용할 수 있습니다.`,
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

// 리스트 예시
export const Lists: Story = {
  args: {
    text: `### 리스트 예시\n\n#### 순서 없는 리스트\n\n* 첫 번째 항목\n* 두 번째 항목\n* 세 번째 항목\n\n#### 순서 있는 리스트\n\n1. 첫 번째 항목\n2. 두 번째 항목\n3. 세 번째 항목`,
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

// 테이블 예시
export const Table: Story = {
  args: {
    text: `### 테이블 예시\n\n| 리그 티어 | 승급 조건 (상위 20%) | 강등 조건 (하위 20~30%) |\n| --- | --- | --- |\n| **BRONZE** | **100 XP** 이상 달성 | (강등 없음) |\n| **SILVER** | **150 XP** 이상 달성 | **80 XP** 미만 또는 하위권 |\n| **GOLD** | **300 XP** 이상 달성 | **90 XP** 미만 또는 하위권 |\n| **SAPPHIRE** | **450 XP** 이상 달성 | **100 XP** 미만 또는 하위권 |\n| **RUBY** | **550 XP** 이상 달성 | **110 XP** 미만 또는 하위권 |\n| **MASTER** | (최고 등급) | **300 XP** 미만 또는 하위권 |`,
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

// 코드 블록 예시
export const CodeBlocks: Story = {
  args: {
    text: `### 코드 블록 예시\n\n인라인 코드: \`const x = 10;\`\n\n\`\`\`javascript\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('World'));\n\`\`\``,
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

// 리더보드 정보 예시 (실제 사용 예시)
export const LeaderboardInfo: Story = {
  args: {
    text: `**알림:** 본 서비스의 정기 점검이 예정되어 있습니다. <br/> 점검 시간에는 서비스 이용이 일시적으로 제한되오니 양해 부탁드립니다.\n\n#### 📅 점검 안내\n\n* **일시:** 2024년 10월 30일(수) 오전 02:00 ~ 06:00\n* **내용:** 서버 안정화 및 신규 기능 업데이트\n\n점검 시간은 작업 상황에 따라 다소 연장될 수 있습니다.<br/> 더 나은 서비스를 위해 최선을 다하겠습니다.`,
  },
  decorators: [
    Story => (
      <div
        style={{
          maxWidth: '880px',
          margin: '0 auto',
          maxHeight: '70vh',
          overflow: 'auto',
          padding: '8px',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

// 긴 텍스트 예시
export const LongContent: Story = {
  args: {
    text: `# 긴 문서 예시\n\n이것은 긴 마크다운 문서의 예시입니다.\n\n## 섹션 1\n\n여기에 많은 내용이 들어갑니다. 여러 문단으로 구성되어 있고, 다양한 마크다운 요소를 포함합니다.\n\n### 하위 섹션 1.1\n\n* 항목 1\n* 항목 2\n* 항목 3\n\n### 하위 섹션 1.2\n\n1. 첫 번째\n2. 두 번째\n3. 세 번째\n\n## 섹션 2\n\n\`\`\`javascript\n// 코드 예시\nconst example = 'This is a code block';\nconsole.log(example);\n\`\`\`\n\n## 섹션 3\n\n| 컬럼 1 | 컬럼 2 | 컬럼 3 |\n| --- | --- | --- |\n| 데이터 1 | 데이터 2 | 데이터 3 |\n| 데이터 4 | 데이터 5 | 데이터 6 |`,
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '800px', margin: '0 auto', maxHeight: '500px', overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
};
