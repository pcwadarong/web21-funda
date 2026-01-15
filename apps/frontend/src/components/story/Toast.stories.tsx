import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

import { Toast } from '@/comp/Toast';

type ToastProps = ComponentProps<typeof Toast>;

const meta: Meta<ToastProps> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div
        style={{
          minHeight: '100vh',
          padding: '24px',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    message: {
      control: { type: 'text' },
    },
    isOpen: {
      control: { type: 'boolean' },
    },
  },
  args: {
    message: '저장되었습니다.',
    isOpen: true,
  },
};

export default meta;
type Story = StoryObj<ToastProps>;

export const Default: Story = {
  args: {
    isOpen: true,
  },
};

export const LongMessage: Story = {
  args: {
    message: '입력한 내용이 저장되었습니다. 계속 진행해 주세요.',
    isOpen: true,
  },
};

export const Hidden: Story = {
  args: {
    isOpen: false,
  },
};
