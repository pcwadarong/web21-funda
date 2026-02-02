import type { Meta, StoryObj } from '@storybook/react-vite';

import { UnsubscribeContainer } from '../UnsubscribeContainer';

const meta: Meta<typeof UnsubscribeContainer> = {
  title: 'Features/User/UnsubscribeContainer',
  component: UnsubscribeContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '이메일 수신 거부 컴포넌트입니다. 사용자가 리마인드 이메일 구독을 해제할 수 있습니다.',
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
    isLoading: false,
  },
};

export const NoEmail: Story = {
  args: {
    email: null,
    isLoading: false,
  },
};

export const LongEmail: Story = {
  args: {
    email: 'this.is.a.very.long.email.address.example@funda.com',
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    email: 'funda@example.com',
    isLoading: true,
  },
};
