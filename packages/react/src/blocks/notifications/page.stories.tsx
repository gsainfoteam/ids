import { useState, type ReactNode } from 'react';

import {
  BellSlashIcon,
  CheckIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { Tabs } from '../../components/navigation/tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Notifications/Page',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Kind = 'mention' | 'activity' | 'system';

type Notification = {
  id: string;
  kind: Kind;
  day: string;
  who?: string;
  icon?: ReactNode;
  text: string;
  quote?: string;
  time: string;
};

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    kind: 'mention',
    day: '오늘',
    who: '박서연',
    text: '박서연님이 댓글에서 회원님을 불렀어요',
    quote: '@김지수 부스 배치도 한번 봐 주세요!',
    time: '5분 전',
  },
  {
    id: 'n2',
    kind: 'activity',
    day: '오늘',
    who: '이도윤',
    text: '이도윤님이 회원님의 글을 좋아해요',
    quote: '한글 웹폰트 크기 줄이기',
    time: '1시간 전',
  },
  {
    id: 'n3',
    kind: 'system',
    day: '오늘',
    icon: <MegaphoneIcon />,
    text: '구독한 게시판에 새 공지가 올라왔어요',
    quote: '2026학년도 2학기 수강 정정 안내',
    time: '3시간 전',
  },
  {
    id: 'n4',
    kind: 'activity',
    day: '어제',
    who: '최하준',
    text: '최하준님이 회원님을 팔로우해요',
    time: '오후 8:12',
  },
  {
    id: 'n5',
    kind: 'mention',
    day: '어제',
    who: '정예린',
    text: '정예린님이 글에서 회원님을 불렀어요',
    quote: '사진전 준비는 @김지수 님이 맡아 주시기로 했어요.',
    time: '오후 2:40',
  },
  {
    id: 'n6',
    kind: 'system',
    day: '이번 주',
    icon: <ShieldCheckIcon />,
    text: '새 기기에서 로그인했어요',
    quote: 'Galaxy Tab S10 · 서울',
    time: '9월 27일',
  },
  {
    id: 'n7',
    kind: 'system',
    day: '이번 주',
    icon: <WrenchScrewdriverIcon />,
    text: '10월 3일 새벽 2시에 서버를 점검해요',
    time: '9월 26일',
  },
];

const UNREAD_AT_FIRST = ['n1', 'n2', 'n3'];

const DAYS = ['오늘', '어제', '이번 주'];

const TABS: { value: 'all' | Kind; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'mention', label: '멘션' },
  { value: 'activity', label: '활동' },
  { value: 'system', label: '시스템' },
];

export const PC: Story = {
  render: function Render() {
    const [unread, setUnread] = useState<string[]>(UNREAD_AT_FIRST);

    const markRead = (id: string) => setUnread(unread.filter((other) => other !== id));

    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-h3-bold">알림</h1>
            <p className="text-body-b2-regular">
              {unread.length > 0 ? `읽지 않은 알림이 ${unread.length}개 있어요.` : '모두 읽었어요.'}
            </p>
          </div>
          <Button
            variant="outline"
            size="tiny"
            disabled={unread.length === 0}
            onClick={() => setUnread([])}
          >
            <CheckIcon />
            모두 읽음
          </Button>
        </div>

        <Tabs defaultValue="all" className="flex flex-col gap-6">
          <Tabs.List aria-label="알림 종류">
            {TABS.map((tab) => (
              <Tabs.Trigger key={tab.value} value={tab.value}>
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {TABS.map((tab) => {
            const shown = NOTIFICATIONS.filter(
              (notification) => tab.value === 'all' || notification.kind === tab.value,
            );

            return (
              <Tabs.Content key={tab.value} value={tab.value} className="flex flex-col gap-6">
                {shown.length === 0 && (
                  <Empty variant="outline">
                    <Empty.Media>
                      <BellSlashIcon />
                    </Empty.Media>
                    <Empty.Title>알림이 없어요</Empty.Title>
                  </Empty>
                )}
                {DAYS.map((day) => {
                  const ofTheDay = shown.filter((notification) => notification.day === day);
                  if (ofTheDay.length === 0) return null;

                  return (
                    <section
                      key={day}
                      aria-labelledby={`${tab.value}-${day}`}
                      className="flex flex-col gap-3"
                    >
                      <h2 id={`${tab.value}-${day}`} className="text-body-b3-semibold">
                        {day}
                      </h2>
                      <Card size="tiny">
                        <Item.Group variant="bordered" aria-label={`${day} 알림`}>
                          {ofTheDay.map((notification) => (
                            <Item key={notification.id} onClick={() => markRead(notification.id)}>
                              <Item.Media variant={notification.icon ? 'soft' : undefined}>
                                {notification.icon ?? (
                                  <Avatar name={notification.who} size="tiny" />
                                )}
                              </Item.Media>
                              <Item.Content>
                                <Item.Title>{notification.text}</Item.Title>
                                <Item.Description>
                                  {notification.quote
                                    ? `${notification.time} · ${notification.quote}`
                                    : notification.time}
                                </Item.Description>
                              </Item.Content>
                              {unread.includes(notification.id) && (
                                <Item.Actions>
                                  <Badge dot colorScheme="primary" aria-label="읽지 않음" />
                                </Item.Actions>
                              )}
                            </Item>
                          ))}
                        </Item.Group>
                      </Card>
                    </section>
                  );
                })}
              </Tabs.Content>
            );
          })}
        </Tabs>
      </main>
    );
  },
};
