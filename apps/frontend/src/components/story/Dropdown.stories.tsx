import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Dropdown, type DropdownOption } from '@/comp/Dropdown';
import SVGIcon from '@/comp/SVGIcon';
import { lightTheme } from '@/styles/theme';

const options: DropdownOption[] = [
  { value: 'frontend', label: '프론트엔드', icon: 'Frontend' },
  { value: 'backend', label: '백엔드', icon: 'Backend' },
  { value: 'mobile', label: '모바일', icon: 'Mobile' },
  { value: 'cs', label: 'CS 기초', icon: 'ComputerScience' },
];

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ padding: '40px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    options,
    placeholder: '분야 선택',
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<string | null>(null);
    return <Dropdown {...args} value={value} onChange={setValue} />;
  },
};

export const PlainTrigger: Story = {
  render: args => {
    const [value, setValue] = useState<string | null>('frontend');
    return (
      <Dropdown
        {...args}
        value={value}
        onChange={setValue}
        variant="plain"
        renderTrigger={selected => (
          <>
            <span>
              <SVGIcon icon={selected?.icon ?? 'Frontend'} size="sm" />
            </span>
            <span>{selected?.value?.toUpperCase() ?? 'FE'}</span>
          </>
        )}
        renderOption={option => (
          <>
            <span>
              <SVGIcon icon={option.icon ?? 'Frontend'} size="sm" />
            </span>
            <span>{option.label}</span>
          </>
        )}
      />
    );
  },
};
