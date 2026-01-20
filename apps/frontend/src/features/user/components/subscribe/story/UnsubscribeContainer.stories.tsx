import type { Meta, StoryObj } from '@storybook/react-vite';

import { UnsubscribeContainer } from '../UnsubscribeContainer';

const meta: Meta<typeof UnsubscribeContainer> = {
  title: 'Features/User/UnsubscribeContainer',
  component: UnsubscribeContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '설정 컴포넌트입니다. 로그아웃, 다크 모드, 사운드 볼륨 조절을 제공합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onUnsubscribe: { action: 'unsubscribed' },
  },
};

export default meta;
type Story = StoryObj<typeof UnsubscribeContainer>;

export const Default: Story = {
  args: {
    email: 'funda@example.com',
  },
};

export const NoEmail: Story = {
  args: {
    email: null,
  },
};

export const LongEmail: Story = {
  args: {
    email: 'this.is.a.very.long.email.address.example@funda.com',
  },
};
