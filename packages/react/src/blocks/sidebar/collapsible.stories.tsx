import { useState } from 'react';

import {
  BookmarkIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  MegaphoneIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { Avatar } from '../../components/data/avatar';
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
  { id: 'board', label: '게시판', icon: <MegaphoneIcon /> },
  { id: 'shuttle', label: '셔틀', icon: <TruckIcon /> },
  { id: 'posts', label: '내 글', icon: <DocumentTextIcon /> },
  { id: 'bookmarks', label: '북마크', icon: <BookmarkIcon /> },
  { id: 'reservations', label: '예약', icon: <CalendarDaysIcon /> },
];

export const PC: Story = {
  render: function Render() {
    const [current, setCurrent] = useState('shuttle');

    const label = ITEMS.find((item) => item.id === current)!.label;

    return (
      <Sidebar.Provider className="break-keep">
        <Sidebar value={current} collapsible aria-label="주 메뉴">
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
            </Sidebar.Item>
          ))}
          <Sidebar.Footer>
            <Sidebar.Item href="#settings">
              <Cog6ToothIcon />
              설정
            </Sidebar.Item>
            <Sidebar.Item href="#profile">
              <Avatar name="김지수" size="tiny" />
              김지수
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
