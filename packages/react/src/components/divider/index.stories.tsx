import { expect } from 'storybook/test';

import { Divider } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  tags: ['autodocs'],
  args: { orientation: 'horizontal', decorative: false },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    decorative: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="flex h-24 w-72 items-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Playground: Story = {
  play: async ({ canvas, args }) => {
    if (args.decorative) {
      await expect(canvas.queryByRole('separator')).not.toBeInTheDocument();
    } else {
      const divider = canvas.getByRole('separator');
      await expect(divider).toHaveAttribute('aria-orientation', args.orientation);
      await expect(divider).not.toHaveAttribute('tabindex');
      const { width, height } = divider.getBoundingClientRect();
      await expect(args.orientation === 'vertical' ? height : width).toBeGreaterThan(1);
    }
  },
};

export const Vertical: Story = {
  ...Playground,
  args: { orientation: 'vertical' },
};

export const Decorative: Story = {
  args: { decorative: true },
  play: async ({ canvasElement, canvas }) => {
    await expect(canvas.queryByRole('separator')).not.toBeInTheDocument();
    await expect(canvasElement.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  },
};

export const BetweenActions: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-4">
      <a href="#account">계정</a>
      <Divider orientation="vertical" decorative />
      <a href="#settings">설정</a>
    </div>
  ),
};
