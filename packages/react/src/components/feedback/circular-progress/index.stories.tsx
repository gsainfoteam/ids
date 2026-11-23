import { useEffect, useState } from 'react';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { CircularProgress } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const schemes = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'info',
  'success',
  'warning',
  'danger',
] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Feedback/CircularProgress',
  component: CircularProgress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    max: { control: 'number' },
    size: { control: 'radio', options: sizes },
    colorScheme: { control: 'select', options: schemes },
    indeterminate: { control: 'boolean' },
  },
  args: { value: 65, max: 100, size: 'standard', colorScheme: 'primary' },
} satisfies Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <CircularProgress {...args}>
      <CircularProgress.Value />
      <CircularProgress.Label>업로드 중</CircularProgress.Label>
    </CircularProgress>
  ),
};

export const Usage: Story = {
  render: () => (
    <CircularProgress value={65} aria-label="업로드">
      <CircularProgress.Value />
    </CircularProgress>
  ),
  play: async ({ canvas }) => {
    const progressbar = canvas.getByRole('progressbar', { name: '업로드' });
    await expect(progressbar).toHaveAttribute('aria-valuenow', '65');
    await expect(progressbar).toHaveAttribute('aria-valuetext', '65%');
    await expect(canvas.getByText('65%')).toHaveAttribute('aria-hidden', 'true');
  },
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Color scheme × Size">
        {sizes.map((size) => (
          <Showcase.Row key={size} label={size}>
            {schemes.map((colorScheme, index) => (
              <CircularProgress
                key={colorScheme}
                size={size}
                colorScheme={colorScheme}
                value={(index + 1) * 12}
                aria-label={colorScheme}
              >
                {size === 'standard' && <CircularProgress.Value />}
              </CircularProgress>
            ))}
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <CircularProgress value={0} aria-label="시작 전">
            <CircularProgress.Value />
          </CircularProgress>
        </Showcase.Row>
        <Showcase.Row label="complete">
          <CircularProgress value={100} colorScheme="success" aria-label="완료">
            <CircularProgress.Value />
          </CircularProgress>
        </Showcase.Row>
        <Showcase.Row label="indeterminate">
          <CircularProgress aria-label="처리 중" />
          <CircularProgress size="tiny" aria-label="처리 중" />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Parts"
        description="Label은 원 옆에, 나머지 자식은 원 가운데에 놓입니다."
      >
        <Showcase.Row label="label beside">
          <CircularProgress value={40}>
            <CircularProgress.Value />
            <CircularProgress.Label>다운로드 중</CircularProgress.Label>
          </CircularProgress>
        </Showcase.Row>
        <Showcase.Row label="icon in the center">
          <CircularProgress value={40}>
            <ArrowDownTrayIcon />
            <CircularProgress.Label>다운로드 중</CircularProgress.Label>
          </CircularProgress>
        </Showcase.Row>
        <Showcase.Row label="custom parts">
          <CircularProgress value={72} aria-label="두꺼운 호">
            <CircularProgress.Track strokeWidth="4" />
            <CircularProgress.Indicator strokeWidth="4" />
          </CircularProgress>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const ShowAnIconWhileDownloading: Story = {
  render: () => (
    <CircularProgress value={40}>
      <ArrowDownTrayIcon />
      <CircularProgress.Label>보고서.pdf 받는 중</CircularProgress.Label>
    </CircularProgress>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Label이 아닌 자식은 원 가운데에 놓입니다. 아이콘은 원의 40% 크기가 되고, Label은 원 옆에 놓여 progressbar의 이름이 됩니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const progressbar = canvas.getByRole('progressbar', { name: '보고서.pdf 받는 중' });
    await expect(progressbar.querySelectorAll('svg')).toHaveLength(2);
    const label = canvasElement.querySelector('[data-circular-progress-label]')!;
    await expect(progressbar.contains(label)).toBe(false);
  },
};

export const WaitWithoutAKnownValue: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <CircularProgress aria-label="변환 중" />
      <CircularProgress size="tiny" aria-label="변환 중" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'value가 없거나 indeterminate면 원의 4분의 1이 돌고 aria-valuenow를 빼 둡니다. 모션 줄이기 설정에서는 돌지 않습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    for (const progressbar of canvas.getAllByRole('progressbar')) {
      await expect(progressbar).not.toHaveAttribute('aria-valuenow');
      await expect(progressbar).not.toHaveAttribute('aria-valuetext');
    }
  },
};

export const FollowALiveValue: Story = {
  render: function Render() {
    const [value, setValue] = useState(10);

    useEffect(() => {
      const id = setInterval(() => setValue((prev) => (prev >= 100 ? 10 : prev + 15)), 900);
      return () => clearInterval(id);
    }, []);

    return (
      <CircularProgress value={value} colorScheme={value >= 100 ? 'success' : 'primary'}>
        <CircularProgress.Value />
        <CircularProgress.Label>동기화</CircularProgress.Label>
      </CircularProgress>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '값이 바뀌면 호가 이어서 늘어납니다. 모션 줄이기 설정에서는 바로 바뀝니다.',
      },
    },
  },
};
