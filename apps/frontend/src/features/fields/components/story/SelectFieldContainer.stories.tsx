import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { SelectFieldContainer } from '@/feat/fields/components/SelectFieldContainer';
import type { Field } from '@/services/fieldService';
import { lightTheme } from '@/styles/theme';

const mockFields: Field[] = [
  {
    slug: 'frontend',
    name: '프론트엔드',
    icon: 'Frontend',
    description: '웹 프론트엔드 개발을 배워보세요',
  },
  {
    slug: 'backend',
    name: '백엔드',
    icon: 'Backend',
    description: '서버 개발을 배워보세요',
  },
  {
    slug: 'mobile',
    name: '모바일',
    icon: 'Mobile',
    description: '모바일 앱 개발을 배워보세요',
  },
];

const meta: Meta<typeof SelectFieldContainer> = {
  title: 'Features/Fields/SelectFieldContainer',
  component: SelectFieldContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '학습 분야를 선택하는 컴포넌트입니다.',
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
    onFieldClick: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof SelectFieldContainer>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 필드 카드 클릭 테스트
    const frontendField = canvas.getByText('프론트엔드');
    await userEvent.click(frontendField);

    // 로드맵 보기 텍스트가 있는지 확인
    await expect(canvas.getByText(/로드맵 보기/i)).toBeInTheDocument();
  },
};

export const WithMultipleFields: Story = {
  args: {
    fields: mockFields,
  },
};
