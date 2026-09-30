import { useState } from 'react';

import { EllipsisHorizontalIcon, PlusIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Spacer } from '../../components/layout/spacer';
import { Menu } from '../../components/overlay/menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Tasks/Board',
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

const COLUMNS: Status[] = ['todo', 'doing', 'done'];

const isStatus = (value: string): value is Status => value in STATUS;

export const PC: Story = {
  render: function Render() {
    const [tasks, setTasks] = useState(TASKS.filter((task) => task.status !== 'canceled'));

    const move = (id: string, status: Status) =>
      setTasks(tasks.map((task) => (task.id === id ? { ...task, status } : task)));

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-h3-bold">IDS 가을 스프린트</h1>
            <p className="text-body-b2-regular">
              9월 22일부터 10월 20일까지 · 카드의 메뉴로 상태를 옮겨요.
            </p>
          </div>
          <Button>
            <PlusIcon />새 할 일
          </Button>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-3">
          {COLUMNS.map((status) => {
            const inColumn = tasks.filter((task) => task.status === status);

            return (
              <section key={status} aria-labelledby={`column-${status}`}>
                <Card variant="soft" size="tiny">
                  <Card.Header>
                    <Card.Title asChild>
                      <h2 id={`column-${status}`}>{STATUS[status].label}</h2>
                    </Card.Title>
                    <Card.Action>
                      <Badge
                        content={`${inColumn.length}개`}
                        variant="soft"
                        colorScheme={STATUS[status].colorScheme}
                      />
                    </Card.Action>
                  </Card.Header>
                  <ul className="flex flex-col gap-2">
                    {inColumn.map((task) => (
                      <li key={task.id}>
                        <Card size="tiny">
                          <Card.Header>
                            <Card.Description>
                              {task.id} · {task.label}
                            </Card.Description>
                            <Card.Title>{task.title}</Card.Title>
                            <Card.Action>
                              <Menu>
                                <Menu.Trigger asChild>
                                  <IconButton
                                    variant="outline"
                                    size="tiny"
                                    aria-label={`${task.title} 메뉴`}
                                    icon={<EllipsisHorizontalIcon />}
                                  />
                                </Menu.Trigger>
                                <Menu.Content>
                                  <Menu.RadioGroup
                                    value={task.status}
                                    onValueChange={(next) => {
                                      if (isStatus(next)) move(task.id, next);
                                    }}
                                  >
                                    <Menu.Label>상태</Menu.Label>
                                    {COLUMNS.map((value) => (
                                      <Menu.RadioItem key={value} value={value}>
                                        {STATUS[value].label}
                                      </Menu.RadioItem>
                                    ))}
                                  </Menu.RadioGroup>
                                </Menu.Content>
                              </Menu>
                            </Card.Action>
                          </Card.Header>
                          <Card.Footer>
                            <Avatar name={task.assignee} size="tiny" />
                            {task.assignee}
                            <Spacer />
                            <Badge
                              content={PRIORITY[task.priority]}
                              variant="soft"
                              colorScheme={task.priority === 'high' ? 'danger' : 'neutral'}
                            />
                            {dayOf(task.due)}
                          </Card.Footer>
                        </Card>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="tiny" className="w-full">
                    <PlusIcon />
                    카드 더하기
                  </Button>
                </Card>
              </section>
            );
          })}
        </div>
      </main>
    );
  },
};
