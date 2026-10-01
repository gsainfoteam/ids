import {
  Bars3Icon,
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
import { Item } from '../../components/data/item';
import { Skeleton } from '../../components/feedback/skeleton';
import { Divider } from '../../components/layout/divider';
import { Spacer } from '../../components/layout/spacer';
import { Breadcrumb } from '../../components/navigation/breadcrumb';
import { Drawer } from '../../components/overlay/drawer';
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
  render: () => {
    const navigation = (
      <nav aria-label="주 메뉴" className="flex flex-col gap-5">
        {GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <h2 className="text-caption-c1-medium px-2">{group.label}</h2>
            <Item.Group size="tiny" aria-label={group.label}>
              {group.items.map((item) => (
                <Item
                  key={item.id}
                  asChild
                  selected={item.id === CURRENT}
                  aria-current={item.id === CURRENT ? 'page' : undefined}
                >
                  <a href={`#${item.id}`}>
                    <Item.Media>{item.icon}</Item.Media>
                    <Item.Content>
                      <Item.Title>{item.label}</Item.Title>
                    </Item.Content>
                    {item.count && (
                      <Item.Actions>
                        <Badge content={item.count} variant="soft" colorScheme="neutral" />
                      </Item.Actions>
                    )}
                  </a>
                </Item>
              ))}
            </Item.Group>
          </div>
        ))}
      </nav>
    );

    return (
      <div className="flex min-h-dvh break-keep">
        <aside className="hidden w-64 shrink-0 flex-col gap-6 p-3 md:flex">
          <div className="text-subtitle-s2-semibold flex items-center gap-2 px-2 pt-2">
            <Avatar name="인포팀" shape="square" size="tiny" aria-hidden>
              <Avatar.Fallback>
                <CubeTransparentIcon />
              </Avatar.Fallback>
            </Avatar>
            GIST 인포팀
          </div>
          {navigation}
          <div className="mt-auto">
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
          </div>
        </aside>
        <Divider orientation="vertical" className="hidden md:block" />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 px-4 py-3 md:px-8">
            <Drawer side="left">
              <Drawer.Trigger asChild>
                <IconButton
                  variant="outline"
                  aria-label="메뉴 열기"
                  icon={<Bars3Icon />}
                  className="md:hidden"
                />
              </Drawer.Trigger>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>GIST 인포팀</Drawer.Title>
                </Drawer.Header>
                {navigation}
              </Drawer.Content>
            </Drawer>
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

          <main className="flex flex-col gap-6 px-4 py-8 md:px-8">
            <h1 className="text-headline-h3-bold">게시판</h1>
            <Skeleton shape="text" lines={2} />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
            <Skeleton className="h-64" />
          </main>
        </div>
      </div>
    );
  },
};
