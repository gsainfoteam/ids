import { useState } from 'react';

import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import tokens from '../../../../core/tokens/motion.json';
import { Button } from '../../components/action/button';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Motion',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const durations = Object.entries(tokens.motion).map(([name, { $value }]) => ({
  name,
  value: $value,
}));

const usage: { [name: string]: string } = {
  fast: 'hover, press, 색 전환 (Button, Chip, Badge, 필드)',
  normal: 'Accordion 펼침, Progress, Dialog, 필드 팝업',
  slow: 'Drawer, Toast 처럼 멀리 움직이는 전환',
};

const seconds = (value: string) => `${parseFloat(value) / 1000}s`;

export const Durations: Story = {
  render: function Render() {
    const [moved, setMoved] = useState(false);

    return (
      <Showcase>
        <Showcase.Section
          title="시간"
          description="motion.json 의 세 단계입니다. 재생을 누르면 점이 각 시간 동안 ease-out 으로 움직입니다. 운영체제에서 동작 줄이기를 켜면 움직임 없이 바로 옮겨 갑니다."
        >
          <Showcase.Row>
            <Button size="tiny" variant="outline" onClick={() => setMoved((value) => !value)}>
              {moved ? '되돌리기' : '재생'}
            </Button>
          </Showcase.Row>
          <div className="flex flex-col gap-4">
            {durations.map(({ name, value }) => (
              <div
                key={name}
                data-motion={name}
                data-value={value}
                className="grid grid-cols-[4rem_4rem_1fr] items-center gap-4"
              >
                <span className="text-body-b3-medium">{name}</span>
                <code className="text-caption-c1-regular font-mono text-(--ids-color-on-muted)">
                  {value}
                </code>
                <div className="flex flex-col gap-1">
                  <div className="relative h-4 w-full max-w-80 rounded-full bg-(--ids-color-muted)">
                    <span
                      data-dot=""
                      className="absolute inset-y-0 left-0 size-4 rounded-full bg-(--ids-color-primary) transition-[left] ease-out data-moved:left-[calc(100%-1rem)] motion-reduce:transition-none"
                      data-moved={moved ? '' : undefined}
                      style={{ transitionDuration: `var(--ids-motion-${name})` }}
                    />
                  </div>
                  <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                    {usage[name]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Showcase.Section>
      </Showcase>
    );
  },
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll<HTMLElement>('[data-motion]')];

    await expect(rows).toHaveLength(Object.keys(tokens.motion).length);
    for (const row of rows) {
      const dot = row.querySelector<HTMLElement>('[data-dot]')!;
      await expect(getComputedStyle(dot).transitionDuration).toBe(seconds(row.dataset.value!));
    }
  },
};
