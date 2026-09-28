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
    variant: { control: 'radio', options: ['hover', 'auto', 'always'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    orientation: { control: 'radio', options: ['vertical', 'horizontal', 'both'] },
  },
  args: { variant: 'hover', size: 'standard', orientation: 'vertical' },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants = ['hover', 'auto', 'always'] as const;
const sizes = ['standard', 'tiny'] as const;

const frame = cn(
  'h-40 w-56 rounded-standard border border-(--ids-color-border) text-body-b3-regular',
);
const panel = cn(
  'h-56 w-64 concentric-p-1 p-0 border border-(--ids-color-border) bg-(--ids-color-surface) shadow-md',
);

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
          className="rounded-standard text-body-b3-medium flex size-20 shrink-0 items-center justify-center bg-(--ids-color-muted)"
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
          className="rounded-standard text-caption-c1-regular flex h-12 items-center justify-center bg-(--ids-color-muted)"
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

export const Playground: Story = {
  render: (args) => (
    <ScrollArea {...args} className={frame}>
      {args.orientation === 'vertical' ? (
        <Text />
      ) : args.orientation === 'horizontal' ? (
        <Wide />
      ) : (
        <Grid />
      )}
    </ScrollArea>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant × Size"
        description="hover 는 포인터를 올리거나 스크롤할 때, auto 는 넘칠 때, always 는 늘 트랙과 함께 보입니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <ScrollArea variant={variant} size={size} className={frame}>
              <Text />
            </ScrollArea>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Orientation">
        <Showcase.Row label="vertical">
          <ScrollArea variant="always" className={frame}>
            <Text />
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="horizontal">
          <ScrollArea variant="always" orientation="horizontal" className="w-72">
            <Wide />
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="both">
          <ScrollArea variant="always" orientation="both" className={frame}>
            <Grid />
          </ScrollArea>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Placement by declaration order"
        description="내용 뒤에 선언한 막대는 기본 자리(끝, 아래), 앞에 선언한 막대는 반대편(시작, 위)에 섭니다."
      >
        <Showcase.Row label="after">
          <ScrollArea variant="always" orientation="both" className={frame}>
            <Grid />
            <ScrollArea.Scrollbar orientation="vertical" />
            <ScrollArea.Scrollbar orientation="horizontal" />
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="before">
          <ScrollArea variant="always" orientation="both" className={frame}>
            <ScrollArea.Scrollbar orientation="vertical" />
            <ScrollArea.Scrollbar orientation="horizontal" />
            <Grid />
          </ScrollArea>
        </Showcase.Row>
        <Showcase.Row label="rtl">
          <div dir="rtl">
            <ScrollArea variant="always" orientation="both" className={frame}>
              <Grid />
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
            <div className="concentric-p-4 h-56 w-64 border border-(--ids-color-border) p-0">
              <Grid />
            </div>
          </ScrollArea>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Dark mode" description="막대 색은 scrollbar-* 토큰을 따릅니다.">
        <Showcase.Row>
          {(['light', 'dark'] as const).map((mode) => (
            <IdsProvider
              key={mode}
              mode={mode}
              className="rounded-standard bg-(--ids-color-surface) p-4 text-(--ids-color-on-surface)"
            >
              <ScrollArea variant="always" className={frame}>
                <Text />
              </ScrollArea>
            </IdsProvider>
          ))}
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const KeyboardScrolling: Story = {
  render: () => (
    <ScrollArea aria-label="약관" className={frame}>
      <Text />
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

export const DeclarationOrder: Story = {
  render: () => (
    <ScrollArea variant="always" orientation="both" className={frame}>
      <ScrollArea.Scrollbar orientation="vertical" />
      <Grid />
      <ScrollArea.Scrollbar orientation="horizontal" />
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '세로 막대를 내용 앞에 선언해 시작 쪽(왼쪽)에 두고, 가로 막대는 뒤에 선언해 아래에 둡니다. 선언하지 않은 방향은 기본 막대가 붙습니다.',
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

export const RoundedPopup: Story = {
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

export const ListboxAsViewport: Story = {
  render: () => (
    <ScrollArea className={cn(frame, 'h-48')}>
      <ScrollArea.Viewport asChild>
        <div role="listbox" aria-label="도시" className="flex flex-col p-1">
          {Array.from({ length: 30 }, (_, index) => (
            <div
              key={index}
              role="option"
              aria-selected={index === 0}
              className="rounded-standard px-2.5 py-1.5 aria-selected:bg-(--ids-color-muted)"
            >
              도시 {index + 1}
            </div>
          ))}
        </div>
      </ScrollArea.Viewport>
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

export const CustomThumb: Story = {
  render: () => (
    <ScrollArea variant="auto" className={frame}>
      <Text />
      <ScrollArea.Scrollbar>
        <ScrollArea.Thumb className="bg-(--ids-color-primary) hover:bg-(--ids-color-primary)" />
      </ScrollArea.Scrollbar>
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story: '`ScrollArea.Scrollbar` 와 `ScrollArea.Thumb` 에 클래스를 넘겨 모양을 바꿉니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const thumb = canvasElement.querySelector<HTMLElement>('[data-scroll-area-thumb]')!;
    await waitFor(() => expect(thumb).toBeVisible());
    await expect(thumb.className).toMatch(/bg-\(--ids-color-primary\)/);
  },
};
