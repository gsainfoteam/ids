import { useState } from 'react';

import {
  ArrowRightStartOnRectangleIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ClipboardIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  LinkIcon,
  PencilIcon,
  ScissorsIcon,
  ShareIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/16/solid';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { overlay } from '../../../internal/overlay';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Dialog } from '../dialog';

import { Menu } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overlay/Menu',
  component: Menu,
  tags: ['autodocs'],
  argTypes: {
    triggerType: { control: 'radio', options: ['click', 'contextmenu'] },
  },
  args: {
    triggerType: 'click',
    onOpenChange: fn(),
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

function EditItems() {
  return (
    <>
      <Menu.Item>
        <ArrowUturnLeftIcon />
        실행 취소
        <Menu.Shortcut keys="mod+z" />
      </Menu.Item>
      <Menu.Item>
        <ArrowUturnRightIcon />
        다시 실행
        <Menu.Shortcut keys="mod+shift+z" />
      </Menu.Item>
      <Menu.Separator />
      <Menu.Item>
        <ScissorsIcon />
        잘라내기
        <Menu.Shortcut keys="mod+x" />
      </Menu.Item>
      <Menu.Item>
        <DocumentDuplicateIcon />
        복사
        <Menu.Shortcut keys="mod+c" />
      </Menu.Item>
      <Menu.Item disabled>
        <ClipboardIcon />
        붙여넣기
        <Menu.Shortcut keys="mod+v" />
      </Menu.Item>
    </>
  );
}

function ShareSub() {
  return (
    <Menu.Sub>
      <Menu.SubTrigger>
        <ShareIcon />
        공유
      </Menu.SubTrigger>
      <Menu.SubContent>
        <Menu.Item>
          <EnvelopeIcon />
          메일로 보내기
        </Menu.Item>
        <Menu.Item>
          <LinkIcon />
          링크 복사
        </Menu.Item>
      </Menu.SubContent>
    </Menu.Sub>
  );
}

const contextArea = 'context-area';

export const Playground: Story = {
  render: (args) => (
    <Menu {...args}>
      {args.triggerType === 'contextmenu' ? (
        <Menu.Trigger
          data-testid={contextArea}
          className="rounded-standard text-body-b3-regular flex h-40 w-80 items-center justify-center border border-dashed border-(--ids-color-border) text-(--ids-color-on-muted)"
        >
          여기를 우클릭하세요
        </Menu.Trigger>
      ) : (
        <Menu.Trigger asChild>
          <Button variant="outline">편집</Button>
        </Menu.Trigger>
      )}
      <Menu.Content aria-label={args.triggerType === 'contextmenu' ? '편집' : undefined}>
        <EditItems />
        <Menu.Separator />
        <ShareSub />
      </Menu.Content>
    </Menu>
  ),
};

function ViewOptions() {
  const [grid, setGrid] = useState(true);
  const [ruler, setRuler] = useState(false);
  const [zoom, setZoom] = useState('100');
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button variant="outline">보기</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
          격자 표시
        </Menu.CheckboxItem>
        <Menu.CheckboxItem
          checked={ruler}
          onCheckedChange={setRuler}
          onSelect={(event) => event.preventDefault()}
        >
          눈금자 표시 (열린 채로)
        </Menu.CheckboxItem>
        <Menu.Separator />
        <Menu.RadioGroup value={zoom} onValueChange={setZoom}>
          <Menu.Label>확대</Menu.Label>
          <Menu.RadioItem value="75">75%</Menu.RadioItem>
          <Menu.RadioItem value="100">100%</Menu.RadioItem>
          <Menu.RadioItem value="150">150%</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu>
  );
}

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Items"
        description="아이콘은 글자 앞에, 단축키(Menu.Shortcut)는 끝에 둡니다. disabled 항목은 흐리게 그려지고 방향키가 건너뜁니다."
      >
        <Showcase.Row label="기본">
          <Menu>
            <Menu.Trigger asChild>
              <Button variant="outline">편집</Button>
            </Menu.Trigger>
            <Menu.Content>
              <EditItems />
            </Menu.Content>
          </Menu>
        </Showcase.Row>
        <Showcase.Row label="아이콘 버튼">
          <Menu>
            <Menu.Trigger asChild>
              <IconButton variant="ghost" aria-label="더 보기" icon={<EllipsisHorizontalIcon />} />
            </Menu.Trigger>
            <Menu.Content align="end">
              <Menu.Item>
                <PencilIcon />
                이름 바꾸기
              </Menu.Item>
              <Menu.Item>
                <DocumentDuplicateIcon />
                복제
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item>
                <TrashIcon />
                삭제
              </Menu.Item>
            </Menu.Content>
          </Menu>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Checkbox · Radio"
        description="고른 상태는 끝의 표시로 보여 줍니다. 상태는 늘 제어해서 넘깁니다. onSelect 에서 preventDefault 하면 고른 뒤에도 메뉴가 열려 있습니다."
      >
        <Showcase.Row label="보기 설정">
          <ViewOptions />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Label · Group · Separator"
        description="Menu.Group 안의 Menu.Label 이 그룹의 이름이 됩니다. 그룹 사이는 Menu.Separator 로 나눕니다."
      >
        <Showcase.Row label="계정">
          <Menu>
            <Menu.Trigger asChild>
              <Button variant="outline">계정</Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Group>
                <Menu.Label>김지스트</Menu.Label>
                <Menu.Item>
                  <UserIcon />
                  프로필
                </Menu.Item>
                <Menu.Item>
                  <Cog6ToothIcon />
                  설정
                  <Menu.Shortcut keys="mod+," />
                </Menu.Item>
              </Menu.Group>
              <Menu.Separator />
              <Menu.Item>
                <ArrowRightStartOnRectangleIcon />
                로그아웃
              </Menu.Item>
            </Menu.Content>
          </Menu>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Submenu"
        description="Menu.Sub 로 하위 메뉴를 겁니다. 올려 두거나 → 키로 열고, ← 키나 Escape 로 하위 메뉴만 닫습니다."
      >
        <Showcase.Row label="공유">
          <Menu>
            <Menu.Trigger asChild>
              <Button variant="outline">파일</Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item>
                <PencilIcon />
                이름 바꾸기
              </Menu.Item>
              <ShareSub />
              <Menu.Sub>
                <Menu.SubTrigger disabled>내보내기</Menu.SubTrigger>
                <Menu.SubContent>
                  <Menu.Item>PDF</Menu.Item>
                </Menu.SubContent>
              </Menu.Sub>
            </Menu.Content>
          </Menu>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Context menu"
        description="triggerType='contextmenu' 이면 Menu.Trigger 영역을 우클릭한 자리에 열립니다."
      >
        <Showcase.Row label="우클릭">
          <Menu triggerType="contextmenu">
            <Menu.Trigger className="rounded-standard text-body-b3-regular flex h-32 w-72 items-center justify-center border border-dashed border-(--ids-color-border) text-(--ids-color-on-muted)">
              여기를 우클릭하세요
            </Menu.Trigger>
            <Menu.Content aria-label="편집">
              <EditItems />
            </Menu.Content>
          </Menu>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  render: () => (
    <Menu>
      <Menu.Trigger asChild>
        <Button variant="outline">편집</Button>
      </Menu.Trigger>
      <Menu.Content>
        <EditItems />
      </Menu.Content>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole('button', { name: '편집' }).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: /^실행 취소/ })).toHaveFocus());
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: /^복사/ })).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: /^실행 취소/ })).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByRole('button', { name: '편집' })).toHaveFocus());
    expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};

export const Submenu: Story = {
  render: () => (
    <Menu>
      <Menu.Trigger asChild>
        <Button variant="outline">파일</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>
          <PencilIcon />
          이름 바꾸기
        </Menu.Item>
        <ShareSub />
      </Menu.Content>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole('button', { name: '파일' }).focus();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: '공유' })).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(canvas.getByRole('menuitem', { name: '메일로 보내기' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: '공유' })).toHaveFocus());
    expect(canvas.queryByRole('menu', { name: '공유 하위 메뉴' })).not.toBeInTheDocument();
    expect(canvas.getByRole('menu', { name: '파일' })).toBeInTheDocument();
  },
};

function ChecklistDemo() {
  const [bold, setBold] = useState(false);
  const [align, setAlign] = useState('left');
  return (
    <div className="flex items-center gap-3">
      <Menu>
        <Menu.Trigger asChild>
          <Button variant="outline">서식</Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.CheckboxItem checked={bold} onCheckedChange={setBold}>
            굵게
          </Menu.CheckboxItem>
          <Menu.Separator />
          <Menu.RadioGroup value={align} onValueChange={setAlign}>
            <Menu.Label>정렬</Menu.Label>
            <Menu.RadioItem value="left">왼쪽</Menu.RadioItem>
            <Menu.RadioItem value="center">가운데</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>
      <span className="text-body-b3-regular">
        굵게 {bold ? '켜짐' : '꺼짐'}, 정렬 {align}
      </span>
    </div>
  );
}

export const CheckboxAndRadio: Story = {
  render: () => <ChecklistDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '서식' }));
    await userEvent.click(await canvas.findByRole('menuitemcheckbox', { name: '굵게' }));
    await waitFor(() => expect(canvas.getByText('굵게 켜짐, 정렬 left')).toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: '서식' }));
    await userEvent.click(await canvas.findByRole('menuitemradio', { name: '가운데' }));
    await waitFor(() => expect(canvas.getByText('굵게 켜짐, 정렬 center')).toBeInTheDocument());
  },
};

export const ContextMenu: Story = {
  render: () => (
    <Menu triggerType="contextmenu">
      <Menu.Trigger
        data-testid={contextArea}
        className="rounded-standard text-body-b3-regular flex h-40 w-80 items-center justify-center border border-dashed border-(--ids-color-border) text-(--ids-color-on-muted)"
      >
        여기를 우클릭하세요
      </Menu.Trigger>
      <Menu.Content aria-label="편집">
        <EditItems />
      </Menu.Content>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByTestId(contextArea) });
    const menu = await canvas.findByRole('menu', { name: '편집' });
    await waitFor(() => expect(menu).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('menu')).not.toBeInTheDocument());
  },
};

function RenameDemo() {
  const [name, setName] = useState('보고서.pdf');
  return (
    <div className="flex items-center gap-3">
      <Menu>
        <Menu.Trigger asChild>
          <IconButton variant="ghost" aria-label="파일 메뉴" icon={<EllipsisHorizontalIcon />} />
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item
            onSelect={async () => {
              const renamed = await overlay.open<string>(({ close }) => (
                <Dialog>
                  <Dialog.Content>
                    <Dialog.Header>
                      <Dialog.Title>이름 바꾸기</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Footer>
                      <Dialog.Close>취소</Dialog.Close>
                      <Button onClick={() => close('최종 보고서.pdf')}>바꾸기</Button>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog>
              ));
              if (renamed) setName(renamed);
            }}
          >
            <PencilIcon />
            이름 바꾸기…
          </Menu.Item>
        </Menu.Content>
      </Menu>
      <span className="text-body-b3-regular">{name}</span>
    </div>
  );
}

export const OpenDialogFromItem: Story = {
  render: () => <RenameDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '파일 메뉴' }));
    await userEvent.click(await canvas.findByRole('menuitem', { name: '이름 바꾸기…' }));
    await userEvent.click(await canvas.findByRole('button', { name: '바꾸기' }));
    await waitFor(() => expect(canvas.getByText('최종 보고서.pdf')).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByRole('button', { name: '파일 메뉴' })).toHaveFocus());
  },
};
