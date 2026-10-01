import { useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Card } from '../../data/card';

import { Resizable } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const panel = cn(
  'concentric-p-4 border border-(--ids-color-border) bg-(--ids-color-surface) text-body-b3-regular',
);

const meta = {
  title: 'Layout/Resizable',
  component: Resizable,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'radio', options: ['both', 'horizontal', 'vertical'] },
    disabled: { control: 'boolean' },
    minWidth: { control: 'number' },
    maxWidth: { control: 'number' },
    minHeight: { control: 'number' },
    maxHeight: { control: 'number' },
  },
  args: {
    direction: 'both',
    defaultWidth: 320,
    defaultHeight: 180,
    minWidth: 160,
    maxWidth: 480,
    minHeight: 96,
    maxHeight: 320,
    className: panel,
    children: '모서리나 가장자리의 손잡이를 끌거나, 손잡이에 포커스한 뒤 방향키로 크기를 바꿉니다.',
    onWidthChange: fn(),
    onHeightChange: fn(),
  },
} satisfies Meta<typeof Resizable>;

export default meta;
type Story = StoryObj<typeof meta>;

const valueOf = (separator: Element) => Number(separator.getAttribute('aria-valuenow'));

function middleOf(path: SVGGeometryElement) {
  const { x, y } = path.getPointAtLength(path.getTotalLength() / 2);
  const toPage = path.getScreenCTM()!;
  return {
    clientX: toPage.a * x + toPage.c * y + toPage.e,
    clientY: toPage.b * x + toPage.d * y + toPage.f,
  };
}

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Direction"
        description="both 는 모서리 손잡이 하나(Tab 한 칸, 방향키가 두 축을 바꿉니다), horizontal 은 끝 가장자리, vertical 은 아래 가장자리 손잡이입니다."
      >
        <Showcase.Row label="both">
          <Resizable defaultWidth={280} defaultHeight={140} className={panel}>
            모서리를 끌어 너비와 높이를 함께 바꿉니다.
          </Resizable>
        </Showcase.Row>
        <Showcase.Row label="horizontal">
          <Resizable direction="horizontal" defaultWidth={280} className={cn(panel, 'h-28')}>
            끝 가장자리를 끌어 너비를 바꿉니다.
          </Resizable>
        </Showcase.Row>
        <Showcase.Row label="vertical">
          <Resizable direction="vertical" defaultHeight={112} className={cn(panel, 'w-72')}>
            아래 가장자리를 끌어 높이를 바꿉니다.
          </Resizable>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Corner"
        description="모서리 손잡이는 가장자리 손잡이와 같은 두께, 색, 자리의 선을 요소의 모서리를 따라 휘어 그립니다. 반지름은 요소에서 읽어서 같은 중심의 호가 되고, 반지름이 0 이면 끝이 살짝 둥근 ㄴ 자가 됩니다."
      >
        <Showcase.Row label="radius">
          <Resizable
            defaultWidth={180}
            defaultHeight={112}
            className="text-body-b3-regular rounded-none border border-(--ids-color-border) bg-(--ids-color-surface) p-4"
          >
            0
          </Resizable>
          <Resizable
            defaultWidth={180}
            defaultHeight={112}
            className="rounded-standard text-body-b3-regular border border-(--ids-color-border) bg-(--ids-color-surface) p-4"
          >
            standard
          </Resizable>
          <Resizable defaultWidth={180} defaultHeight={112} className={panel}>
            concentric-p-4
          </Resizable>
          <Resizable
            defaultWidth={180}
            defaultHeight={112}
            className="text-body-b3-regular rounded-full border border-(--ids-color-border) bg-(--ids-color-surface) px-8 py-4"
          >
            full
          </Resizable>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="disabled">
          <Resizable disabled defaultWidth={280} defaultHeight={112} className={panel}>
            손잡이가 흐려지고 끌거나 포커스할 수 없습니다.
          </Resizable>
          <Resizable
            direction="horizontal"
            disabled
            defaultWidth={200}
            className={cn(panel, 'h-28')}
          >
            비활성
          </Resizable>
        </Showcase.Row>
        <Showcase.Row label="min / max">
          <Resizable
            defaultWidth={240}
            defaultHeight={120}
            minWidth={200}
            maxWidth={320}
            minHeight={96}
            maxHeight={160}
            className={panel}
          >
            너비 200 ~ 320px, 높이 96 ~ 160px 안에서만 바뀝니다.
          </Resizable>
        </Showcase.Row>
        <Showcase.Row label="natural size">
          <div className="w-80">
            <Resizable direction="horizontal" className={cn(panel, 'h-28 w-full')}>
              크기를 주지 않으면 처음에는 CSS 크기를 따르고, 바꾸는 순간부터 px 크기를 가집니다.
            </Resizable>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Custom handle"
        description="Resizable.Handle 을 선언하면 기본 손잡이 대신 그립니다. className 으로 모양과 색을 바꾸고, children 으로 모서리의 호를 다른 표시로 바꿉니다."
      >
        <Showcase.Row label="edge">
          <Resizable direction="horizontal" defaultWidth={260} className={cn(panel, 'h-28')}>
            테마 색 막대가 손잡이입니다.
            <Resizable.Handle className="inset-y-3 -end-0.5 w-1 bg-(--ids-color-primary) before:hidden" />
          </Resizable>
        </Showcase.Row>
        <Showcase.Row label="corner color">
          <Resizable defaultWidth={260} defaultHeight={120} className={panel}>
            호의 색은 글자색입니다. 올리거나 끄는 동안은 손잡이 단계를 따릅니다.
            <Resizable.Handle className="text-(--ids-color-accent)" />
          </Resizable>
        </Showcase.Row>
        <Showcase.Row label="corner mark">
          <Resizable defaultWidth={260} defaultHeight={120} className={panel}>
            children 은 호 대신 그릴 표시입니다.
            <Resizable.Handle>
              <span className="size-1.5 rounded-full bg-current" />
            </Resizable.Handle>
          </Resizable>
        </Showcase.Row>
        <Showcase.Row label="asChild root">
          <Resizable asChild defaultWidth={280}>
            <Card>
              <Card.Title>카드 자체의 크기</Card.Title>
              <Card.Description>
                Resizable asChild 는 자식 요소의 크기를 바꾸고 손잡이를 그 안에 둡니다.
              </Card.Description>
            </Card>
          </Resizable>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Right to left"
        description="손잡이는 쓰는 방향의 끝(왼쪽)에 서고, 모서리의 호와 커서가 뒤집히며, ← 가 넓힙니다."
      >
        <Showcase.Row label="rtl">
          <div dir="rtl" className="flex flex-wrap gap-4">
            <Resizable defaultWidth={240} defaultHeight={112} className={panel}>
              모서리 손잡이
            </Resizable>
            <Resizable direction="horizontal" defaultWidth={200} className={cn(panel, 'h-28')}>
              가장자리 손잡이
            </Resizable>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const KeyboardResizing: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Resizable
        direction="horizontal"
        defaultWidth={240}
        maxWidth={360}
        className={cn(panel, 'h-24')}
      >
        가장자리: ← → 16px, Shift 64px, Home End 최솟값과 최댓값, Enter 처음 크기
      </Resizable>
      <Resizable defaultWidth={240} defaultHeight={120} className={panel}>
        모서리: ← → 너비, ↑ ↓ 높이
      </Resizable>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '가장자리 손잡이는 separator 하나입니다. 모서리 손잡이는 "크기 조절" group 안의 separator 둘(너비, 높이)이 Tab 한 칸을 나눠 씁니다. ↑ ↓ 를 누르면 포커스가 높이 separator 로 옮겨 가서, 스크린 리더는 늘 값이 바뀐 separator 를 읽습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const [edge, width] = canvas.getAllByRole('separator', { name: '너비' });
    edge!.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(valueOf(edge!)).toBe(256));
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(valueOf(edge!)).toBe(360));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(valueOf(edge!)).toBe(240));

    await userEvent.tab();
    await expect(width).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const height = canvas.getByRole('separator', { name: '높이' });
    await waitFor(() => expect(height).toHaveFocus());
    await expect(valueOf(height)).toBe(136);
    await expect(width).toHaveAttribute('tabindex', '-1');
  },
};

export const PointerDrag: Story = {
  render: () => (
    <Resizable defaultWidth={240} defaultHeight={120} className={panel}>
      모서리를 끌면 두 축이 함께 바뀝니다. 끄는 동안 Escape 를 누르면 처음 크기로 돌아갑니다.
    </Resizable>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '끄는 동안에는 한 프레임에 한 번 DOM 에 크기를 쓰고, 놓을 때 한 번 `onWidthChange` `onHeightChange` 를 부릅니다. 손잡이를 두 번 누르면 처음 크기로 돌아갑니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-resizable]')!;
    const grip = canvas.getByRole('group', { name: '크기 조절' });
    const target = await waitFor(() => {
      const path = grip.querySelector<SVGPathElement>('[data-resize-grip-target]');
      expect(path).not.toBeNull();
      return path!;
    });
    const from = middleOf(target);
    const by = (x: number, y: number) => ({ clientX: from.clientX + x, clientY: from.clientY + y });

    await userEvent.pointer([
      { keys: '[MouseLeft>]', target, coords: from },
      { target, coords: by(40, 30) },
      { keys: '[/MouseLeft]', target, coords: by(40, 30) },
    ]);
    await waitFor(() => expect(root.style.width).toBe('280px'));
    await expect(root.style.height).toBe('150px');

    await userEvent.dblClick(target);
    await waitFor(() => expect(root.style.width).toBe('240px'));
  },
};

export const ControlledSize: Story = {
  render: function Render() {
    const [width, setWidth] = useState(280);
    const [height, setHeight] = useState(140);

    return (
      <Resizable
        width={width}
        height={height}
        onWidthChange={setWidth}
        onHeightChange={setHeight}
        minWidth={200}
        minHeight={96}
        className={panel}
      >
        <output aria-live="polite">
          {width} x {height}
        </output>
      </Resizable>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`width` `height` 를 주면 제어 컴포넌트입니다. 바뀐 크기는 끌기가 끝날 때와 키를 누를 때 알리고, 앱이 값을 돌려줘야 크기가 바뀝니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole('separator', { name: '너비' }).focus();
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('216 x 140'));
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('216 x 124'));
  },
};
