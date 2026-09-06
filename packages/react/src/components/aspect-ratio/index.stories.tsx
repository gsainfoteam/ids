import { useState } from 'react';

import { expect } from 'storybook/test';

import { AspectRatio } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof AspectRatio> = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  args: { ratio: 16 / 9 },
  argTypes: { ratio: { control: { type: 'number', min: 0.1, step: 0.1 } } },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const Playground: Story = {
  render: (args) => (
    <AspectRatio {...args} className="rounded-xl bg-(--ids-color-primary)/15">
      <div className="flex h-full items-center justify-center">비율을 유지하는 영역</div>
    </AspectRatio>
  ),
};

export const Responsive: Story = {
  render: function ResponsiveExample() {
    const [compact, setCompact] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <button type="button" onClick={() => setCompact((value) => !value)}>
          폭 변경
        </button>
        <div style={{ width: compact ? 160 : 320 }}>
          <AspectRatio ratio={16 / 9} data-testid="frame" className="bg-(--ids-color-primary)/15">
            <div className="flex h-full items-center justify-center">16:9</div>
          </AspectRatio>
        </div>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const frame = canvas.getByTestId('frame');
    const before = frame.getBoundingClientRect();
    await expect(before.width / before.height).toBeCloseTo(16 / 9, 2);
    await userEvent.click(canvas.getByRole('button', { name: '폭 변경' }));
    const after = frame.getBoundingClientRect();
    await expect(after.width).toBeLessThan(before.width);
    await expect(after.width / after.height).toBeCloseTo(16 / 9, 2);
    for (const ratio of [0, -1, Infinity, NaN]) {
      await expect(() => AspectRatio({ ratio })).toThrow('finite positive number');
    }
  },
};

export const IntrinsicContent: Story = {
  render: () => (
    <AspectRatio data-testid="square" className="overflow-hidden rounded-xl bg-(--ids-color-muted)">
      <div className="h-96">콘텐츠가 커도 바깥 정사각형 비율은 유지됩니다.</div>
    </AspectRatio>
  ),
  play: async ({ canvas }) => {
    const { width, height } = canvas.getByTestId('square').getBoundingClientRect();
    await expect(width).toBeGreaterThan(0);
    await expect(width / height).toBeCloseTo(1, 2);
  },
};
