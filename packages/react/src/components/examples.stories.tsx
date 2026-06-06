import { useState, type ReactNode } from 'react';

import {
  Car03Icon,
  Home01Icon,
  Message01Icon,
  Search01Icon,
  Share01Icon,
  UserCircle02Icon,
} from 'hugeicons-react';

import { Badge } from './badge';
import { BottomNavigation } from './bottom-navigation';
import { Button } from './button';
import { Card } from './card';
import { Checkbox } from './checkbox';
import { Dialog } from './dialog';
import { Empty } from './empty';
import { FloatingButton } from './floating-button';
import { HStack } from './hstack';
import { IconButton } from './icon-button';
import { Tabs } from './tabs';
import { Text } from './text';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Examples/MVP Frames',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

const Phone = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto h-[760px] w-[390px] overflow-hidden bg-(--ids-color-muted) text-(--ids-color-on-surface)">
    {children}
  </div>
);

export const ZiggleGroups: Story = {
  render: () => (
    <Phone>
      <div className="bg-(--ids-color-surface) p-6">
        <HStack gap={16} crossAxis="center">
          <div className="flex size-20 items-center justify-center rounded-full border border-(--ids-color-outline) text-4xl text-(--ids-color-primary)">
            I
          </div>
          <div>
            <Text variant="title">짭인포팀</Text>
            <Text variant="label" className="text-(--ids-color-on-muted)">
              구독자 19명 · 게시글 5개
            </Text>
          </div>
        </HStack>
        <div className="text-label mt-5 rounded-lg bg-(--ids-color-muted) p-4 text-(--ids-color-on-muted)">
          지속 가능한 개발 문화를 통해 지스트 학부생의 삶의 질을 높이는 팀입니다.
        </div>
        <Button fit="fill" className="mt-4">
          즐겨찾기
        </Button>
      </div>
      <Tabs defaultValue="notice">
        <Tabs.List>
          <Tabs.Trigger value="intro">소개</Tabs.Trigger>
          <Tabs.Trigger value="notice">공지</Tabs.Trigger>
          <Tabs.Trigger value="members">멤버</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="notice" className="space-y-4 p-4">
          <Card variant="elevated">
            <Card.Header>
              <Card.Description>짭인포팀 · 10분 전</Card.Description>
              <Card.Title>공지 제목</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="flex aspect-video items-center justify-center rounded-lg bg-green-50 text-2xl font-bold text-green-700">
                가을학기 인포팀 개발자 모집
              </div>
            </Card.Content>
            <Card.Footer className="justify-between">
              <HStack gap={8}>
                <Badge># 태그1</Badge>
                <Badge># 태그1</Badge>
              </HStack>
              <IconButton icon={<Share01Icon size={20} />} label="공유" />
            </Card.Footer>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Phone>
  ),
};

export const PotgSearchEmpty: Story = {
  render: () => (
    <Phone>
      <div className="p-6">
        <Text variant="heading">팟 검색</Text>
      </div>
      <Empty className="h-[520px]">
        <Empty.Media>
          <div className="text-5xl">⌁</div>
        </Empty.Media>
        <Empty.Description>해당 조건의 택시 팟이 존재하지 않습니다</Empty.Description>
        <Empty.Actions>
          <Button variant="outline">새 팟 만들기</Button>
        </Empty.Actions>
      </Empty>
      <FloatingButton aria-label="새 팟 만들기">
        <Car03Icon size={28} />
      </FloatingButton>
      <BottomNavigation value="search">
        <BottomNavigation.Item value="all" icon={<Home01Icon size={24} />} label="모든 팟" />
        <BottomNavigation.Item value="search" icon={<Search01Icon size={24} />} label="팟 검색" />
        <BottomNavigation.Item value="chat" icon={<Message01Icon size={24} />} label="채팅방" />
        <BottomNavigation.Item value="me" icon={<UserCircle02Icon size={24} />} label="내 정보" />
      </BottomNavigation>
    </Phone>
  ),
};

export const PotgFilterAndDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Phone>
        <div className="space-y-6 p-6">
          <Text variant="heading">팟 검색</Text>
          <Card>
            <Card.Content>
              <Text variant="label">노선 필터</Text>
              <div className="text-title mt-2 flex items-center justify-between">
                <span>지스트</span>
                <span>→</span>
                <span>유스퀘어</span>
              </div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content>
              <Text variant="title">2025년 11월</Text>
              <div className="text-label mt-4 grid grid-cols-7 gap-3 text-center">
                {Array.from({ length: 21 }, (_, i) => (
                  <span
                    key={i}
                    className={
                      i === 12
                        ? 'rounded-xl bg-(--ids-color-primary) p-2 text-(--ids-color-on-primary)'
                        : 'p-2'
                    }
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
            </Card.Content>
          </Card>
          <label className="text-label flex items-center gap-2">
            <Checkbox defaultChecked aria-label="정원이 가득 찬 팟 숨기기" />
            정원이 가득 찬 팟 숨기기
          </label>
          <Button fit="fill" onClick={() => setOpen(true)}>
            적용
          </Button>
        </div>
        <FloatingButton aria-label="새 팟 만들기">
          <Car03Icon size={28} />
        </FloatingButton>
        <BottomNavigation value="search">
          <BottomNavigation.Item value="all" icon={<Home01Icon size={24} />} label="모든 팟" />
          <BottomNavigation.Item value="search" icon={<Search01Icon size={24} />} label="팟 검색" />
          <BottomNavigation.Item value="chat" icon={<Message01Icon size={24} />} label="채팅방" />
          <BottomNavigation.Item value="me" icon={<UserCircle02Icon size={24} />} label="내 정보" />
        </BottomNavigation>
        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Header>
            <Dialog.Title>입장하시겠습니까?</Dialog.Title>
          </Dialog.Header>
          <Dialog.Content>
            <div className="text-label space-y-2">
              <p>
                <strong>노선</strong> 송정역 → 지스트
              </p>
              <p>
                <strong>날짜</strong> 2025년 12월 13일 토요일
              </p>
              <p>
                <strong>시간</strong> 23:30~01:00
              </p>
            </div>
          </Dialog.Content>
          <Dialog.Footer>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              아니요
            </Button>
            <Button onClick={() => setOpen(false)}>네</Button>
          </Dialog.Footer>
        </Dialog>
      </Phone>
    );
  },
};
