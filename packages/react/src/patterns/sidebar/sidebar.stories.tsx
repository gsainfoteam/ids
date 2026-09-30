import { useState, type ReactNode } from 'react';

import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  CalendarDaysIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronUpDownIcon,
  Cog6ToothIcon,
  FolderIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  PlusIcon,
  UserCircleIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { AvatarGroup } from '../../components/data/avatar-group';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { ScrollArea } from '../../components/layout/scroll-area';
import { Breadcrumb } from '../../components/navigation/breadcrumb';
import { Drawer } from '../../components/overlay/drawer';
import { Menu } from '../../components/overlay/menu';
import { Tooltip } from '../../components/overlay/tooltip';
import { Kbd } from '../../components/typography/kbd';
import { IdsProvider } from '../../components/utility/ids-provider';
import { cn } from '../../utils';

import type { IdsColor } from '../../tokens/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/PC/Sidebar',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const WORKSPACES: { id: string; name: string; members: number }[] = [
  { id: 'infoteam', name: '인포팀', members: 42 },
  { id: 'band', name: '밴드부', members: 18 },
  { id: 'photo', name: '사진부', members: 25 },
];

const PAGES: { id: string; label: string; icon: ReactNode; unread?: number; empty: string }[] = [
  { id: 'home', label: '홈', icon: <HomeIcon />, empty: '' },
  {
    id: 'notices',
    label: '공지',
    icon: <MegaphoneIcon />,
    unread: 3,
    empty: '아직 올라온 공지가 없어요',
  },
  { id: 'calendar', label: '일정', icon: <CalendarDaysIcon />, empty: '이번 달 일정이 없어요' },
  { id: 'members', label: '멤버', icon: <UsersIcon />, empty: '초대한 멤버가 아직 없어요' },
  { id: 'files', label: '파일', icon: <FolderIcon />, empty: '올린 파일이 없어요' },
];

const PROJECTS: { id: string; label: string; color: IdsColor }[] = [
  { id: 'ziggle', label: 'Ziggle', color: 'blue' },
  { id: 'taxi', label: '택시 합승', color: 'amber' },
  { id: 'bbosong', label: '뽀송', color: 'cyan' },
];

const EVENTS = [
  {
    id: 'meeting',
    day: '10월 2일 목요일',
    time: '19:00',
    title: '정기 회의',
    place: '학생회관 301호',
  },
  {
    id: 'orientation',
    day: '10월 4일 토요일',
    time: '14:00',
    title: '신입 부원 OT',
    place: '온라인',
  },
  {
    id: 'fair',
    day: '10월 7일 화요일',
    time: '18:00',
    title: '동아리 박람회',
    place: '학생회관 앞 광장',
  },
];

const NOTICES = [
  { id: 'mt', title: '가을 MT 장소 투표', author: '박서연', fresh: true },
  { id: 'server', title: '10월 3일 서버 점검 안내', author: '이도윤', fresh: true },
  { id: 'fee', title: '2학기 회비 납부 안내', author: '최하준', fresh: false },
];

const MEMBERS = ['김지수', '박서연', '이도윤', '최하준', '정예린', '한지우', '오세린', '윤태오'];

const hint = cn('text-caption-c1-regular text-(--ids-color-on-muted)');

export const Default: Story = {
  render: function Render() {
    const [current, setCurrent] = useState('home');
    const [workspaceId, setWorkspaceId] = useState('infoteam');
    const [collapsed, setCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);

    const workspace = WORKSPACES.find(({ id }) => id === workspaceId) ?? WORKSPACES[0];
    const page = PAGES.find(({ id }) => id === current) ?? PAGES[0];

    const go = (id: string) => {
      setCurrent(id);
      setDrawerOpen(false);
    };

    const sidebar = (compact: boolean) => (
      <>
        <div className="flex flex-col gap-2 p-2">
          <Menu>
            <Menu.Trigger asChild>
              <Button
                variant="outline"
                aria-label={compact ? `${workspace.name} 워크스페이스 바꾸기` : undefined}
                className={cn('w-full justify-start', compact && 'justify-center px-0')}
              >
                <Avatar name={workspace.name} size="tiny" />
                {!compact && (
                  <>
                    <span className="min-w-0 flex-1 truncate text-start">{workspace.name}</span>
                    <ChevronUpDownIcon />
                  </>
                )}
              </Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Group>
                <Menu.Label>워크스페이스</Menu.Label>
                <Menu.RadioGroup value={workspaceId} onValueChange={setWorkspaceId}>
                  {WORKSPACES.map(({ id, name, members }) => (
                    <Menu.RadioItem key={id} value={id}>
                      {name}
                      <span className={cn(hint, 'ms-auto')}>{members}명</span>
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioGroup>
              </Menu.Group>
              <Menu.Separator />
              <Menu.Item>
                <PlusIcon />새 워크스페이스
              </Menu.Item>
            </Menu.Content>
          </Menu>

          {compact ? (
            <Tooltip content="검색" side="right">
              <IconButton
                variant="outline"
                aria-label="검색"
                icon={<MagnifyingGlassIcon />}
                onClick={() => setPaletteOpen(true)}
                className="mx-auto"
              />
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              onClick={() => setPaletteOpen(true)}
              className="w-full justify-start"
            >
              <MagnifyingGlassIcon />
              <span className="flex-1 text-start">검색</span>
              <Kbd keys="Mod+K" size="tiny" />
            </Button>
          )}
        </div>

        <ScrollArea fade="y" className="min-h-0 flex-1">
          <nav aria-label="주 메뉴" className="flex flex-col gap-4 p-2">
            <ul className="flex flex-col gap-0.5">
              {PAGES.map(({ id, label, icon, unread }) => (
                <li key={id}>
                  <Tooltip content={label} side="right" disabled={!compact}>
                    <Item
                      asChild
                      size="tiny"
                      selected={id === current}
                      className={cn(compact && 'justify-center')}
                      aria-current={id === current ? 'page' : undefined}
                    >
                      <a
                        href={`#${id}`}
                        onClick={(event) => {
                          event.preventDefault();
                          go(id);
                        }}
                      >
                        <Item.Media>{icon}</Item.Media>
                        <Item.Content className={cn(compact && 'sr-only')}>
                          <Item.Title>{label}</Item.Title>
                        </Item.Content>
                        {unread !== undefined && !compact && (
                          <Item.Actions>
                            <Badge content={unread} colorScheme="primary" />
                          </Item.Actions>
                        )}
                      </a>
                    </Item>
                  </Tooltip>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-1">
              {!compact && <p className={cn(hint, 'px-2')}>프로젝트</p>}
              <ul aria-label="프로젝트" className="flex flex-col gap-0.5">
                {PROJECTS.map(({ id, label, color }) => (
                  <li key={id}>
                    <Tooltip content={label} side="right" disabled={!compact}>
                      <Item asChild size="tiny" className={cn(compact && 'justify-center')}>
                        <a href={`#${id}`}>
                          <Item.Media>
                            <IdsProvider
                              color={color}
                              className="mx-auto size-2.5 rounded-full bg-(--ids-color-primary)"
                            />
                          </Item.Media>
                          <Item.Content className={cn(compact && 'sr-only')}>
                            <Item.Title>{label}</Item.Title>
                          </Item.Content>
                        </a>
                      </Item>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </ScrollArea>

        <div className="flex flex-col gap-0.5 border-t border-(--ids-color-border) p-2">
          <Tooltip content="설정" side="right" disabled={!compact}>
            <Item asChild size="tiny" className={cn(compact && 'justify-center')}>
              <a href="#settings">
                <Item.Media>
                  <Cog6ToothIcon />
                </Item.Media>
                <Item.Content className={cn(compact && 'sr-only')}>
                  <Item.Title>설정</Item.Title>
                </Item.Content>
              </a>
            </Item>
          </Tooltip>

          <Menu>
            <Menu.Trigger asChild>
              <Button
                variant="outline"
                aria-label={compact ? '김지수 계정' : undefined}
                className={cn('w-full justify-start', compact && 'justify-center px-0')}
              >
                <Avatar name="김지수" size="tiny" />
                {!compact && <span className="min-w-0 flex-1 truncate text-start">김지수</span>}
              </Button>
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
      </>
    );

    return (
      <div className="flex min-h-dvh break-keep">
        <aside
          aria-label="사이드바"
          className={cn(
            'sticky top-0 hidden h-dvh shrink-0 flex-col border-e border-(--ids-color-border) bg-(--ids-color-muted) transition-[width] duration-200 md:flex',
            collapsed ? 'w-16' : 'w-64',
          )}
        >
          {sidebar(collapsed)}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-(--ids-color-border) bg-(--ids-color-surface) px-4">
            <Drawer side="left" open={drawerOpen} onOpenChange={setDrawerOpen}>
              <Drawer.Trigger asChild>
                <IconButton
                  variant="outline"
                  aria-label="메뉴 열기"
                  icon={<Bars3Icon />}
                  className="md:hidden"
                />
              </Drawer.Trigger>
              <Drawer.Content
                aria-label="메뉴"
                className="flex w-72 flex-col gap-0 bg-(--ids-color-muted) p-0"
              >
                {sidebar(false)}
              </Drawer.Content>
            </Drawer>
            <IconButton
              variant="outline"
              aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
              icon={collapsed ? <ChevronDoubleRightIcon /> : <ChevronDoubleLeftIcon />}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:inline-flex"
            />
            <Breadcrumb aria-label="위치">
              <Breadcrumb.Item>
                <Breadcrumb.Link
                  href="#home"
                  onClick={(event) => {
                    event.preventDefault();
                    go('home');
                  }}
                >
                  {workspace.name}
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Page>{page.label}</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb>
            <Badge content={2} aria-label="새 알림 2개" className="ms-auto">
              <IconButton variant="outline" aria-label="알림" icon={<BellIcon />} />
            </Badge>
          </header>

          <main className="flex flex-col gap-6 p-4 break-keep md:p-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-headline-h3-bold">{page.label}</h1>
              <p className="text-body-b2-regular text-(--ids-color-on-muted)">
                {workspace.name}의 이번 주를 한눈에 봅니다.
              </p>
            </div>

            {current === 'home' ? (
              <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                  <Card.Header>
                    <Card.Title>이번 주 일정</Card.Title>
                    <Card.Description>3개</Card.Description>
                  </Card.Header>
                  <Item.Group variant="bordered" size="tiny" aria-label="이번 주 일정">
                    {EVENTS.map((event) => (
                      <Item key={event.id}>
                        <Item.Content>
                          <Item.Title>{event.title}</Item.Title>
                          <Item.Description>
                            {event.day}, {event.place}
                          </Item.Description>
                        </Item.Content>
                        <Item.Actions className={hint}>{event.time}</Item.Actions>
                      </Item>
                    ))}
                  </Item.Group>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title>새 공지</Card.Title>
                    <Card.Description>읽지 않은 글 2개</Card.Description>
                  </Card.Header>
                  <Item.Group variant="bordered" size="tiny" aria-label="새 공지">
                    {NOTICES.map((notice) => (
                      <Item key={notice.id} asChild>
                        <a href={`#${notice.id}`}>
                          <Item.Media>
                            <Avatar name={notice.author} size="tiny" />
                          </Item.Media>
                          <Item.Content>
                            <Item.Title>{notice.title}</Item.Title>
                            <Item.Description>{notice.author}</Item.Description>
                          </Item.Content>
                          {notice.fresh && (
                            <Item.Actions>
                              <Badge content="새 글" variant="soft" colorScheme="primary" />
                            </Item.Actions>
                          )}
                        </a>
                      </Item>
                    ))}
                  </Item.Group>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title>멤버</Card.Title>
                    <Card.Description>이번 주에 3명이 새로 들어왔어요</Card.Description>
                  </Card.Header>
                  <Card.Content className="flex flex-col items-start gap-4">
                    <AvatarGroup aria-label={`멤버 ${workspace.members}명`} max={5}>
                      {MEMBERS.map((name) => (
                        <Avatar key={name} name={name} />
                      ))}
                    </AvatarGroup>
                    <p className="text-headline-h4-bold">{workspace.members}명</p>
                  </Card.Content>
                  <Card.Footer>
                    <Button variant="soft" className="w-full">
                      <UserPlusIcon />
                      초대하기
                    </Button>
                  </Card.Footer>
                </Card>
              </div>
            ) : (
              <Empty variant="outline" className="py-16">
                <Empty.Media>{page.icon}</Empty.Media>
                <Empty.Title>{page.empty}</Empty.Title>
                <Empty.Description>새로 만들면 여기에 모입니다.</Empty.Description>
                <Empty.Actions>
                  <Button>
                    <PlusIcon />
                    만들기
                  </Button>
                </Empty.Actions>
              </Empty>
            )}
          </main>
        </div>

        <Menu triggerType="command" hotkey="Mod+K" open={paletteOpen} onOpenChange={setPaletteOpen}>
          <Menu.Content>
            <Menu.Search placeholder="페이지나 명령 찾기" />
            <Menu.Group>
              <Menu.Label>이동</Menu.Label>
              {PAGES.map(({ id, label, icon }) => (
                <Menu.Item key={id} onSelect={() => go(id)}>
                  {icon}
                  {label}
                </Menu.Item>
              ))}
            </Menu.Group>
            <Menu.Separator />
            <Menu.Group>
              <Menu.Label>만들기</Menu.Label>
              <Menu.Item>
                <MegaphoneIcon />새 공지
                <Menu.Shortcut keys="Mod+N" />
              </Menu.Item>
              <Menu.Item>
                <CalendarDaysIcon />새 일정
              </Menu.Item>
            </Menu.Group>
            <Menu.Empty>맞는 명령이 없어요.</Menu.Empty>
          </Menu.Content>
        </Menu>
      </div>
    );
  },
};
