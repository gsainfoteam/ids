import { useState } from 'react';

import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { IdsProvider } from '../../utility/ids-provider';

import { ScrollArea } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Layout/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['hover', 'auto', 'always', 'none'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    orientation: { control: 'radio', options: ['vertical', 'horizontal', 'both'] },
    fade: { control: 'radio', options: [undefined, 'y', 'x', 'both'] },
  },
  args: { variant: 'hover', size: 'standard', orientation: 'vertical' },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants = ['hover', 'auto', 'always', 'none'] as const;
const sizes = ['standard', 'tiny'] as const;

const frame = cn('h-40 w-56 rounded-standard border border-neutral text-body-b3-regular');
const panel = cn('h-56 w-64 concentric-p-1 p-0 border border-neutral bg-base shadow-md');

const paragraphs = [
  '스크롤 영역은 브라우저의 스크롤을 그대로 씁니다. 휠, 트랙패드, 터치, 키보드가 평소처럼 움직입니다.',
  '운영체제의 회색 막대 대신 내용 위에 얇은 막대를 그립니다. 막대는 폭을 차지하지 않아서 내용이 밀리지 않습니다.',
  '둥근 모서리 안에서는 막대 끝이 모서리 곡선을 넘지 않도록 안쪽으로 물러납니다.',
  '막대를 끌면 내용이 따라오고, 트랙을 누르면 누른 쪽으로 한 쪽씩 넘어갑니다.',
  '포커스를 받을 요소가 없는 긴 글은 Tab 으로 영역에 들어와 화살표와 PageDown 으로 읽을 수 있습니다.',
  '다크 모드에서는 토큰이 막대 색을 바꿉니다.',
];

function Text({ repeat = 2 }: { repeat?: number }) {
  return (
    <div className="flex flex-col gap-3 p-3">
      {Array.from({ length: repeat }, () => paragraphs)
        .flat()
        .map((text, index) => (
          <p key={index}>{text}</p>
        ))}
    </div>
  );
}

function Wide() {
  return (
    <div className="flex w-max gap-2 p-3">
      {Array.from({ length: 16 }, (_, index) => (
        <div
          key={index}
          className="rounded-standard text-body-b3-medium bg-neutral-soft flex size-20 shrink-0 items-center justify-center"
        >
          {index + 1}
        </div>
      ))}
    </div>
  );
}

function Grid() {
  return (
    <div className="grid w-max grid-cols-[repeat(12,5rem)] gap-2 p-3">
      {Array.from({ length: 96 }, (_, index) => (
        <div
          key={index}
          className="rounded-standard text-caption-c1-regular bg-neutral-soft flex h-12 items-center justify-center"
        >
          {index + 1}
        </div>
      ))}
    </div>
  );
}

const scrollbarOf = (root: Element, orientation: 'vertical' | 'horizontal' = 'vertical') =>
  root.querySelector<HTMLElement>(
    `[data-scroll-area-scrollbar][data-orientation="${orientation}"]`,
  )!;

const CLEAR_OF_BOTH_EDGES = 120;

const startClearOfBothEdges = (viewport: HTMLElement | null) => {
  if (!viewport) return;

  const towardTheEnd = getComputedStyle(viewport).direction === 'rtl' ? -1 : 1;
  viewport.scrollTo({ top: CLEAR_OF_BOTH_EDGES, left: CLEAR_OF_BOTH_EDGES * towardTheEnd });
};

export const Playground: Story = {
  render: (args) => (
    <ScrollArea {...args} asChild>
      <div className={frame}>
        {args.orientation === 'vertical' ? (
          <Text />
        ) : args.orientation === 'horizontal' ? (
          <Wide />
        ) : (
          <Grid />
        )}
      </div>
    </ScrollArea>
  ),
};

export const Usage: Story = {
  render: () => (
    <div className="text-body-b3-regular flex h-40 w-56 flex-col">
      <ScrollArea aria-label="안내">
        <div className="flex flex-col gap-3">
          <p>스크롤 영역은 브라우저의 스크롤을 그대로 씁니다.</p>
          <p>휠, 트랙패드, 터치, 키보드가 평소처럼 움직입니다.</p>
          <p>운영체제의 회색 막대 대신 내용 위에 얇은 막대를 그립니다.</p>
          <p>막대는 폭을 차지하지 않아서 내용이 밀리지 않습니다.</p>
          <p>막대를 끌면 내용이 따라옵니다.</p>
          <p>트랙을 누르면 누른 쪽으로 한 쪽씩 넘어갑니다.</p>
        </div>
      </ScrollArea>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant × Size"
        description="hover 는 포인터를 올리거나 스크롤할 때, auto 는 넘칠 때, always 는 늘 트랙과 함께 보입니다. none 은 막대를 그리지 않습니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <ScrollArea variant={variant} size={size} asChild>
              <div className={frame}>
                <Text />
              </div>
            </ScrollArea>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Orientation">
        <Showcase.Row label="vertical">
          <ScrollArea variant="always" asChild>
            <div className={frame}>
              <Text />
            </div>
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="horizontal">
          <ScrollArea variant="always" orientation="horizontal" asChild>
            <div className="w-72">
              <Wide />
            </div>
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="both">
          <ScrollArea variant="always" orientation="both" asChild>
            <div className={frame}>
              <Grid />
            </div>
          </ScrollArea>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Placement by declaration order"
        description="내용 뒤에 선언한 막대는 기본 자리(끝, 아래), 앞에 선언한 막대는 반대편(시작, 위)에 섭니다."
      >
        <Showcase.Row label="after">
          <ScrollArea variant="always" asChild>
            <div className={frame}>
              <Grid />
              <ScrollArea.Scrollbar orientation="vertical" />
              <ScrollArea.Scrollbar orientation="horizontal" />
            </div>
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="before">
          <ScrollArea variant="always" asChild>
            <div className={frame}>
              <ScrollArea.Scrollbar orientation="vertical" />
              <ScrollArea.Scrollbar orientation="horizontal" />
              <Grid />
            </div>
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="rtl">
          <div dir="rtl">
            <ScrollArea variant="always" orientation="both" asChild>
              <div className={frame}>
                <Grid />
              </div>
            </ScrollArea>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Rounded containers"
        description="막대 끝은 모서리 반지름에서 곡선이 닿는 만큼 안쪽으로 물러나고, 옆 가장자리와 2px 떨어집니다."
      >
        <Showcase.Row label="popup 14px">
          <ScrollArea asChild variant="always">
            <div className={panel}>
              <Text />
            </div>
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="card 16px">
          <ScrollArea asChild variant="always" orientation="both">
            <div className="concentric-p-4 border-neutral h-56 w-64 border p-0">
              <Grid />
            </div>
          </ScrollArea>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Fade"
        description="내용이 더 남은 가장자리만 흐립니다. 흐린 폭은 가려진 거리만큼 자라 standard 24px, tiny 16px 에서 멈춥니다. 여기서는 모두 양쪽 끝에서 떨어진 자리에서 시작합니다."
      >
        <Showcase.Row label="vertical">
          <ScrollArea fade="both" variant="always" asChild>
            <div className={frame}>
              <ScrollArea.Viewport ref={startClearOfBothEdges}>
                <Text />
              </ScrollArea.Viewport>
            </div>
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="horizontal">
          <ScrollArea fade="both" variant="always" orientation="horizontal" asChild>
            <div className="w-72">
              <ScrollArea.Viewport ref={startClearOfBothEdges}>
                <Wide />
              </ScrollArea.Viewport>
            </div>
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="both">
          <ScrollArea fade="both" variant="always" orientation="both" asChild>
            <div className={frame}>
              <ScrollArea.Viewport ref={startClearOfBothEdges}>
                <Grid />
              </ScrollArea.Viewport>
            </div>
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="rtl">
          <div dir="rtl">
            <ScrollArea fade="both" variant="always" orientation="both" asChild>
              <div className={frame}>
                <ScrollArea.Viewport ref={startClearOfBothEdges}>
                  <Grid />
                </ScrollArea.Viewport>
              </div>
            </ScrollArea>
          </div>
        </Showcase.Row>
        <Showcase.Row label="tiny">
          <ScrollArea fade="both" size="tiny" variant="always" asChild>
            <div className={frame}>
              <ScrollArea.Viewport ref={startClearOfBothEdges}>
                <Text />
              </ScrollArea.Viewport>
            </div>
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="none">
          <ScrollArea fade="x" variant="none" orientation="horizontal" asChild>
            <div className="w-72">
              <ScrollArea.Viewport ref={startClearOfBothEdges}>
                <Wide />
              </ScrollArea.Viewport>
            </div>
          </ScrollArea>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Dark mode" description="막대 색은 scrollbar-* 토큰을 따릅니다.">
        <Showcase.Row>
          {(['light', 'dark'] as const).map((mode) => (
            <IdsProvider.Scope key={mode} mode={mode} asChild>
              <div className="rounded-standard bg-base text-neutral-strong p-4">
                <ScrollArea variant="always" asChild>
                  <div className={frame}>
                    <Text />
                  </div>
                </ScrollArea>
              </div>
            </IdsProvider.Scope>
          ))}
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const ReadLongTextWithTheKeyboard: Story = {
  render: () => (
    <ScrollArea aria-label="약관" asChild>
      <div className={frame}>
        <Text />
      </div>
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '넘치는데 안에 포커스를 받을 요소가 없으면 viewport 가 Tab 멈춤이 됩니다. 화살표, PageDown, Home, End 는 브라우저가 그대로 처리합니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const viewport = () => canvasElement.querySelector<HTMLElement>('[data-scroll-area-viewport]')!;
    await waitFor(() => expect(viewport()).toHaveAttribute('tabindex', '0'));

    viewport().focus();
    await expect(viewport()).toHaveFocus();
  },
};

export const PutAScrollbarOnTheStartSide: Story = {
  render: () => (
    <ScrollArea variant="always" asChild>
      <div className={frame}>
        <ScrollArea.Scrollbar orientation="vertical" />
        <Grid />
        <ScrollArea.Scrollbar orientation="horizontal" />
      </div>
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '세로 막대를 내용 앞에 선언해 시작 쪽(왼쪽)에 두고, 가로 막대는 뒤에 선언해 아래에 둡니다. 두 막대를 선언했으니 root 에 orientation 을 주지 않아도 두 방향으로 스크롤합니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-scroll-area]')!;
    await expect(scrollbarOf(root)).toHaveAttribute('data-placement', 'start');
    await expect(scrollbarOf(root, 'horizontal')).toHaveAttribute('data-placement', 'end');

    const box = root.getBoundingClientRect();
    await waitFor(() =>
      expect(scrollbarOf(root).getBoundingClientRect().left - box.left).toBeLessThan(box.width / 2),
    );
  },
};

export const ScrollARoundedPopup: Story = {
  render: () => (
    <ScrollArea asChild variant="always">
      <div role="region" aria-label="알림" className={panel}>
        <Text repeat={3} />
      </div>
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '팝업처럼 모서리가 14px 인 컨테이너를 `asChild` 로 스크롤 영역으로 삼습니다. 막대는 모서리 곡선 안쪽에서 시작하고 끝납니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const root = canvas.getByRole('region', { name: '알림' });
    const style = getComputedStyle(root);
    const radius = parseFloat(style.borderTopRightRadius) - parseFloat(style.borderTopWidth);
    await expect(radius).toBeGreaterThan(10);

    const inner = root.getBoundingClientRect();
    const border = parseFloat(style.borderTopWidth);
    await waitFor(() => {
      const bar = scrollbarOf(root).getBoundingClientRect();
      const center = { x: inner.right - border - radius, y: inner.top + border + radius };
      expect(Math.hypot(bar.right - center.x, bar.top - center.y)).toBeLessThan(radius);
    });
  },
};

export const ScrollAListboxItself: Story = {
  render: () => (
    <ScrollArea asChild>
      <div className={cn(frame, 'h-48')}>
        <ScrollArea.Viewport asChild>
          <div role="listbox" aria-label="도시" className="flex flex-col p-1">
            {Array.from({ length: 30 }, (_, index) => (
              <div
                key={index}
                role="option"
                aria-selected={index === 0}
                tabIndex={index === 0 ? 0 : -1}
                className="focus-ring rounded-standard aria-selected:bg-neutral-soft px-2.5 py-1.5"
              >
                도시 {index + 1}
              </div>
            ))}
          </div>
        </ScrollArea.Viewport>
      </div>
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`ScrollArea.Viewport asChild` 로 listbox 자신이 스크롤 요소가 됩니다. 옵션의 offset parent 와 `scrollTop` 은 listbox 에 그대로 남습니다. 스스로 포커스를 다루는 역할(listbox, menu, grid 등)은 Tab 멈춤을 받지 않습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const listbox = canvas.getByRole('listbox', { name: '도시' });
    await expect(listbox).toHaveAttribute('data-scroll-area-viewport');
    await waitFor(() =>
      expect(listbox.closest('[data-scroll-area]')).toHaveAttribute('data-overflow-y'),
    );
    await expect(listbox).not.toHaveAttribute('tabindex');

    listbox.scrollTop = listbox.scrollHeight;
    await waitFor(() => expect(listbox.scrollTop).toBeGreaterThan(0));
  },
};

export const FadeTheEdgesThatHideContent: Story = {
  render: () => (
    <ScrollArea fade="both" asChild>
      <div className={frame}>
        <Text />
      </div>
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`fade` 는 내용이 더 남은 가장자리만 흐립니다. 맨 위에서는 위가 선명하고, 내리면 위가 흐려지고, 끝에 닿으면 아래가 선명해집니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const viewport = () => canvasElement.querySelector<HTMLElement>('[data-scroll-area-viewport]')!;
    await waitFor(() => expect(viewport()).toHaveAttribute('data-overflow-y-end'));
    await expect(viewport()).not.toHaveAttribute('data-overflow-y-start');

    viewport().scrollTop = CLEAR_OF_BOTH_EDGES;
    await waitFor(() => expect(viewport()).toHaveAttribute('data-overflow-y-start'));
    await expect(viewport()).toHaveAttribute('data-overflow-y-end');

    viewport().scrollTop = viewport().scrollHeight;
    await waitFor(() => expect(viewport()).not.toHaveAttribute('data-overflow-y-end'));
    await expect(viewport()).toHaveAttribute('data-overflow-y-start');
  },
};

export const DrawALineOnceTheTopIsHidden: Story = {
  render: function Render() {
    const [topHidden, setTopHidden] = useState(false);

    return (
      <div className="rounded-standard text-body-b3-regular border-neutral flex h-56 w-64 flex-col border">
        <div
          className={cn(
            'text-body-b3-medium border-b px-3 py-2',
            topHidden ? 'border-neutral' : 'border-transparent',
          )}
        >
          공지
        </div>
        <ScrollArea asChild>
          <div className="min-h-0 grow rounded-b-[inherit]">
            <ScrollArea.Viewport
              onScroll={(event) => setTopHidden(event.currentTarget.scrollTop > 0)}
            >
              <Text />
            </ScrollArea.Viewport>
          </div>
        </ScrollArea>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`ScrollArea.Viewport` 는 스크롤하는 요소라서 `onScroll` 로 `scrollTop` 을 읽을 수 있습니다. 여기서는 위로 가려진 내용이 생기면 머리 아래에 선을 긋습니다. `fade` 없이 가장자리를 알리는 방법입니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const viewport = () => canvasElement.querySelector<HTMLElement>('[data-scroll-area-viewport]')!;
    const rule = () => getComputedStyle(canvas.getByText('공지')).borderBottomColor;
    await waitFor(() => expect(viewport()).toHaveAttribute('data-overflow-y-end'));
    const clear = rule();

    viewport().scrollTop = CLEAR_OF_BOTH_EDGES;
    await waitFor(() => expect(viewport()).toHaveAttribute('data-overflow-y-start'));
    await waitFor(() => expect(rule()).not.toBe(clear));
  },
};

export const StartTheBarsAfterStickyHeaders: Story = {
  render: () => (
    <ScrollArea orientation="both" variant="always" asChild>
      <div className="rounded-standard border-neutral text-body-b3-regular h-56 w-72 border">
        <div className="w-[36rem]">
          <div
            data-scroll-area-pinned="top"
            className="bg-block border-neutral sticky top-0 z-10 flex border-b"
          >
            <div className="bg-block border-neutral sticky start-0 w-16 shrink-0 border-e px-2 py-2">
              시각
            </div>
            {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
              <div key={day} className="flex-1 px-2 py-2">
                {day}
              </div>
            ))}
          </div>
          {Array.from({ length: 12 }, (_, hour) => (
            <div key={hour} className="flex h-10">
              <div
                data-scroll-area-pinned="start"
                className="bg-block border-neutral sticky start-0 w-16 shrink-0 border-e px-2"
              >
                {hour + 9}시
              </div>
              <div className="flex-1" />
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`sticky` 머리와 열에 `data-scroll-area-pinned="top"` / `"start"` 를 붙이면 세로 막대는 머리 아래에서, 가로 막대는 열 다음에서 시작합니다. 막대가 실제로 움직이는 칸에만 놓입니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const head = canvasElement.querySelector('[data-scroll-area-pinned="top"]')!;
    const column = canvasElement.querySelector('[data-scroll-area-pinned="start"]')!;
    const bar = (orientation: string) =>
      canvasElement
        .querySelector(`[data-scroll-area-scrollbar][data-orientation="${orientation}"]`)!
        .getBoundingClientRect();

    await waitFor(() =>
      expect(bar('vertical').top).toBeGreaterThan(head.getBoundingClientRect().bottom),
    );
    await expect(bar('horizontal').left).toBeGreaterThan(column.getBoundingClientRect().right);
  },
};

export const RestyleTheThumb: Story = {
  tags: ['custom-design'],
  render: () => (
    <ScrollArea variant="auto" asChild>
      <div className={frame}>
        <Text />
        <ScrollArea.Scrollbar>
          <ScrollArea.Thumb className="bg-primary-solid hover:bg-primary-solid" />
        </ScrollArea.Scrollbar>
      </div>
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'IDS 위에 새로 그린 디자인입니다(`custom-design`). `ScrollArea.Scrollbar` 와 `ScrollArea.Thumb` 에 클래스를 넘겨 모양을 바꿉니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const thumb = canvasElement.querySelector<HTMLElement>('[data-scroll-area-thumb]')!;
    await waitFor(() => expect(thumb).toBeVisible());
    await expect(thumb.className).toMatch(/(^| )bg-primary-solid( |$)/);
  },
};
