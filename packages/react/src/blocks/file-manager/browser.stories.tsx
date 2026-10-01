import { useState, type ReactNode } from 'react';

import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  FolderIcon,
  FolderPlusIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PresentationChartBarIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { IconToggle } from '../../components/action/icon-toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { Progress } from '../../components/feedback/progress';
import { toast } from '../../components/feedback/toast';
import { FileField } from '../../components/form/file-field';
import { TextField } from '../../components/form/text-field';
import { Breadcrumb } from '../../components/navigation/breadcrumb';
import { Dialog } from '../../components/overlay/dialog';
import { Menu } from '../../components/overlay/menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/FileManager/Browser',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Kind = 'document' | 'image' | 'sheet' | 'slides';

const KIND_ICON: Record<Kind, ReactNode> = {
  document: <DocumentTextIcon />,
  image: <PhotoIcon />,
  sheet: <TableCellsIcon />,
  slides: <PresentationChartBarIcon />,
};

const FOLDERS = [
  { id: 'meetings', name: '회의록', count: 12 },
  { id: 'design', name: '디자인 시안', count: 38 },
  { id: 'recruit', name: '신입 모집', count: 7 },
];

const FILES: { id: string; name: string; kind: Kind; size: string; updated: string }[] = [
  { id: 'f1', name: '가을 축제 부스 기획안.pdf', kind: 'document', size: '2.4MB', updated: '오늘' },
  { id: 'f2', name: '굿즈 스티커 시안.png', kind: 'image', size: '4.8MB', updated: '어제' },
  { id: 'f3', name: '동아리 예산.xlsx', kind: 'sheet', size: '86KB', updated: '9월 28일' },
  { id: 'f4', name: '신입 설명회 발표.pptx', kind: 'slides', size: '12.1MB', updated: '9월 25일' },
  { id: 'f5', name: '부스 배치도.png', kind: 'image', size: '1.2MB', updated: '9월 24일' },
  {
    id: 'f6',
    name: '10월 정기 회의 안건.docx',
    kind: 'document',
    size: '32KB',
    updated: '9월 23일',
  },
];

type View = 'grid' | 'list';

const isView = (value: string): value is View => value === 'grid' || value === 'list';

export const PC: Story = {
  render: function Render() {
    const [view, setView] = useState<View>('grid');
    const [query, setQuery] = useState('');

    const shown = FILES.filter((file) => file.name.includes(query));

    const fileMenu = (name: string) => (
      <Menu>
        <Menu.Trigger asChild>
          <IconButton
            variant="outline"
            size="tiny"
            aria-label={`${name} 메뉴`}
            icon={<EllipsisHorizontalIcon />}
          />
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={() => toast(`${name}을 내려받아요`)}>내려받기</Menu.Item>
          <Menu.Item>이름 바꾸기</Menu.Item>
          <Menu.Item>옮기기</Menu.Item>
          <Menu.Separator />
          <Menu.Item onSelect={() => toast(`${name}을 휴지통으로 옮겼어요`)}>지우기</Menu.Item>
        </Menu.Content>
      </Menu>
    );

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-col gap-4">
          <Breadcrumb aria-label="위치">
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#drive">내 자료실</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#infoteam">인포팀</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>2026 가을</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-headline-h3-bold">2026 가을</h1>
            <div className="flex gap-2">
              <Button variant="outline">
                <FolderPlusIcon />새 폴더
              </Button>
              <Dialog>
                <Dialog.Trigger asChild>
                  <Button>
                    <ArrowUpTrayIcon />
                    올리기
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>2026 가을에 올리기</Dialog.Title>
                    <Dialog.Description>파일을 끌어다 놓거나 골라요.</Dialog.Description>
                  </Dialog.Header>
                  <FileField
                    aria-label="올릴 파일"
                    appearance="dropzone"
                    multiple
                    maxSize={100 * 1024 * 1024}
                  />
                  <Dialog.Footer>
                    <Dialog.Close asChild>
                      <Button variant="outline">취소</Button>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                      <Button onClick={() => toast.success('올리기 시작했어요')}>올리기</Button>
                    </Dialog.Close>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog>
            </div>
          </div>
        </div>

        <section aria-labelledby="folders" className="flex flex-col gap-3">
          <h2 id="folders" className="text-body-b3-semibold">
            폴더
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FOLDERS.map((folder) => (
              <li key={folder.id}>
                <Item variant="outline" asChild>
                  <a href={`#${folder.id}`}>
                    <Item.Media variant="soft">
                      <FolderIcon />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{folder.name}</Item.Title>
                      <Item.Description>파일 {folder.count}개</Item.Description>
                    </Item.Content>
                  </a>
                </Item>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="files" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="files" className="text-body-b3-semibold">
              파일 {shown.length}개
            </h2>
            <div className="flex items-center gap-2">
              <TextField
                type="search"
                aria-label="파일 찾기"
                placeholder="파일 이름"
                value={query}
                onValueChange={setQuery}
                size="tiny"
              >
                <MagnifyingGlassIcon />
                <TextField.Input />
              </TextField>
              <ToggleGroup
                variant="outline"
                size="tiny"
                aria-label="보기"
                value={view}
                onValueChange={(next) => {
                  if (next !== null && isView(next)) setView(next);
                }}
              >
                <IconToggle value="grid" aria-label="격자로 보기" icon={<Squares2X2Icon />} />
                <IconToggle value="list" aria-label="목록으로 보기" icon={<ListBulletIcon />} />
              </ToggleGroup>
            </div>
          </div>

          {shown.length === 0 ? (
            <Empty variant="outline">
              <Empty.Media>
                <MagnifyingGlassIcon />
              </Empty.Media>
              <Empty.Title>‘{query}’ 파일이 없어요</Empty.Title>
            </Empty>
          ) : view === 'grid' ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((file) => (
                <li key={file.id} className="flex">
                  <Card size="tiny" className="w-full">
                    <Card.Header>
                      <Avatar name={file.name} shape="square" aria-hidden>
                        <Avatar.Fallback>{KIND_ICON[file.kind]}</Avatar.Fallback>
                      </Avatar>
                      <Card.Title>{file.name}</Card.Title>
                      <Card.Description>
                        {file.size} · {file.updated}
                      </Card.Description>
                      <Card.Action>{fileMenu(file.name)}</Card.Action>
                    </Card.Header>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <Card size="tiny">
              <Item.Group variant="bordered" aria-label="파일">
                {shown.map((file) => (
                  <Item key={file.id}>
                    <Item.Media variant="soft">{KIND_ICON[file.kind]}</Item.Media>
                    <Item.Content>
                      <Item.Title>{file.name}</Item.Title>
                      <Item.Description>
                        {file.size} · {file.updated}
                      </Item.Description>
                    </Item.Content>
                    <Item.Actions>{fileMenu(file.name)}</Item.Actions>
                  </Item>
                ))}
              </Item.Group>
            </Card>
          )}
        </section>

        <Card variant="soft" size="tiny" className="sm:max-w-sm">
          <Card.Header>
            <Card.Title asChild>
              <h2>저장 공간</h2>
            </Card.Title>
            <Card.Description>인포팀 공용 · 10GB 중 3.2GB</Card.Description>
          </Card.Header>
          <Card.Content>
            <Progress value={32} aria-label="저장 공간 쓴 양" />
          </Card.Content>
        </Card>
      </main>
    );
  },
};
