import { useState } from 'react';

import {
  ArrowRightStartOnRectangleIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ArrowDownTrayIcon,
  ClipboardIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  DocumentPlusIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  FolderOpenIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PencilIcon,
  PhotoIcon,
  PrinterIcon,
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
import { Kbd } from '../../typography/kbd';
import { Dialog } from '../dialog';

import { Menu } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overlay/Menu',
  component: Menu,
  tags: ['autodocs'],
  argTypes: {
    triggerType: { control: 'radio', options: ['click', 'contextmenu', 'command'] },
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

function ShareMenu() {
  return (
    <Menu>
      <Menu.Trigger>
        <ShareIcon />
        공유
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>
          <EnvelopeIcon />
          메일로 보내기
        </Menu.Item>
        <Menu.Item>
          <LinkIcon />
          링크 복사
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
}

function ExportMenu() {
  return (
    <Menu>
      <Menu.Trigger>
        <ArrowDownTrayIcon />
        내보내기
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>PDF 문서</Menu.Item>
        <Menu>
          <Menu.Trigger>
            <PhotoIcon />
            이미지
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item>PNG</Menu.Item>
            <Menu>
              <Menu.Trigger>JPEG</Menu.Trigger>
              <Menu.Content>
                <Menu.Item>고화질</Menu.Item>
                <Menu.Item>보통</Menu.Item>
                <Menu>
                  <Menu.Trigger>저화질</Menu.Trigger>
                  <Menu.Content>
                    <Menu.Item>메일 첨부용 (1MB 이하)</Menu.Item>
                    <Menu.Item>메신저용 (300KB 이하)</Menu.Item>
                  </Menu.Content>
                </Menu>
              </Menu.Content>
            </Menu>
            <Menu.Item>WebP</Menu.Item>
          </Menu.Content>
        </Menu>
        <Menu.Item>HTML 웹 페이지</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}

function DocumentMenu() {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button variant="outline">문서</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>
          <DocumentPlusIcon />새 문서
        </Menu.Item>
        <ExportMenu />
        <Menu.Item>
          <PrinterIcon />
          인쇄
          <Menu.Shortcut keys="mod+p" />
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
}

function CommandPaletteDemo() {
  const [last, setLast] = useState('없음');
  const [dark, setDark] = useState(false);

  const run = (name: string) => () => setLast(name);

  return (
    <div className="flex items-center gap-3">
      <Menu triggerType="command" hotkey="mod+k">
        <Menu.Trigger asChild>
          <Button variant="outline">
            <MagnifyingGlassIcon />
            명령 찾기
            <Kbd keys="mod+k" size="tiny" />
          </Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Search data-1p-ignore data-lpignore="true" />
          <Menu.Group>
            <Menu.Label>문서</Menu.Label>
            <Menu.Item onSelect={run('새 문서')}>
              <DocumentPlusIcon />새 문서
              <Menu.Shortcut keys="mod+n" />
            </Menu.Item>
            <Menu.Item onSelect={run('열기')}>
              <FolderOpenIcon />
              열기…
              <Menu.Shortcut keys="mod+o" />
            </Menu.Item>
            <Menu.Item onSelect={run('인쇄')}>
              <PrinterIcon />
              인쇄
              <Menu.Shortcut keys="mod+p" />
            </Menu.Item>
            <Menu.Item disabled>
              <ClipboardIcon />
              붙여넣기
            </Menu.Item>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Group>
            <Menu.Label>보기</Menu.Label>
            <Menu.CheckboxItem checked={dark} onCheckedChange={setDark}>
              <MoonIcon />
              어두운 화면
            </Menu.CheckboxItem>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Group>
            <Menu.Label>계정</Menu.Label>
            <Menu.Item onSelect={run('설정')}>
              <Cog6ToothIcon />
              설정
              <Menu.Shortcut keys="mod+," />
            </Menu.Item>
            <Menu.Item onSelect={run('로그아웃')}>
              <ArrowRightStartOnRectangleIcon />
              로그아웃
            </Menu.Item>
          </Menu.Group>
          <Menu.Empty>일치하는 명령이 없습니다.</Menu.Empty>
        </Menu.Content>
      </Menu>
      <span className="text-body-b3-regular">
        마지막 명령: {last}, 어두운 화면 {dark ? '켜짐' : '꺼짐'}
      </span>
    </div>
  );
}

const contextArea = 'context-area';

export const Playground: Story = {
  render: (args) => (
    <Menu {...args}>
      {args.triggerType === 'command' ? (
        <>
          <Menu.Trigger asChild>
            <Button variant="outline">명령 찾기</Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Search />
            <EditItems />
          </Menu.Content>
        </>
      ) : args.triggerType === 'contextmenu' ? (
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
      {args.triggerType !== 'command' && (
        <Menu.Content aria-label={args.triggerType === 'contextmenu' ? '편집' : undefined}>
          <EditItems />
          <Menu.Separator />
          <ShareMenu />
        </Menu.Content>
      )}
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
        description="Menu.Content 안에 Menu 를 두면 하위 메뉴가 됩니다. 그 Menu.Trigger 는 화살표가 붙은 항목으로 그려집니다. 올려 두거나 → 키로 열고, ← 키나 Escape 로 하위 메뉴만 닫습니다."
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
              <ShareMenu />
              <Menu>
                <Menu.Trigger disabled>내보내기</Menu.Trigger>
                <Menu.Content>
                  <Menu.Item>PDF</Menu.Item>
                </Menu.Content>
              </Menu>
            </Menu.Content>
          </Menu>
        </Showcase.Row>
        <Showcase.Row label="여러 단계">
          <DocumentMenu />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Command palette"
        description="triggerType='command' 는 화면 위쪽 가운데의 modal 명령 팔레트입니다. 검색 상자에 글자를 치면 항목이 걸러지고, ↑ ↓ 로 고르고 Enter 로 실행합니다. hotkey 로 어디서든 엽니다."
      >
        <Showcase.Row label="mod+k">
          <CommandPaletteDemo />
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
        <ShareMenu />
      </Menu.Content>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole('button', { name: '파일' }).focus();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: '공유' })).toHaveFocus());
    expect(canvas.getByRole('menuitem', { name: '공유' })).toHaveAttribute('aria-haspopup', 'menu');
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

export const NestedSubmenus: Story = {
  render: () => <DocumentMenu />,
  play: async ({ canvas, userEvent }) => {
    const focused = (name: string) =>
      waitFor(() => expect(canvas.getByRole('menuitem', { name })).toHaveFocus());

    canvas.getByRole('button', { name: '문서' }).focus();
    await userEvent.keyboard('{Enter}');
    await focused('새 문서');

    for (const [trigger, first] of [
      ['내보내기', 'PDF 문서'],
      ['이미지', 'PNG'],
    ] as const) {
      await userEvent.keyboard('{ArrowDown}');
      await focused(trigger);
      await userEvent.keyboard('{ArrowRight}');
      await focused(first);
    }

    await userEvent.keyboard('{ArrowDown}');
    await focused('JPEG');
    await userEvent.keyboard('{ArrowRight}');
    await focused('고화질');
    await userEvent.keyboard('{End}');
    await focused('저화질');
    await userEvent.keyboard('{ArrowRight}');
    await focused('메일 첨부용 (1MB 이하)');
    expect(canvas.getAllByRole('menu')).toHaveLength(5);

    await userEvent.keyboard('{ArrowLeft}');
    await focused('저화질');
    expect(canvas.queryByRole('menu', { name: '저화질 하위 메뉴' })).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await focused('JPEG');
    expect(canvas.queryByRole('menu', { name: 'JPEG 하위 메뉴' })).not.toBeInTheDocument();
    await userEvent.keyboard('{ArrowLeft}');
    await focused('이미지');
    await userEvent.keyboard('{Escape}');
    await focused('내보내기');
    expect(canvas.getAllByRole('menu')).toHaveLength(1);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByRole('button', { name: '문서' })).toHaveFocus());
    expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};

export const CommandPalette: Story = {
  render: () => <CommandPaletteDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^명령 찾기/ }));
    const search = await canvas.findByRole('combobox', { name: '명령 검색' });
    await waitFor(() => expect(search).toHaveFocus());

    await userEvent.type(search, 'zzz');
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('일치하는 명령이 없습니다.'),
    );
    expect(canvas.queryAllByRole('option')).toHaveLength(0);

    await userEvent.clear(search);
    await userEvent.type(search, '설정');
    await waitFor(() =>
      expect(canvas.getByRole('option', { name: /^설정/ })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(canvas.getAllByRole('option')).toHaveLength(1);
    expect(canvas.queryByRole('group', { name: '문서' })).not.toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    expect(canvas.getByText('마지막 명령: 설정, 어두운 화면 꺼짐')).toBeInTheDocument();
    await waitFor(() => expect(canvas.getByRole('button', { name: /^명령 찾기/ })).toHaveFocus());
  },
};
