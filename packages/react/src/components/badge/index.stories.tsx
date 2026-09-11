import { useState } from 'react';

import { BellIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { expect, userEvent } from 'storybook/test';

import { Avatar } from '../avatar';
import { Button } from '../button';
import { IconButton } from '../icon-button';

import { Badge } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const PLACEMENTS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const;

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { content: 3, colorScheme: 'danger', size: 'standard', placement: 'top-right' },
  argTypes: {
    colorScheme: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
    },
    placement: { control: 'radio', options: PLACEMENTS },
    shape: { control: 'radio', options: ['rectangular', 'circular'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    dot: { control: 'boolean' },
    showZero: { control: 'boolean' },
  },
  render: (args) => (
    <Badge {...args}>
      <BellIcon className="size-7" />
    </Badge>
  ),
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('3')).toBeInTheDocument();
  },
};

export const Placements: Story = {
  render: () => (
    <div className="flex gap-8 p-4">
      {PLACEMENTS.map((placement) => (
        <Badge key={placement} content={9} placement={placement}>
          <div className="size-12 rounded-lg bg-(--ids-color-muted)" />
        </Badge>
      ))}
    </div>
  ),
};

export const CircularShape: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-2">
      <Badge content={3} shape="circular">
        <Avatar name="Alice Kim" />
      </Badge>
      <Badge dot colorScheme="success" shape="circular" placement="bottom-right">
        <Avatar name="Bob Lee" />
      </Badge>
    </div>
  ),
};

export const Dot: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-2">
      <Badge dot>
        <BellIcon className="size-7" />
      </Badge>
      <Badge dot colorScheme="success" aria-label="온라인">
        <Avatar name="Alice Kim" size="tiny" />
      </Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status', { name: '온라인' })).toBeInTheDocument();
  },
};

export const MaxCaps: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-2">
      <Badge content={99}>
        <BellIcon className="size-7" />
      </Badge>
      <Badge content={100}>
        <BellIcon className="size-7" />
      </Badge>
      <Badge content={1200} max={999}>
        <BellIcon className="size-7" />
      </Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('99')).toBeInTheDocument();
    await expect(canvas.getByText('99+')).toBeInTheDocument();
    await expect(canvas.getByText('999+')).toBeInTheDocument();
  },
};

export const HidesZero: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-2">
      <Badge content={0}>
        <BellIcon className="size-7" />
      </Badge>
      <Badge content={0} showZero>
        <BellIcon className="size-7" />
      </Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText('0')).toHaveLength(1);
  },
};

export const ColorSchemes: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-2">
      {(['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const).map((scheme) => (
        <Badge key={scheme} content={5} colorScheme={scheme}>
          <div className="size-8 rounded-lg bg-(--ids-color-muted)" />
        </Badge>
      ))}
    </div>
  ),
};

export const OnControls: Story = {
  render: function OnControls() {
    const [unread, setUnread] = useState(3);

    return (
      <div className="flex items-center gap-6 p-2">
        <Badge content={unread} size="tiny">
          <IconButton aria-label="알림" variant="soft" icon={<BellIcon />} />
        </Badge>
        <Badge content={unread}>
          <Button variant="outline">
            <EnvelopeIcon className="size-5" />
            받은 편지함
          </Button>
        </Badge>
        <Button size="tiny" onClick={() => setUnread(0)}>
          모두 읽음
        </Button>
      </div>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText('3')).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: '모두 읽음' }));
    await expect(canvas.queryByText('3')).not.toBeInTheDocument();
  },
};
