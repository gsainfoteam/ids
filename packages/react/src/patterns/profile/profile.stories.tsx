import { useState } from 'react';

import {
  BookmarkIcon,
  ChatBubbleOvalLeftIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  FlagIcon,
  LinkIcon,
  MapPinIcon,
  NoSymbolIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Empty } from '../../components/data/empty';
import { Image } from '../../components/data/image';
import { Item } from '../../components/data/item';
import { Tabs } from '../../components/navigation/tabs';
import { Menu } from '../../components/overlay/menu';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/PC/Profile',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function banner(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300"><defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 80% 72%)"/><stop offset="1" stop-color="hsl(${(hue + 60) % 360} 70% 86%)"/></linearGradient></defs><rect width="1200" height="300" fill="url(#sky)"/><path d="M0 300 L260 150 L470 240 L720 110 L980 230 L1200 140 L1200 300 Z" fill="hsl(${hue} 40% 42% / 0.55)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const INTERESTS = ['웹 프론트엔드', '디자인 시스템', '접근성', '사진', '보드게임'];

const POSTS = [
  {
    id: 'patterns',
    title: 'IDS 로 예제 페이지 14개 만든 후기',
    excerpt:
      '컴포넌트만 있으면 화면이 금방 나올 줄 알았는데, 막상 짜 보니 조합 규칙이 더 중요했어요.',
    comments: 12,
    date: '9월 30일',
  },
  {
    id: 'a11y',
    title: '스크린 리더로 우리 서비스 써 보기',
    excerpt: 'VoiceOver 로 Ziggle 을 한 시간 동안 써 보고 고친 것들을 정리했어요.',
    comments: 8,
    date: '9월 22일',
  },
  {
    id: 'fonts',
    title: '한글 웹폰트 크기 줄이기',
    excerpt: '가변 폰트와 서브셋으로 Pretendard 를 1.2MB 에서 340KB 로 줄였어요.',
    comments: 5,
    date: '9월 14일',
  },
  {
    id: 'onboarding',
    title: '신입 부원 온보딩 문서를 다시 쓰며',
    excerpt: '처음 오는 사람이 첫 주에 무엇을 해야 하는지부터 적었어요.',
    comments: 3,
    date: '9월 2일',
  },
];

const CLUBS = [
  { name: '인포팀', role: '프론트엔드 리드' },
  { name: '사진부', role: '부원' },
  { name: '보드게임 동아리', role: '총무' },
];

const stat = cn('flex flex-col items-center rounded-standard px-3 py-1 focus-ring');

export const Default: Story = {
  render: function Render() {
    const [following, setFollowing] = useState(false);

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 break-keep sm:px-6">
        <section aria-labelledby="profile-name" className="flex flex-col">
          <Image src={banner(215)} alt="" ratio={4} className="rounded-container" />
          <div className="flex flex-wrap items-end gap-4 px-2 sm:px-6">
            <div className="-mt-10 [zoom:2] rounded-full bg-(--ids-color-surface) p-1">
              <Avatar name="김지수" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col pb-1">
              <h1 id="profile-name" className="text-headline-h4-bold">
                김지수
              </h1>
              <p className="text-body-b3-regular text-(--ids-color-on-muted)">
                @jisu · 전기전자컴퓨터공학부 22학번
              </p>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Button
                variant={following ? 'outline' : 'solid'}
                onClick={() => setFollowing(!following)}
              >
                {!following && <UserPlusIcon />}
                {following ? '팔로잉' : '팔로우'}
              </Button>
              <Button variant="outline">
                <EnvelopeIcon />
                메시지
              </Button>
              <Menu>
                <Menu.Trigger asChild>
                  <IconButton
                    variant="outline"
                    aria-label="더 보기"
                    icon={<EllipsisHorizontalIcon />}
                  />
                </Menu.Trigger>
                <Menu.Content>
                  <Menu.Item>
                    <LinkIcon />
                    프로필 주소 복사
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item>
                    <NoSymbolIcon />
                    차단하기
                  </Menu.Item>
                  <Menu.Item>
                    <FlagIcon />
                    신고하기
                  </Menu.Item>
                </Menu.Content>
              </Menu>
            </div>
          </div>
          <div className="flex flex-col gap-4 px-2 pt-4 sm:px-6">
            <p className="text-body-b2-regular max-w-2xl">
              웹 프론트엔드와 디자인 시스템을 좋아해요. 인포팀에서 Ziggle 과 IDS 를 만들고, 주말에는
              사진을 찍어요.
            </p>
            <p className="text-body-b3-regular flex items-center gap-1.5 text-(--ids-color-on-muted)">
              <MapPinIcon aria-hidden className="size-4" />
              광주, 생활관 A동
            </p>
            <ul className="-mx-3 flex flex-wrap gap-1">
              <li>
                <a href="#posts" className={stat}>
                  <span className="text-subtitle-s2-bold tabular-nums">24</span>
                  <span className="text-caption-c1-regular text-(--ids-color-on-muted)">글</span>
                </a>
              </li>
              <li>
                <a href="#followers" className={stat}>
                  <span className="text-subtitle-s2-bold tabular-nums">
                    {following ? 129 : 128}
                  </span>
                  <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                    팔로워
                  </span>
                </a>
              </li>
              <li>
                <a href="#following" className={stat}>
                  <span className="text-subtitle-s2-bold tabular-nums">96</span>
                  <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                    팔로잉
                  </span>
                </a>
              </li>
            </ul>
            <ul aria-label="관심사" className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <li key={interest}>
                  <Chip onClick={() => undefined}>{interest}</Chip>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_280px]">
          <Tabs defaultValue="posts" className="flex flex-col gap-4">
            <Tabs.List aria-label="활동">
              <Tabs.Trigger value="posts">글</Tabs.Trigger>
              <Tabs.Trigger value="comments">댓글</Tabs.Trigger>
              <Tabs.Trigger value="bookmarks">북마크</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="posts">
              <ul className="flex flex-col gap-3">
                {POSTS.map((post) => (
                  <li key={post.id}>
                    <Card asChild interactive>
                      <a href={`#${post.id}`}>
                        <Card.Header>
                          <Card.Title>{post.title}</Card.Title>
                          <Card.Description className="line-clamp-2">
                            {post.excerpt}
                          </Card.Description>
                        </Card.Header>
                        <Card.Footer className="text-caption-c1-regular gap-3 text-(--ids-color-on-muted)">
                          <span>{post.date}</span>
                          <span className="inline-flex items-center gap-1">
                            <ChatBubbleOvalLeftIcon aria-hidden className="size-4" />
                            <span className="sr-only">댓글</span>
                            {post.comments}
                          </span>
                        </Card.Footer>
                      </a>
                    </Card>
                  </li>
                ))}
              </ul>
            </Tabs.Content>
            <Tabs.Content value="comments">
              <Empty variant="outline" className="py-12">
                <Empty.Media>
                  <ChatBubbleOvalLeftIcon />
                </Empty.Media>
                <Empty.Title>남긴 댓글이 보이지 않아요</Empty.Title>
                <Empty.Description>김지수 님이 댓글을 숨겨 두었어요.</Empty.Description>
              </Empty>
            </Tabs.Content>
            <Tabs.Content value="bookmarks">
              <Empty variant="outline" className="py-12">
                <Empty.Media>
                  <BookmarkIcon />
                </Empty.Media>
                <Empty.Title>북마크한 글이 없어요</Empty.Title>
              </Empty>
            </Tabs.Content>
          </Tabs>

          <aside aria-label="동아리" className="flex flex-col gap-4">
            <Card>
              <Card.Header>
                <Card.Title>동아리</Card.Title>
                <Card.Description>3곳에서 활동해요</Card.Description>
              </Card.Header>
              <Item.Group variant="bordered" size="tiny" aria-label="동아리">
                {CLUBS.map((club) => (
                  <Item key={club.name} asChild>
                    <a href={`#${club.name}`}>
                      <Item.Media>
                        <Avatar name={club.name} size="tiny" />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>{club.name}</Item.Title>
                      </Item.Content>
                      <Item.Actions>
                        <Badge content={club.role} variant="soft" colorScheme="neutral" />
                      </Item.Actions>
                    </a>
                  </Item>
                ))}
              </Item.Group>
            </Card>
          </aside>
        </div>
      </main>
    );
  },
};
