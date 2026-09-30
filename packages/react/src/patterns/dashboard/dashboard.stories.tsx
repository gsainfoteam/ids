import { useMemo, useState } from 'react';

import {
  ArrowDownTrayIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  UserPlusIcon,
  UsersIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { DataTable } from '../../components/data/data-table';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { Progress } from '../../components/feedback/progress';
import { Select } from '../../components/form/select';
import { TextField } from '../../components/form/text-field';
import { Menu } from '../../components/overlay/menu';
import { IdsProvider } from '../../components/utility/ids-provider';
import { cn } from '../../utils';

import type { IdsColor } from '../../tokens/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/PC/Dashboard',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SECTIONS = [
  { id: 'overview', label: '개요' },
  { id: 'posts', label: '게시글' },
  { id: 'members', label: '멤버' },
  { id: 'reports', label: '신고' },
  { id: 'settings', label: '설정' },
];

const PERIODS = {
  week: {
    label: '7일',
    range: '9월 24일부터 30일까지',
    visitors: 12840,
    signups: 482,
    posts: 1204,
    resolved: 94,
  },
  month: {
    label: '30일',
    range: '9월 1일부터 30일까지',
    visitors: 51230,
    signups: 1930,
    posts: 4870,
    resolved: 91,
  },
  quarter: {
    label: '90일',
    range: '7월 3일부터 9월 30일까지',
    visitors: 140512,
    signups: 5210,
    posts: 13090,
    resolved: 89,
  },
};

type Period = keyof typeof PERIODS;

function isPeriod(value: string): value is Period {
  return value in PERIODS;
}

const CHANGES: Record<
  Period,
  { visitors: number; signups: number; posts: number; resolved: number }
> = {
  week: { visitors: 18, signups: 6, posts: -3, resolved: 2 },
  month: { visitors: 9, signups: 12, posts: 4, resolved: -1 },
  quarter: { visitors: -2, signups: 3, posts: 7, resolved: 5 },
};

const SERVICES: { name: string; share: number; color: IdsColor }[] = [
  { name: 'Ziggle', share: 0.48, color: 'blue' },
  { name: '택시 합승', share: 0.23, color: 'amber' },
  { name: '뽀송', share: 0.14, color: 'cyan' },
  { name: '꼬르륵', share: 0.11, color: 'rose' },
  { name: '청원', share: 0.04, color: 'violet' },
];

const ACTIVITY = [
  { id: 'post', who: '박서연', what: '가을 축제 부스 모집 글을 올렸어요', when: '3분 전' },
  { id: 'resolve', who: '이도윤', what: '신고 2건을 처리했어요', when: '20분 전' },
  { id: 'join', who: '최하준', what: '운영진으로 들어왔어요', when: '1시간 전' },
  { id: 'pin', who: '정예린', what: '해커톤 공지를 고정했어요', when: '3시간 전' },
  { id: 'edit', who: '한지우', what: '이용 약관을 고쳤어요', when: '어제' },
];

type Report = {
  id: string;
  title: string;
  reason: string;
  reporter: string;
  reportedOn: string;
  status: 'pending' | 'resolved' | 'rejected';
};

const STATUS = {
  pending: { label: '처리 대기', scheme: 'warning' },
  resolved: { label: '처리 완료', scheme: 'success' },
  rejected: { label: '반려', scheme: 'neutral' },
} as const;

const REPORTS: Report[] = [
  {
    id: 'r1',
    title: '같이 택시 타실 분 구해요',
    reason: '스팸',
    reporter: '박서연',
    reportedOn: '2026-09-30',
    status: 'pending',
  },
  {
    id: 'r2',
    title: '중고 교재 팝니다 (연락처 있음)',
    reason: '개인정보',
    reporter: '이도윤',
    reportedOn: '2026-09-30',
    status: 'pending',
  },
  {
    id: 'r3',
    title: '오늘 학식 후기',
    reason: '욕설',
    reporter: '최하준',
    reportedOn: '2026-09-29',
    status: 'pending',
  },
  {
    id: 'r4',
    title: '동아리 홍보합니다',
    reason: '스팸',
    reporter: '정예린',
    reportedOn: '2026-09-29',
    status: 'resolved',
  },
  {
    id: 'r5',
    title: '분실물 찾아요',
    reason: '기타',
    reporter: '한지우',
    reportedOn: '2026-09-28',
    status: 'rejected',
  },
  {
    id: 'r6',
    title: '시험 자료 나눔',
    reason: '기타',
    reporter: '오세린',
    reportedOn: '2026-09-27',
    status: 'resolved',
  },
  {
    id: 'r7',
    title: '광고 링크 모음',
    reason: '스팸',
    reporter: '윤태오',
    reportedOn: '2026-09-26',
    status: 'resolved',
  },
  {
    id: 'r8',
    title: '룸메이트 구해요',
    reason: '개인정보',
    reporter: '김지수',
    reportedOn: '2026-09-25',
    status: 'rejected',
  },
];

function dayOf(date: string) {
  const [, month, day] = date.split('-').map(Number);
  return `${month}월 ${day}일`;
}

const count = new Intl.NumberFormat('ko-KR');

const report = DataTable.createColumnHelper<Report>();

const REPORT_COLUMNS = report.columns([
  report.accessor('title', {
    header: '게시글',
    cell: ({ getValue }) => <span className="whitespace-nowrap">{getValue()}</span>,
  }),
  report.accessor('reason', {
    header: '사유',
    cell: ({ getValue }) => <Badge content={getValue()} variant="outline" colorScheme="neutral" />,
  }),
  report.accessor('reporter', { header: '신고한 사람' }),
  report.accessor('reportedOn', {
    header: '날짜',
    cell: ({ getValue }) => <span className="whitespace-nowrap">{dayOf(getValue())}</span>,
  }),
  report.accessor('status', {
    header: '상태',
    cell: ({ getValue }) => (
      <Badge
        content={STATUS[getValue()].label}
        variant="soft"
        colorScheme={STATUS[getValue()].scheme}
      />
    ),
  }),
  report.display({
    id: 'actions',
    header: () => <span className="sr-only">관리</span>,
    meta: { align: 'end', label: '관리' },
    cell: ({ row }) => (
      <Menu>
        <Menu.Trigger asChild>
          <IconButton
            variant="outline"
            size="tiny"
            aria-label={`${row.original.title} 관리`}
            icon={<EllipsisHorizontalIcon />}
          />
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item>
            <EyeIcon />글 보기
          </Menu.Item>
          <Menu.Item>
            <EyeSlashIcon />글 숨기기
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item>
            <XCircleIcon />
            신고 반려
          </Menu.Item>
        </Menu.Content>
      </Menu>
    ),
  }),
]);

const hint = cn('text-body-b3-regular text-(--ids-color-on-muted)');

const navLink = cn(
  'inline-flex h-8 items-center rounded-standard px-3 text-body-b3-medium text-(--ids-color-on-muted) focus-ring hover:text-(--ids-color-on-surface)',
  'aria-[current=page]:bg-(--ids-color-secondary) aria-[current=page]:text-(--ids-color-on-secondary)',
);

export const Default: Story = {
  render: function Render() {
    const [period, setPeriod] = useState<Period>('week');
    const [reports, setReports] = useState(REPORTS);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [selection, setSelection] = useState<DataTable.RowSelection>({});

    const numbers = PERIODS[period];
    const changes = CHANGES[period];
    const selected = Object.values(selection).filter(Boolean).length;
    const pending = reports.filter((item) => item.status === 'pending').length;

    const shown = useMemo(
      () =>
        reports.filter(
          (item) =>
            (status === 'all' || item.status === status) && item.title.includes(query.trim()),
        ),
      [reports, status, query],
    );

    const resolveSelected = () => {
      setReports((current) =>
        current.map((item) => (selection[item.id] ? { ...item, status: 'resolved' } : item)),
      );
      setSelection({});
    };

    const metrics = [
      {
        label: '방문자',
        value: count.format(numbers.visitors),
        change: changes.visitors,
        icon: <UsersIcon />,
      },
      {
        label: '새 가입',
        value: count.format(numbers.signups),
        change: changes.signups,
        icon: <UserPlusIcon />,
      },
      {
        label: '게시글',
        value: count.format(numbers.posts),
        change: changes.posts,
        icon: <DocumentTextIcon />,
      },
      {
        label: '신고 처리율',
        value: `${numbers.resolved}%`,
        change: changes.resolved,
        icon: <FlagIcon />,
      },
    ];

    return (
      <div className="flex min-h-dvh flex-col break-keep">
        <header className="sticky top-0 z-10 border-b border-(--ids-color-border) bg-(--ids-color-surface)">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
            <Menu>
              <Menu.Trigger asChild>
                <IconButton
                  variant="outline"
                  aria-label="메뉴"
                  icon={<Bars3Icon />}
                  className="md:hidden"
                />
              </Menu.Trigger>
              <Menu.Content>
                {SECTIONS.map(({ id, label }) => (
                  <Menu.Item key={id} asChild>
                    <a href={`#${id}`} aria-current={id === 'overview' ? 'page' : undefined}>
                      {label}
                    </a>
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu>

            <a href="#overview" className="text-subtitle-s2-bold flex items-center gap-2">
              <span
                aria-hidden
                className="rounded-standard grid size-8 place-items-center bg-(--ids-color-primary) text-(--ids-color-on-primary)"
              >
                Z
              </span>
              Ziggle 운영
            </a>

            <nav aria-label="주 메뉴" className="ms-4 hidden md:block">
              <ul className="flex items-center gap-1">
                {SECTIONS.map(({ id, label }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={id === 'overview' ? 'page' : undefined}
                      className={navLink}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="ms-auto flex items-center gap-1">
              <TextField
                type="search"
                aria-label="검색"
                placeholder="검색"
                className="hidden w-52 lg:flex"
              >
                <MagnifyingGlassIcon />
                <TextField.Input />
              </TextField>
              <Badge content={pending} aria-label={`처리 대기 신고 ${pending}건`}>
                <IconButton variant="outline" aria-label="알림" icon={<BellIcon />} />
              </Badge>
              <Menu>
                <Menu.Trigger asChild>
                  <IconButton
                    variant="outline"
                    aria-label="김지수 계정"
                    icon={<Avatar name="김지수" size="tiny" />}
                  />
                </Menu.Trigger>
                <Menu.Content>
                  <Menu.Group>
                    <Menu.Label>jisu@gistory.me</Menu.Label>
                    <Menu.Item>
                      <UserCircleIcon />
                      프로필
                    </Menu.Item>
                    <Menu.Item>
                      <Cog6ToothIcon />
                      설정
                    </Menu.Item>
                  </Menu.Group>
                  <Menu.Separator />
                  <Menu.Item>
                    <ArrowRightStartOnRectangleIcon />
                    로그아웃
                  </Menu.Item>
                </Menu.Content>
              </Menu>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 break-keep sm:px-6 lg:py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-headline-h3-bold">개요</h1>
              <p className={hint}>{numbers.range}</p>
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup
                variant="outline"
                aria-label="기간"
                value={period}
                onValueChange={(next) => {
                  if (next !== null && isPeriod(next)) setPeriod(next);
                }}
              >
                {Object.entries(PERIODS).map(([id, { label }]) => (
                  <Toggle key={id} value={id}>
                    {label}
                  </Toggle>
                ))}
              </ToggleGroup>
              <Button variant="outline">
                <ArrowDownTrayIcon />
                내보내기
              </Button>
            </div>
          </div>

          <section aria-label="요약" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map(({ label, value, change, icon }) => (
              <Card key={label}>
                <Card.Header>
                  <Card.Description>{label}</Card.Description>
                  <Card.Action className="text-(--ids-color-on-muted) [&_svg]:size-5">
                    {icon}
                  </Card.Action>
                </Card.Header>
                <Card.Content className="flex flex-col gap-2">
                  <p className="text-headline-h3-bold tabular-nums">{value}</p>
                  <p className="text-caption-c1-regular flex flex-wrap items-center gap-1.5 text-(--ids-color-on-muted)">
                    <Badge
                      content={`${change > 0 ? '+' : ''}${change}%`}
                      variant="soft"
                      colorScheme={change >= 0 ? 'success' : 'danger'}
                    />
                    지난 기간보다
                  </p>
                </Card.Content>
              </Card>
            ))}
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <Card.Header>
                <Card.Title>서비스별 방문</Card.Title>
                <Card.Description>{numbers.label} 동안의 방문자 수</Card.Description>
              </Card.Header>
              <Card.Content>
                <ul className="flex flex-col gap-4">
                  {SERVICES.map(({ name, share, color }) => (
                    <li key={name} className="flex flex-col gap-1.5">
                      <div className="text-body-b3-medium flex items-center justify-between">
                        <span>{name}</span>
                        <span className="tabular-nums">
                          {count.format(Math.round(numbers.visitors * share))}명
                        </span>
                      </div>
                      <div
                        aria-hidden
                        className="h-2 overflow-hidden rounded-full bg-(--ids-color-muted)"
                      >
                        <IdsProvider
                          color={color}
                          className="h-full rounded-full bg-(--ids-color-primary)"
                          style={{ width: `${(share / SERVICES[0].share) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>최근 활동</Card.Title>
                <Card.Description>운영진 5명</Card.Description>
              </Card.Header>
              <Item.Group variant="bordered" size="tiny" aria-label="최근 활동">
                {ACTIVITY.map(({ id, who, what, when }) => (
                  <Item key={id}>
                    <Item.Media>
                      <Avatar name={who} size="tiny" />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{who}</Item.Title>
                      <Item.Description>{what}</Item.Description>
                    </Item.Content>
                    <Item.Actions className="text-caption-c1-regular text-(--ids-color-on-muted)">
                      {when}
                    </Item.Actions>
                  </Item>
                ))}
              </Item.Group>
            </Card>
          </div>

          <Card>
            <Card.Header>
              <Card.Title>신고</Card.Title>
              <Card.Description>처리 대기 {pending}건</Card.Description>
              <Card.Action className="flex items-center gap-2">
                <Progress value={numbers.resolved} aria-label="신고 처리율" className="w-20" />
                <span className="text-caption-c1-medium tabular-nums">{numbers.resolved}%</span>
              </Card.Action>
            </Card.Header>
            <Card.Content className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <TextField
                  type="search"
                  aria-label="신고 찾기"
                  placeholder="게시글 제목으로 찾기"
                  value={query}
                  onValueChange={setQuery}
                  className="w-full sm:w-auto sm:flex-1"
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
                  <Select.Item value="pending">처리 대기</Select.Item>
                  <Select.Item value="resolved">처리 완료</Select.Item>
                  <Select.Item value="rejected">반려</Select.Item>
                </Select>
                <Button
                  disabled={selected === 0}
                  onClick={resolveSelected}
                  className="ms-auto sm:ms-0"
                >
                  <CheckCircleIcon />
                  {selected === 0 ? '선택해서 처리' : `${selected}건 처리`}
                </Button>
              </div>
              <DataTable
                aria-label="신고"
                columns={REPORT_COLUMNS}
                data={shown}
                getRowId={(item) => item.id}
                enableRowSelection
                getRowLabel={(item) => item.title}
                rowSelection={selection}
                onRowSelectionChange={setSelection}
                enablePagination
                defaultPagination={{ pageIndex: 0, pageSize: 5 }}
                empty={
                  <Empty variant="soft" size="tiny">
                    <Empty.Title>맞는 신고가 없어요</Empty.Title>
                    <Empty.Description>검색어나 상태를 바꿔 보세요.</Empty.Description>
                  </Empty>
                }
              />
            </Card.Content>
          </Card>
        </main>
      </div>
    );
  },
};
