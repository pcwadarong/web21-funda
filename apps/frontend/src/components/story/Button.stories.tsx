import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

import { Button } from '@/comp/Button';

type ButtonProps = ComponentProps<typeof Button> & {
  buttonText: string;
};

const meta: Meta<ButtonProps> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div
        style={{
          width: '200px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      options: ['primary', 'secondary', 'disabled'],
      control: { type: 'select' },
    },
    fullWidth: {
      options: [true, false],
      control: { type: 'boolean' },
    },
  },
  args: {
    buttonText: 'Button',
    fullWidth: true,
    onClick: () => {},
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
  render: ({ buttonText, ...args }) => <Button {...args}>{buttonText}</Button>,
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
  render: ({ buttonText, ...args }) => <Button {...args}>{buttonText}</Button>,
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
  },
  render: ({ buttonText, ...args }) => <Button {...args}>{buttonText}</Button>,
};
