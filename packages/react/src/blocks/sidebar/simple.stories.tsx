import {
  BellIcon,
  BookmarkIcon,
  CalendarDaysIcon,
  ChevronUpDownIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  HomeIcon,
  MegaphoneIcon,
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

const GROUPS = [
  {
    label: '둘러보기',
    items: [
      { id: 'home', label: '홈', icon: <HomeIcon /> },
      { id: 'board', label: '게시판', icon: <MegaphoneIcon />, count: 12 },
      { id: 'shuttle', label: '셔틀', icon: <TruckIcon /> },
    ],
  },
  {
    label: '내 활동',
    items: [
      { id: 'posts', label: '내 글', icon: <DocumentTextIcon /> },
      { id: 'bookmarks', label: '북마크', icon: <BookmarkIcon />, count: 3 },
      { id: 'reservations', label: '예약', icon: <CalendarDaysIcon /> },
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
              <Sidebar.Item key={item.id} value={item.id} href={`#${item.id}`}>
                {item.icon}
                {item.label}
                {item.count && <Badge content={item.count} variant="soft" />}
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
