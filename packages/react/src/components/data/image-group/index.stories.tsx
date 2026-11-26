import { useState } from 'react';

import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { AspectRatio } from '../../layout/aspect-ratio';
import { Image } from '../image';

import { ImageGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

function scene(hue: number, width = 640, height = 480) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 80%)"/><stop offset="1" stop-color="hsl(${hue} 60% 94%)"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#sky)"/><circle cx="${width * 0.72}" cy="${height * 0.3}" r="${height * 0.1}" fill="hsl(${(hue + 40) % 360} 90% 68%)"/><path d="M0 ${height} L${width * 0.28} ${height * 0.46} L${width * 0.52} ${height * 0.74} L${width * 0.74} ${height * 0.5} L${width} ${height} Z" fill="hsl(${hue} 32% 38%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PHOTOS = [
  { id: 'lake', hue: 200, alt: '호수 위로 뜬 해', caption: '아침의 호수' },
  { id: 'field', hue: 95, alt: '초록 들판 너머의 산', caption: '여름 들판' },
  { id: 'dusk', hue: 20, alt: '노을 진 산등성이', caption: '해 질 녘' },
  { id: 'snow', hue: 225, alt: '눈 덮인 봉우리', caption: '겨울 산' },
  { id: 'dune', hue: 40, alt: '모래 언덕과 해', caption: '사막' },
  { id: 'forest', hue: 140, alt: '숲 위로 뜬 해', caption: '숲' },
].map((photo) => ({ ...photo, src: scene(photo.hue) }));

const layouts = ['row', 'column', 'grid'] as const;

const VIEWER = '사진 보기';

const meta = {
  title: 'Data/ImageGroup',
  component: ImageGroup,
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'radio', options: layouts },
    loop: { control: 'boolean' },
  },
  args: { layout: 'grid', 'aria-label': '풍경 사진' },
  render: (args) => (
    <div className="max-w-md">
      <ImageGroup {...args}>
        {PHOTOS.map((photo) => (
          <AspectRatio key={photo.id} ratio={1}>
            <Image src={photo.src} alt={photo.alt}>
              <Image.Caption>{photo.caption}</Image.Caption>
            </Image>
          </AspectRatio>
        ))}
      </ImageGroup>
    </div>
  ),
} satisfies Meta<typeof ImageGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <div className="max-w-md">
      <ImageGroup aria-label="풍경 사진">
        {PHOTOS.slice(0, 3).map((photo) => (
          <AspectRatio key={photo.id} ratio={1}>
            <Image src={photo.src} alt={photo.alt} />
          </AspectRatio>
        ))}
      </ImageGroup>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Layout"
        description="ImageGroup 은 사진을 가로, 세로, 격자로 늘어놓고, 누르면 그 장부터 크게 봅니다."
      >
        <Showcase.Row label="row">
          <div className="w-full max-w-md">
            <ImageGroup layout="row" aria-label="풍경 사진">
              {PHOTOS.slice(0, 3).map((photo) => (
                <AspectRatio key={photo.id} ratio={1}>
                  <Image src={photo.src} alt={photo.alt} />
                </AspectRatio>
              ))}
            </ImageGroup>
          </div>
        </Showcase.Row>
        <Showcase.Row label="column">
          <div className="w-40">
            <ImageGroup layout="column" aria-label="풍경 사진">
              {PHOTOS.slice(3, 5).map((photo) => (
                <AspectRatio key={photo.id} ratio={16 / 9}>
                  <Image src={photo.src} alt={photo.alt} />
                </AspectRatio>
              ))}
            </ImageGroup>
          </div>
        </Showcase.Row>
        <Showcase.Row label="grid">
          <div className="w-full max-w-md">
            <ImageGroup layout="grid" aria-label="풍경 사진">
              {PHOTOS.map((photo) => (
                <AspectRatio key={photo.id} ratio={1}>
                  <Image src={photo.src} alt={photo.alt}>
                    <Image.Caption>{photo.caption}</Image.Caption>
                  </Image>
                </AspectRatio>
              ))}
            </ImageGroup>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const OpenTheViewerFromOutside: Story = {
  render: function Render() {
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);

    return (
      <div className="flex max-w-md flex-col gap-3">
        <ImageGroup
          layout="grid"
          value={index}
          onValueChange={setIndex}
          open={open}
          onOpenChange={setOpen}
          aria-label="풍경 사진"
        >
          {PHOTOS.map((photo) => (
            <AspectRatio key={photo.id} ratio={1}>
              <Image src={photo.src} alt={photo.alt}>
                <Image.Caption>{photo.caption}</Image.Caption>
              </Image>
            </AspectRatio>
          ))}
        </ImageGroup>
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
    const third = () => canvas.getByLabelText('노을 진 산등성이 크게 보기');
    const status = () => canvas.getByLabelText('뷰어 상태');

    await expect(canvas.getByRole('list', { name: '풍경 사진' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(PHOTOS.length);
    await expect(third()).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.click(third());
    await canvas.findByRole('dialog', { name: VIEWER });
    await expect(status()).toHaveTextContent('3번째 장을 연다');
    await waitFor(() => expect(third()).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(status()).toHaveTextContent('4번째 장을 연다'));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(status()).toHaveTextContent('닫힘'));
    await waitFor(() => expect(third()).toHaveFocus());
  },
};
