import { useState, type ReactNode } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';

import { Splitter } from '.';

import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Layout/Splitter',
  component: Splitter,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
  },
  args: {
    orientation: 'horizontal',
    onValueChange: fn(),
    onValueCommit: fn(),
  },
} satisfies Meta<typeof Splitter>;

export default meta;
type Story = StoryObj<typeof Splitter>;

const frame = cn('h-48 w-full overflow-hidden rounded-standard border border-(--ids-color-border)');
const tall = cn('h-80 w-full overflow-hidden rounded-standard border border-(--ids-color-border)');

const framed: Decorator = (Story) => (
  <div className={frame}>
    <Story />
  </div>
);

function Pane({ children }: { children: ReactNode }) {
  return (
    <div className="text-body-b3-medium flex h-full items-center justify-center p-3 text-center text-(--ids-color-on-muted)">
      {children}
    </div>
  );
}

const handlesIn = (canvasElement: HTMLElement) => [
  ...canvasElement.querySelectorAll<HTMLElement>('[role=separator]'),
];
const valueOf = (handle: HTMLElement) => Number(handle.getAttribute('aria-valuenow'));
const LAYOUT_COOKIE = 'ids-splitter-layout';

export const Playground: Story = {
  decorators: [framed],
  render: (args) => (
    <Splitter {...args}>
      <Splitter.Panel defaultSize={30} minSize={20}>
        <Pane>사이드바</Pane>
      </Splitter.Panel>
      <Splitter.Panel>
        <Pane>편집기</Pane>
      </Splitter.Panel>
    </Splitter>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Orientation"
        description="horizontal 은 패널을 옆으로, vertical 은 위아래로 놓습니다. 핸들은 1px 선이고 잡는 영역은 24px 입니다."
      >
        <Showcase.Row label="horizontal">
          <div className={frame}>
            <Splitter>
              <Splitter.Panel defaultSize={35}>
                <Pane>파일</Pane>
              </Splitter.Panel>
              <Splitter.Panel>
                <Pane>편집기</Pane>
              </Splitter.Panel>
            </Splitter>
          </div>
        </Showcase.Row>
        <Showcase.Row label="vertical">
          <div className={frame}>
            <Splitter orientation="vertical">
              <Splitter.Panel defaultSize={60}>
                <Pane>편집기</Pane>
              </Splitter.Panel>
              <Splitter.Panel>
                <Pane>터미널</Pane>
              </Splitter.Panel>
            </Splitter>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Three panels">
        <Showcase.Row label="handles">
          <div className={frame}>
            <Splitter defaultValue={[20, 50, 30]}>
              <Splitter.Panel>
                <Pane>파일</Pane>
              </Splitter.Panel>
              <Splitter.Handle />
              <Splitter.Panel>
                <Pane>편집기</Pane>
              </Splitter.Panel>
              <Splitter.Handle />
              <Splitter.Panel>
                <Pane>미리보기</Pane>
              </Splitter.Panel>
            </Splitter>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Collapsible"
        description="접을 수 있는 패널 옆 핸들에는 접기 버튼이 붙습니다. 접힌 패널은 버튼이 열린 쪽으로 비켜 섭니다."
      >
        <Showcase.Row label="expanded">
          <div className={frame}>
            <Splitter>
              <Splitter.Panel defaultSize={30} minSize={20} collapsible>
                <Pane>사이드바</Pane>
              </Splitter.Panel>
              <Splitter.Panel>
                <Pane>편집기</Pane>
              </Splitter.Panel>
            </Splitter>
          </div>
        </Showcase.Row>
        <Showcase.Row label="collapsed">
          <div className={frame}>
            <Splitter defaultValue={[0, 100]}>
              <Splitter.Panel minSize={20} collapsible>
                <Pane>사이드바</Pane>
              </Splitter.Panel>
              <Splitter.Panel>
                <Pane>편집기</Pane>
              </Splitter.Panel>
            </Splitter>
          </div>
        </Showcase.Row>
        <Showcase.Row label="end side">
          <div className={frame}>
            <Splitter defaultValue={[75, 25]}>
              <Splitter.Panel>
                <Pane>편집기</Pane>
              </Splitter.Panel>
              <Splitter.Panel minSize={20} collapsible>
                <Pane>속성</Pane>
              </Splitter.Panel>
            </Splitter>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Min and max">
        <Showcase.Row label="20% – 60%">
          <div className={frame}>
            <Splitter>
              <Splitter.Panel defaultSize={40} minSize={20} maxSize={60}>
                <Pane>20% 에서 60% 까지</Pane>
              </Splitter.Panel>
              <Splitter.Panel>
                <Pane>나머지</Pane>
              </Splitter.Panel>
            </Splitter>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Nested">
        <Showcase.Row label="grid">
          <div className={tall}>
            <Splitter>
              <Splitter.Panel defaultSize={25}>
                <Pane>파일</Pane>
              </Splitter.Panel>
              <Splitter.Panel>
                <Splitter orientation="vertical">
                  <Splitter.Panel defaultSize={65}>
                    <Pane>편집기</Pane>
                  </Splitter.Panel>
                  <Splitter.Panel>
                    <Pane>터미널</Pane>
                  </Splitter.Panel>
                </Splitter>
              </Splitter.Panel>
            </Splitter>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Right to left">
        <Showcase.Row label="rtl">
          <div dir="rtl" className={frame}>
            <Splitter>
              <Splitter.Panel defaultSize={30} minSize={20} collapsible>
                <Pane>사이드바</Pane>
              </Splitter.Panel>
              <Splitter.Panel>
                <Pane>편집기</Pane>
              </Splitter.Panel>
            </Splitter>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  decorators: [framed],
  render: (args) => (
    <Splitter {...args}>
      <Splitter.Panel defaultSize={50} minSize={20} maxSize={80}>
        <Pane>20% 에서 80% 까지</Pane>
      </Splitter.Panel>
      <Splitter.Panel>
        <Pane>나머지</Pane>
      </Splitter.Panel>
    </Splitter>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '핸들에 포커스를 두고 방향키로 16px, Shift 와 함께 64px 씩 옮깁니다. Home 과 End 는 앞 패널을 가장 작게, 가장 크게 만듭니다. 키를 놓으면 `onValueCommit` 이 한 번 불립니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const [handle] = handlesIn(canvasElement);
    await userEvent.tab();
    await expect(handle).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(valueOf(handle!)).toBeGreaterThan(50));
    const afterOneStep = valueOf(handle!);
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await waitFor(() => expect(valueOf(handle!)).toBeGreaterThan(afterOneStep + 5));
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(valueOf(handle!)).toBe(80));
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(valueOf(handle!)).toBe(20));
    await expect(args.onValueCommit).toHaveBeenLastCalledWith([20, 80]);
  },
};

export const CollapseAndExpand: Story = {
  decorators: [framed],
  render: (args) => (
    <Splitter {...args}>
      <Splitter.Panel defaultSize={30} minSize={20} collapsible>
        <Pane>사이드바</Pane>
      </Splitter.Panel>
      <Splitter.Panel>
        <Pane>편집기</Pane>
      </Splitter.Panel>
    </Splitter>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`collapsible` 패널은 끝까지 끌면 접힙니다. 끌지 않고도 핸들 위 버튼을 누르거나, 핸들에서 Enter 를 누르면 접고 다시 펼칩니다. 펼치면 접기 전 크기로 돌아갑니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    const [handle] = handlesIn(canvasElement);
    const sidebar = canvasElement.querySelector<HTMLElement>('[data-splitter-panel]')!;
    await userEvent.click(canvas.getByRole('button', { name: '패널 접기' }));
    await waitFor(() => expect(valueOf(handle!)).toBe(0));
    await expect(sidebar).toHaveAttribute('data-collapsed');
    await expect(handle).toHaveAttribute('aria-valuetext', '접힘');
    await expect(args.onValueCommit).toHaveBeenLastCalledWith([0, 100]);
    handle!.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(valueOf(handle!)).toBe(30));
    await expect(canvas.getByRole('button', { name: '패널 접기' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  },
};

export const Controlled: Story = {
  render: function Render() {
    const [layout, setLayout] = useState([30, 70]);

    return (
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Button variant="outline" size="tiny" onClick={() => setLayout([50, 50])}>
            반반
          </Button>
          <Button variant="outline" size="tiny" onClick={() => setLayout([20, 80])}>
            좁게
          </Button>
        </div>
        <div className={frame}>
          <Splitter value={layout} onValueChange={setLayout}>
            <Splitter.Panel minSize={15}>
              <Pane>사이드바</Pane>
            </Splitter.Panel>
            <Splitter.Panel>
              <Pane>편집기</Pane>
            </Splitter.Panel>
          </Splitter>
        </div>
        <output aria-label="현재 레이아웃" className="text-body-b3-regular font-mono">
          {layout.map(Math.round).join(' : ')}
        </output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`value` 와 `onValueChange` 로 크기를 앱이 쥡니다. 값은 패널마다 퍼센트이고 합이 100 입니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '반반' }));
    await waitFor(() => expect(valueOf(handlesIn(canvasElement)[0]!)).toBe(50));
    handlesIn(canvasElement)[0]!.focus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByLabelText('현재 레이아웃')).toHaveTextContent('15 : 85');
  },
};

export const PersistLayout: Story = {
  render: function Render() {
    const [saved, setSaved] = useState<number[] | null>(null);

    return (
      <div className="flex flex-col gap-3">
        <div className={frame}>
          <Splitter
            defaultValue={[25, 75]}
            onValueCommit={(layout) => {
              document.cookie = `ids-splitter-layout=${encodeURIComponent(JSON.stringify(layout))}; path=/; max-age=31536000; samesite=lax`;
              setSaved(layout);
            }}
          >
            <Splitter.Panel minSize={15}>
              <Pane>사이드바</Pane>
            </Splitter.Panel>
            <Splitter.Panel>
              <Pane>편집기</Pane>
            </Splitter.Panel>
          </Splitter>
        </div>
        <output aria-label="저장한 레이아웃" className="text-body-b3-regular font-mono">
          {saved ? saved.map(Math.round).join(' : ') : '없음'}
        </output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '끌기나 키가 끝날 때 `onValueCommit` 으로 레이아웃을 쿠키에 적습니다. 서버가 그 쿠키를 읽어 `defaultValue` 로 넘기면 첫 화면부터 저장한 크기로 그려집니다(README 의 레이아웃 저장).',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    try {
      handlesIn(canvasElement)[0]!.focus();
      await userEvent.keyboard('{Home}');
      await expect(canvas.getByLabelText('저장한 레이아웃')).toHaveTextContent('15 : 85');
      await expect(document.cookie).toContain(
        `${LAYOUT_COOKIE}=${encodeURIComponent(JSON.stringify([15, 85]))}`,
      );
    } finally {
      document.cookie = `${LAYOUT_COOKIE}=; path=/; max-age=0`;
    }
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl" className={frame}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Splitter {...args}>
      <Splitter.Panel defaultSize={30}>
        <Pane>사이드바</Pane>
      </Splitter.Panel>
      <Splitter.Panel>
        <Pane>편집기</Pane>
      </Splitter.Panel>
    </Splitter>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`dir="rtl"` 안에서는 첫 패널이 오른쪽에 섭니다. ← 가 핸들을 왼쪽으로 옮겨 오른쪽 패널을 키우고, 끌기도 포인터를 따라갑니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    const [handle] = handlesIn(canvasElement);
    const first = canvasElement.querySelector<HTMLElement>('[data-splitter-panel]')!;
    const root = canvasElement.querySelector<HTMLElement>('[data-splitter]')!;
    await expect(first.getBoundingClientRect().right).toBeCloseTo(
      root.getBoundingClientRect().right,
      0,
    );
    handle!.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(valueOf(handle!)).toBeGreaterThan(30));
  },
};
