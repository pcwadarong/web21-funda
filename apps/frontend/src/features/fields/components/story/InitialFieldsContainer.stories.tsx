import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { InitialFieldsContainer } from '@/feat/fields/components/InitialFieldsContainer';
import type { Field } from '@/services/fieldService';
import { lightTheme } from '@/styles/theme';

const mockFields: Field[] = [
  {
    slug: 'frontend',
    name: '프론트엔드',
    description: '사용자 인터페이스와 웹 프론트엔드 개발',
    icon: 'Frontend',
  },
  {
    slug: 'backend',
    name: '백엔드',
    description: '서버와 데이터베이스, API 개발',
    icon: 'Backend',
  },
  {
    slug: 'mobile',
    name: '모바일',
    description: 'iOS와 Android 모바일 앱 개발',
    icon: 'Mobile',
  },
  {
    slug: 'cs',
    name: 'CS 기초',
    description: '컴퓨터 과학 기초 지식',
    icon: 'ComputerScience',
  },
  {
    slug: 'algorithm',
    name: '알고리즘',
    description: '문제 해결을 위한 알고리즘 학습',
    icon: 'Algorithm',
  },
  {
    slug: 'game',
    name: '게임 개발',
    description: '게임 엔진과 게임 로직 개발',
    icon: 'Game',
  },
  {
    slug: 'data',
    name: '데이터/AI 기초',
    description: '데이터 분석과 인공지능 기초',
    icon: 'Data',
  },
  {
    slug: 'devops',
    name: '데브옵스',
    description: 'CI/CD, 인프라 자동화 및 배포',
    icon: 'Cloud',
  },
];

const meta: Meta<typeof InitialFieldsContainer> = {
  title: 'Features/Fields/InitialFieldsContainer',
  component: InitialFieldsContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '비로그인 사용자가 퀴즈를 시작하기 전, 학습 분야를 최초 1회 선택하는 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <div style={{ backgroundColor: lightTheme.colors.surface.default, minHeight: '100vh' }}>
            <Story />
          </div>
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
  args: {
    fields: mockFields,
    selectedField: null,
    onFieldChange: () => {},
    onComplete: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof InitialFieldsContainer>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // '프론트엔드' 필드 찾기 및 클릭
    const frontendField = canvas.getByText('프론트엔드');
    await userEvent.click(frontendField);

    // 버튼 활성화 여부 확인
    const startButton = canvas.getByRole('button', { name: /선택 완료하고 시작하기/i });
    await expect(startButton).not.toBeDisabled();

    // 완료 버튼 클릭
    await userEvent.click(startButton);
  },
};

export const WithSelectedField: Story = {
  args: {
    selectedField: 'frontend',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 버튼이 활성화되어 있는지 확인
    const startButton = canvas.getByRole('button', { name: /선택 완료하고 시작하기/i });
    await expect(startButton).not.toBeDisabled();
  },
};
