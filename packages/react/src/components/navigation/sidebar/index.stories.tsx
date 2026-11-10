import { useState, type ReactNode } from 'react';

import {
  AcademicCapIcon as AcademicCapSolid,
  BuildingLibraryIcon as BuildingLibrarySolid,
  CameraIcon as CameraSolid,
  CodeBracketIcon as CodeBracketSolid,
  DevicePhoneMobileIcon as DevicePhoneMobileSolid,
  EyeIcon as EyeSolid,
  FolderIcon as FolderSolid,
  HomeModernIcon as HomeModernSolid,
  MapIcon as MapSolid,
  PaintBrushIcon as PaintBrushSolid,
  PencilSquareIcon as PencilSquareSolid,
  PuzzlePieceIcon as PuzzlePieceSolid,
  RocketLaunchIcon as RocketLaunchSolid,
  ServerStackIcon as ServerStackSolid,
  SparklesIcon as SparklesSolid,
  SwatchIcon as SwatchSolid,
  TruckIcon as TruckSolid,
} from '@heroicons/react/16/solid';
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  BellIcon,
  BookmarkIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  FolderIcon,
  HashtagIcon,
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
  RectangleStackIcon,
  TruckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { expect, waitFor, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { overlay } from '../../../internal/overlay';
import { Button } from '../../action/button';
import { Avatar } from '../../data/avatar';
import { Badge } from '../../data/badge';
import { Card } from '../../data/card';
import { Item } from '../../data/item';
import { Skeleton } from '../../feedback/skeleton';
import { ScrollArea } from '../../layout/scroll-area';
import { Dialog } from '../../overlay/dialog';
import { Kbd } from '../../typography/kbd';

import { Sidebar } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['sidebar', 'floating', 'inset'] as const;
const collapsibles = [false, 'icon', 'offcanvas'] as const;

const meta = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: { canvasPadding: false },
  argTypes: {
    variant: { control: 'radio', options: variants },
    collapsible: { control: 'radio', options: collapsibles },
    value: { control: 'text' },
  },
  args: {
    variant: 'sidebar',
    collapsible: 'icon',
    value: '/board',
  },
  render: (args) => (
    <Sidebar.Provider>
      <Sidebar {...args}>
        <Sidebar.Header>
          <CubeTransparentIcon className="size-6 shrink-0" />
          <span className="text-subtitle-s2-semibold truncate in-data-collapsed:hidden">
            GIST 인포팀
          </span>
        </Sidebar.Header>
        <Sidebar.Group label="둘러보기">
          <Sidebar.Item value="/" href="#home">
            <HomeIcon />홈
          </Sidebar.Item>
          <Sidebar.Item value="/board" href="#board">
            <MegaphoneIcon />
            게시판
            <Badge content={12} variant="soft" />
          </Sidebar.Item>
          <Sidebar.Item value="/shuttle" href="#shuttle">
            <TruckIcon />
            셔틀
          </Sidebar.Item>
        </Sidebar.Group>
        <Sidebar.Group label="설정">
          <Sidebar.Item>
            <Cog6ToothIcon />
            설정
            <Sidebar.Item value="/settings/account" href="#account">
              계정
            </Sidebar.Item>
            <Sidebar.Item value="/settings/alerts" href="#alerts">
              알림
            </Sidebar.Item>
          </Sidebar.Item>
        </Sidebar.Group>
        <Sidebar.Footer>
          <Item size="tiny" variant="outline" className="in-data-collapsed:p-0">
            <Item.Media>
              <Avatar name="김지수" size="tiny" />
            </Item.Media>
            <Item.Content className="in-data-collapsed:sr-only">
              <Item.Title>김지수</Item.Title>
            </Item.Content>
          </Item>
        </Sidebar.Footer>
      </Sidebar>
      <Sidebar.Inset className="gap-6 p-6">
        <div className="flex items-center gap-3">
          <Sidebar.Trigger />
          <h1 className="text-headline-h3-bold">게시판</h1>
        </div>
        <Skeleton shape="text" lines={3} />
        <Skeleton className="h-64" />
      </Sidebar.Inset>
    </Sidebar.Provider>
  ),
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase className="p-6">
      <Showcase.Section
        title="Variant"
        description="sidebar 는 가장자리에 붙고 선 하나로 나뉩니다. floating 은 사이드바가 카드로 뜨고, inset 은 본문이 카드로 뜹니다."
      >
        <Showcase.Row label="sidebar">
          <Sidebar.Provider className="h-80 min-h-0 overflow-hidden">
            <Sidebar value="/" shortcut={false} aria-label="sidebar 메뉴" className="h-full">
              <Sidebar.Item value="/" href="#home">
                <HomeIcon />홈
              </Sidebar.Item>
              <Sidebar.Item href="#inbox">
                <InboxIcon />
                받은 소식
                <Badge content={3} variant="soft" />
              </Sidebar.Item>
              <Sidebar.Item href="#bookmarks">
                <BookmarkIcon />
                북마크
              </Sidebar.Item>
            </Sidebar>
            <Sidebar.Inset className="p-4">
              <Skeleton className="h-full" />
            </Sidebar.Inset>
          </Sidebar.Provider>
        </Showcase.Row>
        <Showcase.Row label="floating">
          <Sidebar.Provider className="h-80 min-h-0 overflow-hidden">
            <Sidebar
              value="/"
              variant="floating"
              shortcut={false}
              aria-label="floating 메뉴"
              className="h-full"
            >
              <Sidebar.Item value="/" href="#home">
                <HomeIcon />홈
              </Sidebar.Item>
              <Sidebar.Item href="#inbox">
                <InboxIcon />
                받은 소식
                <Badge content={3} variant="soft" />
              </Sidebar.Item>
              <Sidebar.Item href="#bookmarks">
                <BookmarkIcon />
                북마크
              </Sidebar.Item>
            </Sidebar>
            <Sidebar.Inset className="p-4">
              <Skeleton className="h-full" />
            </Sidebar.Inset>
          </Sidebar.Provider>
        </Showcase.Row>
        <Showcase.Row label="inset">
          <Sidebar.Provider className="h-80 min-h-0 overflow-hidden">
            <Sidebar
              value="/"
              variant="inset"
              shortcut={false}
              aria-label="inset 메뉴"
              className="h-full"
            >
              <Sidebar.Item value="/" href="#home">
                <HomeIcon />홈
              </Sidebar.Item>
              <Sidebar.Item href="#inbox">
                <InboxIcon />
                받은 소식
                <Badge content={3} variant="soft" />
              </Sidebar.Item>
              <Sidebar.Item href="#bookmarks">
                <BookmarkIcon />
                북마크
              </Sidebar.Item>
            </Sidebar>
            <Sidebar.Inset className="p-4">
              <Skeleton className="h-full" />
            </Sidebar.Inset>
          </Sidebar.Provider>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Collapsed"
        description="icon 은 아이콘 띠만 남고 라벨은 Tooltip 으로 뜹니다. 하위 메뉴는 Menu 로 열립니다."
      >
        {variants.map((variant) => (
          <Showcase.Row key={variant} label={variant}>
            <Sidebar.Provider className="h-80 min-h-0 overflow-hidden">
              <Sidebar
                value="/"
                variant={variant}
                collapsible
                defaultCollapsed
                shortcut={false}
                aria-label={`접힌 ${variant} 메뉴`}
                className="h-full"
              >
                <Sidebar.Item value="/" href="#home">
                  <HomeIcon />홈
                </Sidebar.Item>
                <Sidebar.Item href="#inbox">
                  <InboxIcon />
                  받은 소식
                  <Badge content={3} variant="soft" />
                </Sidebar.Item>
                <Sidebar.Item>
                  <Cog6ToothIcon />
                  설정
                  <Sidebar.Item href="#account">계정</Sidebar.Item>
                  <Sidebar.Item href="#alerts">알림</Sidebar.Item>
                </Sidebar.Item>
              </Sidebar>
              <Sidebar.Inset className="p-4">
                <Skeleton className="h-full" />
              </Sidebar.Inset>
            </Sidebar.Provider>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Parts"
        description="Header 끝에 접기 버튼이 붙고, Group 은 라벨과 목록을 묶습니다. Item 안의 Item 은 하위 메뉴, Footer 는 아래 끝에 붙습니다."
      >
        <Showcase.Row label="states">
          <Sidebar.Provider className="h-[30rem] min-h-0 overflow-hidden">
            <Sidebar
              value="/settings/alerts"
              collapsible
              shortcut={false}
              aria-label="파트 메뉴"
              className="h-full"
            >
              <Sidebar.Header>
                <CubeTransparentIcon className="size-6 shrink-0" />
                <span className="text-subtitle-s2-semibold truncate">GIST 인포팀</span>
              </Sidebar.Header>
              <Sidebar.Group label="둘러보기">
                <Sidebar.Item href="#home">
                  <HomeIcon />홈
                </Sidebar.Item>
                <Sidebar.Item href="#notice" disabled>
                  <BellIcon />
                  알림(disabled)
                </Sidebar.Item>
              </Sidebar.Group>
              <Sidebar.Group label="접히는 그룹" collapsible>
                <Sidebar.Item href="#bookmarks">
                  <BookmarkIcon />
                  북마크
                </Sidebar.Item>
              </Sidebar.Group>
              <Sidebar.Group label="설정">
                <Sidebar.Item>
                  <Cog6ToothIcon />
                  설정
                  <Sidebar.Item value="/settings/account" href="#account">
                    계정
                  </Sidebar.Item>
                  <Sidebar.Item value="/settings/alerts" href="#alerts">
                    알림
                  </Sidebar.Item>
                </Sidebar.Item>
              </Sidebar.Group>
              <Sidebar.Footer>
                <Item size="tiny" variant="outline">
                  <Item.Media>
                    <Avatar name="김지수" size="tiny" />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>김지수</Item.Title>
                  </Item.Content>
                </Item>
              </Sidebar.Footer>
            </Sidebar>
            <Sidebar.Inset className="p-4">
              <Skeleton className="h-full" />
            </Sidebar.Inset>
          </Sidebar.Provider>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const RouterLinks: Story = {
  render: function Render() {
    const [pathname, setPathname] = useState('/inbox');

    return (
      <Sidebar.Provider>
        <Sidebar value={pathname}>
          <Sidebar.Group label="워크스페이스">
            <Sidebar.Item value="/inbox" asChild>
              <a
                href="/inbox"
                onClick={(event) => {
                  event.preventDefault();
                  setPathname('/inbox');
                }}
              >
                <InboxIcon />
                받은 소식
                <Badge content={3} variant="soft" />
              </a>
            </Sidebar.Item>
            <Sidebar.Item value="/bookmarks" asChild>
              <a
                href="/bookmarks"
                onClick={(event) => {
                  event.preventDefault();
                  setPathname('/bookmarks');
                }}
              >
                <BookmarkIcon />
                북마크
              </a>
            </Sidebar.Item>
          </Sidebar.Group>
        </Sidebar>
        <Sidebar.Inset className="gap-4 p-6">
          <div className="flex items-center gap-3">
            <Sidebar.Trigger />
            <h1 className="text-headline-h3-bold">{pathname}</h1>
          </div>
          <Skeleton className="h-64" />
        </Sidebar.Inset>
      </Sidebar.Provider>
    );
  },
};

const TREE_CODE = `<Sidebar aria-label="워크스페이스">
  <Sidebar.Header>
    <Avatar name="GIST 인포팀" shape="square" size="tiny" aria-hidden>
      <Avatar.Fallback>
        <CubeTransparentIcon />
      </Avatar.Fallback>
    </Avatar>
    <span className="text-subtitle-s2-semibold">GIST 인포팀</span>
  </Sidebar.Header>

  <Sidebar.Item href="#search">
    <MagnifyingGlassIcon />
    찾기
    <Kbd keys="Mod+K" size="tiny" />
  </Sidebar.Item>
  <Sidebar.Item value="inbox" href="#inbox">
    <InboxIcon />
    받은 소식
    <Badge content={12} variant="soft" colorScheme="primary" />
  </Sidebar.Item>
  <Sidebar.Item value="my-issues" href="#my-issues">
    <UserCircleIcon />
    내 이슈
    <Badge content={4} variant="soft" colorScheme="warning" />
  </Sidebar.Item>
  <Sidebar.Item value="reviews" href="#reviews">
    <CheckCircleIcon />
    리뷰 요청
    <Badge content={2} variant="soft" colorScheme="danger" />
  </Sidebar.Item>

  <Sidebar.Group label="즐겨찾기" collapsible>
    <Sidebar.Item value="ziggle-v3" href="#ziggle-v3" colorScheme="primary">
      <RocketLaunchSolid />
      Ziggle v3 출시
      <Badge dot colorScheme="success" />
    </Sidebar.Item>
    <Sidebar.Item value="ids-tokens" href="#ids-tokens" colorScheme="danger">
      <SwatchSolid />
      IDS 색 토큰 정리
    </Sidebar.Item>
    <Sidebar.Item value="shuttle-api" href="#shuttle-api" colorScheme="warning">
      <TruckSolid />
      셔틀 API 개편
      <Badge dot colorScheme="warning" />
    </Sidebar.Item>
  </Sidebar.Group>

  <Sidebar.Group label="팀" collapsible>
    <Sidebar.Item value="info" colorScheme="primary">
      <BuildingLibrarySolid />
      인포팀
      <Sidebar.Item value="info-issues" href="#info-issues">
        <InboxIcon />
        이슈
        <Badge content={38} variant="soft" />
      </Sidebar.Item>
      <Sidebar.Item value="info-projects" href="#info-projects">
        <RectangleStackIcon />
        프로젝트
      </Sidebar.Item>
      <Sidebar.Item value="frontend" colorScheme="info">
        <CodeBracketSolid />
        프론트엔드
        <Sidebar.Item value="frontend-active" href="#frontend-active">
          <PlayCircleIcon />
          진행 중
          <Badge content={7} variant="soft" colorScheme="info" />
        </Sidebar.Item>
        <Sidebar.Item value="frontend-backlog" href="#frontend-backlog">
          <ArchiveBoxIcon />
          백로그
        </Sidebar.Item>
        <Sidebar.Item value="frontend-cycles" href="#frontend-cycles">
          <ArrowPathIcon />
          사이클
          <Badge content="12주차" variant="outline" colorScheme="success" />
        </Sidebar.Item>
      </Sidebar.Item>
      <Sidebar.Item value="backend" colorScheme="success">
        <ServerStackSolid />
        백엔드
        <Sidebar.Item value="backend-active" href="#backend-active">
          <PlayCircleIcon />
          진행 중
          <Badge content={3} variant="soft" colorScheme="info" />
        </Sidebar.Item>
        <Sidebar.Item value="backend-backlog" href="#backend-backlog">
          <ArchiveBoxIcon />
          백로그
        </Sidebar.Item>
      </Sidebar.Item>
    </Sidebar.Item>
    <Sidebar.Item value="design" colorScheme="danger">
      <PaintBrushSolid />
      디자인팀
      <Sidebar.Item value="design-issues" href="#design-issues">
        <InboxIcon />
        이슈
        <Badge content={9} variant="soft" />
      </Sidebar.Item>
      <Sidebar.Item value="design-projects" href="#design-projects">
        <RectangleStackIcon />
        프로젝트
      </Sidebar.Item>
    </Sidebar.Item>
    <Sidebar.Item value="photo" colorScheme="warning">
      <CameraSolid />
      사진부
      <Sidebar.Item value="photo-issues" href="#photo-issues">
        <InboxIcon />
        이슈
      </Sidebar.Item>
    </Sidebar.Item>
  </Sidebar.Group>

  <Sidebar.Footer>
    <Sidebar.Item href="#help">
      <QuestionMarkCircleIcon />
      도움말
    </Sidebar.Item>
    <Sidebar.Item href="#profile">
      <Avatar name="김지수" size="tiny" />
      김지수
      <Badge content="관리자" variant="soft" colorScheme="primary" />
    </Sidebar.Item>
  </Sidebar.Footer>
</Sidebar>`;

export const Tree: Story = {
  args: { value: 'frontend-active' },
  render: (args) => (
    <Sidebar.Provider>
      <Sidebar {...args} aria-label="워크스페이스">
        <Sidebar.Header>
          <Avatar name="GIST 인포팀" shape="square" size="tiny" aria-hidden>
            <Avatar.Fallback>
              <CubeTransparentIcon />
            </Avatar.Fallback>
          </Avatar>
          <span className="text-subtitle-s2-semibold">GIST 인포팀</span>
        </Sidebar.Header>

        <Sidebar.Item href="#search">
          <MagnifyingGlassIcon />
          찾기
          <Kbd keys="Mod+K" size="tiny" />
        </Sidebar.Item>
        <Sidebar.Item value="inbox" href="#inbox">
          <InboxIcon />
          받은 소식
          <Badge content={12} variant="soft" colorScheme="primary" />
        </Sidebar.Item>
        <Sidebar.Item value="my-issues" href="#my-issues">
          <UserCircleIcon />
          내 이슈
          <Badge content={4} variant="soft" colorScheme="warning" />
        </Sidebar.Item>
        <Sidebar.Item value="reviews" href="#reviews">
          <CheckCircleIcon />
          리뷰 요청
          <Badge content={2} variant="soft" colorScheme="danger" />
        </Sidebar.Item>

        <Sidebar.Group label="즐겨찾기" collapsible>
          <Sidebar.Item value="ziggle-v3" href="#ziggle-v3" colorScheme="primary">
            <RocketLaunchSolid />
            Ziggle v3 출시
            <Badge dot colorScheme="success" />
          </Sidebar.Item>
          <Sidebar.Item value="ids-tokens" href="#ids-tokens" colorScheme="danger">
            <SwatchSolid />
            IDS 색 토큰 정리
          </Sidebar.Item>
          <Sidebar.Item value="shuttle-api" href="#shuttle-api" colorScheme="warning">
            <TruckSolid />
            셔틀 API 개편
            <Badge dot colorScheme="warning" />
          </Sidebar.Item>
        </Sidebar.Group>

        <Sidebar.Group label="팀" collapsible>
          <Sidebar.Item value="info" colorScheme="primary">
            <BuildingLibrarySolid />
            인포팀
            <Sidebar.Item value="info-issues" href="#info-issues">
              <InboxIcon />
              이슈
              <Badge content={38} variant="soft" />
            </Sidebar.Item>
            <Sidebar.Item value="info-projects" href="#info-projects">
              <RectangleStackIcon />
              프로젝트
            </Sidebar.Item>
            <Sidebar.Item value="frontend" colorScheme="info">
              <CodeBracketSolid />
              프론트엔드
              <Sidebar.Item value="frontend-active" href="#frontend-active">
                <PlayCircleIcon />
                진행 중
                <Badge content={7} variant="soft" colorScheme="info" />
              </Sidebar.Item>
              <Sidebar.Item value="frontend-backlog" href="#frontend-backlog">
                <ArchiveBoxIcon />
                백로그
              </Sidebar.Item>
              <Sidebar.Item value="frontend-cycles" href="#frontend-cycles">
                <ArrowPathIcon />
                사이클
                <Badge content="12주차" variant="outline" colorScheme="success" />
              </Sidebar.Item>
            </Sidebar.Item>
            <Sidebar.Item value="backend" colorScheme="success">
              <ServerStackSolid />
              백엔드
              <Sidebar.Item value="backend-active" href="#backend-active">
                <PlayCircleIcon />
                진행 중
                <Badge content={3} variant="soft" colorScheme="info" />
              </Sidebar.Item>
              <Sidebar.Item value="backend-backlog" href="#backend-backlog">
                <ArchiveBoxIcon />
                백로그
              </Sidebar.Item>
            </Sidebar.Item>
          </Sidebar.Item>
          <Sidebar.Item value="design" colorScheme="danger">
            <PaintBrushSolid />
            디자인팀
            <Sidebar.Item value="design-issues" href="#design-issues">
              <InboxIcon />
              이슈
              <Badge content={9} variant="soft" />
            </Sidebar.Item>
            <Sidebar.Item value="design-projects" href="#design-projects">
              <RectangleStackIcon />
              프로젝트
            </Sidebar.Item>
          </Sidebar.Item>
          <Sidebar.Item value="photo" colorScheme="warning">
            <CameraSolid />
            사진부
            <Sidebar.Item value="photo-issues" href="#photo-issues">
              <InboxIcon />
              이슈
            </Sidebar.Item>
          </Sidebar.Item>
        </Sidebar.Group>

        <Sidebar.Footer>
          <Sidebar.Item href="#help">
            <QuestionMarkCircleIcon />
            도움말
          </Sidebar.Item>
          <Sidebar.Item href="#profile">
            <Avatar name="김지수" size="tiny" />
            김지수
            <Badge content="관리자" variant="soft" colorScheme="primary" />
          </Sidebar.Item>
        </Sidebar.Footer>
      </Sidebar>
      <Sidebar.Inset className="p-6">
        <Card>
          <ScrollArea orientation="horizontal">
            <pre className="text-body-b3-regular font-mono">
              <code>{TREE_CODE}</code>
            </pre>
          </ScrollArea>
        </Card>
      </Sidebar.Inset>
    </Sidebar.Provider>
  ),
};

type Page = {
  id: string;
  label: string;
  icon: ReactNode;
  colorScheme?: Sidebar.Item.Props['colorScheme'];
  badge?: ReactNode;
  children?: Page[];
};

const FAVORITES: Page[] = [
  { id: 'roadmap', label: 'Ziggle 로드맵', icon: <MapSolid />, colorScheme: 'info' },
  { id: 'tokens', label: 'IDS 색 토큰', icon: <SwatchSolid />, colorScheme: 'danger' },
  { id: 'shuttle', label: '셔틀 시간표', icon: <TruckSolid />, colorScheme: 'warning' },
  { id: 'onboarding', label: '신입 온보딩', icon: <AcademicCapSolid />, colorScheme: 'success' },
];

const FAVORITES_CODE = `<Sidebar aria-label="워크스페이스">
  <Sidebar.Item value="inbox" href="#inbox">
    <InboxIcon />
    받은 소식
  </Sidebar.Item>
  <Sidebar.Group
    label="즐겨찾기"
    items={favorites}
    onItemsChange={setFavorites}
    canMove={({ to }) => to.parent === null}
  >
    {(page) => (
      <Sidebar.Item value={page.id} href={\`#\${page.id}\`} colorScheme={page.colorScheme}>
        {page.icon}
        {page.label}
      </Sidebar.Item>
    )}
  </Sidebar.Group>
</Sidebar>`;

export const Favorites: Story = {
  args: { value: 'tokens' },
  render: function Render(args) {
    const [favorites, setFavorites] = useState(FAVORITES);

    return (
      <Sidebar.Provider>
        <Sidebar {...args} aria-label="워크스페이스">
          <Sidebar.Item value="inbox" href="#inbox">
            <InboxIcon />
            받은 소식
          </Sidebar.Item>
          <Sidebar.Group
            label="즐겨찾기"
            items={favorites}
            onItemsChange={setFavorites}
            canMove={({ to }) => to.parent === null}
          >
            {(page) => (
              <Sidebar.Item value={page.id} href={`#${page.id}`} colorScheme={page.colorScheme}>
                {page.icon}
                {page.label}
              </Sidebar.Item>
            )}
          </Sidebar.Group>
        </Sidebar>
        <Sidebar.Inset className="p-6">
          <Card>
            <ScrollArea orientation="horizontal">
              <pre className="text-body-b3-regular font-mono">
                <code>{FAVORITES_CODE}</code>
              </pre>
            </ScrollArea>
          </Card>
        </Sidebar.Inset>
      </Sidebar.Provider>
    );
  },
};

type Channel = {
  id: string;
  kind: 'category' | 'channel';
  label: string;
  unread?: number;
  children?: Channel[];
};

const CHANNELS: Channel[] = [
  {
    id: 'notice',
    kind: 'category',
    label: '공지',
    children: [
      { id: 'announcements', kind: 'channel', label: '공지사항', unread: 2 },
      { id: 'events', kind: 'channel', label: '행사' },
    ],
  },
  {
    id: 'dev',
    kind: 'category',
    label: '개발',
    children: [
      { id: 'frontend', kind: 'channel', label: '프론트엔드', unread: 12 },
      { id: 'backend', kind: 'channel', label: '백엔드' },
      { id: 'deploy', kind: 'channel', label: '배포 알림' },
    ],
  },
  { id: 'lounge', kind: 'category', label: '잡담', children: [] },
];

const CHANNELS_CODE = `<Sidebar aria-label="워크스페이스">
  <Sidebar.Group
    label="채널"
    items={channels}
    onItemsChange={setChannels}
    canMove={({ item, to }) =>
      item.kind === 'category' ? to.parent === null : to.parent?.kind === 'category'
    }
  >
    {(channel) =>
      channel.kind === 'category' ? (
        <Sidebar.Item>
          <FolderIcon />
          {channel.label}
        </Sidebar.Item>
      ) : (
        <Sidebar.Item value={channel.id} href={\`#\${channel.id}\`}>
          <HashtagIcon />
          {channel.label}
          {channel.unread && (
            <Badge content={channel.unread} variant="soft" colorScheme="primary" />
          )}
        </Sidebar.Item>
      )
    }
  </Sidebar.Group>
</Sidebar>`;

export const ChannelSections: Story = {
  args: { value: 'frontend' },
  render: function Render(args) {
    const [channels, setChannels] = useState(CHANNELS);

    return (
      <Sidebar.Provider>
        <Sidebar {...args} aria-label="워크스페이스">
          <Sidebar.Group
            label="채널"
            items={channels}
            onItemsChange={setChannels}
            canMove={({ item, to }) =>
              item.kind === 'category' ? to.parent === null : to.parent?.kind === 'category'
            }
          >
            {(channel) =>
              channel.kind === 'category' ? (
                <Sidebar.Item>
                  <FolderIcon />
                  {channel.label}
                </Sidebar.Item>
              ) : (
                <Sidebar.Item value={channel.id} href={`#${channel.id}`}>
                  <HashtagIcon />
                  {channel.label}
                  {channel.unread && (
                    <Badge content={channel.unread} variant="soft" colorScheme="primary" />
                  )}
                </Sidebar.Item>
              )
            }
          </Sidebar.Group>
        </Sidebar>
        <Sidebar.Inset className="p-6">
          <Card>
            <ScrollArea orientation="horizontal">
              <pre className="text-body-b3-regular font-mono">
                <code>{CHANNELS_CODE}</code>
              </pre>
            </ScrollArea>
          </Card>
        </Sidebar.Inset>
      </Sidebar.Provider>
    );
  },
};

const PAGES: Page[] = [
  { id: 'roadmap', label: 'Ziggle 로드맵', icon: <MapSolid />, colorScheme: 'info' },
  {
    id: 'ids',
    label: 'IDS 디자인 시스템',
    icon: <SwatchSolid />,
    colorScheme: 'danger',
    children: [
      { id: 'minutes', label: '주간 회의록', icon: <PencilSquareSolid /> },
      {
        id: 'tokens',
        label: '토큰',
        icon: <PuzzlePieceSolid />,
        colorScheme: 'primary',
        children: [
          { id: 'color', label: '색', icon: <SparklesSolid />, colorScheme: 'warning' },
          { id: 'radius', label: '모서리', icon: <FolderSolid /> },
        ],
      },
      {
        id: 'review',
        label: '컴포넌트 리뷰',
        icon: <EyeSolid />,
        colorScheme: 'success',
        badge: <Badge content={3} variant="soft" colorScheme="danger" />,
      },
    ],
  },
  {
    id: 'shuttle',
    label: '셔틀 시간표',
    icon: <TruckSolid />,
    colorScheme: 'warning',
    badge: <Badge content="새 학기" variant="outline" colorScheme="success" />,
  },
  {
    id: 'projects',
    label: '프로젝트',
    icon: <RocketLaunchSolid />,
    colorScheme: 'primary',
    children: [
      { id: 'ziggle-v3', label: 'Ziggle v3', icon: <RocketLaunchSolid /> },
      { id: 'gistory', label: 'GISTORY 앱', icon: <DevicePhoneMobileSolid />, colorScheme: 'info' },
      { id: 'site', label: '인포팀 홈페이지', icon: <HomeModernSolid />, colorScheme: 'danger' },
    ],
  },
];

const PAGES_CODE = `<Sidebar aria-label="워크스페이스">
  <Sidebar.Group
    label="페이지"
    items={pages}
    onItemsChange={async (next, { item, to }) => {
      const place = to.parent ? \`"\${to.parent.label}" 안\` : '맨 위';
      const confirmed = await overlay.open<boolean>(({ close }) => (
        <Dialog>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>페이지를 옮길까요?</Dialog.Title>
              <Dialog.Description>
                "{item.label}" 페이지가 {place}의 {to.index + 1}번째 자리로 옮겨집니다.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close>취소</Dialog.Close>
              <Button onClick={() => close(true)}>옮기기</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ));
      if (confirmed) setPages(next);
    }}
  >
    {(page) => (
      <Sidebar.Item value={page.id} href={\`#\${page.id}\`} colorScheme={page.colorScheme}>
        {page.icon}
        {page.label}
        {page.badge}
      </Sidebar.Item>
    )}
  </Sidebar.Group>
</Sidebar>`;

export const NestedPages: Story = {
  args: { value: 'color' },
  render: function Render(args) {
    const [pages, setPages] = useState(PAGES);

    return (
      <Sidebar.Provider>
        <Sidebar {...args} aria-label="워크스페이스">
          <Sidebar.Group
            label="페이지"
            items={pages}
            onItemsChange={async (next, { item, to }) => {
              const place = to.parent ? `"${to.parent.label}" 안` : '맨 위';
              const confirmed = await overlay.open<boolean>(({ close }) => (
                <Dialog>
                  <Dialog.Content className="break-keep">
                    <Dialog.Header>
                      <Dialog.Title>페이지를 옮길까요?</Dialog.Title>
                      <Dialog.Description>
                        &quot;{item.label}&quot; 페이지가 {place}의 {to.index + 1}번째 자리로
                        옮겨집니다.
                      </Dialog.Description>
                    </Dialog.Header>
                    <Dialog.Footer>
                      <Dialog.Close>취소</Dialog.Close>
                      <Button onClick={() => close(true)}>옮기기</Button>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog>
              ));
              if (confirmed) setPages(next);
            }}
          >
            {(page) => (
              <Sidebar.Item value={page.id} href={`#${page.id}`} colorScheme={page.colorScheme}>
                {page.icon}
                {page.label}
                {page.badge}
              </Sidebar.Item>
            )}
          </Sidebar.Group>
        </Sidebar>
        <Sidebar.Inset className="p-6">
          <Card>
            <ScrollArea orientation="horizontal">
              <pre className="text-body-b3-regular font-mono">
                <code>{PAGES_CODE}</code>
              </pre>
            </ScrollArea>
          </Card>
        </Sidebar.Inset>
      </Sidebar.Provider>
    );
  },
};

type FileNode = { id: string; kind: 'folder' | 'file'; name: string; children?: FileNode[] };

const FILES: FileNode[] = [
  {
    id: 'src',
    kind: 'folder',
    name: 'src',
    children: [
      {
        id: 'components',
        kind: 'folder',
        name: 'components',
        children: [
          { id: 'button.tsx', kind: 'file', name: 'button.tsx' },
          { id: 'dialog.tsx', kind: 'file', name: 'dialog.tsx' },
        ],
      },
      { id: 'index.ts', kind: 'file', name: 'index.ts' },
    ],
  },
  { id: 'assets', kind: 'folder', name: 'assets', children: [] },
  { id: 'README.md', kind: 'file', name: 'README.md' },
  { id: 'package.json', kind: 'file', name: 'package.json' },
];

const FILES_CODE = `<Sidebar aria-label="파일">
  <Sidebar.Group
    label="ids-react"
    items={files}
    onItemsChange={setFiles}
    canMove={({ to }) => to.parent === null || to.parent.kind === 'folder'}
  >
    {(file) =>
      file.kind === 'folder' ? (
        <Sidebar.Item>
          <FolderIcon />
          {file.name}
        </Sidebar.Item>
      ) : (
        <Sidebar.Item value={file.id} href={\`#\${file.id}\`}>
          <DocumentTextIcon />
          {file.name}
        </Sidebar.Item>
      )
    }
  </Sidebar.Group>
</Sidebar>`;

export const FileTree: Story = {
  args: { value: 'button.tsx' },
  render: function Render(args) {
    const [files, setFiles] = useState(FILES);

    return (
      <Sidebar.Provider>
        <Sidebar {...args} aria-label="파일">
          <Sidebar.Group
            label="ids-react"
            items={files}
            onItemsChange={setFiles}
            canMove={({ to }) => to.parent === null || to.parent.kind === 'folder'}
          >
            {(file) =>
              file.kind === 'folder' ? (
                <Sidebar.Item>
                  <FolderIcon />
                  {file.name}
                </Sidebar.Item>
              ) : (
                <Sidebar.Item value={file.id} href={`#${file.id}`}>
                  <DocumentTextIcon />
                  {file.name}
                </Sidebar.Item>
              )
            }
          </Sidebar.Group>
        </Sidebar>
        <Sidebar.Inset className="p-6">
          <Card>
            <ScrollArea orientation="horizontal">
              <pre className="text-body-b3-regular font-mono">
                <code>{FILES_CODE}</code>
              </pre>
            </ScrollArea>
          </Card>
        </Sidebar.Inset>
      </Sidebar.Provider>
    );
  },
};

export const MobileDrawer: Story = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  render: () => (
    <Sidebar.Provider>
      <Sidebar value="/">
        <Sidebar.Item value="/" href="#home">
          <HomeIcon />홈
        </Sidebar.Item>
        <Sidebar.Item href="#board">
          <MegaphoneIcon />
          게시판
        </Sidebar.Item>
      </Sidebar>
      <Sidebar.Inset className="gap-4 p-4">
        <div className="flex items-center gap-3">
          <Sidebar.Trigger />
          <h1 className="text-headline-h3-bold">홈</h1>
        </div>
        <Skeleton className="h-64" />
      </Sidebar.Inset>
    </Sidebar.Provider>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '메뉴 열기' }));
    const drawer = await canvas.findByRole('dialog', { name: '사이드바' });
    await userEvent.click(within(drawer).getByRole('link', { name: '게시판' }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: '메뉴 열기' })).toHaveAttribute(
        'aria-expanded',
        'false',
      ),
    );
  },
};
