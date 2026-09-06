import { expect } from 'storybook/test';

import { Spacer } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Spacer> = {
  title: 'Components/Spacer',
  component: Spacer,
  tags: ['autodocs'],
  args: { flex: 1 },
  argTypes: { flex: { control: { type: 'number', min: 0.1, step: 0.5 } } },
};

export default meta;
type Story = StoryObj<typeof Spacer>;

export const Playground: Story = {
  render: (args) => (
    <div className="flex w-72 items-center rounded-lg border border-(--ids-color-outline) p-3">
      <span>제목</span>
      <Spacer {...args} />
      <button type="button">더보기</button>
    </div>
  ),
};

export const Distribution: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      <div className="flex h-12 w-72" data-testid="row">
        <span className="shrink-0">시작</span>
        <Spacer data-testid="row-one" className="bg-(--ids-color-primary)/10" />
        <span className="shrink-0">중간</span>
        <Spacer flex={2} data-testid="row-two" className="bg-(--ids-color-primary)/20" />
        <span className="shrink-0">끝</span>
      </div>
      <div className="flex h-72 w-24 flex-col" data-testid="column">
        <span>시작</span>
        <Spacer data-testid="column-one" className="bg-(--ids-color-primary)/10" />
        <span>중간</span>
        <Spacer flex={2} data-testid="column-two" className="bg-(--ids-color-primary)/20" />
        <span>끝</span>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const [axis, dimension] of [
      ['row', 'width'],
      ['column', 'height'],
    ] as const) {
      const first = canvas.getByTestId(`${axis}-one`);
      const second = canvas.getByTestId(`${axis}-two`);
      const a = first.getBoundingClientRect()[dimension];
      const b = second.getBoundingClientRect()[dimension];
      await expect(a).toBeGreaterThan(0);
      await expect(b / a).toBeCloseTo(2, 1);
      await expect(first).toHaveAttribute('aria-hidden', 'true');
      await expect(second).not.toHaveAttribute('tabindex');
    }
    for (const flex of [0, -1, Infinity, NaN]) {
      await expect(() => Spacer({ flex })).toThrow('finite positive number');
    }
  },
};
