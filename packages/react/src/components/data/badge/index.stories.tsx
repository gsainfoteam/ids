import { useState } from 'react';

import { BellIcon, EnvelopeIcon, InboxIcon } from '@heroicons/react/24/outline';
import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Avatar } from '../avatar';

import { Badge } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['solid', 'soft', 'outline'] as const;
const colorSchemes = ['danger', 'neutral', 'primary', 'success', 'warning', 'info'] as const;
const placements = ['top-end', 'top-start', 'bottom-end', 'bottom-start'] as const;

const Box = () => <div className="rounded-standard size-10 bg-(--ids-color-muted)" />;

const meta = {
  title: 'Data/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    colorScheme: { control: 'select', options: colorSchemes },
    placement: { control: 'radio', options: placements },
    shape: { control: 'radio', options: ['rectangular', 'circular'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    content: { control: 'number' },
    max: { control: 'number' },
    dot: { control: 'boolean' },
    showZero: { control: 'boolean' },
    invisible: { control: 'boolean' },
  },
  args: {
    content: 3,
    variant: 'solid',
    colorScheme: 'danger',
    size: 'standard',
    placement: 'top-end',
  },
  render: (args) => (
    <Badge {...args}>
      <BellIcon className="size-7" />
    </Badge>
  ),
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Color scheme">
        <Showcase.Matrix
          rows={colorSchemes}
          columns={variants}
          render={(colorScheme, variant) => (
            <div className="flex items-center gap-6">
              <Badge content={5} variant={variant} colorScheme={colorScheme} />
              <Badge content={128} variant={variant} colorScheme={colorScheme} />
              <Badge content={7} variant={variant} colorScheme={colorScheme}>
                <Box />
              </Badge>
              <Badge dot variant={variant} colorScheme={colorScheme}>
                <Box />
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
            <Badge key={placement} content={9} placement={placement}>
              <Box />
            </Badge>
          ))}
        </Showcase.Row>
        <Showcase.Row label="rtl">
          <div dir="rtl" className="flex gap-10 py-3">
            {placements.map((placement) => (
              <Badge key={placement} content={9} placement={placement}>
                <Box />
              </Badge>
            ))}
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Shape"
        description="둥근 대상에는 원의 가장자리로 당겨 붙습니다. Avatar는 모양을 알아서 알려 줍니다."
      >
        <Showcase.Row label="avatar">
          <Badge content={3}>
            <Avatar name="Alice Kim" />
          </Badge>
          <Badge dot colorScheme="success" placement="bottom-end" aria-label="온라인">
            <Avatar name="Bob Lee" />
          </Badge>
          <Badge dot colorScheme="success" placement="bottom-end" aria-label="온라인">
            <Avatar name="Acme" shape="square" />
          </Badge>
        </Showcase.Row>
        <Showcase.Row label="circular">
          <Badge content={2} shape="circular">
            <div className="size-10 rounded-full bg-(--ids-color-muted)" />
          </Badge>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Size">
        <Showcase.Row label="standard">
          <Badge content={3}>
            <BellIcon className="size-7" />
          </Badge>
          <Badge dot>
            <BellIcon className="size-7" />
          </Badge>
        </Showcase.Row>
        <Showcase.Row label="tiny">
          <Badge content={3} size="tiny">
            <BellIcon className="size-5" />
          </Badge>
          <Badge dot size="tiny">
            <BellIcon className="size-5" />
          </Badge>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Standalone" description="children 없이 쓰면 제자리에 그립니다.">
        <Showcase.Row label="inline">
          <span className="text-body-b3-medium inline-flex items-center gap-2">
            <InboxIcon className="size-5" />
            받은 편지함
            <Badge content={12} variant="soft" colorScheme="primary" size="tiny" />
          </span>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Count: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Badge content={99}>
        <BellIcon className="size-7" />
      </Badge>
      <Badge content={100}>
        <BellIcon className="size-7" />
      </Badge>
      <Badge content={1200} max={999}>
        <BellIcon className="size-7" />
      </Badge>
      <Badge content={0}>
        <BellIcon className="size-7" />
      </Badge>
      <Badge content={0} showZero>
        <BellIcon className="size-7" />
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '숫자는 `max`(기본 99)를 넘으면 `99+` 가 됩니다. 0은 숨고, `showZero` 면 보입니다. 숨은 배지도 자리를 지켜서 다시 나타날 때 튀어나오듯 커집니다.',
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
      '0',
    ]);
    await expect(indicators[1]).toHaveAttribute('data-overflow');
    await expect(indicators[3]).toHaveAttribute('data-invisible');
    await expect(indicators[4]).not.toHaveAttribute('data-invisible');
  },
};

export const Accessibility: Story = {
  render: function Render() {
    const [unread, setUnread] = useState(3);

    return (
      <div className="flex items-center gap-6">
        <Badge content={unread} aria-label={`읽지 않은 메일 ${unread}통`}>
          <Button variant="outline">
            <EnvelopeIcon />
            받은 편지함
          </Button>
        </Badge>
        <Badge content={unread} size="tiny">
          <IconButton aria-label="알림" variant="ghost" icon={<BellIcon />} />
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
          '`aria-label` 을 주면 배지가 live region이 되어 바뀔 때마다 그 문장을 읽습니다. 주지 않으면 숫자가 붙어 있는 버튼의 설명(`aria-describedby`)이 되어 "알림, 버튼, 3" 처럼 읽힙니다.',
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
    await expect(status).toHaveAttribute('data-invisible');
    await expect(canvas.getByRole('button', { name: '알림' })).not.toHaveAttribute(
      'aria-describedby',
    );
  },
};

export const OnAvatar: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Badge content={3}>
        <Avatar name="Alice Kim" />
      </Badge>
      <Badge content={3} shape="rectangular">
        <Avatar name="Alice Kim" />
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '둥근 Avatar에 붙이면 모서리 허공이 아니라 원의 가장자리에 붙습니다. `shape` 를 주면 그 값을 따릅니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const [round, square] = [...canvasElement.querySelectorAll('[data-badge-indicator]')];
    await expect(Number.parseFloat(getComputedStyle(round!).top)).toBeGreaterThan(0);
    await expect(getComputedStyle(square!).top).toBe('0px');
  },
};

export const Invisible: Story = {
  render: function Render() {
    const [online, setOnline] = useState(true);

    return (
      <div className="flex items-center gap-4">
        <Badge
          dot
          invisible={!online}
          colorScheme="success"
          placement="bottom-end"
          aria-label={online ? '온라인' : '오프라인'}
        >
          <Avatar name="Alice Kim" />
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
          '`invisible` 은 배지를 지우지 않고 줄여서 감춥니다. 다시 보일 때 커지며 나타나고, live region은 그대로 남아 상태 변화를 읽습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole('status');
    await userEvent.click(canvas.getByRole('button', { name: '오프라인으로' }));
    await expect(status).toHaveAttribute('data-invisible');
    await expect(status).toHaveTextContent('오프라인');
    await userEvent.click(canvas.getByRole('button', { name: '온라인으로' }));
    await waitFor(() => expect(status).not.toHaveAttribute('data-invisible'));
  },
};
