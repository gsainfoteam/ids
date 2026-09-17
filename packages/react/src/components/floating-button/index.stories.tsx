import { PlusIcon } from '@heroicons/react/24/outline';
import { expect, fn } from 'storybook/test';

import { FloatingButton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Components/FloatingButton',
  component: FloatingButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="relative h-72 w-full transform-[translateZ(0)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FloatingButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Action: Story = {
  args: { 'aria-label': '추가', children: <PlusIcon />, onClick: fn() },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '추가' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
export const Extended: Story = {
  args: {
    variant: 'surface',
    children: (
      <>
        <PlusIcon />새 글 작성
      </>
    ),
  },
};
export const DisabledLink: Story = {
  render: () => (
    <FloatingButton asChild disabled>
      <a href="#compose">
        <PlusIcon />새 글 작성
      </a>
    </FloatingButton>
  ),
  play: async ({ canvas }) => {
    const action = canvas.getByRole('link', { name: '새 글 작성' });
    await expect(action).not.toHaveAttribute('href');
    await expect(action).toHaveAttribute('aria-disabled', 'true');
  },
};
