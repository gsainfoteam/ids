import { useState, type ReactNode } from 'react';

import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  FolderIcon,
  FolderPlusIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PhotoIcon,
  PresentationChartBarIcon,
  Squares2X2Icon,
  TableCellsIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { IconToggle } from '../../components/action/icon-toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Table } from '../../components/data/table';
import { Progress } from '../../components/feedback/progress';
import { toast } from '../../components/feedback/toast';
import { FileField } from '../../components/form/file-field';
import { TextField } from '../../components/form/text-field';
import { Breadcrumb } from '../../components/navigation/breadcrumb';
import { Dialog } from '../../components/overlay/dialog';
import { Menu } from '../../components/overlay/menu';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/FileManager',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Kind = 'folder' | 'document' | 'sheet' | 'slides' | 'image';

const KIND_ICON: Record<Kind, ReactNode> = {
  folder: <FolderIcon />,
  document: <DocumentTextIcon />,
  sheet: <TableCellsIcon />,
  slides: <PresentationChartBarIcon />,
  image: <PhotoIcon />,
};

type Entry = { id: string; name: string; kind: Kind; size: string; updated: string; owner: string };

const ENTRIES: Entry[] = [
  {
    id: 'design',
    name: '디자인',
    kind: 'folder',
    size: '파일 18개',
    updated: '9월 30일',
    owner: '정예린',
  },
  {
    id: 'minutes',
    name: '회의록',
    kind: 'folder',
    size: '파일 42개',
    updated: '9월 29일',
    owner: '이도윤',
  },
  {
    id: 'plan',
    name: '2026 가을 계획서.pdf',
    kind: 'document',
    size: '1.2MB',
    updated: '9월 28일',
    owner: '김지수',
  },
  {
    id: 'budget',
    name: '동아리 예산.xlsx',
    kind: 'sheet',
    size: '86KB',
    updated: '9월 27일',
    owner: '최하준',
  },
  {
    id: 'deck',
    name: '신입 부원 OT.key',
    kind: 'slides',
    size: '24.6MB',
    updated: '9월 25일',
    owner: '박서연',
  },
  {
    id: 'poster',
    name: '축제 포스터.png',
    kind: 'image',
    size: '5.1MB',
    updated: '9월 24일',
    owner: '정예린',
  },
  {
    id: 'rules',
    name: '회칙.pdf',
    kind: 'document',
    size: '240KB',
    updated: '9월 2일',
    owner: '김지수',
  },
];

const USED_GB = 16.4;

const TOTAL_GB = 20;

const tile = cn(
  'grid size-11 place-items-center rounded-standard bg-(--ids-color-secondary) text-(--ids-color-on-secondary) [&_svg]:size-6',
);

export const Default: Story = {
  render: function Render() {
    const [entries, setEntries] = useState(ENTRIES);
    const [view, setView] = useState('grid');
    const [query, setQuery] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [picked, setPicked] = useState<File[]>([]);

    const shown = entries.filter(({ name }) => name.includes(query.trim()));

    const upload = () => {
      setEntries((current) => [
        ...current,
        ...picked.map((file) => ({
          id: `${file.name}-${file.size}`,
          name: file.name,
          kind: file.type.startsWith('image/') ? ('image' as const) : ('document' as const),
          size: `${Math.max(1, Math.round(file.size / 1024))}KB`,
          updated: '방금',
          owner: '김지수',
        })),
      ]);
      toast.success(`파일 ${picked.length}개를 올렸어요`);
      setPicked([]);
      setUploadOpen(false);
    };

    const remove = (id: string) =>
      setEntries((current) => current.filter((entry) => entry.id !== id));

    const actions = (entry: Entry) => (
      <>
        <Menu.Item>
          <ArrowDownTrayIcon />
          내려받기
        </Menu.Item>
        <Menu.Item>
          <PencilIcon />
          이름 바꾸기
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item onSelect={() => remove(entry.id)}>
          <TrashIcon />
          지우기
        </Menu.Item>
      </>
    );

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Breadcrumb aria-label="위치">
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#files">자료실</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#infoteam">인포팀</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Page>2026 가을</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-headline-h3-bold">2026 가을</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <FolderPlusIcon />새 폴더
            </Button>
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <Dialog.Trigger asChild>
                <Button>
                  <ArrowUpTrayIcon />
                  올리기
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>파일 올리기</Dialog.Title>
                  <Dialog.Description>
                    한 번에 10개, 파일마다 50MB 까지 올릴 수 있어요.
                  </Dialog.Description>
                </Dialog.Header>
                <FileField
                  aria-label="올릴 파일"
                  appearance="dropzone"
                  multiple
                  maxCount={10}
                  maxSize={50 * 1024 * 1024}
                  value={picked}
                  onValueChange={setPicked}
                />
                <Dialog.Footer>
                  <Dialog.Close>취소</Dialog.Close>
                  <Button onClick={upload} disabled={picked.length === 0}>
                    {picked.length > 0 ? `${picked.length}개 올리기` : '올리기'}
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_260px]">
          <section aria-label="파일" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <TextField
                type="search"
                aria-label="이 폴더에서 찾기"
                placeholder="이 폴더에서 찾기"
                value={query}
                onValueChange={setQuery}
                className="min-w-0 flex-1"
              >
                <MagnifyingGlassIcon />
                <TextField.Input />
              </TextField>
              <ToggleGroup
                variant="outline"
                aria-label="보기"
                value={view}
                onValueChange={(next) => {
                  if (next !== null) setView(next);
                }}
              >
                <IconToggle value="grid" icon={<Squares2X2Icon />} aria-label="격자로 보기" />
                <IconToggle value="list" icon={<ListBulletIcon />} aria-label="목록으로 보기" />
              </ToggleGroup>
            </div>

            {view === 'grid' ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {shown.map((entry) => (
                  <li key={entry.id} className="relative">
                    <Menu triggerType="contextmenu">
                      <Menu.Trigger asChild>
                        <Card size="tiny" className="h-full">
                          <Card.Header>
                            <span aria-hidden className={tile}>
                              {KIND_ICON[entry.kind]}
                            </span>
                          </Card.Header>
                          <Card.Content className="flex flex-col gap-0.5">
                            <span className="text-body-b3-semibold truncate">{entry.name}</span>
                            <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                              {entry.size}, {entry.updated}
                            </span>
                          </Card.Content>
                        </Card>
                      </Menu.Trigger>
                      <Menu.Content>{actions(entry)}</Menu.Content>
                    </Menu>
                    <Menu>
                      <Menu.Trigger asChild>
                        <IconButton
                          variant="outline"
                          size="tiny"
                          aria-label={`${entry.name} 더 보기`}
                          icon={<EllipsisHorizontalIcon />}
                          className="absolute end-3 top-3"
                        />
                      </Menu.Trigger>
                      <Menu.Content>{actions(entry)}</Menu.Content>
                    </Menu>
                  </li>
                ))}
              </ul>
            ) : (
              <Table aria-label="파일">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>이름</Table.Head>
                    <Table.Head>크기</Table.Head>
                    <Table.Head>바꾼 날</Table.Head>
                    <Table.Head>올린 사람</Table.Head>
                    <Table.Head>
                      <span className="sr-only">관리</span>
                    </Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {shown.map((entry) => (
                    <Table.Row key={entry.id}>
                      <Table.Cell>
                        <span className="flex items-center gap-2 whitespace-nowrap [&_svg]:size-5 [&_svg]:text-(--ids-color-on-muted)">
                          {KIND_ICON[entry.kind]}
                          {entry.name}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{entry.size}</Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{entry.updated}</Table.Cell>
                      <Table.Cell>
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          <Avatar name={entry.owner} size="tiny" />
                          {entry.owner}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-end">
                        <Menu>
                          <Menu.Trigger asChild>
                            <IconButton
                              variant="outline"
                              size="tiny"
                              aria-label={`${entry.name} 더 보기`}
                              icon={<EllipsisHorizontalIcon />}
                            />
                          </Menu.Trigger>
                          <Menu.Content>{actions(entry)}</Menu.Content>
                        </Menu>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
            <p className="text-caption-c1-regular text-(--ids-color-on-muted)">
              파일을 오른쪽 버튼으로 누르면 메뉴가 떠요.
            </p>
          </section>

          <Card>
            <Card.Header>
              <Card.Title>저장 공간</Card.Title>
              <Card.Description>
                {TOTAL_GB}GB 중 {USED_GB}GB 를 썼어요
              </Card.Description>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <Progress value={(USED_GB / TOTAL_GB) * 100} aria-label="저장 공간" />
              <ul className="text-body-b3-regular flex flex-col gap-2">
                <li className="flex items-center justify-between">
                  <span>문서</span>
                  <span className="text-(--ids-color-on-muted) tabular-nums">6.2GB</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>사진</span>
                  <span className="text-(--ids-color-on-muted) tabular-nums">8.9GB</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>그 밖</span>
                  <span className="text-(--ids-color-on-muted) tabular-nums">1.3GB</span>
                </li>
              </ul>
            </Card.Content>
            <Card.Footer>
              <Button variant="soft" className="w-full">
                공간 늘리기
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </main>
    );
  },
};
