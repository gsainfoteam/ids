import { useState } from 'react';

import {
  BookmarkIcon,
  CalendarDaysIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  MegaphoneIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Item } from '../../components/data/item';
import { Skeleton } from '../../components/feedback/skeleton';
import { Divider } from '../../components/layout/divider';
import { Spacer } from '../../components/layout/spacer';
import { Tooltip } from '../../components/overlay/tooltip';

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
  { id: 'board', label: '게시판', icon: <MegaphoneIcon /> },
  { id: 'shuttle', label: '셔틀', icon: <TruckIcon /> },
  { id: 'posts', label: '내 글', icon: <DocumentTextIcon /> },
  { id: 'bookmarks', label: '북마크', icon: <BookmarkIcon /> },
  { id: 'reservations', label: '예약', icon: <CalendarDaysIcon /> },
];

export const PC: Story = {
  render: function Render() {
    const [collapsed, setCollapsed] = useState(false);
    const [current, setCurrent] = useState('shuttle');

    const label = ITEMS.find((item) => item.id === current)!.label;

    return (
      <div className="flex min-h-dvh break-keep">
        <aside className="flex shrink-0 flex-col gap-4 p-2">
          <IconButton
            variant="outline"
            aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
            aria-expanded={!collapsed}
            icon={collapsed ? <ChevronDoubleRightIcon /> : <ChevronDoubleLeftIcon />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <nav aria-label="주 메뉴">
            <Item.Group size="tiny" aria-label="주 메뉴">
              {ITEMS.map((item) => {
                const link = (
                  <Item
                    key={item.id}
                    asChild
                    selected={item.id === current}
                    aria-current={item.id === current ? 'page' : undefined}
                  >
                    <a
                      href={`#${item.id}`}
                      aria-label={collapsed ? item.label : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrent(item.id);
                      }}
                    >
                      <Item.Media>{item.icon}</Item.Media>
                      {!collapsed && (
                        <Item.Content>
                          <Item.Title>{item.label}</Item.Title>
                        </Item.Content>
                      )}
                    </a>
                  </Item>
                );

                return collapsed ? (
                  <Tooltip key={item.id} content={item.label} side="right">
                    {link}
                  </Tooltip>
                ) : (
                  link
                );
              })}
            </Item.Group>
          </nav>
          <Spacer />
          <Tooltip content="설정" side="right">
            <IconButton variant="outline" aria-label="설정" icon={<Cog6ToothIcon />} />
          </Tooltip>
          <Avatar name="김지수" size="tiny" />
        </aside>
        <Divider orientation="vertical" />

        <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-8 md:px-8">
          <h1 className="text-headline-h3-bold">{label}</h1>
          <Skeleton shape="text" lines={2} />
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </main>
      </div>
    );
  },
};
