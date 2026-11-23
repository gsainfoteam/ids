import { useState } from 'react';

import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Image } from '../../data/image';

import { AspectRatio } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Layout/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  argTypes: { ratio: { control: { type: 'number', min: 0.1, step: 0.1 } } },
  args: { ratio: 16 / 9 },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

const picture = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#2563eb"/><stop offset="1" stop-color="#ff4500"/></linearGradient></defs><rect width="600" height="200" fill="url(#g)"/><circle cx="300" cy="100" r="60" fill="#ffffff" fill-opacity="0.8"/></svg>',
)}`;

const tile = cn(
  'flex items-center justify-center rounded-standard bg-primary-soft text-body-b3-medium text-on-primary-soft',
);

const ratios = [
  ['1:1', 1],
  ['4:3', 4 / 3],
  ['16:9', 16 / 9],
  ['21:9', 21 / 9],
  ['3:4', 3 / 4],
] as const;

export const Playground: Story = {
  render: (args) => (
    <div className="w-80">
      <AspectRatio {...args}>
        <div className={tile}>비율을 지키는 영역</div>
      </AspectRatio>
    </div>
  ),
};

export const Usage: Story = {
  render: () => (
    <div className="w-80">
      <AspectRatio ratio={16 / 9}>
        <div className="rounded-standard bg-neutral-soft text-body-b3-medium text-neutral flex items-center justify-center">
          16:9
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Ratio" description="폭이 같아도 높이는 비율을 따릅니다.">
        <Showcase.Row className="items-start">
          {ratios.map(([label, ratio]) => (
            <div key={label} className="w-40">
              <AspectRatio ratio={ratio}>
                <div className={tile}>{label}</div>
              </AspectRatio>
            </div>
          ))}
        </Showcase.Row>
      </Showcase.Section>
      <Showcase.Section
        title="Media"
        description="Image 와 img, video 는 칸을 채우고 넘치는 부분은 잘립니다(cover). Image 는 모서리도 깎습니다. 앱의 img 에 준 클래스는 기본값을 이깁니다."
      >
        <Showcase.Row label="Image" className="items-start">
          <div className="w-40">
            <AspectRatio>
              <Image src={picture} alt="그라데이션" />
            </AspectRatio>
          </div>
        </Showcase.Row>
        <Showcase.Row label="img" className="items-start">
          <div className="w-40">
            <AspectRatio>
              <img src={picture} alt="그라데이션" />
            </AspectRatio>
          </div>
        </Showcase.Row>
        <Showcase.Row label="object-contain" className="items-start">
          <div className="w-40">
            <AspectRatio>
              <img src={picture} alt="그라데이션" className="object-contain" />
            </AspectRatio>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const KeepTheRatioWhileTheWidthChanges: Story = {
  render: function Render() {
    const [compact, setCompact] = useState(false);

    return (
      <div className="flex flex-col items-start gap-4">
        <Button variant="outline" onClick={() => setCompact((value) => !value)}>
          폭 바꾸기
        </Button>
        <div style={{ width: compact ? 160 : 320 }}>
          <AspectRatio ratio={16 / 9} data-testid="frame">
            <div className={tile}>16:9</div>
          </AspectRatio>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`ratio` 하나로 폭이 바뀌어도 비율을 지키는 칸을 얻습니다. 부모 폭이 바뀌면 높이를 CSS가 다시 계산하고, 크기를 재는 스크립트는 없습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const frame = canvas.getByTestId('frame');
    const before = frame.getBoundingClientRect();
    await expect(before.width / before.height).toBeCloseTo(16 / 9, 2);
    await userEvent.click(canvas.getByRole('button', { name: '폭 바꾸기' }));
    const after = frame.getBoundingClientRect();
    await expect(after.width).toBeLessThan(before.width);
    await expect(after.width / after.height).toBeCloseTo(16 / 9, 2);
  },
};

export const GiveAnImageARatio: Story = {
  render: () => (
    <div className="w-60">
      <AspectRatio ratio={1} data-testid="frame">
        <Image src={picture} alt="그라데이션" />
      </AspectRatio>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '비율이 없는 Image, `video`, `iframe` 은 AspectRatio 로 감싸 비율을 줍니다. 자식은 칸을 채우고, 3:1 그림을 1:1 칸에 넣어도 넘치는 좌우가 잘립니다(`object-cover`). 모서리는 Image 가 스스로 깎습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const frame = canvas.getByTestId('frame').getBoundingClientRect();
    const picture = canvas.getByRole('img', { name: '그라데이션' });
    const image = picture.getBoundingClientRect();
    await expect(image.width).toBeCloseTo(frame.width, 0);
    await expect(image.height).toBeCloseTo(frame.height, 0);
    await expect(getComputedStyle(picture).objectFit).toBe('cover');
  },
};

export const ClipContentTallerThanTheFrame: Story = {
  render: () => (
    <div className="w-60">
      <AspectRatio data-testid="square">
        <div className="rounded-standard bg-neutral-soft overflow-hidden">
          <div className="text-body-b3-regular h-96 p-3">
            콘텐츠가 커도 바깥 정사각형 비율은 그대로입니다.
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '자식이 칸보다 커도 칸은 늘어나지 않고 비율을 지킵니다. 자식은 칸을 채우므로, 넘치는 부분은 자식(앱의 요소)의 `overflow-hidden` 으로 자릅니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const { width, height } = canvas.getByTestId('square').getBoundingClientRect();
    await expect(width).toBeGreaterThan(0);
    await expect(width / height).toBeCloseTo(1, 2);
  },
};
