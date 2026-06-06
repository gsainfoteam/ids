import { useState } from 'react';

import {
  Bookmark01Icon,
  Home01Icon,
  Message01Icon,
  Search01Icon,
  UserCircle02Icon,
} from 'hugeicons-react';

import { BottomNavigation } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BottomNavigation> = {
  title: 'Components/BottomNavigation',
  component: BottomNavigation,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BottomNavigation>;

export const Ziggle: Story = {
  render: () => {
    const [value, setValue] = useState('home');
    return (
      <div className="h-80 bg-(--ids-color-muted)">
        <BottomNavigation value={value} onValueChange={setValue}>
          <BottomNavigation.Item value="home" icon={<Home01Icon size={24} />} label="홈" />
          <BottomNavigation.Item
            value="favorite"
            icon={<Bookmark01Icon size={24} />}
            label="즐겨찾기"
          />
          <BottomNavigation.Item
            value="profile"
            icon={<UserCircle02Icon size={24} />}
            label="프로필"
          />
        </BottomNavigation>
      </div>
    );
  },
};

export const Potg: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <div className="h-80 bg-(--ids-color-muted)">
        <BottomNavigation value={value} onValueChange={setValue}>
          <BottomNavigation.Item value="all" icon={<Home01Icon size={24} />} label="모든 팟" />
          <BottomNavigation.Item value="search" icon={<Search01Icon size={24} />} label="팟 검색" />
          <BottomNavigation.Item value="chat" icon={<Message01Icon size={24} />} label="채팅방" />
          <BottomNavigation.Item value="me" icon={<UserCircle02Icon size={24} />} label="내 정보" />
        </BottomNavigation>
      </div>
    );
  },
};
