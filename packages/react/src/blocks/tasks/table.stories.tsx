import { useMemo, useState } from 'react';

import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { DataTable } from '../../components/data/data-table';
import { Empty } from '../../components/data/empty';
import { toast } from '../../components/feedback/toast';
import { Select } from '../../components/form/select';
import { TextField } from '../../components/form/text-field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Tasks/Table',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Status = 'todo' | 'doing' | 'done' | 'canceled';

type Priority = 'high' | 'medium' | 'low';

const STATUS: Record<Status, { label: string; colorScheme: 'neutral' | 'info' | 'success' }> = {
  todo: { label: '할 일', colorScheme: 'neutral' },
  doing: { label: '하는 중', colorScheme: 'info' },
  done: { label: '끝남', colorScheme: 'success' },
  canceled: { label: '취소', colorScheme: 'neutral' },
};

const PRIORITY: Record<Priority, string> = { high: '높음', medium: '보통', low: '낮음' };

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
    title: '블록 페이지 만들기',
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

const dayOf = (iso: string) => {
  const [, month, day] = iso.split('-').map(Number);
  return `${month}월 ${day}일`;
};

const isStatus = (value: string): value is Status => value in STATUS;

const isPriority = (value: string): value is Priority => value in PRIORITY;

const column = DataTable.createColumnHelper<Task>();

const COLUMNS = column.columns([
  column.accessor('id', { header: '번호', size: 104 }),
  column.accessor('title', {
    header: '제목',
    size: 320,
    cell: ({ row, getValue }) => (
      <>
        <Badge content={row.original.label} variant="outline" colorScheme="neutral" /> {getValue()}
      </>
    ),
  }),
  column.accessor('status', {
    header: '상태',
    size: 112,
    cell: ({ getValue }) => (
      <Badge
        content={STATUS[getValue()].label}
        variant="soft"
        colorScheme={STATUS[getValue()].colorScheme}
      />
    ),
  }),
  column.accessor('priority', {
    header: '우선순위',
    size: 112,
    cell: ({ getValue }) => PRIORITY[getValue()],
  }),
  column.accessor('assignee', {
    header: '담당',
    size: 128,
    cell: ({ getValue }) => (
      <>
        <Avatar name={getValue()} size="tiny" /> {getValue()}
      </>
    ),
  }),
  column.accessor('due', { header: '마감', size: 96, cell: ({ getValue }) => dayOf(getValue()) }),
]);

export const PC: Story = {
  render: function Render() {
    const [tasks, setTasks] = useState(TASKS);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<Status | 'all'>('all');
    const [priority, setPriority] = useState<Priority | 'all'>('all');
    const [selection, setSelection] = useState<DataTable.RowSelection>({});

    const shown = useMemo(
      () =>
        tasks.filter(
          (task) =>
            (status === 'all' || task.status === status) &&
            (priority === 'all' || task.priority === priority) &&
            (query === '' || task.id.includes(query.toUpperCase()) || task.title.includes(query)),
        ),
      [tasks, status, priority, query],
    );
    const selectedIds = Object.keys(selection).filter((id) => selection[id]);
    const filtering = query !== '' || status !== 'all' || priority !== 'all';

    const markSelectedDone = () => {
      setTasks(
        tasks.map((task) => (selectedIds.includes(task.id) ? { ...task, status: 'done' } : task)),
      );
      toast.success(`${selectedIds.length}개를 끝냈어요`);
      setSelection({});
    };

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-h3-bold">할 일</h1>
            <p className="text-body-b2-regular">
              IDS 가을 스프린트 · 남은 일{' '}
              {tasks.filter((task) => task.status === 'todo' || task.status === 'doing').length}개
            </p>
          </div>
          <Button>
            <PlusIcon />새 할 일
          </Button>
        </div>

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
            onValueChange={(next) => setStatus(next !== null && isStatus(next) ? next : 'all')}
            className="w-36"
          >
            <Select.Item value="all">모든 상태</Select.Item>
            {(Object.keys(STATUS) as Status[]).map((value) => (
              <Select.Item key={value} value={value}>
                {STATUS[value].label}
              </Select.Item>
            ))}
          </Select>
          <Select
            aria-label="우선순위"
            value={priority}
            onValueChange={(next) => setPriority(next !== null && isPriority(next) ? next : 'all')}
            className="w-36"
          >
            <Select.Item value="all">모든 우선순위</Select.Item>
            {(Object.keys(PRIORITY) as Priority[]).map((value) => (
              <Select.Item key={value} value={value}>
                {PRIORITY[value]}
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
            <Button variant="soft" className="ms-auto" onClick={markSelectedDone}>
              <CheckCircleIcon />
              고른 {selectedIds.length}개 끝내기
            </Button>
          )}
        </div>

        <DataTable
          aria-label="할 일"
          columns={COLUMNS}
          data={shown}
          getRowId={(task) => task.id}
          enableRowSelection
          getRowLabel={(task) => task.title}
          rowSelection={selection}
          onRowSelectionChange={setSelection}
          enablePagination
          defaultPagination={{ pageIndex: 0, pageSize: 8 }}
          defaultSorting={[{ id: 'due', desc: true }]}
          highlightOnHover
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
