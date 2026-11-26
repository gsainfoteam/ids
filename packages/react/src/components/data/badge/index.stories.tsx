import { useState } from 'react';

import { BellIcon, EnvelopeIcon, InboxIcon } from '@heroicons/react/24/outline';
import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Toggle } from '../../action/toggle';
import { IdsProvider } from '../../utility/ids-provider';
import { Avatar } from '../avatar';
import { Card } from '../card';
import { Item } from '../item';

import { Badge } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['solid', 'soft', 'outline'] as const;
const colorSchemes = [
  'danger',
  'neutral',
  'primary',
  'secondary',
  'tertiary',
  'success',
  'warning',
  'info',
] as const;
const placements = ['top-end', 'top-start', 'bottom-end', 'bottom-start'] as const;

const Box = () => <div className="rounded-standard bg-neutral-soft size-10" />;

const meta = {
  title: 'Data/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    colorScheme: { control: 'select', options: colorSchemes },
    placement: { control: 'radio', options: placements },
    size: { control: 'radio', options: ['standard', 'tiny'] },
  },
  args: {
    variant: 'solid',
    colorScheme: 'danger',
    size: 'standard',
    placement: 'top-end',
    children: <BellIcon className="size-7" />,
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

type BadgePlaygroundArgs = Omit<Badge.Props, 'children'> & {
  indicatorCount?: number;
  indicatorMax?: number;
  indicatorLabel?: string;
};

export const Playground: StoryObj<BadgePlaygroundArgs> = {
  args: { indicatorCount: 3, indicatorMax: 99, indicatorLabel: '' },
  argTypes: {
    indicatorCount: {
      name: 'count',
      control: 'number',
      table: { category: 'Badge.Indicator' },
    },
    indicatorMax: { name: 'max', control: 'number', table: { category: 'Badge.Indicator' } },
    indicatorLabel: {
      name: 'aria-label',
      control: 'text',
      table: { category: 'Badge.Indicator' },
    },
  },
  render: ({ indicatorCount, indicatorMax, indicatorLabel, ...args }) => (
    <Badge {...args}>
      <BellIcon className="size-7" />
      <Badge.Indicator
        count={indicatorCount}
        max={indicatorMax}
        aria-label={indicatorLabel || undefined}
      />
    </Badge>
  ),
};

export const Usage: Story = {
  render: () => (
    <Badge>
      <IconButton aria-label="알림" variant="outline" icon={<BellIcon />} />
      <Badge.Indicator count={3} aria-label="읽지 않은 알림 3개" />
    </Badge>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Color scheme">
        <Showcase.Matrix
          rows={colorSchemes}
          columns={variants}
          render={(colorScheme, variant) => (
            <div className="flex items-center gap-6">
              <Badge variant={variant} colorScheme={colorScheme}>
                <Box />
                <Badge.Indicator count={5} />
              </Badge>
              <Badge variant={variant} colorScheme={colorScheme}>
                <Box />
                <Badge.Indicator count={128} />
              </Badge>
              <Badge variant={variant} colorScheme={colorScheme}>
                <Box />
                <Badge.Indicator count={7} />
              </Badge>
              <Badge variant={variant} colorScheme={colorScheme}>
                <Box />
                <Badge.Indicator />
              </Badge>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Placement"
        description="모서리 위치는 논리 방향입니다. end는 오른쪽에서 왼쪽으로 쓰는 문서에서 왼쪽입니다."
      >
        <Showcase.Row label="ltr" className="gap-10 py-3">
          {placements.map((placement) => (
            <Badge key={placement} placement={placement}>
              <Box />
              <Badge.Indicator count={9} />
            </Badge>
          ))}
        </Showcase.Row>
        <Showcase.Row label="rtl">
          <div dir="rtl" className="flex gap-10 py-3">
            {placements.map((placement) => (
              <Badge key={placement} placement={placement}>
                <Box />
                <Badge.Indicator count={9} />
              </Badge>
            ))}
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Wrapped corner"
        description="Badge가 감싼 요소의 모서리를 재서 그 곡선 위에 붙습니다."
      >
        <Showcase.Row label="avatar">
          <Badge>
            <Avatar name="Alice Kim" />
            <Badge.Indicator count={3} />
          </Badge>
          <Badge colorScheme="success" placement="bottom-end">
            <Avatar name="Bob Lee" />
            <Badge.Indicator aria-label="온라인" />
          </Badge>
        </Showcase.Row>
        <Showcase.Row label="icon button">
          <Badge>
            <IconButton aria-label="알림" variant="outline" icon={<BellIcon />} />
            <Badge.Indicator count={3} />
          </Badge>
          <Badge>
            <IconButton aria-label="받은 편지함" variant="soft" icon={<InboxIcon />} />
            <Badge.Indicator />
          </Badge>
        </Showcase.Row>
        <Showcase.Row label="card">
          <Badge colorScheme="primary">
            <Card variant="outline">
              <Card.Header>
                <Card.Title>새 공지</Card.Title>
                <Card.Description>오늘 올라온 글</Card.Description>
              </Card.Header>
            </Card>
            <Badge.Indicator>New</Badge.Indicator>
          </Badge>
        </Showcase.Row>
        <Showcase.Row label="rounded-full">
          <Badge>
            <div className="bg-neutral-soft size-10 rounded-full" />
            <Badge.Indicator count={2} />
          </Badge>
          <Badge>
            <div className="bg-neutral-soft h-8 w-20 rounded-full" />
            <Badge.Indicator count={12} />
          </Badge>
        </Showcase.Row>
        <Showcase.Row label="square">
          <Badge>
            <div className="bg-neutral-soft size-10" />
            <Badge.Indicator count={5} />
          </Badge>
        </Showcase.Row>
        <Showcase.Row label="squircle theme">
          <IdsProvider.Scope theme={{ cornerShape: 'squircle', radius: 14 }}>
            <div className="flex gap-6">
              <Badge>
                <IconButton aria-label="알림" variant="outline" icon={<BellIcon />} />
                <Badge.Indicator count={3} />
              </Badge>
              <Badge>
                <Box />
                <Badge.Indicator count={7} />
              </Badge>
            </div>
          </IdsProvider.Scope>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Size">
        <Showcase.Row label="standard">
          <Badge>
            <BellIcon className="size-7" />
            <Badge.Indicator count={3} />
          </Badge>
          <Badge>
            <BellIcon className="size-7" />
            <Badge.Indicator />
          </Badge>
        </Showcase.Row>
        <Showcase.Row label="tiny">
          <Badge size="tiny">
            <BellIcon className="size-5" />
            <Badge.Indicator count={3} />
          </Badge>
          <Badge size="tiny">
            <BellIcon className="size-5" />
            <Badge.Indicator />
          </Badge>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const ShowAnUnreadCount: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Badge>
        <BellIcon className="size-7" />
        <Badge.Indicator count={99} />
      </Badge>
      <Badge>
        <BellIcon className="size-7" />
        <Badge.Indicator count={100} />
      </Badge>
      <Badge>
        <BellIcon className="size-7" />
        <Badge.Indicator count={1200} max={999} />
      </Badge>
      <Badge>
        <BellIcon className="size-7" />
        <Badge.Indicator count={0} />
      </Badge>
      <Badge>
        <BellIcon className="size-7" />
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`Badge.Indicator` 의 `count` 는 `max`(기본 99)를 넘으면 `99+` 가 됩니다. 0도 그대로 그리니, 0일 때 감추려면 Indicator 를 넣지 않습니다. 다시 넣으면 커지며 나타납니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const indicators = [...canvasElement.querySelectorAll('[data-badge-indicator]')];
    await expect(indicators.map((indicator) => indicator.textContent)).toEqual([
      '99',
      '99+',
      '999+',
      '0',
    ]);
    await expect(indicators[1]).toHaveAttribute('data-overflow');
  },
};

export const AnnounceTheCount: Story = {
  render: function Render() {
    const [unread, setUnread] = useState(3);

    return (
      <div className="flex items-center gap-6">
        <Badge>
          <Button variant="outline">
            <EnvelopeIcon />
            받은 편지함
          </Button>
          <Badge.Indicator count={unread} aria-label={`읽지 않은 메일 ${unread}통`} />
        </Badge>
        <Badge size="tiny">
          <IconButton aria-label="알림" variant="ghost" icon={<BellIcon />} />
          {unread > 0 && <Badge.Indicator count={unread} />}
        </Badge>
        <Button size="tiny" onClick={() => setUnread((count) => count + 1)}>
          새 메일
        </Button>
        <Button size="tiny" variant="outline" onClick={() => setUnread(0)}>
          모두 읽음
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`Badge.Indicator` 에 `aria-label` 을 주면 live region이 되어 바뀔 때마다 그 문장을 읽습니다. 0이 되어도 남겨 두면 "읽지 않은 메일 0통" 까지 읽습니다. 주지 않으면 숫자가 붙어 있는 버튼의 설명(`aria-describedby`)이 되어 "알림, 버튼, 3" 처럼 읽히고, 0이면 Indicator 를 빼서 설명도 사라집니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole('status');
    await expect(status).toHaveTextContent('읽지 않은 메일 3통');
    await expect(canvas.getByRole('button', { name: '알림' })).toHaveAccessibleDescription('3');
    await userEvent.click(canvas.getByRole('button', { name: '새 메일' }));
    await expect(status).toHaveTextContent('읽지 않은 메일 4통');
    await userEvent.click(canvas.getByRole('button', { name: '모두 읽음' }));
    await expect(status).toHaveTextContent('읽지 않은 메일 0통');
    await expect(canvas.getByRole('button', { name: '알림' })).not.toHaveAttribute(
      'aria-describedby',
    );
  },
};

export const AttachToAnyRoundedTarget: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Badge>
        <Avatar name="Alice Kim" />
        <Badge.Indicator count={3} />
      </Badge>
      <Badge>
        <div className="bg-neutral-soft size-10 rounded-full" />
        <Badge.Indicator count={3} />
      </Badge>
      <Badge>
        <div className="bg-neutral-soft size-10" />
        <Badge.Indicator count={3} />
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Badge는 감싼 요소의 모서리 반지름과 `corner-shape` 를 재서 배지 중심을 그 곡선 위에 둡니다. 원에서는 모서리에서 14.6% 안쪽이고, 각진 요소에서는 꼭짓점입니다. 따로 정할 prop은 없습니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const indicators = () => [...canvasElement.querySelectorAll('[data-badge-indicator]')];
    await waitFor(() =>
      expect(Number.parseFloat(getComputedStyle(indicators()[0]!).top)).toBeCloseTo(5.86, 1),
    );
    await expect(Number.parseFloat(getComputedStyle(indicators()[1]!).top)).toBeCloseTo(5.86, 1);
    await expect(getComputedStyle(indicators()[2]!).top).toBe('0px');
  },
};

export const ShowOnlineStatus: Story = {
  render: function Render() {
    const [online, setOnline] = useState(true);

    return (
      <div className="flex items-center gap-4">
        <Badge colorScheme={online ? 'success' : 'neutral'} placement="bottom-end">
          <Avatar name="Alice Kim" />
          <Badge.Indicator aria-label={online ? '온라인' : '오프라인'} />
        </Badge>
        <Button size="tiny" variant="outline" onClick={() => setOnline((value) => !value)}>
          {online ? '오프라인으로' : '온라인으로'}
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'children 없는 `Badge.Indicator` 는 점입니다. 상태를 색(`colorScheme`)으로 바꾸고 Indicator 는 그대로 두면, live region이 남아 바뀐 상태를 읽습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole('status');
    await userEvent.click(canvas.getByRole('button', { name: '오프라인으로' }));
    await expect(status).toHaveTextContent('오프라인');
    await expect(status.className).toContain('scheme-neutral');
    await userEvent.click(canvas.getByRole('button', { name: '온라인으로' }));
    await expect(status).toHaveTextContent('온라인');
    await expect(status.className).toContain('scheme-success');
  },
};

const targets = [
  'avatar',
  'circle',
  'button',
  'icon button',
  'toggle',
  'card',
  'item',
  'popup corner',
  'square',
  'pill',
  'mixed corners',
  'ellipse',
  'percent',
  'thick border',
  'squircle',
  'rtl',
] as const;

const CIRCLE_DIAGONAL = 1 - Math.SQRT1_2;

const KNOWN_CORNERS: Partial<
  Record<(typeof targets)[number], Record<(typeof placements)[number], [number, number]>>
> = {
  avatar: {
    'top-end': [20, 20],
    'top-start': [20, 20],
    'bottom-end': [20, 20],
    'bottom-start': [20, 20],
  },
  pill: {
    'top-end': [16, 16],
    'top-start': [16, 16],
    'bottom-end': [16, 16],
    'bottom-start': [16, 16],
  },
  square: { 'top-end': [0, 0], 'top-start': [0, 0], 'bottom-end': [0, 0], 'bottom-start': [0, 0] },
  'mixed corners': {
    'top-end': [6, 6],
    'top-start': [0, 0],
    'bottom-end': [24, 24],
    'bottom-start': [12, 12],
  },
  ellipse: {
    'top-end': [40, 20],
    'top-start': [40, 20],
    'bottom-end': [40, 20],
    'bottom-start': [40, 20],
  },
  rtl: { 'top-end': [24, 24], 'top-start': [0, 0], 'bottom-end': [0, 0], 'bottom-start': [0, 0] },
};

function expectedCenter(root: Element, [rx, ry]: [number, number]) {
  const box = root.firstElementChild!.getBoundingClientRect();
  const placement = root.getAttribute('data-placement')!;
  const rtl = getComputedStyle(root).direction === 'rtl';
  const right = placement.endsWith('end') !== rtl;
  const top = placement.startsWith('top');

  return {
    x: right ? box.right - rx * CIRCLE_DIAGONAL : box.left + rx * CIRCLE_DIAGONAL,
    y: top ? box.top + ry * CIRCLE_DIAGONAL : box.bottom - ry * CIRCLE_DIAGONAL,
  };
}

function centerOf(element: Element) {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

export const EveryCorner: Story = {
  tags: ['verification'],
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Target × Placement"
        description="대상마다 네 모서리에 숫자 배지와 점을 붙입니다. 배지 중심은 그 모서리 곡선의 45도 지점에 옵니다."
      >
        <Showcase.Matrix
          rows={targets}
          columns={placements}
          render={(target, placement) => {
            const badges = [3, undefined].map((content) => (
              <Badge key={content ?? 'dot'} placement={placement} data-target={target}>
                {
                  {
                    avatar: <Avatar name="Alice Kim" />,
                    circle: <div className="bg-neutral-soft size-10 rounded-full" />,
                    button: <Button variant="outline">저장</Button>,
                    'icon button': (
                      <IconButton aria-label="알림" variant="outline" icon={<BellIcon />} />
                    ),
                    toggle: <Toggle variant="outline">굵게</Toggle>,
                    card: (
                      <Card variant="outline">
                        <Card.Header>
                          <Card.Title>공지</Card.Title>
                        </Card.Header>
                      </Card>
                    ),
                    item: (
                      <Item variant="outline">
                        <Item.Content>
                          <Item.Title>받은 편지함</Item.Title>
                        </Item.Content>
                      </Item>
                    ),
                    'popup corner': (
                      <div className="concentric-p-1 bg-neutral-soft">
                        <div className="h-8 w-20" />
                      </div>
                    ),
                    square: <div className="bg-neutral-soft size-10 rounded-none" />,
                    pill: <div className="bg-neutral-soft h-8 w-24 rounded-full" />,
                    'mixed corners': (
                      <div className="bg-neutral-soft size-12 rounded-tl-none rounded-tr-[6px] rounded-br-[24px] rounded-bl-[12px]" />
                    ),
                    ellipse: <div className="bg-neutral-soft h-10 w-20 rounded-[50%]" />,
                    percent: <div className="bg-neutral-soft size-12 rounded-[30%]" />,
                    'thick border': (
                      <div className="border-neutral-strong bg-neutral-soft size-12 rounded-[16px] border-4" />
                    ),
                    squircle: <Button variant="outline">저장</Button>,
                    rtl: <div className="bg-neutral-soft size-12 rounded-tl-[24px]" />,
                  }[target]
                }
                <Badge.Indicator count={content} />
              </Badge>
            ));

            if (target === 'squircle')
              return (
                <IdsProvider.Scope theme={{ cornerShape: 'squircle', radius: 14 }}>
                  <div className="flex gap-6 p-3">{badges}</div>
                </IdsProvider.Scope>
              );
            return (
              <div dir={target === 'rtl' ? 'rtl' : undefined} className="flex gap-6 p-3">
                {badges}
              </div>
            );
          }}
        />
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    for (const [target, corners] of Object.entries(KNOWN_CORNERS)) {
      for (const root of canvasElement.querySelectorAll(`[data-target="${target}"]`)) {
        const placement = root.getAttribute('data-placement') as (typeof placements)[number];
        const indicator = root.querySelector('[data-badge-indicator]')!;

        await waitFor(() => {
          const expected = expectedCenter(root, corners[placement]);
          const actual = centerOf(indicator);
          expect(Math.abs(actual.x - expected.x), `${target} ${placement} x`).toBeLessThanOrEqual(
            1,
          );
          expect(Math.abs(actual.y - expected.y), `${target} ${placement} y`).toBeLessThanOrEqual(
            1,
          );
        });
      }
    }
  },
};
