import { useMemo, useState } from 'react';

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  PlusIcon,
  StopCircleIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { DataTable } from '../../components/data/data-table';
import { Empty } from '../../components/data/empty';
import { toast } from '../../components/feedback/toast';
import { Select } from '../../components/form/select';
import { TextField } from '../../components/form/text-field';
import { Menu } from '../../components/overlay/menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Tasks',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const STATUSES = {
  todo: { label: '할 일', icon: <StopCircleIcon /> },
  doing: { label: '하는 중', icon: <ClockIcon /> },
  done: { label: '끝남', icon: <CheckCircleIcon /> },
  canceled: { label: '취소', icon: <NoSymbolIcon /> },
};

const PRIORITIES = {
  high: { label: '높음', icon: <ArrowUpIcon /> },
  medium: { label: '보통', icon: <ArrowRightIcon /> },
  low: { label: '낮음', icon: <ArrowDownIcon /> },
};

type Status = keyof typeof STATUSES;

type Priority = keyof typeof PRIORITIES;

type Task = {
  id: string;
  title: string;
  label: '기능' | '버그' | '문서' | '디자인';
  status: Status;
  priority: Priority;
  assignee: string;
  due: string;
};

const TASKS: Task[] = [
  {
    id: 'IDS-142',
    title: 'Splitter 에 접기 단축키 더하기',
    label: '기능',
    status: 'doing',
    priority: 'high',
    assignee: '김지수',
    due: '2026-10-03',
  },
  {
    id: 'IDS-141',
    title: 'Safari 에서 Drawer 끌기가 튀는 문제',
    label: '버그',
    status: 'todo',
    priority: 'high',
    assignee: '이도윤',
    due: '2026-10-02',
  },
  {
    id: 'IDS-140',
    title: 'Carousel README 예제 고치기',
    label: '문서',
    status: 'done',
    priority: 'low',
    assignee: '박서연',
    due: '2026-09-29',
  },
  {
    id: 'IDS-139',
    title: '17가지 테마 대비 검사 다시 돌리기',
    label: '디자인',
    status: 'done',
    priority: 'medium',
    assignee: '정예린',
    due: '2026-09-28',
  },
  {
    id: 'IDS-138',
    title: 'DataTable 열 고정',
    label: '기능',
    status: 'todo',
    priority: 'medium',
    assignee: '최하준',
    due: '2026-10-10',
  },
  {
    id: 'IDS-137',
    title: 'Flutter Button 토큰 맞추기',
    label: '기능',
    status: 'doing',
    priority: 'medium',
    assignee: '한지우',
    due: '2026-10-08',
  },
  {
    id: 'IDS-136',
    title: 'Kbd 기호가 Windows 에서 어긋남',
    label: '버그',
    status: 'canceled',
    priority: 'low',
    assignee: '오세린',
    due: '2026-09-25',
  },
  {
    id: 'IDS-135',
    title: '패턴 예제 페이지 만들기',
    label: '기능',
    status: 'doing',
    priority: 'high',
    assignee: '김지수',
    due: '2026-10-05',
  },
  {
    id: 'IDS-134',
    title: '접근성 점검표 채우기',
    label: '문서',
    status: 'todo',
    priority: 'medium',
    assignee: '윤태오',
    due: '2026-10-15',
  },
  {
    id: 'IDS-133',
    title: 'Toast 가 모달 뒤에 가려지는 문제',
    label: '버그',
    status: 'done',
    priority: 'high',
    assignee: '이도윤',
    due: '2026-09-24',
  },
  {
    id: 'IDS-132',
    title: '다크 모드 그림자 다듬기',
    label: '디자인',
    status: 'todo',
    priority: 'low',
    assignee: '정예린',
    due: '2026-10-20',
  },
  {
    id: 'IDS-131',
    title: 'OTPField 붙여넣기 테스트 더하기',
    label: '기능',
    status: 'done',
    priority: 'low',
    assignee: '최하준',
    due: '2026-09-22',
  },
];

function dayOf(date: string) {
  const [, month, day] = date.split('-').map(Number);
  return `${month}월 ${day}일`;
}

const task = DataTable.createColumnHelper<Task>();

const TASK_COLUMNS = task.columns([
  task.accessor('id', {
    header: '번호',
    size: 100,
    cell: ({ getValue }) => <span className="font-mono whitespace-nowrap">{getValue()}</span>,
  }),
  task.accessor('title', {
    header: '제목',
    size: 320,
    cell: ({ row, getValue }) => (
      <span className="flex items-center gap-2">
        <Badge content={row.original.label} variant="outline" colorScheme="neutral" />
        <span className="whitespace-nowrap">{getValue()}</span>
      </span>
    ),
  }),
  task.accessor('status', {
    header: '상태',
    size: 120,
    cell: ({ getValue }) => (
      <span className="flex items-center gap-1.5 whitespace-nowrap [&_svg]:size-4 [&_svg]:text-(--ids-color-on-muted)">
        {STATUSES[getValue()].icon}
        {STATUSES[getValue()].label}
      </span>
    ),
  }),
  task.accessor('priority', {
    header: '우선순위',
    size: 110,
    cell: ({ getValue }) => (
      <span className="flex items-center gap-1.5 whitespace-nowrap [&_svg]:size-4 [&_svg]:text-(--ids-color-on-muted)">
        {PRIORITIES[getValue()].icon}
        {PRIORITIES[getValue()].label}
      </span>
    ),
  }),
  task.accessor('assignee', {
    header: '담당',
    size: 120,
    cell: ({ getValue }) => (
      <span className="flex items-center gap-2 whitespace-nowrap">
        <Avatar name={getValue()} size="tiny" />
        {getValue()}
      </span>
    ),
  }),
  task.accessor('due', {
    header: '마감',
    size: 100,
    cell: ({ getValue }) => <span className="whitespace-nowrap">{dayOf(getValue())}</span>,
  }),
  task.display({
    id: 'actions',
    size: 56,
    header: () => <span className="sr-only">관리</span>,
    meta: { align: 'end', label: '관리' },
    cell: ({ row }) => (
      <Menu>
        <Menu.Trigger asChild>
          <IconButton
            variant="outline"
            size="tiny"
            aria-label={`${row.original.id} 관리`}
            icon={<EllipsisHorizontalIcon />}
          />
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item>
            <PencilSquareIcon />
            고치기
          </Menu.Item>
          <Menu.Item>
            <ClockIcon />
            마감 바꾸기
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item>
            <TrashIcon />
            지우기
            <Menu.Shortcut keys="Mod+Backspace" />
          </Menu.Item>
        </Menu.Content>
      </Menu>
    ),
  }),
]);

export const Default: Story = {
  render: function Render() {
    const [tasks, setTasks] = useState(TASKS);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [priority, setPriority] = useState('all');
    const [selection, setSelection] = useState<DataTable.RowSelection>({});

    const shown = useMemo(
      () =>
        tasks.filter(
          (item) =>
            (status === 'all' || item.status === status) &&
            (priority === 'all' || item.priority === priority) &&
            `${item.id} ${item.title}`.toLowerCase().includes(query.trim().toLowerCase()),
        ),
      [tasks, status, priority, query],
    );

    const selectedIds = Object.keys(selection).filter((id) => selection[id]);
    const filtering = query !== '' || status !== 'all' || priority !== 'all';

    const markSelectedDone = () => {
      setTasks((current) =>
        current.map((item) => (selectedIds.includes(item.id) ? { ...item, status: 'done' } : item)),
      );
      toast.success(`${selectedIds.length}개를 끝냈어요`);
      setSelection({});
    };

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-h3-bold">할 일</h1>
            <p className="text-body-b2-regular text-(--ids-color-on-muted)">
              IDS 2026 가을 스프린트. 끝나지 않은 일{' '}
              {tasks.filter((item) => item.status !== 'done').length}개
            </p>
          </div>
          <Button>
            <PlusIcon />새 할 일
          </Button>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <TextField
            type="search"
            aria-label="할 일 찾기"
            placeholder="번호나 제목으로 찾기"
            value={query}
            onValueChange={setQuery}
            className="w-full sm:w-64"
          >
            <MagnifyingGlassIcon />
            <TextField.Input />
          </TextField>
          <Select
            aria-label="상태"
            value={status}
            onValueChange={(next) => setStatus(next ?? 'all')}
            className="w-32"
          >
            <Select.Item value="all">모든 상태</Select.Item>
            {Object.entries(STATUSES).map(([value, { label }]) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select>
          <Select
            aria-label="우선순위"
            value={priority}
            onValueChange={(next) => setPriority(next ?? 'all')}
            className="w-32"
          >
            <Select.Item value="all">모든 우선순위</Select.Item>
            {Object.entries(PRIORITIES).map(([value, { label }]) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select>
          {filtering && (
            <Button
              variant="outline"
              onClick={() => {
                setQuery('');
                setStatus('all');
                setPriority('all');
              }}
            >
              <XMarkIcon />
              필터 지우기
            </Button>
          )}
          {selectedIds.length > 0 && (
            <div className="ms-auto flex items-center gap-2">
              <span className="text-body-b3-medium text-(--ids-color-on-muted)">
                {selectedIds.length}개 고름
              </span>
              <Button variant="soft" onClick={markSelectedDone}>
                <CheckCircleIcon />
                끝냄으로 바꾸기
              </Button>
            </div>
          )}
        </div>

        <DataTable
          aria-label="할 일"
          columns={TASK_COLUMNS}
          data={shown}
          getRowId={(item) => item.id}
          enableRowSelection
          getRowLabel={(item) => item.title}
          rowSelection={selection}
          onRowSelectionChange={setSelection}
          enableColumnResizing
          enablePagination
          defaultPagination={{ pageIndex: 0, pageSize: 8 }}
          defaultSorting={[{ id: 'due', desc: false }]}
          empty={
            <Empty variant="soft" size="tiny">
              <Empty.Media>
                <MagnifyingGlassIcon />
              </Empty.Media>
              <Empty.Title>맞는 할 일이 없어요</Empty.Title>
              <Empty.Description>필터를 지우거나 다른 낱말로 찾아 보세요.</Empty.Description>
            </Empty>
          }
        />
      </main>
    );
  },
};
