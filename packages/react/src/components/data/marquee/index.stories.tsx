import { useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';

import { Marquee } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const directions = ['start', 'end', 'up', 'down'] as const;
const variants = ['fade', 'plain'] as const;
const sizes = ['standard', 'tiny'] as const;
const speeds = ['slow', 'normal', 'fast', 120] as const;

const PARTNERS = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark'];

const NOTICES = [
  { id: 'enrolment', title: '새 학기 수강신청 안내' },
  { id: 'library', title: '도서관 운영 시간 변경' },
  { id: 'dormitory', title: '기숙사 입사 신청 마감' },
  { id: 'student-id', title: '학생증 재발급 절차 안내' },
];

const STATS = ['재학생 2,400명', '동아리 120개', '연구실 180곳', '올해 행사 64건'];

const logo = (name: string, color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="132" height="32" viewBox="0 0 132 32"><rect width="32" height="32" rx="9" fill="${color}"/><text x="42" y="22" font-family="system-ui, sans-serif" font-size="17" font-weight="700" fill="#52525b">${name}</text></svg>`,
  )}`;

const LOGOS = [
  { name: 'Acme', src: logo('Acme', '#2563eb') },
  { name: 'Globex', src: logo('Globex', '#16a34a') },
  { name: 'Initech', src: logo('Initech', '#dc2626') },
  { name: 'Umbrella', src: logo('Umbrella', '#ca8a04') },
  { name: 'Hooli', src: logo('Hooli', '#7c3aed') },
  { name: 'Stark', src: logo('Stark', '#0891b2') },
];

const isVertical = (direction: Marquee.Direction | undefined) =>
  direction === 'up' || direction === 'down';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const track = (root: Element) => root.querySelector<HTMLElement>('[data-marquee-track]')!;
const content = (root: Element) => root.querySelector<HTMLElement>('[data-marquee-content]')!;
const copy = (root: Element) => root.querySelector<HTMLElement>('[data-marquee-copy]');
const playState = (root: Element) => getComputedStyle(track(root)).animationPlayState;
const duration = (root: Element) =>
  parseFloat((root as HTMLElement).style.getPropertyValue('--marquee-duration'));

const meta = {
  title: 'Data/Marquee',
  component: Marquee,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'radio', options: directions },
    speed: { control: 'select', options: speeds },
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
  },
  args: {
    'aria-label': '함께하는 단체',
    direction: 'start',
    speed: 'normal',
    variant: 'fade',
    size: 'standard',
    onPlayingChange: fn(),
  },
  render: (args) => (
    <Marquee {...args} className={isVertical(args.direction) ? 'h-48 w-80' : undefined}>
      {PARTNERS.map((name) => (
        <Marquee.Item key={name} className="text-body-b1-semibold text-neutral">
          {name}
        </Marquee.Item>
      ))}
      <Marquee.Pause />
    </Marquee>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Marquee 는 운영체제의 동작 줄이기(`prefers-reduced-motion`)를 따릅니다. 동작 줄이기를 켜 두면 모든 스토리가 흐르지 않고 항목을 줄바꿈한 모습으로 보입니다.',
      },
    },
  },
} satisfies Meta<typeof Marquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <Marquee aria-label="함께하는 단체" className="gap-12">
      {LOGOS.map((partner) => (
        <img key={partner.name} src={partner.src} alt={partner.name} className="h-8" />
      ))}
      <Marquee.Pause />
    </Marquee>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole('img')).toHaveLength(LOGOS.length);

    const root = canvasElement.querySelector('[data-marquee]')!;
    if (prefersReducedMotion()) {
      await waitFor(() => expect(copy(root)).toBeNull());
      return;
    }
    await expect(copy(root)?.querySelectorAll('img')).toHaveLength(LOGOS.length);
    await expect(copy(root)).toHaveAttribute('aria-hidden', 'true');
    await expect(copy(root)).toHaveAttribute('inert');
  },
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Direction"
        description="모두 멈춘 채로 그렸습니다. start 는 글이 시작하는 쪽으로, end 는 그 반대로 흐르고, up 과 down 은 세로 띠입니다."
      >
        {directions.map((direction) => (
          <Showcase.Row key={direction} label={direction}>
            <Marquee
              aria-label={direction}
              direction={direction}
              defaultPlaying={false}
              className={isVertical(direction) ? 'h-40 w-80 gap-3' : 'w-80'}
            >
              {PARTNERS.map((name) => (
                <Marquee.Item key={name} className="text-body-b1-semibold text-neutral">
                  {name}
                </Marquee.Item>
              ))}
            </Marquee>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Variant"
        description="fade 는 양 끝을 mask-image 로 흐리게 합니다. 배경색을 몰라도 어느 표면 위에서나 맞습니다. plain 은 흐리지 않고 잘라 냅니다."
      >
        {variants.map((variant) => (
          <Showcase.Row key={variant} label={variant}>
            <Marquee aria-label={variant} variant={variant} defaultPlaying={false}>
              {PARTNERS.map((name) => (
                <Marquee.Item key={name} className="text-body-b1-semibold text-neutral">
                  {name}
                </Marquee.Item>
              ))}
            </Marquee>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Size"
        description="size 는 멈춤 버튼의 크기입니다. 띠의 높이는 내용이 정합니다."
      >
        {sizes.map((size) => (
          <Showcase.Row key={size} label={size}>
            <Marquee aria-label={size} size={size} defaultPlaying={false}>
              {NOTICES.map((notice) => (
                <Marquee.Item key={notice.id} className="text-body-b3-regular">
                  {notice.title}
                </Marquee.Item>
              ))}
              <Marquee.Pause />
            </Marquee>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Pause"
        description="멈춤 버튼은 Marquee.Pause 를 넣을 때만 그려집니다."
      >
        <Showcase.Row label="Marquee.Pause outline">
          <Marquee aria-label="outline pause" defaultPlaying={false}>
            {PARTNERS.map((name) => (
              <Marquee.Item key={name} className="text-body-b1-semibold text-neutral">
                {name}
              </Marquee.Item>
            ))}
            <Marquee.Pause variant="outline" />
          </Marquee>
        </Showcase.Row>
        <Showcase.Row label="no Marquee.Pause">
          <Marquee aria-label="no pause" defaultPlaying={false}>
            {PARTNERS.map((name) => (
              <Marquee.Item key={name} className="text-body-b1-semibold text-neutral">
                {name}
              </Marquee.Item>
            ))}
          </Marquee>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const LetReadersPauseTheFlow: Story = {
  render: () => (
    <Marquee aria-label="공지" className="gap-10">
      {NOTICES.map((notice) => (
        <Marquee.Item key={notice.id} className="text-body-b2-medium">
          {notice.title}
        </Marquee.Item>
      ))}
      <Marquee.Pause />
    </Marquee>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '5초 넘게 움직이는 내용에는 `Marquee.Pause` 를 넣어 멈춤 버튼을 그립니다(WCAG 2.2.2). 누르면 다시 누를 때까지 멈추고, 버튼은 "일시 정지, 눌림" 으로 읽힙니다. 동작 줄이기에서는 흐르지 않으므로 버튼도 그리지 않습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const root = () => canvasElement.querySelector('[data-marquee]')!;
    const pause = () => canvas.getByRole('button', { name: '일시 정지' });

    if (prefersReducedMotion()) {
      await waitFor(() => expect(canvas.queryByRole('button')).toBeNull());
      await expect(root()).toHaveAttribute('data-paused');
      return;
    }

    await expect(pause()).toHaveAttribute('aria-pressed', 'false');
    await expect(root()).toHaveAttribute('data-playing');

    await userEvent.click(pause());
    await expect(pause()).toHaveAttribute('aria-pressed', 'true');
    await expect(root()).toHaveAttribute('data-paused');
    await waitFor(() => expect(playState(root())).toBe('paused'));

    await userEvent.click(pause());
    await expect(pause()).toHaveAttribute('aria-pressed', 'false');
    await expect(root()).toHaveAttribute('data-playing');
  },
};

export const RunATickerOfLinks: Story = {
  render: () => (
    <Marquee aria-label="공지" className="gap-10">
      {NOTICES.map((notice) => (
        <Marquee.Item key={notice.id} asChild>
          <a
            href={`#${notice.id}`}
            className="focus-ring rounded-standard text-body-b2-medium underline-offset-4 hover:underline"
          >
            {notice.title}
          </a>
        </Marquee.Item>
      ))}
      <Marquee.Pause />
    </Marquee>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '항목을 `Marquee.Item asChild` 로 링크에 입힙니다. 포인터를 올리거나 키보드 포커스가 안에 있는 동안 늘 잠시 멈추고, 포인터나 포커스가 나가면 다시 흐릅니다. 복제본은 `inert` 라 Tab 은 링크마다 한 번만 멈추고, 포커스를 받은 링크는 띠 가운데로 옮겨집니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const links = canvas.getAllByRole('link');
    await expect(links).toHaveLength(NOTICES.length);

    const first = links[0]!;
    first.focus();
    await expect(first).toHaveFocus();

    canvasElement.querySelector<HTMLElement>('[data-marquee-copy] a')?.focus();
    await expect(first).toHaveFocus();
    await expect(canvas.getByRole('group', { name: '공지' })).toHaveAttribute(
      prefersReducedMotion() ? 'data-paused' : 'data-playing',
    );
  },
};

export const ControlPlayingFromOutside: Story = {
  render: function Render() {
    const [playing, setPlaying] = useState(true);

    return (
      <div className="flex w-full flex-col gap-3">
        <Marquee aria-label="고객사" playing={playing} onPlayingChange={setPlaying}>
          {PARTNERS.map((name) => (
            <Marquee.Item key={name} className="text-body-b1-semibold text-neutral">
              {name}
            </Marquee.Item>
          ))}
          <Marquee.Pause />
        </Marquee>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="tiny" onClick={() => setPlaying(!playing)}>
            {playing ? '모두 멈추기' : '다시 흐르기'}
          </Button>
          <span className="text-body-b3-regular text-neutral">
            {playing ? '흐르는 중' : '멈춤'}
          </span>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`playing` 과 `onPlayingChange` 로 제어합니다. 멈춤 버튼도 `onPlayingChange` 를 부르므로 바깥 상태와 어긋나지 않습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const root = () => canvasElement.querySelector('[data-marquee]')!;

    await userEvent.click(canvas.getByRole('button', { name: '모두 멈추기' }));
    await expect(root()).toHaveAttribute('data-paused');
    await expect(canvas.getByText('멈춤')).toBeVisible();
    if (prefersReducedMotion()) return;

    await expect(canvas.getByRole('button', { name: '일시 정지' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(canvas.getByRole('button', { name: '일시 정지' }));
    await expect(root()).toHaveAttribute('data-playing');
    await expect(canvas.getByText('흐르는 중')).toBeVisible();
  },
};

export const ChooseASpeed: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-4">
      {speeds.map((speed) => (
        <Marquee key={speed} aria-label={`speed ${speed}`} speed={speed}>
          {PARTNERS.map((name) => (
            <Marquee.Item key={name} className="text-body-b1-semibold text-neutral">
              {name}
            </Marquee.Item>
          ))}
        </Marquee>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`speed` 는 초당 px 입니다. `slow` 25, `normal` 50, `fast` 100 이고 숫자도 받습니다. 한 바퀴 시간은 내용 길이를 재서 정하므로, 항목 수가 달라도 같은 속도로 읽힙니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const [slow, normal, fast, custom] = [...canvasElement.querySelectorAll('[data-marquee]')];

    await waitFor(() => expect(duration(slow!) / duration(fast!)).toBeCloseTo(4, 1));
    await expect(duration(normal!) / duration(fast!)).toBeCloseTo(2, 1);
    await expect(duration(fast!) / duration(custom!)).toBeCloseTo(1.2, 1);
  },
};

export const FlowNumbersDownAColumn: Story = {
  render: () => (
    <Marquee aria-label="숫자로 보는 학교" direction="down" className="h-40 w-72 gap-4 text-center">
      {STATS.map((stat) => (
        <Marquee.Item key={stat} className="text-body-b1-semibold">
          {stat}
        </Marquee.Item>
      ))}
    </Marquee>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`direction="up"` 이나 `"down"` 은 세로 띠입니다. 높이를 정해 주고(`h-40`), 페이드도 위아래 끝에 걸립니다. 이 띠는 아래로 흐릅니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-marquee]')!;

    await expect(root).toHaveAttribute('data-orientation', 'vertical');
    await expect(root).toHaveAttribute('data-direction', 'down');
    await expect(getComputedStyle(content(root)).flexDirection).toBe('column');
    if (prefersReducedMotion()) return;

    await expect(getComputedStyle(track(root)).animationDirection).toBe('reverse');
    await expect(root.getBoundingClientRect().height).toBe(160);
  },
};

export const RunTwoRowsInOppositeDirections: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-4">
      <Marquee aria-label="함께하는 단체" className="gap-12">
        {LOGOS.slice(0, 3).map((partner) => (
          <img key={partner.name} src={partner.src} alt={partner.name} className="h-8" />
        ))}
        <Marquee.Pause />
      </Marquee>
      <Marquee aria-label="후원하는 단체" direction="end" className="gap-12">
        {LOGOS.slice(3).map((partner) => (
          <img key={partner.name} src={partner.src} alt={partner.name} className="h-8" />
        ))}
        <Marquee.Pause />
      </Marquee>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '두 줄을 `direction="start"` 와 `"end"` 로 반대 방향으로 흘립니다. 각 줄이 자기 이름과 멈춤 버튼을 가집니다. 내용이 띠보다 짧으면 항목 사이를 벌려 띠를 채웁니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const [first, second] = [
      canvas.getByRole('group', { name: '함께하는 단체' }),
      canvas.getByRole('group', { name: '후원하는 단체' }),
    ];

    await expect(first).toHaveAttribute('data-direction', 'start');
    await expect(second).toHaveAttribute('data-direction', 'end');
    if (prefersReducedMotion()) return;

    await expect(getComputedStyle(track(first)).animationDirection).toBe('normal');
    await expect(getComputedStyle(track(second)).animationDirection).toBe('reverse');
    await expect(canvas.getAllByRole('button', { name: '일시 정지' })).toHaveLength(2);
  },
};

export const ReducedMotion: Story = {
  tags: ['verification'],
  render: () => (
    <Marquee aria-label="함께하는 단체" className="w-72">
      {PARTNERS.map((name) => (
        <Marquee.Item key={name} className="text-body-b1-semibold text-neutral">
          {name}
        </Marquee.Item>
      ))}
      <Marquee.Pause />
    </Marquee>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '운영체제의 동작 줄이기를 켜면 흐르지 않고 항목을 줄바꿈해 모두 보여 줍니다. 복제본과 멈춤 버튼은 그리지 않습니다. 설정이 꺼져 있으면 흐르는 띠로 보입니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('[data-marquee]')!;

    if (!prefersReducedMotion()) {
      await expect(root).not.toHaveAttribute('data-reduced-motion');
      await expect(copy(root)).not.toBeNull();
      return;
    }

    const bounds = root.getBoundingClientRect();
    await waitFor(() => expect(root).toHaveAttribute('data-reduced-motion'));
    await expect(root).toHaveAttribute('data-paused');
    await expect(copy(root)).toBeNull();
    await expect(canvas.queryByRole('button')).toBeNull();
    for (const item of root.querySelectorAll('[data-marquee-item]')) {
      const box = item.getBoundingClientRect();
      await expect(box.left >= bounds.left - 1 && box.right <= bounds.right + 1).toBe(true);
    }
    await expect(
      new Set(
        [...root.querySelectorAll('[data-marquee-item]')].map(
          (item) => item.getBoundingClientRect().top,
        ),
      ).size,
    ).toBeGreaterThan(1);
  },
};
