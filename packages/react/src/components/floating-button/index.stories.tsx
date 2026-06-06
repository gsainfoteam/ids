import { Car03Icon } from 'hugeicons-react';

import { FloatingButton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof FloatingButton> = {
  title: 'Components/FloatingButton',
  component: FloatingButton,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof FloatingButton>;

export const Basic: Story = {
  render: () => (
    <div className="relative h-80 bg-(--ids-color-muted)">
      <FloatingButton aria-label="새 팟 만들기">
        <Car03Icon size={28} />
      </FloatingButton>
    </div>
  ),
};

export const Extended: Story = {
  render: () => (
    <div className="relative h-80 bg-(--ids-color-muted)">
      <FloatingButton aria-label="새 팟 만들기">
        <Car03Icon size={24} />
        <span>새 팟</span>
      </FloatingButton>
    </div>
  ),
};
