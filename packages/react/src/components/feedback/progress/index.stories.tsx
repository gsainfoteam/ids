import { useEffect, useState } from 'react';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Progress } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const schemes = ['primary', 'neutral', 'info', 'success', 'warning', 'danger'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Feedback/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    max: { control: 'number' },
    shape: { control: 'radio', options: ['linear', 'circular'] },
    size: { control: 'radio', options: sizes },
    colorScheme: { control: 'select', options: schemes },
    indeterminate: { control: 'boolean' },
  },
  args: { value: 65, max: 100, shape: 'linear', size: 'standard', colorScheme: 'primary' },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

const bar = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[role="progressbar"]')!;

export const Playground: Story = {
  render: (args) => (
    <Progress {...args} className="max-w-md">
      <Progress.Label>업로드 중</Progress.Label>
      <Progress.Value />
    </Progress>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Color scheme × Size">
        <Showcase.Matrix
          rows={schemes}
          columns={sizes}
          render={(colorScheme, size) => (
            <div className="w-64">
              <Progress value={62} colorScheme={colorScheme} size={size}>
                <Progress.Label>{colorScheme}</Progress.Label>
                <Progress.Value />
              </Progress>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Circular × Size">
        {sizes.map((size) => (
          <Showcase.Row key={size} label={size}>
            {schemes.map((colorScheme, index) => (
              <Progress
                key={colorScheme}
                shape="circular"
                size={size}
                colorScheme={colorScheme}
                value={(index + 1) * 15}
                aria-label={colorScheme}
              >
                {size === 'standard' && <Progress.Value />}
              </Progress>
            ))}
          </Showcase.Row>
        ))}
        <Showcase.Row label="label, icon">
          <Progress shape="circular" value={40}>
            <ArrowDownTrayIcon />
            <Progress.Label>다운로드 중</Progress.Label>
          </Progress>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <div className="w-64">
            <Progress value={0} aria-label="시작 전" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="complete">
          <div className="w-64">
            <Progress value={100} colorScheme="success">
              <Progress.Label>완료</Progress.Label>
              <Progress.Value />
            </Progress>
          </div>
        </Showcase.Row>
        <Showcase.Row label="indeterminate">
          <div className="w-64">
            <Progress aria-label="처리 중" />
          </div>
          <Progress shape="circular" aria-label="처리 중" />
          <Progress shape="circular" size="tiny" aria-label="처리 중" />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Parts"
        description="Track 앞의 자식은 바 위에, 뒤의 자식은 바 아래에 놓입니다."
      >
        <Showcase.Row label="value below">
          <div className="w-64">
            <Progress value={30}>
              <Progress.Label>프로필 완성도</Progress.Label>
              <Progress.Track />
              <Progress.Value>{(state) => `${state.value} / ${state.max} 항목`}</Progress.Value>
            </Progress>
          </div>
        </Showcase.Row>
        <Showcase.Row label="custom parts">
          <div className="w-64">
            <Progress value={72} aria-label="그라데이션">
              <Progress.Track className="h-3">
                <Progress.Indicator className="bg-linear-to-r from-(--ids-color-info) to-(--ids-color-success)" />
              </Progress.Track>
            </Progress>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const LabelNamesTheBar: Story = {
  render: () => (
    <Progress value={65} className="max-w-md">
      <Progress.Label>사진 올리는 중</Progress.Label>
      <Progress.Value />
    </Progress>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Progress.Label이 progressbar의 이름이 됩니다. 눈에 보이는 값은 progressbar가 이미 알리므로 스크린 리더에서는 숨깁니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const progressbar = canvas.getByRole('progressbar', { name: '사진 올리는 중' });
    await expect(progressbar).toHaveAttribute('aria-valuenow', '65');
    await expect(progressbar).toHaveAttribute('aria-valuetext', '65%');
    await expect(canvas.getByText('65%')).toHaveAttribute('aria-hidden', 'true');
  },
};

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export const ValueLabel: Story = {
  render: () => (
    <Progress
      value={2_411_724}
      max={8_388_608}
      getValueLabel={(value, max) => `${megabytes(value)} / ${megabytes(max)}`}
      className="max-w-md"
    >
      <Progress.Label>보고서.pdf</Progress.Label>
      <Progress.Value />
    </Progress>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'getValueLabel이 돌려준 문장이 aria-valuetext와 Progress.Value의 기본 내용이 됩니다. 스크린 리더와 화면이 같은 말을 합니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(bar(canvasElement)).toHaveAttribute('aria-valuetext', '2.3 MB / 8.0 MB');
    await expect(bar(canvasElement)).toHaveAttribute('aria-valuenow', '2411724');
    await expect(canvas.getByText('2.3 MB / 8.0 MB')).toBeInTheDocument();
  },
};

export const OutOfRange: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Progress value={8_400_000} max={8_388_608} aria-label="넘침" data-testid="over">
        <Progress.Value />
      </Progress>
      <Progress value={-5} aria-label="음수" data-testid="under">
        <Progress.Value />
      </Progress>
      <Progress value={99.6} aria-label="거의" data-testid="almost">
        <Progress.Value />
      </Progress>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '범위를 벗어난 값은 오류 대신 0과 max 사이로 맞춥니다(개발 모드 경고). 백분율은 내림이라 끝나기 전에는 100%가 나오지 않습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const over = canvas.getByRole('progressbar', { name: '넘침' });
    await expect(over).toHaveAttribute('aria-valuenow', '8388608');
    await expect(canvas.getByTestId('over')).toHaveAttribute('data-complete');
    await expect(canvas.getByRole('progressbar', { name: '음수' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    await expect(canvas.getByRole('progressbar', { name: '거의' })).toHaveAttribute(
      'aria-valuetext',
      '99%',
    );
    await expect(canvas.getByTestId('almost')).not.toHaveAttribute('data-complete');
  },
};

export const Indeterminate: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <Progress aria-label="준비 중" />
      <div className="flex items-center gap-4">
        <Progress shape="circular" aria-label="변환 중" />
        <Progress shape="circular" size="tiny" aria-label="변환 중" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'value가 없거나 indeterminate면 진행률 없이 움직이고 aria-valuenow를 빼 둡니다. 모션 줄이기 설정에서는 흐린 막대로 멈춰 있습니다.',
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

function LiveExample() {
  const [value, setValue] = useState(10);
  useEffect(() => {
    const id = setInterval(() => setValue((prev) => (prev >= 100 ? 10 : prev + 15)), 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-6">
      <Progress value={value} colorScheme={value >= 100 ? 'success' : 'primary'} className="w-64">
        <Progress.Label>동기화</Progress.Label>
        <Progress.Value />
      </Progress>
      <Progress shape="circular" value={value} aria-label="동기화">
        <Progress.Value />
      </Progress>
    </div>
  );
}

export const Live: Story = {
  render: () => <LiveExample />,
  parameters: {
    docs: {
      description: {
        story: '값이 바뀌면 막대는 폭을 다시 계산하지 않고 미끄러져 움직입니다.',
      },
    },
  },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" className="flex max-w-md flex-col gap-4">
      <Progress value={30}>
        <Progress.Label>تحميل</Progress.Label>
        <Progress.Value />
      </Progress>
      <Progress aria-label="انتظار" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '오른쪽에서 왼쪽으로 쓰는 문서에서는 막대가 오른쪽부터 차고, 무한 애니메이션도 반대로 흐릅니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const track = bar(canvasElement).getBoundingClientRect();
    const fill = canvasElement.querySelector('[data-progress-indicator]')!.getBoundingClientRect();
    // The bar is full width and slid out of the track, so its visible part starts 70% in.
    await expect(Math.abs(fill.left - track.left - track.width * 0.7)).toBeLessThan(1);
  },
};
