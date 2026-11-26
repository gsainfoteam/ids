import { useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { useDrawer } from './hooks/use-drawer';
import { Button } from '../../action/button';
import { FloatingButton } from '../../action/floating-button';
import { Select } from '../../form/select';
import { TextField } from '../../form/text-field';

import { Drawer } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sides = ['top', 'right', 'bottom', 'left'] as const;

const sideLabels = { top: '위', right: '오른쪽', bottom: '아래', left: '왼쪽' } as const;

const meta = {
  title: 'Overlay/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'radio', options: sides },
    role: { control: 'radio', options: ['dialog', 'alertdialog'] },
    modal: { control: 'boolean' },
    dismissible: { control: 'boolean' },
  },
  args: {
    side: 'right',
    role: 'dialog',
    modal: true,
    dismissible: true,
    onOpenChange: fn(),
    onOpenChangeComplete: fn(),
  },
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
        <Drawer.Close />
      </Drawer.Content>
    </Drawer>
  ),
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button variant="outline">알림 설정</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>알림 설정</Drawer.Title>
          <Drawer.Description>받을 알림을 고릅니다.</Drawer.Description>
        </Drawer.Header>
        <Drawer.Footer>
          <Drawer.Close>닫기</Drawer.Close>
        </Drawer.Footer>
        <Drawer.Close />
      </Drawer.Content>
    </Drawer>
  ),
};

export const Gallery: Story = {
  render: function Render() {
    const map = useDrawer({ snap: { points: [0.3, 0.6, 1] } });

    return (
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
          title="Close"
          description="닫기 버튼은 Drawer.Close 를 쓸 때만 그립니다. children 없는 Drawer.Close 는 모서리의 X 이고, children 을 주면 outline 버튼, asChild 면 그 요소가 닫습니다."
        >
          <Showcase.Row label="corner">
            <Drawer>
              <Drawer.Trigger asChild>
                <Button variant="outline">모서리 X</Button>
              </Drawer.Trigger>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>모서리 X</Drawer.Title>
                </Drawer.Header>
                <Drawer.Close />
              </Drawer.Content>
            </Drawer>
          </Showcase.Row>
          <Showcase.Row label="footer">
            <Drawer>
              <Drawer.Trigger asChild>
                <Button variant="outline">Footer 버튼</Button>
              </Drawer.Trigger>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>Footer 버튼</Drawer.Title>
                </Drawer.Header>
                <Drawer.Footer>
                  <Drawer.Close>취소</Drawer.Close>
                  <Drawer.Close asChild>
                    <Button>확인</Button>
                  </Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer>
          </Showcase.Row>
          <Showcase.Row label="none">
            <Drawer side="bottom">
              <Drawer.Trigger asChild>
                <Button variant="outline">버튼 없이</Button>
              </Drawer.Trigger>
              <Drawer.Content>
                <Drawer.Handle />
                <Drawer.Header>
                  <Drawer.Title>버튼 없이</Drawer.Title>
                  <Drawer.Description>
                    끌어 내리거나 바깥을 누르거나 Escape 로 닫습니다.
                  </Drawer.Description>
                </Drawer.Header>
              </Drawer.Content>
            </Drawer>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section
          title="Snap points"
          description="useDrawer({ snap: { points } }) 의 결과를 drawer 로 넘기면 그 높이들에 멈춥니다. 화면 비율(0~1)이나 '320px' 를 씁니다. 손잡이를 누르거나 Enter 로 다음 높이로 갑니다."
        >
          <Showcase.Row label="snap">
            <Drawer side="bottom" drawer={map}>
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
          description="modal 이면 배경이 깔리고 뒤 페이지가 조금 작아집니다. modal={false} 는 배경 없이 뜨고, 뒤 페이지를 계속 누르고 스크롤할 수 있습니다. 바깥을 눌러도 닫히지 않습니다."
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
                <Drawer.Close />
              </Drawer.Content>
            </Drawer>
          </Showcase.Row>
        </Showcase.Section>
      </Showcase>
    );
  },
};

export const StopAtSnapPoints: Story = {
  render: function Render() {
    const [snap, setSnap] = useState<Drawer.SnapPoint>(0.3);
    const drawer = useDrawer({
      snap: { points: [0.3, '420px', 1], value: snap, onValueChange: setSnap },
    });

    return (
      <Drawer side="bottom" drawer={drawer}>
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
  },
  parameters: {
    docs: {
      description: {
        story:
          '`useDrawer({ snap })` 의 `points` 에 멈출 높이를 적고, 결과를 `drawer` 로 넘깁니다. `value` 와 `onValueChange` 로 지금 높이를 읽고 바꾸며, 손잡이를 누르거나 Enter 를 누르면 다음 높이로 갑니다. 배경은 `fadeFrom` 번째 높이부터 어두워지고, 주지 않으면 마지막 높이에서만 어둡습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '경로 보기' }));
    const handle = await canvas.findByRole('button', { name: '크기 조절' });
    handle.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByText('지금 높이: 420px')).toBeInTheDocument());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByText('지금 높이: 1')).toBeInTheDocument());
  },
};

export const StackADrawerOnADrawer: Story = {
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
        <Select aria-label="언어" defaultValue="ko">
          <Select.Content narrow="drawer">
            <Select.Item value="ko">한국어</Select.Item>
            <Select.Item value="en">English</Select.Item>
          </Select.Content>
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
  parameters: {
    docs: {
      description: {
        story:
          '서랍 안에 Drawer 를 하나 더 쓰면 위에 쌓이고, 아래 서랍은 뒤로 물러납니다. Escape 는 맨 위 서랍만 닫습니다.',
      },
    },
  },
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

export const KeepThePageUsableBehind: Story = {
  render: function Render() {
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
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>목차</Drawer.Title>
            </Drawer.Header>
            <Drawer.Close />
          </Drawer.Content>
        </Drawer>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`modal={false}` 면 배경을 깔지 않고 뒤 페이지를 줄이지 않습니다. 서랍을 연 채로 페이지를 누르고 스크롤할 수 있고, 바깥을 눌러도 닫히지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '목차 열기' }));
    await canvas.findByRole('dialog', { name: '목차' });
    await userEvent.click(canvas.getByRole('button', { name: /페이지 버튼/ }));
    await waitFor(() => expect(canvas.getByText('페이지 버튼 1')).toBeInTheDocument());
    expect(canvas.getByRole('dialog', { name: '목차' })).toBeInTheDocument();
  },
};

export const Keyboard: Story = {
  tags: ['verification'],
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
        <Drawer.Close />
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

export const FixedElementsBehind: Story = {
  tags: ['verification'],
  render: () => (
    <div className="flex h-[200vh] flex-col items-start gap-3">
      <p className="text-body-b3-regular text-neutral">
        페이지를 내린 뒤 열어 보세요. 오른쪽 아래 버튼은 화면에 있던 자리에서 페이지와 함께
        줄어듭니다.
      </p>
      <Drawer side="bottom">
        <Drawer.Trigger asChild>
          <Button variant="outline">열기</Button>
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
