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
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Skeleton } from '../../components/feedback/skeleton';
import { Spacer } from '../../components/layout/spacer';
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
      <div className="flex min-h-dvh break-keep">
        <aside className="hidden w-64 shrink-0 flex-col gap-5 p-3 md:flex">
          <Menu>
            <Menu.Trigger asChild>
              <Button variant="outline" className="w-full">
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

          <Button variant="soft" className="w-full">
            <MagnifyingGlassIcon />
            찾기
            <Spacer />
            <Kbd keys="Mod+K" size="tiny" />
          </Button>

          <nav aria-label="워크스페이스 메뉴" className="flex flex-col gap-5">
            <Item.Group size="tiny" aria-label="바로 가기">
              <Item asChild selected aria-current="page">
                <a href="#inbox">
                  <Item.Media>
                    <InboxIcon />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>받은 소식</Item.Title>
                  </Item.Content>
                  <Item.Actions>
                    <Badge content={7} variant="soft" colorScheme="primary" />
                  </Item.Actions>
                </a>
              </Item>
            </Item.Group>

            <div className="flex flex-col gap-1">
              <h2 className="text-caption-c1-medium px-2">즐겨찾기</h2>
              <Item.Group size="tiny" aria-label="즐겨찾기">
                {STARRED.map((page) => (
                  <Item key={page.id} asChild>
                    <a href={`#${page.id}`}>
                      <Item.Media>
                        <StarIcon />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>{page.label}</Item.Title>
                      </Item.Content>
                    </a>
                  </Item>
                ))}
              </Item.Group>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-caption-c1-medium px-2">채널</h2>
              <Item.Group size="tiny" aria-label="채널">
                {CHANNELS.map((channel) => (
                  <Item key={channel.id} asChild>
                    <a href={`#${channel.id}`}>
                      <Item.Media>
                        <HashtagIcon />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>{channel.label}</Item.Title>
                      </Item.Content>
                      {channel.unread > 0 && (
                        <Item.Actions>
                          <Badge content={channel.unread} variant="soft" colorScheme="neutral" />
                        </Item.Actions>
                      )}
                    </a>
                  </Item>
                ))}
              </Item.Group>
            </div>
          </nav>

          <Item size="tiny" variant="outline" className="mt-auto">
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
        </aside>

        <div className="flex min-w-0 flex-1 p-2 md:ps-0">
          <Card className="flex-1">
            <Card.Header className="border-b">
              <Card.Title asChild>
                <h1>받은 소식</h1>
              </Card.Title>
              <Card.Description>{active.name}에서 나에게 온 멘션과 댓글이에요.</Card.Description>
              <Card.Action>
                <Button variant="outline" size="tiny">
                  모두 읽음
                </Button>
              </Card.Action>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <Skeleton shape="text" lines={3} />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </Card.Content>
          </Card>
        </div>
      </div>
    );
  },
};
