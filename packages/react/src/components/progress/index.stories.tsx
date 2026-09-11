import { useEffect, useState } from 'react';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { expect } from 'storybook/test';

import { Spinner } from '../spinner';

import { Progress } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const SCHEMES = ['primary', 'success', 'warning', 'danger', 'neutral'] as const;

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
  args: { value: 65, max: 100, shape: 'linear', size: 'standard', colorScheme: 'primary' },
  argTypes: {
    shape: { control: 'radio', options: ['linear', 'circular'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    colorScheme: { control: 'select', options: SCHEMES },
    indeterminate: { control: 'boolean' },
    value: { control: { type: 'range', min: 0, max: 100 } },
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
type Story = StoryObj<typeof Progress>;

export const Playground: Story = {
  render: (args) => <Progress {...args} aria-label="업로드 진행률" />,
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: '업로드 진행률' });
    await expect(bar).toHaveAttribute('aria-valuenow', '65');
    await expect(bar).toHaveAttribute('aria-valuemax', '100');
  },
};

export const WithLabelAndValue: Story = {
  render: () => (
    <Progress value={65}>
      <Progress.Label>업로드 중</Progress.Label>
      <Progress.Value />
    </Progress>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('65%')).toBeInTheDocument();
  },
};

export const CustomValueText: Story = {
  render: () => (
    <Progress value={2_411_724} max={8_388_608}>
      <Progress.Label>보고서.pdf</Progress.Label>
      <Progress.Value>2.3 MB / 8 MB</Progress.Value>
    </Progress>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2411724');
  },
};

export const ColorSchemes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {SCHEMES.map((colorScheme, index) => (
        <Progress key={colorScheme} value={(index + 1) * 18} colorScheme={colorScheme}>
          <Progress.Label>{colorScheme}</Progress.Label>
          <Progress.Value />
        </Progress>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Progress value={40} size="standard" aria-label="standard" />
      <Progress value={40} size="tiny" aria-label="tiny" />
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Progress aria-label="처리 중" />
      <div className="flex items-center gap-4">
        <Progress shape="circular" aria-label="원형 처리 중" />
        <Progress shape="circular" size="tiny" aria-label="작은 원형 처리 중" />
        <Spinner />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const bar of canvas.getAllByRole('progressbar')) {
      await expect(bar).not.toHaveAttribute('aria-valuenow');
    }
  },
};

export const Circular: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Progress shape="circular" value={25} aria-label="25%">
        <Progress.Value />
      </Progress>
      <Progress shape="circular" value={70} colorScheme="success" aria-label="70%">
        <Progress.Value />
      </Progress>
      <Progress shape="circular" value={50} aria-label="다운로드 중">
        <ArrowDownTrayIcon className="size-4" />
      </Progress>
      <Progress shape="circular" size="tiny" value={80} aria-label="80%" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('25%')).toBeInTheDocument();
  },
};

export const Animates: Story = {
  render: function Animates() {
    const [value, setValue] = useState(10);

    useEffect(() => {
      const id = setInterval(() => setValue((prev) => (prev >= 100 ? 10 : prev + 15)), 900);
      return () => clearInterval(id);
    }, []);

    return (
      <div className="flex items-center gap-6">
        <Progress value={value} colorScheme={value === 100 ? 'success' : 'primary'}>
          <Progress.Label>업로드 중</Progress.Label>
          <Progress.Value />
        </Progress>
        <Progress shape="circular" value={value} aria-label={`${value}%`}>
          <Progress.Value />
        </Progress>
      </div>
    );
  },
};
