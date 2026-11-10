import type { ReactNode } from 'react';

import {
  CameraIcon as CameraSolid,
  CpuChipIcon as CpuChipSolid,
  MusicalNoteIcon as MusicalNoteSolid,
} from '@heroicons/react/16/solid';
import {
  BellIcon,
  BookmarkIcon,
  CakeIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChevronUpDownIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  HomeIcon,
  MegaphoneIcon,
  NewspaperIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Skeleton } from '../../components/feedback/skeleton';
import { Divider } from '../../components/layout/divider';
import { Spacer } from '../../components/layout/spacer';
import { Breadcrumb } from '../../components/navigation/breadcrumb';
import { Sidebar } from '../../components/navigation/sidebar';
import { Menu } from '../../components/overlay/menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Sidebar/Simple',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Entry = {
  id: string;
  label: string;
  icon: ReactNode;
  colorScheme?: Sidebar.Item.Props['colorScheme'];
  badge?: ReactNode;
};

const GROUPS: { label: string; items: Entry[] }[] = [
  {
    label: '둘러보기',
    items: [
      { id: 'home', label: '홈', icon: <HomeIcon /> },
      {
        id: 'board',
        label: '게시판',
        icon: <NewspaperIcon />,
        badge: <Badge content={12} variant="soft" colorScheme="primary" />,
      },
      {
        id: 'notice',
        label: '공지',
        icon: <MegaphoneIcon />,
        badge: <Badge content="새 글" variant="soft" colorScheme="danger" />,
      },
      {
        id: 'shuttle',
        label: '셔틀',
        icon: <TruckIcon />,
        badge: <Badge content="운행 중" variant="outline" colorScheme="success" />,
      },
      { id: 'meal', label: '오늘의 식단', icon: <CakeIcon /> },
    ],
  },
  {
    label: '내 활동',
    items: [
      { id: 'posts', label: '내 글', icon: <DocumentTextIcon /> },
      {
        id: 'comments',
        label: '받은 댓글',
        icon: <ChatBubbleLeftRightIcon />,
        badge: <Badge content={4} variant="soft" colorScheme="info" />,
      },
      { id: 'bookmarks', label: '북마크', icon: <BookmarkIcon /> },
      {
        id: 'reservations',
        label: '예약',
        icon: <CalendarDaysIcon />,
        badge: <Badge content="D-2" variant="soft" colorScheme="warning" />,
      },
    ],
  },
  {
    label: '내 동아리',
    items: [
      {
        id: 'photo',
        label: '사진부',
        icon: <CameraSolid />,
        colorScheme: 'warning',
        badge: <Badge dot colorScheme="success" />,
      },
      { id: 'band', label: '밴드부 소리샘', icon: <MusicalNoteSolid />, colorScheme: 'danger' },
      {
        id: 'robot',
        label: '로봇 연구회',
        icon: <CpuChipSolid />,
        colorScheme: 'info',
        badge: <Badge dot colorScheme="warning" />,
      },
    ],
  },
];

const CURRENT = 'board';

export const PC: Story = {
  render: () => (
    <Sidebar.Provider className="break-keep">
      <Sidebar value={CURRENT} aria-label="주 메뉴">
        <Sidebar.Header>
          <Avatar name="인포팀" shape="square" size="tiny" aria-hidden>
            <Avatar.Fallback>
              <CubeTransparentIcon />
            </Avatar.Fallback>
          </Avatar>
          <span className="text-subtitle-s2-semibold">GIST 인포팀</span>
        </Sidebar.Header>
        {GROUPS.map((group) => (
          <Sidebar.Group key={group.label} label={group.label}>
            {group.items.map((item) => (
              <Sidebar.Item
                key={item.id}
                value={item.id}
                href={`#${item.id}`}
                colorScheme={item.colorScheme}
              >
                {item.icon}
                {item.label}
                {item.badge}
              </Sidebar.Item>
            ))}
          </Sidebar.Group>
        ))}
        <Sidebar.Footer>
          <Menu>
            <Menu.Trigger asChild>
              <Button variant="outline" className="w-full">
                <Avatar name="김지수" size="tiny" />
                김지수
                <Spacer />
                <ChevronUpDownIcon />
              </Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item>내 프로필</Menu.Item>
              <Menu.Item>설정</Menu.Item>
              <Menu.Separator />
              <Menu.Item>로그아웃</Menu.Item>
            </Menu.Content>
          </Menu>
        </Sidebar.Footer>
      </Sidebar>

      <Sidebar.Inset>
        <header className="flex items-center gap-3 px-4 py-3 md:px-8">
          <Sidebar.Trigger />
          <Breadcrumb aria-label="위치">
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>게시판</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb>
          <Spacer />
          <IconButton variant="outline" aria-label="알림" icon={<BellIcon />} />
        </header>
        <Divider />

        <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
          <h1 className="text-headline-h3-bold">게시판</h1>
          <Skeleton shape="text" lines={2} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </Sidebar.Inset>
    </Sidebar.Provider>
  ),
};
