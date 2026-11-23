import { useState, type ReactNode } from 'react';

import {
  BookOpenIcon as BookOpenSolid,
  RocketLaunchIcon as RocketLaunchSolid,
  TicketIcon as TicketSolid,
} from '@heroicons/react/16/solid';
import {
  BookmarkIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  HomeIcon,
  MegaphoneIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Skeleton } from '../../components/feedback/skeleton';
import { Sidebar } from '../../components/navigation/sidebar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Sidebar/Collapsible',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const ITEMS = [
  { id: 'home', label: '홈', icon: <HomeIcon /> },
  {
    id: 'board',
    label: '게시판',
    icon: <MegaphoneIcon />,
    badge: (
      <Chip variant="soft" colorScheme="primary">
        {12}
      </Chip>
    ),
  },
  {
    id: 'shuttle',
    label: '셔틀',
    icon: <TruckIcon />,
    badge: (
      <Chip variant="outline" colorScheme="success">
        운행 중
      </Chip>
    ),
  },
  {
    id: 'posts',
    label: '내 글',
    icon: <DocumentTextIcon />,
    badge: (
      <Chip variant="soft" colorScheme="info">
        {4}
      </Chip>
    ),
  },
  { id: 'bookmarks', label: '북마크', icon: <BookmarkIcon /> },
  {
    id: 'reservations',
    label: '예약',
    icon: <CalendarDaysIcon />,
    badge: (
      <Chip variant="soft" colorScheme="warning">
        D-2
      </Chip>
    ),
  },
];

const PINNED: {
  id: string;
  label: string;
  icon: ReactNode;
  colorScheme: Sidebar.Item.Props['colorScheme'];
  badge?: ReactNode;
}[] = [
  {
    id: 'ziggle',
    label: 'Ziggle v3 출시',
    icon: <RocketLaunchSolid />,
    colorScheme: 'primary',
    badge: <Chip variant="solid" colorScheme="success" />,
  },
  { id: 'festival', label: '축제 부스 준비', icon: <TicketSolid />, colorScheme: 'warning' },
  {
    id: 'study',
    label: '알고리즘 스터디',
    icon: <BookOpenSolid />,
    colorScheme: 'success',
    badge: <Chip variant="solid" colorScheme="danger" />,
  },
];

export const PC: Story = {
  render: function Render() {
    const [current, setCurrent] = useState('shuttle');

    const label = [...ITEMS, ...PINNED].find((item) => item.id === current)!.label;

    return (
      <div className="break-keep">
        <Sidebar.Provider>
          <Sidebar value={current} collapsible aria-label="주 메뉴">
            <Sidebar.Header>
              <Avatar name="인포팀" size="tiny" aria-hidden>
                <Avatar.Fallback>
                  <CubeTransparentIcon />
                </Avatar.Fallback>
              </Avatar>
              <span className="text-body-b2-semibold">GIST 인포팀</span>
            </Sidebar.Header>
            {ITEMS.map((item) => (
              <Sidebar.Item
                key={item.id}
                value={item.id}
                href={`#${item.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  setCurrent(item.id);
                }}
              >
                {item.icon}
                {item.label}
                {item.badge}
              </Sidebar.Item>
            ))}
            <Sidebar.Group label="고정한 페이지">
              {PINNED.map((item) => (
                <Sidebar.Item
                  key={item.id}
                  value={item.id}
                  href={`#${item.id}`}
                  colorScheme={item.colorScheme}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrent(item.id);
                  }}
                >
                  {item.icon}
                  {item.label}
                  {item.badge}
                </Sidebar.Item>
              ))}
            </Sidebar.Group>
            <Sidebar.Footer>
              <Sidebar.Item href="#settings">
                <Cog6ToothIcon />
                설정
              </Sidebar.Item>
              <Sidebar.Item href="#profile">
                <Avatar name="김지수" size="tiny" />
                김지수
                <Chip variant="soft" colorScheme="primary">
                  관리자
                </Chip>
              </Sidebar.Item>
            </Sidebar.Footer>
          </Sidebar>

          <Sidebar.Inset>
            <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
              <div className="flex items-center gap-3">
                <Sidebar.Trigger />
                <h1 className="text-headline-h3-bold">{label}</h1>
              </div>
              <Skeleton loading>
                <p className="text-body-b3-regular">
                  수강 신청은 9월 1일 오전 10시에 열립니다. 신청 전에 졸업 요건과 선수 과목을
                  확인하고, 시간표가 겹치지 않는지 미리 살펴 두세요.
                </p>
              </Skeleton>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="grid h-32">
                  <Skeleton loading asChild>
                    <Card>
                      <Card.Title>수강 신청</Card.Title>
                    </Card>
                  </Skeleton>
                </div>
                <div className="grid h-32">
                  <Skeleton loading asChild>
                    <Card>
                      <Card.Title>장학금 안내</Card.Title>
                    </Card>
                  </Skeleton>
                </div>
                <div className="grid h-32">
                  <Skeleton loading asChild>
                    <Card>
                      <Card.Title>동아리 모집</Card.Title>
                    </Card>
                  </Skeleton>
                </div>
              </div>
              <div className="grid h-64">
                <Skeleton loading asChild>
                  <Card>
                    <Card.Title>본문</Card.Title>
                  </Card>
                </Skeleton>
              </div>
            </div>
          </Sidebar.Inset>
        </Sidebar.Provider>
      </div>
    );
  },
};
