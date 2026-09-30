import { useState, type ReactNode } from 'react';

import {
  AtSymbolIcon,
  BellSlashIcon,
  CheckIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  EnvelopeOpenIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { Tabs } from '../../components/navigation/tabs';
import { Menu } from '../../components/overlay/menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Notifications',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Notification = {
  id: string;
  kind: 'mention' | 'activity' | 'system';
  day: '오늘' | '어제' | '이번 주';
  who?: string;
  icon?: ReactNode;
  text: string;
  quote?: string;
  time: string;
  unread: boolean;
};

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    kind: 'mention',
    day: '오늘',
    who: '박서연',
    text: '님이 댓글에서 회원님을 불렀어요',
    quote: '@김지수 부스 배치도 한번 봐 주세요!',
    time: '5분 전',
    unread: true,
  },
  {
    id: 'n2',
    kind: 'activity',
    day: '오늘',
    who: '이도윤',
    text: '님이 회원님의 글을 좋아해요',
    quote: '한글 웹폰트 크기 줄이기',
    time: '1시간 전',
    unread: true,
  },
  {
    id: 'n3',
    kind: 'system',
    day: '오늘',
    icon: <MegaphoneIcon />,
    text: '구독한 게시판에 새 공지가 올라왔어요',
    quote: '2026학년도 2학기 수강 정정 안내',
    time: '3시간 전',
    unread: true,
  },
  {
    id: 'n4',
    kind: 'activity',
    day: '어제',
    who: '최하준',
    text: '님이 회원님을 팔로우해요',
    time: '어제 오후 8:12',
    unread: false,
  },
  {
    id: 'n5',
    kind: 'mention',
    day: '어제',
    who: '정예린',
    text: '님이 글에서 회원님을 불렀어요',
    quote: '사진전 준비는 @김지수 님이 맡아 주시기로 했어요.',
    time: '어제 오후 2:40',
    unread: false,
  },
  {
    id: 'n6',
    kind: 'system',
    day: '이번 주',
    icon: <ShieldCheckIcon />,
    text: '새 기기에서 로그인했어요',
    quote: 'Galaxy Tab S10, 서울',
    time: '9월 27일',
    unread: false,
  },
  {
    id: 'n7',
    kind: 'system',
    day: '이번 주',
    icon: <WrenchScrewdriverIcon />,
    text: '10월 3일 새벽 2시에 서버를 점검해요',
    time: '9월 26일',
    unread: false,
  },
];

const DAYS = ['오늘', '어제', '이번 주'] as const;

const TABS = [
  { value: 'all', label: '전체' },
  { value: 'mention', label: '멘션' },
  { value: 'system', label: '시스템' },
];

export const Default: Story = {
  render: function Render() {
    const [notifications, setNotifications] = useState(NOTIFICATIONS);

    const unread = notifications.filter((notification) => notification.unread).length;

    const markRead = (id: string) =>
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, unread: false } : notification,
        ),
      );

    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-12">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-h3-bold">알림</h1>
            <p aria-live="polite" className="text-body-b2-regular text-(--ids-color-on-muted)">
              {unread > 0 ? `읽지 않은 알림 ${unread}개` : '모두 읽었어요'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={unread === 0}
              onClick={() =>
                setNotifications((current) =>
                  current.map((notification) => ({ ...notification, unread: false })),
                )
              }
            >
              <CheckIcon />
              모두 읽음
            </Button>
            <IconButton variant="outline" aria-label="알림 설정" icon={<Cog6ToothIcon />} />
          </div>
        </header>

        <Tabs defaultValue="all" className="flex flex-col gap-6">
          <Tabs.List aria-label="알림 종류">
            {TABS.map(({ value, label }) => (
              <Tabs.Trigger key={value} value={value}>
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {TABS.map(({ value }) => {
            const shown = notifications.filter(
              (notification) => value === 'all' || notification.kind === value,
            );

            return (
              <Tabs.Content key={value} value={value} className="flex flex-col gap-6">
                {shown.length === 0 ? (
                  <Empty variant="outline" className="py-12">
                    <Empty.Media>
                      <AtSymbolIcon />
                    </Empty.Media>
                    <Empty.Title>새 알림이 없어요</Empty.Title>
                  </Empty>
                ) : (
                  DAYS.map((day) => {
                    const ofDay = shown.filter((notification) => notification.day === day);
                    if (ofDay.length === 0) return null;

                    return (
                      <section key={day} aria-label={day} className="flex flex-col gap-2">
                        <h2 className="text-body-b3-semibold text-(--ids-color-on-muted)">{day}</h2>
                        <Item.Group variant="separated" aria-label={`${day} 알림`}>
                          {ofDay.map((notification) => (
                            <Item key={notification.id} onClick={() => markRead(notification.id)}>
                              <Item.Media variant={notification.who ? undefined : 'soft'}>
                                {notification.who ? (
                                  <Avatar name={notification.who} />
                                ) : (
                                  notification.icon
                                )}
                              </Item.Media>
                              <Item.Content className="gap-1">
                                <Item.Title>
                                  {notification.who && <strong>{notification.who}</strong>}
                                  {notification.text}
                                  {notification.unread && (
                                    <span className="sr-only">, 읽지 않음</span>
                                  )}
                                </Item.Title>
                                {notification.quote && (
                                  <Item.Description className="line-clamp-2">
                                    {notification.quote}
                                  </Item.Description>
                                )}
                                <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                                  {notification.time}
                                </span>
                              </Item.Content>
                              <Item.Actions>
                                {notification.unread && (
                                  <Badge content="새 알림" variant="soft" colorScheme="primary" />
                                )}
                                <Menu>
                                  <Menu.Trigger asChild>
                                    <IconButton
                                      variant="outline"
                                      size="tiny"
                                      aria-label="알림 관리"
                                      icon={<EllipsisHorizontalIcon />}
                                    />
                                  </Menu.Trigger>
                                  <Menu.Content>
                                    <Menu.Item onSelect={() => markRead(notification.id)}>
                                      <EnvelopeOpenIcon />
                                      읽음으로 표시
                                    </Menu.Item>
                                    <Menu.Item>
                                      <BellSlashIcon />이 글의 알림 끄기
                                    </Menu.Item>
                                  </Menu.Content>
                                </Menu>
                              </Item.Actions>
                            </Item>
                          ))}
                        </Item.Group>
                      </section>
                    );
                  })
                )}
              </Tabs.Content>
            );
          })}
        </Tabs>
      </main>
    );
  },
};
