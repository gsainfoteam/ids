import { useState, type ReactNode } from 'react';

import {
  Car03Icon,
  Home01Icon,
  Message01Icon,
  Search01Icon,
  Share01Icon,
  UserCircle02Icon,
} from 'hugeicons-react';

import { Avatar } from './avatar';
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
import { Item } from './item';
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

const PhoneHeader = ({ title, backLabel }: { title: string; backLabel?: string }) => (
  <div className="relative flex h-14 items-center justify-center border-b border-(--ids-color-outline) bg-(--ids-color-surface) px-4">
    {backLabel ? (
      <button className="text-label absolute left-4 text-(--ids-color-primary)">{backLabel}</button>
    ) : null}
    <Text variant="label">{title}</Text>
  </div>
);

const PotgNavigation = ({ value }: { value: string }) => (
  <BottomNavigation value={value}>
    <BottomNavigation.Item value="all" icon={<Home01Icon size={24} />} label="모든 팟" />
    <BottomNavigation.Item value="search" icon={<Search01Icon size={24} />} label="팟 검색" />
    <BottomNavigation.Item value="chat" icon={<Message01Icon size={24} />} label="채팅방" />
    <BottomNavigation.Item value="me" icon={<UserCircle02Icon size={24} />} label="내 정보" />
  </BottomNavigation>
);

const NoticePoster = () => (
  <div className="flex aspect-square items-center justify-center rounded-lg border border-(--ids-color-outline) bg-rose-100 p-8 text-center text-2xl font-bold text-rose-500">
    2024 정보국
    <br />
    신규 국원 모집
  </div>
);

const NoticeBody = ({ withImage }: { withImage: boolean }) => (
  <div className="space-y-6">
    {withImage ? (
      <>
        <NoticePoster />
        <Card>
          <Card.Content>
            <Text variant="title" className="text-rose-500">
              Q. Infoteam이 무엇인가요?
            </Text>
            <Text className="mt-2 text-(--ids-color-on-muted)">
              Infoteam은 IT기술을 이용해 GIST 학생들의 삶을 편리하게 만듭니다.
            </Text>
          </Card.Content>
        </Card>
      </>
    ) : null}
    <Text>
      비상대책위원회 정보국(Infoteam)에서 신규 부원 모집을 진행합니다!
      <br />
      <u>지원서 작성 구글 폼 링크</u>
    </Text>
    <Text>
      인포팀은 IT 서비스 개발을 통해 GIST 학부생의 학교 생활을 편리하게 만들어주는 역할을 수행하고
      있습니다. 현재 지글(Ziggle), IdP 등의 서비스를 운영 중입니다.
    </Text>
    <Text>
      올해 모집은 개발자, 디자이너로 나누어 진행하며 각 직군별 역할을 잘 읽어보신 후 지원해주세요.
    </Text>
  </div>
);

const NoticeActions = () => (
  <div className="flex flex-wrap gap-2">
    <Button size="sm">🔥 268</Button>
    <Button size="sm" variant="soft">
      😮 37
    </Button>
    <Button size="sm" variant="soft">
      😭 2
    </Button>
    <Button size="sm" variant="soft">
      🤔 1
    </Button>
    <Button size="sm" variant="soft">
      공유하기
    </Button>
    <Button size="sm" variant="soft">
      링크 복사하기
    </Button>
  </div>
);

const TaxiPotCard = () => (
  <Card variant="elevated" interactive>
    <div className="flex">
      <Card.Content className="min-w-0 flex-1">
        <Text variant="label" className="text-(--ids-color-on-muted)">
          지스트 → 송정역
        </Text>
        <Text variant="title" className="mt-1">
          13:10~14:00
        </Text>
      </Card.Content>
      <div className="flex w-24 flex-col items-center justify-center border-l border-dashed border-(--ids-color-outline) bg-(--ids-color-secondary)">
        <Text variant="caption">정원</Text>
        <Text variant="title" className="text-(--ids-color-primary)">
          1/4
        </Text>
      </div>
    </div>
  </Card>
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

export const ZiggleNoticeDetailWithImage: Story = {
  render: () => (
    <Phone>
      <PhoneHeader title="공지 상세" backLabel="공지" />
      <div className="h-[706px] space-y-6 overflow-y-auto bg-(--ids-color-surface) p-6">
        <Button fit="fill">마감기한&nbsp;&nbsp;2024.03.30. 18:00</Button>
        <HStack gap={10} crossAxis="center">
          <Avatar name="인포팀" />
          <Text variant="label">인포팀 · 32분 전</Text>
        </HStack>
        <Text variant="heading">2024 정보국 신입 국원 모집</Text>
        <div className="flex flex-wrap gap-2">
          {['#모집', '#인포팀', '#개발', '#지글', '#비대위', '#정보국'].map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <NoticeBody withImage />
        <NoticeActions />
      </div>
    </Phone>
  ),
};

export const ZiggleNoticeDetailTextOnly: Story = {
  render: () => (
    <Phone>
      <PhoneHeader title="공지 상세" backLabel="공지" />
      <div className="h-[706px] space-y-6 overflow-y-auto bg-(--ids-color-surface) p-6">
        <HStack gap={10} crossAxis="center">
          <Avatar name="인포팀" />
          <Text variant="label">인포팀 · 32분 전</Text>
        </HStack>
        <Text variant="heading">2024 정보국 신입 국원 모집</Text>
        <div className="flex flex-wrap gap-2">
          {['#모집', '#인포팀', '#개발', '#지글', '#비대위', '#정보국'].map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <NoticeBody withImage={false} />
        <NoticeActions />
      </div>
    </Phone>
  ),
};

export const ZiggleProfile: Story = {
  render: () => (
    <Phone>
      <div className="flex h-[688px] flex-col gap-6 p-6">
        <Card size="lg">
          <Card.Content className="flex flex-col items-center py-10">
            <Avatar name="이정우" size="xl" className="size-24 text-2xl" />
            <Text variant="heading" className="mt-6">
              이정우
            </Text>
            <Text variant="title">20260000</Text>
            <Text className="mt-2 text-(--ids-color-on-muted)">
              <u>crowntheking@gm.gist.ac.kr</u>
            </Text>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Item>
              <Item.Content>
                <Item.Title>계정</Item.Title>
                <Item.Description>회원 정보 수정 · 아이디 및 비밀번호 변경</Item.Description>
              </Item.Content>
            </Item>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Item>
              <Item.Content>
                <Item.Title>회원 탈퇴</Item.Title>
              </Item.Content>
            </Item>
            <div className="border-t border-(--ids-color-outline)" />
            <Item>
              <Item.Content>
                <Item.Title>로그아웃</Item.Title>
              </Item.Content>
            </Item>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Item>
              <Item.Content>
                <Item.Title>설정</Item.Title>
                <Item.Description>알림 · 언어 · 정보</Item.Description>
              </Item.Content>
            </Item>
            <div className="border-t border-(--ids-color-outline)" />
            <Item>
              <Item.Content>
                <Item.Title>피드백 · 버그 제보하기</Item.Title>
              </Item.Content>
            </Item>
          </Card.Content>
        </Card>
      </div>
      <BottomNavigation value="profile">
        <BottomNavigation.Item value="home" icon={<Home01Icon size={24} />} label="홈" />
        <BottomNavigation.Item value="favorite" icon={<Share01Icon size={24} />} label="즐겨찾기" />
        <BottomNavigation.Item
          value="profile"
          icon={<UserCircle02Icon size={24} />}
          label="프로필"
        />
      </BottomNavigation>
    </Phone>
  ),
};

export const PotgMainList: Story = {
  render: () => (
    <Phone>
      <div className="h-[688px] space-y-5 overflow-y-auto p-6">
        <Text variant="heading">팟쥐</Text>
        <Card>
          <Card.Content>
            <Text variant="title">요일 별 팟 현황</Text>
            <div className="mt-4 grid grid-cols-7 gap-3 text-center">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div key={day} className="space-y-2">
                  <Text variant="caption">{day}</Text>
                  {[0, 1, 2].map((row) => (
                    <div
                      key={row}
                      className={
                        index === 6 && row === 1
                          ? 'mx-auto flex size-9 items-center justify-center rounded-full bg-(--ids-color-primary) text-(--ids-color-on-primary)'
                          : 'mx-auto flex size-9 items-center justify-center rounded-full border border-(--ids-color-outline)'
                      }
                    >
                      {index === 6 && row === 1 ? 5 : row === 0 ? 0 : 1}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
        <Text variant="label">2025/11/15 토요일</Text>
        {Array.from({ length: 5 }, (_, i) => (
          <TaxiPotCard key={i} />
        ))}
      </div>
      <FloatingButton aria-label="새 팟 만들기">
        <Car03Icon size={28} />
      </FloatingButton>
      <PotgNavigation value="all" />
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
      <PotgNavigation value="search" />
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
        <PotgNavigation value="search" />
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

export const PotgCreateTime: Story = {
  render: () => (
    <Phone>
      <div className="h-full space-y-8 bg-(--ids-color-surface) p-8">
        <Text variant="heading">팟 생성</Text>
        <div className="space-y-5">
          <Text variant="title">
            <span className="mr-3 rounded-lg bg-(--ids-color-primary) px-3 py-1 text-(--ids-color-on-primary)">
              1
            </span>
            지스트 → 광주송정역
          </Text>
          <Text variant="title">
            <span className="mr-3 rounded-lg bg-(--ids-color-primary) px-3 py-1 text-(--ids-color-on-primary)">
              2
            </span>
            11월 14일 금요일
          </Text>
          <Text variant="title">
            <span className="mr-3 rounded-lg border-2 border-(--ids-color-primary) px-3 py-1 text-(--ids-color-primary)">
              3
            </span>
            시간대 설정
          </Text>
        </div>
        <Card>
          <Card.Content className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
            <div>
              <Text variant="caption">금요일 오전</Text>
              <Text variant="title">9:41</Text>
            </div>
            <Text variant="heading">~</Text>
            <div>
              <Text variant="caption">금요일 오후</Text>
              <Text variant="title">12:30</Text>
            </div>
          </Card.Content>
        </Card>
        <Text variant="title">출발 가능한 가장 늦은 시각을 설정하세요</Text>
        <Card variant="filled">
          <Card.Content className="flex h-64 flex-col items-center justify-center gap-6">
            <div className="grid w-56 grid-cols-3 text-center text-3xl text-(--ids-color-on-muted)">
              <span>9</span>
              <span>41</span>
              <span>AM</span>
            </div>
            <Button variant="outline">확인</Button>
          </Card.Content>
        </Card>
      </div>
    </Phone>
  ),
};
