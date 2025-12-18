import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { action } from 'storybook/actions';

import { Sidebar } from '@/components/Sidebar';

type SidebarProps = ComponentProps<typeof Sidebar>;
const navClickAction = action('Sidebar navigation click');

const meta: Meta<SidebarProps> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <MemoryRouter initialEntries={['/learn']}>
        <div
          style={{
            minHeight: '100vh',
            background: '#f7f7fc',
            padding: 24,
          }}
          onClickCapture={event => {
            const anchor = (event.target as HTMLElement).closest('a');
            if (anchor) {
              event.preventDefault();
              const label = anchor.textContent?.replace(/\s+/g, ' ').trim();
              const href = anchor.getAttribute('href') ?? '';
              navClickAction(label ?? 'Unknown page', href);
            }
          }}
        >
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<SidebarProps>;

export const Default: Story = {
  render: () => <Sidebar />,
};
