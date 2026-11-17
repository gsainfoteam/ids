import { useState } from 'react';

import {
  ChevronUpDownIcon,
  Cog6ToothIcon,
  HashtagIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Item } from '../../components/data/item';
import { Skeleton } from '../../components/feedback/skeleton';
import { Divider } from '../../components/layout/divider';
import { Spacer } from '../../components/layout/spacer';
import { Sidebar } from '../../components/navigation/sidebar';
import { Menu } from '../../components/overlay/menu';
import { Kbd } from '../../components/typography/kbd';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Sidebar/Inset',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const WORKSPACES = [
  { id: 'infoteam', name: 'GIST 인포팀', plan: '동아리 · 24명' },
  { id: 'photo', name: '사진부', plan: '동아리 · 18명' },
  { id: 'lab', name: '로봇 연구실', plan: '연구실 · 9명' },
];

const CHANNELS = [
  { id: 'general', label: '공지', unread: 2 },
  { id: 'frontend', label: '프론트엔드', unread: 0 },
  { id: 'design', label: '디자인', unread: 5 },
  { id: 'random', label: '잡담', unread: 0 },
];

const STARRED = [
  { id: 'ziggle', label: 'Ziggle 로드맵' },
  { id: 'ids', label: 'IDS 회의록' },
];

export const PC: Story = {
  render: function Render() {
    const [workspace, setWorkspace] = useState(WORKSPACES[0].id);

    const active = WORKSPACES.find(({ id }) => id === workspace)!;

    return (
      <Sidebar.Provider className="break-keep">
        <Sidebar
          value="inbox"
          variant="inset"
          collapsible="offcanvas"
          aria-label="워크스페이스 메뉴"
        >
          <Sidebar.Header>
            <Menu>
              <Menu.Trigger asChild>
                <Button variant="outline" className="-ms-2 min-w-0 flex-1">
                  <Avatar name={active.name} shape="square" size="tiny" />
                  {active.name}
                  <Spacer />
                  <ChevronUpDownIcon />
                </Button>
              </Menu.Trigger>
              <Menu.Content>
                <Menu.RadioGroup value={workspace} onValueChange={setWorkspace}>
                  <Menu.Label>워크스페이스</Menu.Label>
                  {WORKSPACES.map((item) => (
                    <Menu.RadioItem key={item.id} value={item.id}>
                      {item.name}
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioGroup>
                <Menu.Separator />
                <Menu.Item>
                  <PlusIcon />새 워크스페이스
                </Menu.Item>
              </Menu.Content>
            </Menu>
          </Sidebar.Header>

          <Sidebar.Item>
            <MagnifyingGlassIcon />
            찾기
            <Kbd keys="Mod+K" size="tiny" />
          </Sidebar.Item>
          <Sidebar.Item value="inbox" href="#inbox">
            <InboxIcon />
            받은 소식
            <Badge content={7} variant="soft" colorScheme="primary" />
          </Sidebar.Item>

          <Sidebar.Group label="즐겨찾기" collapsible>
            {STARRED.map((page) => (
              <Sidebar.Item key={page.id} value={page.id} href={`#${page.id}`}>
                <StarIcon />
                {page.label}
              </Sidebar.Item>
            ))}
          </Sidebar.Group>

          <Sidebar.Group label="채널" collapsible>
            {CHANNELS.map((channel) => (
              <Sidebar.Item key={channel.id} value={channel.id} href={`#${channel.id}`}>
                <HashtagIcon />
                {channel.label}
                {channel.unread > 0 && <Badge content={channel.unread} variant="soft" />}
              </Sidebar.Item>
            ))}
          </Sidebar.Group>

          <Sidebar.Footer>
            <Item size="tiny" variant="outline">
              <Item.Media>
                <Avatar name="김지수" size="tiny" />
              </Item.Media>
              <Item.Content>
                <Item.Title>김지수</Item.Title>
                <Item.Description>jisu@gm.gist.ac.kr</Item.Description>
              </Item.Content>
              <Item.Actions>
                <IconButton
                  variant="outline"
                  size="tiny"
                  aria-label="설정"
                  icon={<Cog6ToothIcon />}
                />
              </Item.Actions>
            </Item>
          </Sidebar.Footer>
        </Sidebar>

        <Sidebar.Inset>
          <Item className="rounded-none">
            <Item.Media>
              <Sidebar.Trigger />
            </Item.Media>
            <Item.Content>
              <Item.Title asChild>
                <h1 className="text-subtitle-s2-semibold">받은 소식</h1>
              </Item.Title>
              <Item.Description>{active.name}에서 나에게 온 멘션과 댓글이에요.</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Button variant="outline" size="tiny">
                모두 읽음
              </Button>
            </Item.Actions>
          </Item>
          <Divider />
          <div className="flex flex-col gap-4 p-4">
            <Skeleton shape="text" lines={3} />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </Sidebar.Inset>
      </Sidebar.Provider>
    );
  },
};
