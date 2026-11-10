import { useState } from 'react';

import {
  BellIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  MegaphoneIcon,
  RectangleStackIcon,
  TruckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { expect, waitFor, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Avatar } from '../../data/avatar';
import { Badge } from '../../data/badge';
import { Item } from '../../data/item';
import { Skeleton } from '../../feedback/skeleton';

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

export const IconRail: Story = {
  render: () => (
    <Sidebar.Provider>
      <Sidebar value="/" collapsible defaultCollapsed>
        <Sidebar.Item value="/" href="#home">
          <HomeIcon />홈
        </Sidebar.Item>
        <Sidebar.Item href="#board">
          <MegaphoneIcon />
          게시판
        </Sidebar.Item>
        <Sidebar.Item>
          <Cog6ToothIcon />
          설정
          <Sidebar.Item href="#account">계정</Sidebar.Item>
          <Sidebar.Item href="#alerts">알림</Sidebar.Item>
        </Sidebar.Item>
      </Sidebar>
      <Sidebar.Inset className="gap-4 p-6">
        <h1 className="text-headline-h3-bold">홈</h1>
        <Skeleton className="h-64" />
      </Sidebar.Inset>
    </Sidebar.Provider>
  ),
};

export const Offcanvas: Story = {
  render: () => (
    <Sidebar.Provider>
      <Sidebar value="/" variant="inset" collapsible="offcanvas">
        <Sidebar.Header>
          <CubeTransparentIcon className="size-6 shrink-0" />
          <span className="text-subtitle-s2-semibold truncate">GIST 인포팀</span>
        </Sidebar.Header>
        <Sidebar.Item value="/" href="#home">
          <HomeIcon />홈
        </Sidebar.Item>
        <Sidebar.Item href="#board">
          <MegaphoneIcon />
          게시판
        </Sidebar.Item>
      </Sidebar>
      <Sidebar.Inset className="gap-4 p-6">
        <div className="flex items-center gap-3">
          <Sidebar.Trigger />
          <h1 className="text-headline-h3-bold">홈</h1>
        </div>
        <Skeleton className="h-64" />
      </Sidebar.Inset>
    </Sidebar.Provider>
  ),
};

export const CollapsibleGroups: Story = {
  render: () => (
    <Sidebar.Provider>
      <Sidebar>
        <Sidebar.Group label="즐겨찾기" collapsible>
          <Sidebar.Item href="#roadmap">Ziggle 로드맵</Sidebar.Item>
          <Sidebar.Item href="#minutes">IDS 회의록</Sidebar.Item>
        </Sidebar.Group>
        <Sidebar.Group label="보관함" collapsible defaultOpen={false}>
          <Sidebar.Item href="#2025">2025년</Sidebar.Item>
          <Sidebar.Item href="#2024">2024년</Sidebar.Item>
        </Sidebar.Group>
      </Sidebar>
      <Sidebar.Inset className="p-6">
        <Skeleton className="h-64" />
      </Sidebar.Inset>
    </Sidebar.Provider>
  ),
};

export const Tree: Story = {
  render: () => (
    <Sidebar.Provider>
      <Sidebar value="frontend-issues" collapsible aria-label="워크스페이스">
        <Sidebar.Group label="팀">
          <Sidebar.Item value="info">
            <UserGroupIcon />
            인포팀
            <Sidebar.Item value="info-issues" href="#info-issues">
              <InboxIcon />
              이슈
            </Sidebar.Item>
            <Sidebar.Item value="info-projects" href="#info-projects">
              <RectangleStackIcon />
              프로젝트
            </Sidebar.Item>
            <Sidebar.Item value="frontend">
              <UserGroupIcon />
              프론트엔드
              <Sidebar.Item value="frontend-issues" href="#frontend-issues">
                <InboxIcon />
                이슈
              </Sidebar.Item>
              <Sidebar.Item value="frontend-projects" href="#frontend-projects">
                <RectangleStackIcon />
                프로젝트
              </Sidebar.Item>
            </Sidebar.Item>
          </Sidebar.Item>
        </Sidebar.Group>
      </Sidebar>
      <Sidebar.Inset className="p-6">
        <Skeleton className="h-64" />
      </Sidebar.Inset>
    </Sidebar.Provider>
  ),
};

const FAVORITES = [
  { value: 'roadmap', label: 'Ziggle 로드맵', icon: <DocumentTextIcon /> },
  {
    value: 'ids',
    label: 'IDS',
    icon: <FolderIcon />,
    children: [
      { value: 'minutes', label: '회의록', icon: <DocumentTextIcon /> },
      { value: 'tokens', label: '토큰 정리', icon: <DocumentTextIcon /> },
    ],
  },
  { value: 'shuttle', label: '셔틀 시간표', icon: <DocumentTextIcon /> },
];

type Favorite = (typeof FAVORITES)[number] & { children?: Favorite[] };

export const Reorder: Story = {
  render: function Render() {
    const [favorites, setFavorites] = useState<Favorite[]>(FAVORITES);

    const renderFavorite = (favorite: Favorite) => (
      <Sidebar.Item key={favorite.value} value={favorite.value} href={`#${favorite.value}`}>
        {favorite.icon}
        {favorite.label}
        {favorite.children?.map(renderFavorite)}
      </Sidebar.Item>
    );

    return (
      <Sidebar.Provider>
        <Sidebar aria-label="워크스페이스">
          <Sidebar.Group
            label="즐겨찾기"
            onItemMove={(move) => setFavorites((current) => Sidebar.moveItem(current, move))}
          >
            {favorites.map(renderFavorite)}
          </Sidebar.Group>
        </Sidebar>
        <Sidebar.Inset className="p-6">
          <Skeleton className="h-64" />
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
