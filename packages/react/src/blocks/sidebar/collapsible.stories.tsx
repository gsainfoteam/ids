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
import { Badge } from '../../components/data/badge';
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
    badge: <Badge content={12} variant="soft" colorScheme="primary" />,
  },
  {
    id: 'shuttle',
    label: '셔틀',
    icon: <TruckIcon />,
    badge: <Badge content="운행 중" variant="outline" colorScheme="success" />,
  },
  {
    id: 'posts',
    label: '내 글',
    icon: <DocumentTextIcon />,
    badge: <Badge content={4} variant="soft" colorScheme="info" />,
  },
  { id: 'bookmarks', label: '북마크', icon: <BookmarkIcon /> },
  {
    id: 'reservations',
    label: '예약',
    icon: <CalendarDaysIcon />,
    badge: <Badge content="D-2" variant="soft" colorScheme="warning" />,
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
    badge: <Badge dot colorScheme="success" />,
  },
  { id: 'festival', label: '축제 부스 준비', icon: <TicketSolid />, colorScheme: 'warning' },
  {
    id: 'study',
    label: '알고리즘 스터디',
    icon: <BookOpenSolid />,
    colorScheme: 'success',
    badge: <Badge dot colorScheme="danger" />,
  },
];

export const PC: Story = {
  render: function Render() {
    const [current, setCurrent] = useState('shuttle');

    const label = [...ITEMS, ...PINNED].find((item) => item.id === current)!.label;

    return (
      <Sidebar.Provider className="break-keep">
        <Sidebar value={current} collapsible aria-label="주 메뉴">
          <Sidebar.Header>
            <Avatar name="인포팀" shape="square" size="tiny" aria-hidden>
              <Avatar.Fallback>
                <CubeTransparentIcon />
              </Avatar.Fallback>
            </Avatar>
            <span className="text-subtitle-s2-semibold">GIST 인포팀</span>
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
              <Badge content="관리자" variant="soft" colorScheme="primary" />
            </Sidebar.Item>
          </Sidebar.Footer>
        </Sidebar>

        <Sidebar.Inset className="gap-6 px-4 py-8 md:px-8">
          <div className="flex items-center gap-3">
            <Sidebar.Trigger />
            <h1 className="text-headline-h3-bold">{label}</h1>
          </div>
          <Skeleton shape="text" lines={2} />
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </Sidebar.Inset>
      </Sidebar.Provider>
    );
  },
};
