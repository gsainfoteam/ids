import { useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';

import { Image } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

function scene(hue: number, width = 640, height = 480) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 80%)"/><stop offset="1" stop-color="hsl(${hue} 60% 94%)"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#sky)"/><circle cx="${width * 0.72}" cy="${height * 0.3}" r="${height * 0.1}" fill="hsl(${(hue + 40) % 360} 90% 68%)"/><path d="M0 ${height} L${width * 0.28} ${height * 0.46} L${width * 0.52} ${height * 0.74} L${width * 0.74} ${height * 0.5} L${width} ${height} Z" fill="hsl(${hue} 32% 38%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PHOTO = scene(200);
const BROKEN = 'data:image/png;base64,AAAA';

const PHOTOS = [
  { id: 'lake', hue: 200, alt: '호수 위로 뜬 해', caption: '아침의 호수' },
  { id: 'field', hue: 95, alt: '초록 들판 너머의 산', caption: '여름 들판' },
  { id: 'dusk', hue: 20, alt: '노을 진 산등성이', caption: '해 질 녘' },
  { id: 'snow', hue: 225, alt: '눈 덮인 봉우리', caption: '겨울 산' },
  { id: 'dune', hue: 40, alt: '모래 언덕과 해', caption: '사막' },
  { id: 'forest', hue: 140, alt: '숲 위로 뜬 해', caption: '숲' },
].map((photo) => ({ ...photo, src: scene(photo.hue) }));

const ratios = [1, 4 / 3, 16 / 9, 3 / 4];

const meta = {
  title: 'Data/Image',
  component: Image,
  tags: ['autodocs'],
  argTypes: {
    ratio: { control: { type: 'number', min: 0.25, max: 4, step: 0.25 } },
    preview: { control: 'boolean' },
  },
  args: { src: PHOTO, alt: '호수 위로 뜬 해', ratio: 4 / 3, onStatusChange: fn() },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Ratio"
        description="ratio 가 폭에 맞춘 높이를 정합니다. 그림은 칸을 채우고 넘치는 부분은 잘립니다."
      >
        <Showcase.Row label="ratio">
          {ratios.map((ratio) => (
            <div key={ratio} className="w-36">
              <Image src={PHOTO} alt="호수 위로 뜬 해" ratio={ratio} />
            </div>
          ))}
        </Showcase.Row>
        <Showcase.Row label="natural">
          <div className="w-36">
            <Image src={PHOTO} alt="호수 위로 뜬 해" />
          </div>
          <div className="w-36">
            <Image src={scene(20, 480, 640)} alt="노을 진 산등성이" />
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Status"
        description="깨지거나 주소가 없는 그림은 Image.Fallback 이 대신합니다. 기본은 그림 아이콘입니다."
      >
        <Showcase.Row label="loaded">
          <div className="w-36">
            <Image src={PHOTO} alt="호수 위로 뜬 해" ratio={4 / 3} />
          </div>
        </Showcase.Row>
        <Showcase.Row label="broken">
          <div className="w-36">
            <Image src={BROKEN} alt="깨진 사진" ratio={4 / 3} />
          </div>
          <div className="w-36">
            <Image src={BROKEN} alt="깨진 사진" width={640} height={360} />
          </div>
        </Showcase.Row>
        <Showcase.Row label="no src">
          <div className="w-36">
            <Image alt="아직 올리지 않은 사진" ratio={4 / 3} />
          </div>
        </Showcase.Row>
        <Showcase.Row label="custom">
          <div className="w-36">
            <Image src={BROKEN} alt="깨진 사진" ratio={4 / 3}>
              <Image.Fallback>불러오지 못했습니다</Image.Fallback>
            </Image>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Group layout"
        description="Image.Group 은 사진을 가로, 세로, 격자로 늘어놓고, 누르면 그 장부터 크게 봅니다."
      >
        <Showcase.Row label="row">
          <div className="w-full max-w-md">
            <Image.Group layout="row" aria-label="풍경 사진">
              {PHOTOS.slice(0, 3).map((photo) => (
                <Image key={photo.id} src={photo.src} alt={photo.alt} ratio={1} />
              ))}
            </Image.Group>
          </div>
        </Showcase.Row>
        <Showcase.Row label="column">
          <div className="w-40">
            <Image.Group layout="column" aria-label="풍경 사진">
              {PHOTOS.slice(3, 5).map((photo) => (
                <Image key={photo.id} src={photo.src} alt={photo.alt} ratio={16 / 9} />
              ))}
            </Image.Group>
          </div>
        </Showcase.Row>
        <Showcase.Row label="grid">
          <div className="w-full max-w-md">
            <Image.Group layout="grid" columns={3} aria-label="풍경 사진">
              {PHOTOS.map((photo) => (
                <Image
                  key={photo.id}
                  src={photo.src}
                  alt={photo.alt}
                  caption={photo.caption}
                  ratio={1}
                />
              ))}
            </Image.Group>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Status: Story = {
  render: function Render() {
    const [src, setSrc] = useState(PHOTO);
    const [log, setLog] = useState<string[]>([]);

    return (
      <div className="flex max-w-xs flex-col items-start gap-4">
        <Image
          src={src}
          alt="호수 위로 뜬 해"
          ratio={4 / 3}
          className={(state) =>
            state.status === 'loaded' ? 'ring-2 ring-(--ids-color-success)' : undefined
          }
          onStatusChange={(status) => setLog((previous) => [...previous, status])}
        />
        <div className="flex gap-2">
          <Button size="tiny" variant="outline" onClick={() => setSrc(BROKEN)}>
            깨진 주소로
          </Button>
          <Button size="tiny" variant="outline" onClick={() => setSrc(scene(20))}>
            다른 사진으로
          </Button>
        </div>
        <output aria-label="상태 기록" className="text-body-b3-regular font-mono">
          {log.join(' → ')}
        </output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '상태는 `loading` / `loaded` / `error` 입니다. 루트의 `data-status`, `onStatusChange`, 상태를 받는 `className` 으로 씁니다. 깨진 `<img>` 는 DOM 에서 빠지고 Image.Fallback 이 `alt` 를 이름으로 가진 그림이 됩니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const frame = () => canvasElement.querySelector('[data-image]')!;
    await waitFor(() => expect(frame()).toHaveAttribute('data-status', 'loaded'));
    await userEvent.click(canvas.getByRole('button', { name: '깨진 주소로' }));
    await waitFor(() => expect(frame()).toHaveAttribute('data-status', 'error'));
    await expect(canvas.getByRole('img', { name: '호수 위로 뜬 해' })).toHaveAttribute(
      'data-image-fallback',
    );
    await expect(frame().querySelector('img')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: '다른 사진으로' }));
    await waitFor(() => expect(frame()).toHaveAttribute('data-status', 'loaded'));
    await waitFor(() =>
      expect(canvas.getByLabelText('상태 기록')).toHaveTextContent(
        'loading → loaded → loading → error → loading → loaded',
      ),
    );
  },
};

export const Fallback: Story = {
  render: () => (
    <div className="flex max-w-md gap-3">
      <div className="w-40">
        <Image src={BROKEN} alt="깨진 사진" ratio={4 / 3} />
      </div>
      <div className="w-40">
        <Image src={BROKEN} alt="깨진 사진" ratio={4 / 3}>
          <Image.Fallback>불러오지 못했습니다</Image.Fallback>
        </Image>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '깨진 그림 자리에는 Image.Fallback 이 그려집니다. 기본은 그림 아이콘이고, children 으로 바꿉니다. 스크린 리더는 어느 쪽이든 `alt` 를 그림의 이름으로 읽습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('[data-status="error"]')).toHaveLength(2),
    );
    await expect(canvas.getAllByRole('img', { name: '깨진 사진' })).toHaveLength(2);
    await expect(canvas.getByText('불러오지 못했습니다')).toBeVisible();
  },
};

export const Group: Story = {
  render: function Render() {
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);

    return (
      <div className="flex max-w-md flex-col gap-3">
        <Image.Group
          layout="grid"
          columns={3}
          value={index}
          onValueChange={setIndex}
          open={open}
          onOpenChange={setOpen}
          aria-label="풍경 사진"
        >
          {PHOTOS.map((photo) => (
            <Image
              key={photo.id}
              src={photo.src}
              alt={photo.alt}
              caption={photo.caption}
              ratio={1}
            />
          ))}
        </Image.Group>
        <output aria-label="뷰어 상태" className="text-body-b3-regular font-mono">
          {open ? `${index + 1}번째 장을 연다` : '닫힘'}
        </output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '사진을 누르거나 Tab 으로 가서 Enter, Space 를 누르면 그 장부터 뷰어가 열립니다. 지금 보는 장은 `value` / `onValueChange`, 열림은 `open` / `onOpenChange` 로 제어합니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('list', { name: '풍경 사진' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(PHOTOS.length);
    const third = canvas.getByRole('button', { name: '노을 진 산등성이 크게 보기' });
    await expect(third).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.click(third);
    await expect(canvas.getByLabelText('뷰어 상태')).toHaveTextContent('3번째 장을 연다');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: '노을 진 산등성이 크게 보기' })).toHaveAttribute(
        'aria-expanded',
        'true',
      ),
    );
  },
};

export const Decorative: Story = {
  render: () => (
    <div className="flex max-w-xs items-center gap-3">
      <div className="w-16 shrink-0">
        <Image src={PHOTO} alt="" ratio={1} />
      </div>
      <p className="text-body-b3-regular">아침의 호수. 해가 막 떠오른 호수의 풍경입니다.</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '바로 옆 글이 이미 설명하는 그림은 `alt=""` 로 장식임을 알립니다. 스크린 리더가 건너뜁니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('img')).toBeNull();
  },
};
