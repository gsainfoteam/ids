import { useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { FloatingButton } from '../../action/floating-button';
import { Select } from '../../form/select';
import { TextField } from '../../form/text-field';

import { Drawer } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sides = ['top', 'right', 'bottom', 'left'] as const;

const meta = {
  title: 'Overlay/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'radio', options: sides },
    role: { control: 'radio', options: ['dialog', 'alertdialog'] },
    modal: { control: 'boolean' },
    scaleBackground: { control: 'boolean' },
    dismissible: { control: 'boolean' },
    hideClose: { control: 'boolean' },
  },
  args: {
    side: 'right',
    role: 'dialog',
    modal: true,
    scaleBackground: true,
    dismissible: true,
    hideClose: false,
    onOpenChange: fn(),
    onOpenChangeComplete: fn(),
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Drawer {...args}>
      <Drawer.Trigger asChild>
        <Button variant="outline">필터</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Handle />
        <Drawer.Header>
          <Drawer.Title>필터</Drawer.Title>
          <Drawer.Description>조건을 고르면 목록이 바로 바뀝니다.</Drawer.Description>
        </Drawer.Header>
        <TextField aria-label="검색어" placeholder="검색어" />
        <Drawer.Footer>
          <Drawer.Close>취소</Drawer.Close>
          <Drawer.Close asChild>
            <Button>적용</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  ),
};

const sideLabels = { top: '위', right: '오른쪽', bottom: '아래', left: '왼쪽' } as const;

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Side"
        description="side 로 밀려 나오는 가장자리를 고릅니다. 기본은 right 이고, 화면에 닿는 쪽 모서리는 각지고 안쪽 모서리만 둥급니다."
      >
        <Showcase.Row label="side">
          {sides.map((side) => (
            <Drawer key={side} side={side}>
              <Drawer.Trigger asChild>
                <Button variant="outline">{sideLabels[side]}</Button>
              </Drawer.Trigger>
              <Drawer.Content>
                <Drawer.Handle />
                <Drawer.Header>
                  <Drawer.Title>{sideLabels[side]}에서 열기</Drawer.Title>
                  <Drawer.Description>끌어서 닫거나 Escape 를 누릅니다.</Drawer.Description>
                </Drawer.Header>
                <Drawer.Footer>
                  <Drawer.Close>닫기</Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer>
          ))}
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Snap points"
        description="snapPoints 로 멈출 높이를 정합니다. 화면 비율(0~1)이나 '320px' 를 씁니다. 손잡이를 누르거나 Enter 로 다음 높이로 갑니다. 배경은 fadeFromIndex 부터 어두워집니다."
      >
        <Showcase.Row label="snapPoints">
          <Drawer side="bottom" snapPoints={[0.3, 0.6, 1]}>
            <Drawer.Trigger asChild>
              <Button variant="outline">지도 목록</Button>
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Handle />
              <Drawer.Header>
                <Drawer.Title>주변 식당</Drawer.Title>
                <Drawer.Description>위로 끌어 올리면 더 보입니다.</Drawer.Description>
              </Drawer.Header>
            </Drawer.Content>
          </Drawer>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Modal"
        description="modal={false} 는 배경 없이 뜨고, 뒤 페이지를 계속 누르고 스크롤할 수 있습니다. 바깥을 눌러도 닫히지 않습니다. scaleBackground={false} 는 뒤 페이지를 줄이지 않습니다."
      >
        <Showcase.Row label="modal={false}">
          <Drawer side="left" modal={false}>
            <Drawer.Trigger asChild>
              <Button variant="outline">목차</Button>
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>목차</Drawer.Title>
              </Drawer.Header>
            </Drawer.Content>
          </Drawer>
        </Showcase.Row>
        <Showcase.Row label="scaleBackground">
          <Drawer side="bottom" scaleBackground={false}>
            <Drawer.Trigger asChild>
              <Button variant="outline">페이지를 줄이지 않고</Button>
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Handle />
              <Drawer.Header>
                <Drawer.Title>공유</Drawer.Title>
              </Drawer.Header>
            </Drawer.Content>
          </Drawer>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Size"
        description="크기 prop 은 없습니다. 좌우는 w-[min(24rem,100%-2rem)], 위아래는 내용 높이이고 className 으로 바꿉니다."
      >
        <Showcase.Row label="className">
          <Drawer>
            <Drawer.Trigger asChild>
              <Button variant="outline">넓게</Button>
            </Drawer.Trigger>
            <Drawer.Content className="w-[min(40rem,calc(100%-2rem))]">
              <Drawer.Header>
                <Drawer.Title>넓은 서랍</Drawer.Title>
              </Drawer.Header>
            </Drawer.Content>
          </Drawer>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const KeyboardAndFocus: Story = {
  render: () => (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button variant="outline">이름 바꾸기</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>이름 바꾸기</Drawer.Title>
        </Drawer.Header>
        <TextField aria-label="새 이름" data-1p-ignore data-lpignore="true" />
        <Drawer.Footer>
          <Drawer.Close>취소</Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '이름 바꾸기' }));
    await waitFor(() => expect(canvas.getByRole('textbox', { name: '새 이름' })).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByRole('button', { name: '이름 바꾸기' })).toHaveFocus());
  },
};

function SnapDemo() {
  const [snap, setSnap] = useState<Drawer.SnapPoint>(0.3);
  return (
    <Drawer
      side="bottom"
      snapPoints={[0.3, '420px', 1]}
      activeSnapPoint={snap}
      onActiveSnapPointChange={setSnap}
    >
      <Drawer.Trigger asChild>
        <Button variant="outline">경로 보기</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Handle />
        <Drawer.Header>
          <Drawer.Title>경로</Drawer.Title>
          <Drawer.Description>지금 높이: {String(snap)}</Drawer.Description>
        </Drawer.Header>
      </Drawer.Content>
    </Drawer>
  );
}

export const SnapPoints: Story = {
  render: () => <SnapDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '경로 보기' }));
    const handle = await canvas.findByRole('button', { name: '끌어서 크기 조절' });
    handle.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByText('지금 높이: 420px')).toBeInTheDocument());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByText('지금 높이: 1')).toBeInTheDocument());
  },
};

export const Nested: Story = {
  render: () => (
    <Drawer side="bottom">
      <Drawer.Trigger asChild>
        <Button variant="outline">설정</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Handle />
        <Drawer.Header>
          <Drawer.Title>설정</Drawer.Title>
          <Drawer.Description>
            안에서 연 서랍이 위에 쌓이고, 아래 서랍은 뒤로 물러납니다.
          </Drawer.Description>
        </Drawer.Header>
        <Select aria-label="언어" mobileVariant="drawer" defaultValue="ko">
          <Select.Item value="ko">한국어</Select.Item>
          <Select.Item value="en">English</Select.Item>
        </Select>
        <Drawer side="bottom">
          <Drawer.Trigger asChild>
            <Button variant="outline">비밀번호 변경</Button>
          </Drawer.Trigger>
          <Drawer.Content>
            <Drawer.Handle />
            <Drawer.Header>
              <Drawer.Title>비밀번호 변경</Drawer.Title>
            </Drawer.Header>
            <Drawer.Footer>
              <Drawer.Close>취소</Drawer.Close>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </Drawer.Content>
    </Drawer>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '설정' }));
    await userEvent.click(await canvas.findByRole('button', { name: '비밀번호 변경' }));
    await canvas.findByRole('dialog', { name: '비밀번호 변경' });
    await waitFor(() =>
      expect(canvas.getByRole('dialog', { name: '설정' })).toHaveAttribute('data-nested-open'),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.queryByRole('dialog', { name: '비밀번호 변경' })).not.toBeInTheDocument(),
    );
    expect(canvas.getByRole('dialog', { name: '설정' })).toBeInTheDocument();
  },
};

function NonModalDemo() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col items-end gap-3">
      <Button variant="outline" onClick={() => setCount((value) => value + 1)}>
        페이지 버튼 {count}
      </Button>
      <Drawer side="left" modal={false}>
        <Drawer.Trigger asChild>
          <Button variant="outline">목차 열기</Button>
        </Drawer.Trigger>
        <Drawer.Content className="w-60">
          <Drawer.Header>
            <Drawer.Title>목차</Drawer.Title>
          </Drawer.Header>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}

export const NonModal: Story = {
  render: () => <NonModalDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '목차 열기' }));
    await canvas.findByRole('dialog', { name: '목차' });
    await userEvent.click(canvas.getByRole('button', { name: /페이지 버튼/ }));
    await waitFor(() => expect(canvas.getByText('페이지 버튼 1')).toBeInTheDocument());
    expect(canvas.getByRole('dialog', { name: '목차' })).toBeInTheDocument();
  },
};

export const FixedElementsBehind: Story = {
  name: 'Fixed elements behind',
  render: () => (
    <div className="flex h-[200vh] flex-col gap-3">
      <p className="text-body-b3-regular text-(--ids-color-on-muted)">
        페이지를 내린 뒤 열어 보세요. 오른쪽 아래 버튼은 화면에 있던 자리에서 페이지와 함께
        줄어듭니다.
      </p>
      <Drawer side="bottom">
        <Drawer.Trigger asChild>
          <Button variant="outline" className="self-start">
            열기
          </Button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Handle />
          <Drawer.Header>
            <Drawer.Title>새 글</Drawer.Title>
          </Drawer.Header>
        </Drawer.Content>
      </Drawer>
      <FloatingButton aria-label="글쓰기">+</FloatingButton>
    </div>
  ),
};
