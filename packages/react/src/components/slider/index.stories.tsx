import { useState } from 'react';

import { expect, userEvent } from 'storybook/test';

import { Label } from '../label';

import { Slider } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  args: { min: 0, max: 100, step: 1, size: 'standard' },
  argTypes: {
    selectionMode: { control: 'radio', options: ['single', 'range'] },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Playground: Story = {
  render: function Playground(args) {
    const [volume, setVolume] = useState(50);

    return (
      <div className="flex flex-col gap-2">
        <Label>볼륨</Label>
        <Slider {...args} value={volume} onChange={(next) => setVolume(next as number)} />
        <output className="text-caption-c1-regular tabular-nums">{volume}</output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole('slider');
    await expect(thumb).toHaveAttribute('aria-valuenow', '50');

    thumb.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '51');

    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '61');

    await userEvent.keyboard('{End}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');

    await userEvent.keyboard('{Home}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
  },
};

export const Range: Story = {
  render: function Range() {
    const [price, setPrice] = useState<[number, number]>([20, 70]);

    return (
      <div className="flex flex-col gap-2">
        <Label>가격 범위</Label>
        <Slider
          selectionMode="range"
          value={price}
          onChange={(next) => setPrice(next as [number, number])}
        />
        <output className="text-caption-c1-regular tabular-nums">
          {price[0]} ~ {price[1]}
        </output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const [start, end] = canvas.getAllByRole('slider');
    await expect(start).toHaveAttribute('aria-valuenow', '20');
    await expect(end).toHaveAttribute('aria-valuenow', '70');
    // 시작 thumb은 끝 thumb을 넘지 못한다.
    await expect(start).toHaveAttribute('aria-valuemax', '70');
  },
};

export const DoesNotCross: Story = {
  render: function DoesNotCross() {
    const [range, setRange] = useState<[number, number]>([40, 50]);

    return (
      <Slider
        selectionMode="range"
        value={range}
        onChange={(next) => setRange(next as [number, number])}
        aria-label="교차 방지"
      />
    );
  },
  play: async ({ canvas }) => {
    const [start, end] = canvas.getAllByRole('slider');
    start.focus();
    await userEvent.keyboard('{End}');
    await expect(start).toHaveAttribute('aria-valuenow', '50');
    await expect(end).toHaveAttribute('aria-valuenow', '50');
  },
};

export const WithMarks: Story = {
  render: function WithMarks() {
    const [value, setValue] = useState(50);

    return (
      <Slider
        value={value}
        onChange={(next) => setValue(next as number)}
        step={25}
        marks={[0, 25, 50, 75, 100]}
        aria-label="진행률"
      />
    );
  },
};

export const FormattedLabel: Story = {
  render: function FormattedLabel() {
    const [price, setPrice] = useState(300000);

    return (
      <div className="flex flex-col gap-2">
        <Label>예산</Label>
        <Slider
          value={price}
          onChange={(next) => setPrice(next as number)}
          min={0}
          max={1000000}
          step={50000}
          formatLabel={(v) => `₩${v.toLocaleString()}`}
        />
        <output className="text-caption-c1-regular tabular-nums">₩{price.toLocaleString()}</output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider')).toHaveAttribute('aria-valuetext', '₩300,000');
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Slider defaultValue={40} size="standard" aria-label="standard" />
      <Slider defaultValue={40} size="tiny" aria-label="tiny" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <Slider defaultValue={40} disabled aria-label="비활성" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider')).toHaveAttribute('aria-disabled', 'true');
  },
};

export const Vertical: Story = {
  decorators: [
    (Story) => (
      <div className="h-48">
        <Story />
      </div>
    ),
  ],
  render: function Vertical() {
    const [volume, setVolume] = useState(60);

    return (
      <Slider
        orientation="vertical"
        value={volume}
        onChange={(next) => setVolume(next as number)}
        aria-label="볼륨"
      />
    );
  },
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole('slider');
    await expect(thumb).toHaveAttribute('aria-orientation', 'vertical');

    thumb.focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '61');
  },
};
