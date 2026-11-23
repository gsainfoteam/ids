import { useId, useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { AspectRatio } from '../../layout/aspect-ratio';
import { Card } from '../card';

import { Carousel, useCarousel } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'ghost', 'soft', 'solid', 'glossy'] as const;
const sizes = ['standard', 'tiny'] as const;

function landscape(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="hsl(${hue} 70% 86%)"/><circle cx="500" cy="92" r="42" fill="hsl(${hue + 40} 90% 70%)"/><path d="M0 260 L150 150 L260 230 L380 120 L520 240 L640 170 L640 360 L0 360Z" fill="hsl(${hue} 35% 48%)"/><path d="M0 300 L200 220 L360 290 L520 230 L640 280 L640 360 L0 360Z" fill="hsl(${hue} 35% 34%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const photos = [
  { id: 'spring', alt: '벚꽃이 핀 산책로', src: landscape(340) },
  { id: 'summer', alt: '여름 바다', src: landscape(200) },
  { id: 'autumn', alt: '단풍 든 언덕', src: landscape(25) },
  { id: 'winter', alt: '눈 덮인 운동장', src: landscape(220) },
  { id: 'night', alt: '불 켜진 기숙사', src: landscape(260) },
];

const products = [
  { id: 'mug', name: '머그컵', price: '₩12,000', hue: 30 },
  { id: 'hoodie', name: '후드 티', price: '₩39,000', hue: 210 },
  { id: 'cap', name: '볼캡', price: '₩18,000', hue: 140 },
  { id: 'tote', name: '에코백', price: '₩15,000', hue: 50 },
  { id: 'sticker', name: '스티커 세트', price: '₩4,000', hue: 300 },
  { id: 'pen', name: '볼펜', price: '₩2,500', hue: 0 },
];

const notices = [
  '수강 신청은 9월 2일에 열립니다',
  '도서관이 밤 10시까지 엽니다',
  '축제 부스를 모집합니다',
];

const meta = {
  title: 'Data/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    size: { control: 'radio', options: sizes },
    carousel: { control: false },
  },
  args: {
    'aria-label': '행사 사진',
    orientation: 'horizontal',
    size: 'standard',
    onValueChange: fn(),
  },
  render: (args) => (
    <div className={args.orientation === 'vertical' ? 'h-80 w-full max-w-md' : 'w-full max-w-md'}>
      <Carousel {...args}>
        <Carousel.Content>
          {photos.map((photo) => (
            <Carousel.Slide key={photo.id}>
              <img src={photo.src} alt={photo.alt} className="aspect-video w-full object-cover" />
            </Carousel.Slide>
          ))}
        </Carousel.Content>
      </Carousel>
    </div>
  ),
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function expectPauseToHold(
  carousel: () => HTMLElement,
  pause: () => HTMLElement,
  paused: boolean,
) {
  await waitFor(() => expect(pause()).toHaveAttribute('aria-pressed', String(paused)));
  if (paused) await expect(carousel()).not.toHaveAttribute('data-playing');
}

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Carousel aria-label="행사 사진">
        <Carousel.Slide>
          <div className="rounded-container text-body-b2-semibold bg-neutral-soft flex aspect-video items-center justify-center">
            봄 축제
          </div>
        </Carousel.Slide>
        <Carousel.Slide>
          <div className="rounded-container text-body-b2-semibold bg-neutral-soft flex aspect-video items-center justify-center">
            여름 캠프
          </div>
        </Carousel.Slide>
        <Carousel.Slide>
          <div className="rounded-container text-body-b2-semibold bg-neutral-soft flex aspect-video items-center justify-center">
            가을 체육대회
          </div>
        </Carousel.Slide>
      </Carousel>
    </div>
  ),
};

export const Gallery: Story = {
  render: function Render() {
    const twoAtOnce = useCarousel({ slides: { perView: 2 } });
    const threeAtOnce = useCarousel({ slides: { perView: 3 } });
    const rotating = useCarousel({ slides: { loop: true }, autoplay: { defaultValue: false } });
    const flowing = useCarousel({
      slides: { perView: 3, loop: true },
      autoScroll: { defaultValue: false },
    });
    const looping = useCarousel({ slides: { loop: true } });

    return (
      <Showcase>
        <Showcase.Section
          title="Size"
          description="size 는 이전, 다음 버튼과 점의 크기입니다. 슬라이드의 폭은 slides.perView 가, 높이는 슬라이드 안의 내용이 정합니다."
        >
          {sizes.map((size) => (
            <Showcase.Row key={size} label={size}>
              <div className="w-96">
                <Carousel aria-label={`${size} 크기`} size={size}>
                  {photos.map((photo) => (
                    <Carousel.Slide key={photo.id}>
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="aspect-video w-full object-cover"
                      />
                    </Carousel.Slide>
                  ))}
                </Carousel>
              </div>
            </Showcase.Row>
          ))}
        </Showcase.Section>

        <Showcase.Section
          title="Slides per view"
          description="useCarousel 의 slides.perView 는 한 번에 보이는 장 수입니다. 장 사이의 간격은 슬라이드 안에서 내용을 감싼 요소의 padding 으로 둡니다."
        >
          <Showcase.Row label="1">
            <div className="w-md">
              <Carousel aria-label="1장씩 보기">
                {products.map((product) => (
                  <Carousel.Slide key={product.id}>
                    <div className="px-1.5">
                      <div className="rounded-container text-body-b2-semibold bg-neutral-soft flex aspect-square items-center justify-center">
                        {product.name}
                      </div>
                    </div>
                  </Carousel.Slide>
                ))}
              </Carousel>
            </div>
          </Showcase.Row>
          <Showcase.Row label="2">
            <div className="w-md">
              <Carousel aria-label="2장씩 보기" carousel={twoAtOnce}>
                {products.map((product) => (
                  <Carousel.Slide key={product.id}>
                    <div className="px-1.5">
                      <div className="rounded-container text-body-b2-semibold bg-neutral-soft flex aspect-square items-center justify-center">
                        {product.name}
                      </div>
                    </div>
                  </Carousel.Slide>
                ))}
              </Carousel>
            </div>
          </Showcase.Row>
          <Showcase.Row label="3">
            <div className="w-md">
              <Carousel aria-label="3장씩 보기" carousel={threeAtOnce}>
                {products.map((product) => (
                  <Carousel.Slide key={product.id}>
                    <div className="px-1.5">
                      <div className="rounded-container text-body-b2-semibold bg-neutral-soft flex aspect-square items-center justify-center">
                        {product.name}
                      </div>
                    </div>
                  </Carousel.Slide>
                ))}
              </Carousel>
            </div>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section
          title="Orientation"
          description="세로는 부모가 높이를 줍니다. 캐러셀이 그 높이를 채우고, 점의 줄을 뺀 만큼이 슬라이드의 높이입니다. 버튼의 화살표는 방향을 따릅니다."
        >
          <Showcase.Row label="horizontal">
            <div className="w-96">
              <Carousel aria-label="가로 공지">
                {notices.map((notice) => (
                  <Carousel.Slide key={notice}>
                    <p className="rounded-container text-body-b3-medium bg-neutral-soft flex h-28 items-center justify-center px-16 text-center">
                      {notice}
                    </p>
                  </Carousel.Slide>
                ))}
              </Carousel>
            </div>
          </Showcase.Row>
          <Showcase.Row label="vertical">
            <div className="h-52 w-96">
              <Carousel aria-label="세로 공지" orientation="vertical">
                {notices.map((notice) => (
                  <Carousel.Slide key={notice}>
                    <p className="rounded-container text-body-b3-medium bg-neutral-soft flex h-full items-center justify-center px-6 text-center">
                      {notice}
                    </p>
                  </Carousel.Slide>
                ))}
              </Carousel>
            </div>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section
          title="Control variant"
          description="Carousel.Prev 와 Carousel.Next 는 IconButton 의 variant 를 받습니다. 기본은 outline 입니다."
        >
          {variants.map((variant) => (
            <Showcase.Row key={variant} label={variant}>
              <div className="w-80">
                <Carousel aria-label={`${variant} 버튼`}>
                  <Carousel.Content>
                    {photos.map((photo) => (
                      <Carousel.Slide key={photo.id}>
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="aspect-video w-full object-cover"
                        />
                      </Carousel.Slide>
                    ))}
                  </Carousel.Content>
                  <div className="flex items-center justify-between">
                    <Carousel.Prev variant={variant} />
                    <Carousel.Indicators />
                    <Carousel.Next variant={variant} />
                  </div>
                </Carousel>
              </div>
            </Showcase.Row>
          ))}
        </Showcase.Section>

        <Showcase.Section
          title="Motion"
          description="autoplay 는 한 장씩 넘기고 autoScroll 은 멈추지 않고 흐릅니다. 둘 다 Carousel.Pause 가 함께 그려집니다. 여기서는 멈춘 모습입니다."
        >
          <Showcase.Row label="autoplay">
            <div className="w-96">
              <Carousel aria-label="자동 넘김" carousel={rotating}>
                {photos.map((photo) => (
                  <Carousel.Slide key={photo.id}>
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="aspect-video w-full object-cover"
                    />
                  </Carousel.Slide>
                ))}
              </Carousel>
            </div>
          </Showcase.Row>
          <Showcase.Row label="autoScroll">
            <div className="w-96">
              <Carousel aria-label="흐르는 상품" carousel={flowing}>
                {products.map((product) => (
                  <Carousel.Slide key={product.id}>
                    <div className="px-1.5">
                      <div className="rounded-container text-body-b3-medium bg-neutral-soft flex aspect-square items-center justify-center">
                        {product.name}
                      </div>
                    </div>
                  </Carousel.Slide>
                ))}
              </Carousel>
            </div>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section title="States">
          <Showcase.Row label="last slide">
            <div className="w-80">
              <Carousel aria-label="마지막 장" defaultValue={photos.length - 1}>
                {photos.map((photo) => (
                  <Carousel.Slide key={photo.id}>
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="aspect-video w-full object-cover"
                    />
                  </Carousel.Slide>
                ))}
              </Carousel>
            </div>
          </Showcase.Row>
          <Showcase.Row label="loop">
            <div className="w-80">
              <Carousel aria-label="처음과 끝이 이어진 사진" carousel={looping}>
                {photos.map((photo) => (
                  <Carousel.Slide key={photo.id}>
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="aspect-video w-full object-cover"
                    />
                  </Carousel.Slide>
                ))}
              </Carousel>
            </div>
          </Showcase.Row>
          <Showcase.Row label="one slide">
            <div className="w-80">
              <Carousel aria-label="한 장">
                <Carousel.Slide>
                  <img
                    src={photos[0].src}
                    alt={photos[0].alt}
                    className="aspect-video w-full object-cover"
                  />
                </Carousel.Slide>
              </Carousel>
            </div>
          </Showcase.Row>
        </Showcase.Section>
      </Showcase>
    );
  },
};

export const JumpToASlideFromOutside: Story = {
  render: function Render() {
    const [index, setIndex] = useState(2);

    return (
      <div className="flex w-full max-w-md flex-col gap-3">
        <Carousel aria-label="행사 사진" value={index} onValueChange={setIndex}>
          {photos.map((photo) => (
            <Carousel.Slide key={photo.id}>
              <img src={photo.src} alt={photo.alt} className="aspect-video w-full object-cover" />
            </Carousel.Slide>
          ))}
        </Carousel>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIndex(0)}>
            처음으로
          </Button>
          <p className="text-body-b3-regular text-neutral">지금 {photos[index].alt}</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`value` 와 `onValueChange` 로 지금 자리를 앱이 쥡니다. 값은 멈추는 자리(스냅)의 번호이고 0부터 셉니다. 끌기, 버튼, 키, 자동 넘김이 모두 `onValueChange` 로 알립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText('지금 단풍 든 언덕')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '다음 슬라이드' }));
    await expect(canvas.getByText('지금 눈 덮인 운동장')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '처음으로' }));
    await expect(canvas.getByRole('group', { name: '5장 중 1번째' })).toHaveAttribute(
      'data-selected',
    );
    await expect(canvas.getByRole('button', { name: '이전 슬라이드' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

export const ShowSeveralCardsAtOnce: Story = {
  render: function Render() {
    const carousel = useCarousel({ slides: { perView: 3, toScroll: 'auto' } });

    return (
      <div className="w-full max-w-2xl">
        <Carousel aria-label="추천 상품" carousel={carousel}>
          {products.map((product) => (
            <Carousel.Slide key={product.id}>
              <div className="px-2">
                <Card>
                  <Card.Media>
                    <AspectRatio ratio={1}>
                      <img src={landscape(product.hue)} alt="" />
                    </AspectRatio>
                  </Card.Media>
                  <Card.Header>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Description>{product.price}</Card.Description>
                  </Card.Header>
                </Card>
              </div>
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "`useCarousel` 의 `slides.perView` 는 한 번에 보이는 장 수, `slides.toScroll` 은 한 번에 넘기는 장 수입니다. `toScroll: 'auto'` 면 보이는 만큼 넘기고, 점은 넘기는 묶음마다 하나입니다. 결과는 `carousel` 로 넘깁니다. 장 사이의 간격은 슬라이드 안에서 카드를 감싼 `div` 의 padding 입니다.",
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByRole('button', { name: /번째 슬라이드로$/ })).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: '다음 슬라이드' }));
    await expect(canvas.getByRole('button', { name: '4번째 슬라이드로' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await expect(canvas.getByRole('group', { name: '6장 중 6번째' })).not.toHaveAttribute('inert');
  },
};

export const ConnectTheEnds: Story = {
  render: function Render(args) {
    const carousel = useCarousel({ slides: { loop: true } });

    return (
      <div className="w-full max-w-md">
        <Carousel {...args} carousel={carousel}>
          {photos.map((photo) => (
            <Carousel.Slide key={photo.id}>
              <img src={photo.src} alt={photo.alt} className="aspect-video w-full object-cover" />
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`slides.loop` 면 끝에서 처음으로, 처음에서 끝으로 이어집니다. 이전과 다음 버튼이 비활성이 되지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const previous = canvas.getByRole('button', { name: '이전 슬라이드' });
    await expect(previous).not.toHaveAttribute('aria-disabled');
    await userEvent.click(previous);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(4);
    await userEvent.click(canvas.getByRole('button', { name: '다음 슬라이드' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(0);
  },
};

export const RotateABanner: Story = {
  render: function Render() {
    const carousel = useCarousel({ slides: { loop: true }, autoplay: { delay: 5000 } });

    return (
      <div className="w-full max-w-md">
        <Carousel aria-label="공지 배너" carousel={carousel}>
          {notices.map((notice) => (
            <Carousel.Slide key={notice}>
              <p className="rounded-container text-body-b3-medium bg-neutral-soft flex h-32 items-center justify-center px-16 text-center">
                {notice}
              </p>
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`autoplay` 를 주면 `delay`(기본 4초)마다 다음 장으로 넘깁니다. 5초 넘게 움직이는 내용이라 멈춤 버튼(`Carousel.Pause`)이 함께 그려집니다(WCAG 2.2.2). 포인터를 올리거나, 키보드로 안에 들어오거나, 끄는 동안은 잠깐 멈추고, 멈춤 버튼으로 멈추면 다시 누를 때까지 멈춰 있습니다. 동작 줄이기를 켠 사용자에게는 멈춘 채로 시작합니다. 넘기는지는 `autoplay` 의 `value` / `defaultValue` / `onValueChange` 로 앱이 쥘 수 있습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const carousel = () => canvas.getByRole('region', { name: '공지 배너' });
    const pause = () => canvas.getByRole('button', { name: '자동 넘김 멈춤' });
    const startsPaused = prefersReducedMotion();

    await expectPauseToHold(carousel, pause, startsPaused);

    await userEvent.click(pause());
    await expectPauseToHold(carousel, pause, !startsPaused);

    await userEvent.click(pause());
    await expectPauseToHold(carousel, pause, startsPaused);
  },
};

export const FlowLogosWithoutStopping: Story = {
  render: function Render() {
    const carousel = useCarousel({
      slides: { perView: 3, loop: true },
      autoScroll: { speed: 1 },
    });

    return (
      <div className="w-full max-w-2xl">
        <Carousel aria-label="후원 단체" carousel={carousel}>
          {products.map((product) => (
            <Carousel.Slide key={product.id}>
              <div className="px-1.5">
                <div className="rounded-container text-body-b3-medium bg-neutral-soft flex h-20 items-center justify-center">
                  {product.name}
                </div>
              </div>
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`autoScroll` 을 주면 멈추지 않고 흐릅니다. `speed` 는 한 프레임에 움직이는 픽셀(기본 2), `direction` 은 `forward`(기본) 또는 `backward` 입니다. 멈춤과 잠깐 멈춤은 `autoplay` 와 같습니다. `slides.loop` 없이 끝에 닿으면 멈춤 상태가 되고, 다시 누르면 처음부터 흐릅니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const carousel = () => canvas.getByRole('region', { name: '후원 단체' });
    const pause = () => canvas.getByRole('button', { name: '자동 넘김 멈춤' });
    const startsPaused = prefersReducedMotion();

    await expectPauseToHold(carousel, pause, startsPaused);

    await userEvent.click(pause());
    await expectPauseToHold(carousel, pause, !startsPaused);

    await userEvent.click(pause());
    await expectPauseToHold(carousel, pause, startsPaused);
  },
};

export const StackNoticesVertically: Story = {
  render: () => (
    <div className="h-52 w-full max-w-sm">
      <Carousel aria-label="오늘의 공지" orientation="vertical">
        {notices.map((notice) => (
          <Carousel.Slide key={notice}>
            <p className="rounded-container text-body-b3-medium bg-neutral-soft flex h-full items-center justify-center px-6 text-center">
              {notice}
            </p>
          </Carousel.Slide>
        ))}
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`orientation="vertical"` 이면 위아래로 넘기고 `↑` `↓` 로 옮깁니다. 세로는 캐러셀을 감싼 부모가 높이를 주고, 캐러셀이 그 높이를 채웁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '다음 슬라이드' }));
    await expect(canvas.getByRole('group', { name: '3장 중 2번째' })).toHaveAttribute(
      'data-selected',
    );
    await userEvent.click(canvas.getByRole('button', { name: '2번째 슬라이드로' }));
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('button', { name: '3번째 슬라이드로' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: '3번째 슬라이드로' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  },
};

export const PlaceYourOwnControls: Story = {
  render: function Render() {
    const titleId = useId();
    const [index, setIndex] = useState(0);
    const carousel = useCarousel({ slides: { perView: 3, loop: true } });

    return (
      <div className="w-full max-w-2xl">
        <Carousel
          aria-labelledby={titleId}
          value={index}
          onValueChange={setIndex}
          carousel={carousel}
        >
          <div className="flex items-center justify-between">
            <h2 id={titleId} className="text-headline-h4-bold">
              추천 상품
            </h2>
            <div className="flex gap-2">
              <Carousel.Prev />
              <Carousel.Next />
            </div>
          </div>
          <Carousel.Content>
            {products.map((product) => (
              <Carousel.Slide key={product.id}>
                <div className="px-2">
                  <Card>
                    <Card.Media>
                      <AspectRatio ratio={1}>
                        <img src={landscape(product.hue)} alt="" />
                      </AspectRatio>
                    </Card.Media>
                    <Card.Header>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Description>{product.price}</Card.Description>
                    </Card.Header>
                  </Card>
                </div>
              </Carousel.Slide>
            ))}
          </Carousel.Content>
          <Carousel.Indicators />
        </Carousel>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '파트를 직접 두면 그 자리에 그립니다. `Carousel.Prev`, `Carousel.Next`, `Carousel.Indicators` 중 하나라도 두면 기본 버튼과 점은 그리지 않습니다. 보이는 제목이 있으면 `aria-labelledby` 로 이름을 잇습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('region', { name: '추천 상품' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('button', { name: '다음 슬라이드' })).toHaveLength(1);
    await userEvent.click(canvas.getByRole('button', { name: '다음 슬라이드' }));
    await expect(canvas.getByRole('button', { name: '2번째 슬라이드로' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  },
};

export const Keyboard: Story = {
  tags: ['verification'],
  parameters: {
    docs: {
      description: {
        story:
          '포커스가 캐러셀 안에 있을 때 `←` `→` 는 이전과 다음 장으로, `Home` `End` 는 처음과 끝으로 옮깁니다. 점에서 누르면 포커스가 새 현재 점을 따라가고, 이전과 다음 버튼에서 누르면 그 버튼에 남습니다. 화면 밖 슬라이드는 `inert` 라서 `Tab` 은 보이는 슬라이드 안의 요소로만 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '1번째 슬라이드로' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(1);
    await expect(canvas.getByRole('button', { name: '2번째 슬라이드로' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('button', { name: '5번째 슬라이드로' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await userEvent.keyboard('{Home}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(0);
    await expect(canvas.getByRole('group', { name: '5장 중 1번째' })).toHaveAttribute(
      'data-selected',
    );
  },
};

export const RightToLeft: Story = {
  tags: ['verification'],
  render: () => (
    <div dir="rtl" className="w-full max-w-md">
      <Carousel aria-label="행사 사진">
        {photos.map((photo) => (
          <Carousel.Slide key={photo.id}>
            <img src={photo.src} alt={photo.alt} className="aspect-video w-full object-cover" />
          </Carousel.Slide>
        ))}
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '오른쪽에서 왼쪽으로 쓰는 화면에서는 첫 장이 오른쪽에 있고, `←` 가 다음 장, `→` 가 이전 장입니다. 이전과 다음 버튼의 화살표도 뒤집힙니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '1번째 슬라이드로' }));
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('button', { name: '2번째 슬라이드로' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: '1번째 슬라이드로' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  },
};
