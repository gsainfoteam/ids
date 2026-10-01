import { useRef, useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { overlay } from '../../../internal/overlay';
import { Button } from '../../action/button';
import { TextField } from '../../form/text-field';

import { Popover } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overlay/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {
    modal: { control: 'boolean' },
    triggerType: { control: 'radio', options: ['click', 'hover'] },
    openDelay: { control: { type: 'number', min: 0, step: 50 } },
    closeDelay: { control: { type: 'number', min: 0, step: 50 } },
  },
  args: {
    modal: false,
    triggerType: 'click',
    openDelay: 200,
    closeDelay: 100,
    onOpenChange: fn(),
    onOpenChangeComplete: fn(),
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger asChild>
        <Button variant="outline">공유</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Arrow />
        <Popover.Title>링크 공유</Popover.Title>
        <Popover.Description>링크가 있는 사람은 누구나 볼 수 있습니다.</Popover.Description>
        <TextField aria-label="링크" defaultValue="https://gistory.me/p/42" readOnly />
      </Popover.Content>
    </Popover>
  ),
};

const sides = ['top', 'right', 'bottom', 'left'] as const;
const aligns = ['start', 'center', 'end'] as const;

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Side × Align"
        description="side 쪽에 붙고 align 으로 정렬합니다. 자리가 모자라면 반대쪽으로 넘어갑니다."
      >
        <Showcase.Matrix
          rows={sides}
          columns={aligns}
          render={(side, align) => (
            <Popover>
              <Popover.Trigger asChild>
                <Button variant="outline" size="tiny">
                  {side} {align}
                </Button>
              </Popover.Trigger>
              <Popover.Content side={side} align={align} className="w-48">
                <Popover.Arrow />
                {side} / {align}
              </Popover.Content>
            </Popover>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Anatomy"
        description="Title 과 Description 이 이름과 설명이 됩니다. Arrow 와 Close 는 필요할 때만 넣습니다."
      >
        <Showcase.Row label="기본">
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="outline">기본</Button>
            </Popover.Trigger>
            <Popover.Content>
              <Popover.Title>Pro 플랜</Popover.Title>
              <Popover.Description>이 기능은 Pro 플랜에서 쓸 수 있습니다.</Popover.Description>
            </Popover.Content>
          </Popover>
        </Showcase.Row>
        <Showcase.Row label="Arrow">
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="outline">화살표</Button>
            </Popover.Trigger>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Title>화살표</Popover.Title>
              <Popover.Description>trigger 쪽을 가리킵니다.</Popover.Description>
            </Popover.Content>
          </Popover>
        </Showcase.Row>
        <Showcase.Row label="Close">
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="outline">닫기 버튼</Button>
            </Popover.Trigger>
            <Popover.Content>
              <div className="flex items-center justify-between gap-2">
                <Popover.Title>알림</Popover.Title>
                <Popover.Close />
              </div>
              <Popover.Description>새 댓글이 3개 있습니다.</Popover.Description>
              <Popover.Close asChild>
                <Button size="tiny">모두 읽음</Button>
              </Popover.Close>
            </Popover.Content>
          </Popover>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Trigger type"
        description="hover 는 올려 둔 채 openDelay 가 지나면 열리고, 포인터가 content 로 건너가는 동안은 닫히지 않습니다."
      >
        <Showcase.Row label="click">
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="outline">누르면</Button>
            </Popover.Trigger>
            <Popover.Content>눌러서 열었습니다.</Popover.Content>
          </Popover>
        </Showcase.Row>
        <Showcase.Row label="hover">
          <Popover triggerType="hover">
            <Popover.Trigger asChild>
              <Button variant="ghost">올리면</Button>
            </Popover.Trigger>
            <Popover.Content>
              <Popover.Title>김지스트</Popover.Title>
              <Popover.Description>정보통신팀 · 프론트엔드</Popover.Description>
            </Popover.Content>
          </Popover>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Modal"
        description="modal 은 포커스를 안에 가두고 뒤 페이지의 스크롤과 누르기를 막습니다."
      >
        <Showcase.Row label="modal">
          <Popover modal>
            <Popover.Trigger asChild>
              <Button variant="outline">이름 편집</Button>
            </Popover.Trigger>
            <Popover.Content aria-label="이름 편집">
              <TextField aria-label="이름" defaultValue="김지스트" />
              <div className="flex justify-end gap-2">
                <Popover.Close>취소</Popover.Close>
                <Popover.Close asChild>
                  <Button>저장</Button>
                </Popover.Close>
              </div>
            </Popover.Content>
          </Popover>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const KeyboardAndFocus: Story = {
  render: () => (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline">메모 추가</Button>
      </Popover.Trigger>
      <Popover.Content initialFocus="input">
        <Popover.Title>메모</Popover.Title>
        <TextField aria-label="메모 내용" data-1p-ignore data-lpignore="true" />
      </Popover.Content>
    </Popover>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '메모 추가' }));
    await waitFor(() => expect(canvas.getByRole('textbox', { name: '메모 내용' })).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByRole('button', { name: '메모 추가' })).toHaveFocus());
  },
};

export const HoverCard: Story = {
  render: () => (
    <Popover triggerType="hover" openDelay={0} closeDelay={0}>
      <Popover.Trigger asChild>
        <Button variant="ghost">@gistory</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Arrow />
        <Popover.Title>gistory</Popover.Title>
        <Popover.Description>GIST 학생을 위한 서비스를 만듭니다.</Popover.Description>
      </Popover.Content>
    </Popover>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('button', { name: '@gistory' }));
    await waitFor(() =>
      expect(canvas.getByRole('dialog', { name: 'gistory' })).toBeInTheDocument(),
    );
  },
};

export const Modal: Story = {
  render: () => (
    <Popover modal>
      <Popover.Trigger asChild>
        <Button variant="outline">이름 편집</Button>
      </Popover.Trigger>
      <Popover.Content aria-label="이름 편집">
        <TextField aria-label="이름" data-1p-ignore data-lpignore="true" />
        <div className="flex justify-end gap-2">
          <Popover.Close>취소</Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '이름 편집' }));
    await waitFor(() => expect(canvas.getByRole('textbox', { name: '이름' })).toHaveFocus());
    await userEvent.keyboard('{Tab}');
    await waitFor(() => expect(canvas.getByRole('button', { name: '취소' })).toHaveFocus());
    await userEvent.click(canvas.getByRole('button', { name: '취소' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: '이름 편집' })).toHaveFocus());
  },
};

export const Nested: Story = {
  render: () => (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline">필터</Button>
      </Popover.Trigger>
      <Popover.Content aria-label="필터">
        <p>안에서 연 popover 는 위에 쌓이고, 바깥 popover 를 누르면 안쪽만 닫힙니다.</p>
        <Popover>
          <Popover.Trigger asChild>
            <Button variant="outline" size="tiny">
              기간
            </Button>
          </Popover.Trigger>
          <Popover.Content aria-label="기간" side="right" className="w-40">
            최근 7일
          </Popover.Content>
        </Popover>
      </Popover.Content>
    </Popover>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '필터' }));
    await userEvent.click(await canvas.findByRole('button', { name: '기간' }));
    await canvas.findByRole('dialog', { name: '기간' });
    await userEvent.click(canvas.getByText(/안에서 연 popover/));
    await waitFor(() =>
      expect(canvas.queryByRole('dialog', { name: '기간' })).not.toBeInTheDocument(),
    );
    expect(canvas.getByRole('dialog', { name: '필터' })).toBeInTheDocument();
  },
};

export const OpenFromAnywhere: Story = {
  name: 'overlay.open',
  render: function Render() {
    const [color, setColor] = useState('없음');
    const anchor = useRef<HTMLSpanElement>(null);

    return (
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={async () => {
            const picked = await overlay.open<string>(({ close }) => (
              <Popover>
                <Popover.Content aria-label="색 고르기" anchor={anchor} className="w-auto">
                  <div className="flex gap-2">
                    <Button size="tiny" onClick={() => close('빨강')}>
                      빨강
                    </Button>
                    <Button size="tiny" onClick={() => close('파랑')}>
                      파랑
                    </Button>
                  </div>
                </Popover.Content>
              </Popover>
            ));
            setColor(picked ?? '닫음');
          }}
        >
          색 고르기
        </Button>
        <span ref={anchor} className="text-body-b3-regular">
          고른 색: {color}
        </span>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '색 고르기' }));
    await userEvent.click(await canvas.findByRole('button', { name: '파랑' }));
    await waitFor(() => expect(canvas.getByText('고른 색: 파랑')).toBeInTheDocument());
  },
};
