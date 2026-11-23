import { useState } from 'react';

import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Card } from '../../data/card';

import { Resizable, useResizable } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const panel = cn('concentric-p-4 border border-neutral bg-base text-body-b3-regular');

const meta = {
  title: 'Layout/Resizable',
  component: Resizable,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'radio', options: ['both', 'horizontal', 'vertical'] },
    disabled: { control: 'boolean' },
  },
  args: {
    direction: 'both',
    className: cn(panel, 'h-45 w-80'),
    children: '모서리나 가장자리의 손잡이를 끌거나, 손잡이에 포커스한 뒤 방향키로 크기를 바꿉니다.',
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

export const Usage: Story = {
  render: () => (
    <Resizable className="concentric-p-4 border-neutral bg-base text-body-b3-regular h-45 w-80 border">
      모서리를 끌어 너비와 높이를 바꿉니다.
    </Resizable>
  ),
};

export const Gallery: Story = {
  render: function Render() {
    const bounded = useResizable({
      width: { defaultValue: 240, min: 200, max: 320 },
      height: { defaultValue: 120, min: 96, max: 160 },
    });

    return (
      <Showcase>
        <Showcase.Section
          title="Direction"
          description="both 는 모서리 손잡이 하나(Tab 한 칸, 방향키가 두 축을 바꿉니다), horizontal 은 끝 가장자리, vertical 은 아래 가장자리 손잡이입니다."
        >
          <Showcase.Row label="both">
            <Resizable className={cn(panel, 'h-35 w-70')}>
              모서리를 끌어 너비와 높이를 함께 바꿉니다.
            </Resizable>
          </Showcase.Row>
          <Showcase.Row label="horizontal">
            <Resizable direction="horizontal" className={cn(panel, 'h-28 w-70')}>
              끝 가장자리를 끌어 너비를 바꿉니다.
            </Resizable>
          </Showcase.Row>
          <Showcase.Row label="vertical">
            <Resizable direction="vertical" className={cn(panel, 'h-28 w-72')}>
              아래 가장자리를 끌어 높이를 바꿉니다.
            </Resizable>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section
          title="Corner"
          description="모서리 손잡이는 가장자리 손잡이와 같은 두께, 색, 자리의 선을 요소의 모서리를 따라 휘어 그립니다. 반지름은 요소에서 읽어서 같은 중심의 호가 되고, 반지름이 0 이면 끝이 살짝 둥근 ㄴ 자가 됩니다."
        >
          <Showcase.Row label="radius">
            <Resizable className="text-body-b3-regular border-neutral bg-base h-28 w-45 rounded-none border p-4">
              0
            </Resizable>
            <Resizable className="rounded-standard text-body-b3-regular border-neutral bg-base h-28 w-45 border p-4">
              standard
            </Resizable>
            <Resizable className={cn(panel, 'h-28 w-45')}>concentric-p-4</Resizable>
            <Resizable className="text-body-b3-regular border-neutral bg-base h-28 w-45 rounded-full border px-8 py-4">
              full
            </Resizable>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section title="States">
          <Showcase.Row label="disabled">
            <Resizable disabled className={cn(panel, 'h-28 w-70')}>
              손잡이가 흐려지고 끌거나 포커스할 수 없습니다.
            </Resizable>
            <Resizable direction="horizontal" disabled className={cn(panel, 'h-28 w-50')}>
              비활성
            </Resizable>
          </Showcase.Row>
          <Showcase.Row label="min / max">
            <Resizable resizable={bounded} className={panel}>
              너비 200 ~ 320px, 높이 96 ~ 160px 안에서만 바뀝니다.
            </Resizable>
          </Showcase.Row>
          <Showcase.Row label="natural size">
            <div className="w-80">
              <Resizable direction="horizontal" className={cn(panel, 'h-28 w-full')}>
                처음에는 CSS 크기를 따르고, 바꾸는 순간부터 px 크기를 가집니다.
              </Resizable>
            </div>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section
          title="Custom handle"
          description="Resizable.Handle 을 선언하면 기본 손잡이 대신 그립니다. className 으로 모양과 색을 바꾸고, children 으로 모서리의 호를 다른 표시로 바꿉니다."
        >
          <Showcase.Row label="edge">
            <Resizable direction="horizontal" className={cn(panel, 'h-28 w-65')}>
              테마 색 막대가 손잡이입니다.
              <Resizable.Handle className="bg-primary-solid inset-y-3 -end-0.5 w-1 before:hidden" />
            </Resizable>
          </Showcase.Row>
          <Showcase.Row label="corner color">
            <Resizable className={cn(panel, 'h-30 w-65')}>
              호의 색은 글자색입니다. 올리거나 끄는 동안은 손잡이 단계를 따릅니다.
              <Resizable.Handle className="text-primary" />
            </Resizable>
          </Showcase.Row>
          <Showcase.Row label="corner mark">
            <Resizable className={cn(panel, 'h-30 w-65')}>
              children 은 호 대신 그릴 표시입니다.
              <Resizable.Handle>
                <span className="size-1.5 rounded-full bg-current" />
              </Resizable.Handle>
            </Resizable>
          </Showcase.Row>
          <Showcase.Row label="asChild root">
            <Resizable asChild>
              <Card className="w-70">
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
              <Resizable className={cn(panel, 'h-28 w-60')}>모서리 손잡이</Resizable>
              <Resizable direction="horizontal" className={cn(panel, 'h-28 w-50')}>
                가장자리 손잡이
              </Resizable>
            </div>
          </Showcase.Row>
        </Showcase.Section>
      </Showcase>
    );
  },
};

export const ResizeByDragging: Story = {
  render: () => (
    <Resizable className={cn(panel, 'h-30 w-60')}>
      모서리를 끌면 두 축이 함께 바뀝니다. 끄는 동안 Escape 를 누르면 처음 크기로 돌아갑니다.
    </Resizable>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '처음 크기는 요소의 CSS(`w-60 h-30`)가 정하고, 모서리를 끌어 두 축을 함께 바꿉니다. 끄는 동안에는 한 프레임에 한 번 DOM 에 크기를 쓰고, 놓을 때부터 px 크기를 가집니다. 손잡이를 두 번 누르면 CSS 크기로 돌아갑니다.',
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
    await waitFor(() => expect(root.offsetWidth).toBe(240));
  },
};

export const SnapTheSizeToAStep: Story = {
  render: function Render() {
    const resizable = useResizable({
      height: { defaultValue: 96, min: 48, max: 240 },
      step: 12,
      getValueLabel: (size) => `${size / 48}시간`,
    });

    return (
      <Resizable resizable={resizable} direction="vertical" className={cn(panel, 'w-64')}>
        아래 가장자리를 끌면 높이가 12px 단위로 맞습니다.
      </Resizable>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`useResizable` 에 `step` 을 주면 끄는 크기가 그 배수에 맞고, 방향키는 한 칸, `Shift` 와 함께면 네 칸을 옮깁니다. `getValueLabel` 은 스크린 리더가 읽는 값(`aria-valuetext`)을 px 대신 그 글자로 바꿉니다. Scheduler 가 일정의 끝 시각을 15분 단위로 바꿀 때 이 둘을 씁니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-resizable]')!;
    const edge = canvas.getByRole('separator', { name: '높이' });
    await expect(edge).toHaveAttribute('aria-valuetext', '2시간');

    edge.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(valueOf(edge)).toBe(108));
    await expect(edge).toHaveAttribute('aria-valuetext', '2.25시간');
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await waitFor(() => expect(valueOf(edge)).toBe(156));

    const { left, width, top, height } = edge.getBoundingClientRect();
    const from = { clientX: left + width / 2, clientY: top + height / 2 };
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: edge, coords: from },
      { target: edge, coords: { ...from, clientY: from.clientY + 17 } },
      { keys: '[/MouseLeft]', target: edge, coords: { ...from, clientY: from.clientY + 17 } },
    ]);
    await waitFor(() => expect(root.style.height).toBe('168px'));
  },
};

export const LimitTheSize: Story = {
  render: function Render() {
    const resizable = useResizable({ width: { defaultValue: 240, min: 200, max: 320 } });

    return (
      <Resizable resizable={resizable} direction="horizontal" className={cn(panel, 'h-28')}>
        너비가 200 ~ 320px 안에서만 바뀝니다.
      </Resizable>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '최소와 최대 크기는 `useResizable` 의 축마다 `min` `max` 로 줍니다. 끌기와 방향키가 그 안에서 멈추고, Home 과 End 가 그 끝으로 가며, 손잡이의 `aria-valuemin` `aria-valuemax` 가 됩니다. 서버 HTML 에도 그대로 들어갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const edge = canvas.getByRole('separator', { name: '너비' });
    edge.focus();
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(valueOf(edge)).toBe(320));
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(valueOf(edge)).toBe(200));
  },
};

export const ControlTheSize: Story = {
  render: function Render() {
    const [width, setWidth] = useState(280);
    const [height, setHeight] = useState(140);
    const resizable = useResizable({
      width: { value: width, onValueChange: setWidth, min: 200 },
      height: { value: height, onValueChange: setHeight, min: 96 },
    });

    return (
      <Resizable resizable={resizable} className={panel}>
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
          '`useResizable` 의 축에 `value` 와 `onValueChange` 를 주면 제어 컴포넌트입니다. 바뀐 크기는 끌기가 끝날 때와 키를 누를 때 알리고, 앱이 값을 돌려줘야 크기가 바뀝니다.',
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

export const Keyboard: Story = {
  tags: ['verification'],
  render: function Render() {
    const edge = useResizable({ width: { defaultValue: 240, max: 360 } });

    return (
      <div className="flex flex-col gap-6">
        <Resizable resizable={edge} direction="horizontal" className={cn(panel, 'h-24')}>
          가장자리: ← → 16px, Shift 64px, Home End 최솟값과 최댓값, Enter 처음 크기
        </Resizable>
        <Resizable className={cn(panel, 'h-30 w-60')}>모서리: ← → 너비, ↑ ↓ 높이</Resizable>
      </div>
    );
  },
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
