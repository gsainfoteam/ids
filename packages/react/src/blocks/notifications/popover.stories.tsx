import { useState } from 'react';

import { BellIcon, CubeTransparentIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Item } from '../../components/data/item';
import { Skeleton } from '../../components/feedback/skeleton';
import { Divider } from '../../components/layout/divider';
import { Popover } from '../../components/overlay/popover';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Notifications/Popover',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const RECENT = [
  { id: 'n1', who: '박서연', text: '박서연님이 댓글에서 회원님을 불렀어요', time: '5분 전' },
  { id: 'n2', who: '이도윤', text: '이도윤님이 회원님의 글을 좋아해요', time: '1시간 전' },
  { id: 'n3', who: null, text: '구독한 게시판에 새 공지가 올라왔어요', time: '3시간 전' },
  { id: 'n4', who: '최하준', text: '최하준님이 회원님을 팔로우해요', time: '어제' },
];

const UNREAD_AT_FIRST = ['n1', 'n2', 'n3'];

export const PC: Story = {
  render: function Render() {
    const [unread, setUnread] = useState<string[]>(UNREAD_AT_FIRST);

    return (
      <div className="flex min-h-dvh flex-col break-keep">
        <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="text-subtitle-s2-semibold flex items-center gap-2">
            <Avatar name="인포팀" shape="square" size="tiny" aria-hidden>
              <Avatar.Fallback>
                <CubeTransparentIcon />
              </Avatar.Fallback>
            </Avatar>
            GIST 인포팀
          </div>
          <div className="flex items-center gap-3">
            <Popover defaultOpen>
              <Badge content={unread.length} aria-label={`읽지 않은 알림 ${unread.length}개`}>
                <Popover.Trigger asChild>
                  <IconButton variant="outline" aria-label="알림" icon={<BellIcon />} />
                </Popover.Trigger>
              </Badge>
              <Popover.Content className="flex w-80 flex-col gap-3 sm:w-96">
                <div className="flex items-center justify-between gap-3">
                  <Popover.Title>알림</Popover.Title>
                  <Button
                    variant="outline"
                    size="tiny"
                    disabled={unread.length === 0}
                    onClick={() => setUnread([])}
                  >
                    모두 읽음
                  </Button>
                </div>
                <Item.Group size="tiny" aria-label="최근 알림">
                  {RECENT.map((notification) => (
                    <Item
                      key={notification.id}
                      selected={unread.includes(notification.id)}
                      onClick={() => setUnread(unread.filter((other) => other !== notification.id))}
                    >
                      <Item.Media variant={notification.who ? undefined : 'soft'}>
                        {notification.who ? (
                          <Avatar name={notification.who} size="tiny" />
                        ) : (
                          <MegaphoneIcon />
                        )}
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>{notification.text}</Item.Title>
                        <Item.Description>{notification.time}</Item.Description>
                      </Item.Content>
                    </Item>
                  ))}
                </Item.Group>
                <Divider />
                <Button asChild variant="soft" size="tiny" className="w-full">
                  <a href="#notifications">알림 모두 보기</a>
                </Button>
              </Popover.Content>
            </Popover>
            <Avatar name="김지수" size="tiny" />
          </div>
        </header>
        <Divider />

        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton shape="text" lines={3} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="aspect-video" />
            <Skeleton className="aspect-video" />
            <Skeleton className="aspect-video" />
          </div>
        </main>
      </div>
    );
  },
};
