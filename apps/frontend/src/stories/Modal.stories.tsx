import { css, useTheme } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useState } from 'react';

import { Button } from '@/comp/Button';
import { Modal } from '@/comp/Modal';
import type { Theme } from '@/styles/theme';

type ModalProps = ComponentProps<typeof Modal>;

const meta: Meta<ModalProps> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const [open, setOpen] = useState(true);

      return (
        <>
          <Button onClick={() => setOpen(true)}>Open Modal</Button>
          {open && (
            <Story
              args={{
                ...context.args,
                onClose: () => setOpen(false),
              }}
            />
          )}
        </>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<ModalProps>;

export const Default: Story = {
  args: {
    title: 'Default Modal',
    content: 'Content goes here.',
  },
  render: args => <Modal {...args} />,
};

export const Confirm: Story = {
  args: {
    title: 'Confirm Modal',
    content: (
      <>
        <div style={{ marginBottom: 24 }}>Are you sure you want to proceed?</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button variant="primary" style={{ flex: 1 }}>
            Confirm
          </Button>
        </div>
      </>
    ),
  },
  render: args => <Modal {...args} />,
};

const reportOptionsStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const reportOptionButtonStyle = (theme: Theme) => css`
  padding: 12px 16px;
  background: ${theme.colors.surface.default};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  color: ${theme.colors.text.default};
  cursor: pointer;
  text-align: left;
  transition: all 150ms ease;

  &:hover {
    background: ${theme.colors.surface.bold};
    border-color: ${theme.colors.primary.main};
  }
`;

const SelectContent = () => {
  const theme = useTheme();

  return (
    <div css={reportOptionsStyle}>
      <button css={reportOptionButtonStyle(theme)}>Option 1</button>
      <button css={reportOptionButtonStyle(theme)}>Option 2</button>
      <button css={reportOptionButtonStyle(theme)}>Option 3</button>
      <button css={reportOptionButtonStyle(theme)}>Option 4</button>
    </div>
  );
};

export const Select: Story = {
  args: {
    title: 'Select Modal',
    content: (
      <>
        <div style={{ marginBottom: 24 }}>Select from below:</div>
        <SelectContent />
      </>
    ),
  },
  render: args => <Modal {...args} />,
};
