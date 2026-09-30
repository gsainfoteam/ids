import { useState } from 'react';

import {
  ChatBubbleLeftIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';
import { Tabs } from '../../components/navigation/tabs';
import { Menu } from '../../components/overlay/menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Profile/Page',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const INTERESTS = ['프론트엔드', '디자인 시스템', '사진', '보드게임'];

const POSTS = [
  {
    id: 'p1',
    title: '한글 웹폰트 크기 줄이기',
    board: '개발',
    when: '9월 28일',
    likes: 42,
    comments: 7,
  },
  {
    id: 'p2',
    title: 'Ziggle 알림이 두 번 오던 문제 고친 이야기',
    board: '개발',
    when: '9월 12일',
    likes: 31,
    comments: 4,
  },
  {
    id: 'p3',
    title: '무등산 출사 사진 모음',
    board: '사진부',
    when: '8월 30일',
    likes: 58,
    comments: 12,
  },
];

const COMMENTS = [
  {
    id: 'c1',
    on: '가을 축제 부스 운영 동아리 모집',
    text: '인포팀도 부스 내요! 굿즈 준비 중이에요.',
    when: '어제',
  },
  {
    id: 'c2',
    on: 'GIST 해커톤 참가 신청',
    text: '프론트엔드 한 명 구해요. 댓글이나 DM 주세요.',
    when: '9월 27일',
  },
];

const CLUBS = [
  { id: 'infoteam', name: 'GIST 인포팀', role: '프론트엔드 · 2025년부터', lead: true },
  { id: 'photo', name: '사진부', role: '부원 · 2025년부터', lead: false },
];

const STATS = [
  { label: '글', value: '24' },
  { label: '팔로워', value: '128' },
  { label: '팔로잉', value: '96' },
];

export const PC: Story = {
  render: function Render() {
    const [following, setFollowing] = useState(false);

    return (
      <main className="mx-auto grid w-full max-w-5xl items-start gap-6 px-4 py-10 break-keep sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:py-14">
        <Card>
          <Card.Header>
            <Avatar name="김지수" />
            <Card.Title asChild>
              <h1 className="text-headline-h4-bold">김지수</h1>
            </Card.Title>
            <Card.Description>@jisu · 전기전자컴퓨터공학과 25학번</Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <p>웹 프론트엔드와 디자인 시스템을 좋아해요. 인포팀에서 Ziggle 을 만들어요.</p>
            <ul aria-label="관심사" className="flex flex-wrap gap-1.5">
              {INTERESTS.map((interest) => (
                <li key={interest}>
                  <Chip size="tiny">{interest}</Chip>
                </li>
              ))}
            </ul>
            <dl className="grid grid-cols-3 gap-2">
              {STATS.map((stat) => (
                <Card key={stat.label} variant="soft" size="tiny" asChild>
                  <div>
                    <dt>
                      <Card.Description>{stat.label}</Card.Description>
                    </dt>
                    <dd>
                      <Card.Title className="text-subtitle-s1-bold">{stat.value}</Card.Title>
                    </dd>
                  </div>
                </Card>
              ))}
            </dl>
          </Card.Content>
          <Card.Footer className="border-t">
            <Button
              variant={following ? 'outline' : 'solid'}
              className="flex-1"
              onClick={() => setFollowing(!following)}
            >
              {following ? <CheckIcon /> : <UserPlusIcon />}
              {following ? '팔로잉' : '팔로우'}
            </Button>
            <IconButton
              variant="outline"
              aria-label="메시지 보내기"
              icon={<ChatBubbleLeftIcon />}
            />
            <Menu>
              <Menu.Trigger asChild>
                <IconButton
                  variant="outline"
                  aria-label="더 보기"
                  icon={<EllipsisHorizontalIcon />}
                />
              </Menu.Trigger>
              <Menu.Content>
                <Menu.Item onSelect={() => toast.success('프로필 주소를 복사했어요')}>
                  프로필 주소 복사
                </Menu.Item>
                <Menu.Item>차단하기</Menu.Item>
                <Menu.Item>신고하기</Menu.Item>
              </Menu.Content>
            </Menu>
          </Card.Footer>
        </Card>

        <Tabs defaultValue="posts" className="flex flex-col gap-6">
          <Tabs.List aria-label="활동">
            <Tabs.Trigger value="posts">글</Tabs.Trigger>
            <Tabs.Trigger value="comments">댓글</Tabs.Trigger>
            <Tabs.Trigger value="clubs">동아리</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="posts">
            <Card size="tiny">
              <Item.Group variant="bordered" aria-label="쓴 글">
                {POSTS.map((post) => (
                  <Item key={post.id} asChild>
                    <a href={`#${post.id}`}>
                      <Item.Content>
                        <Item.Title>{post.title}</Item.Title>
                        <Item.Description>
                          {post.board} · {post.when} · 좋아요 {post.likes} · 댓글 {post.comments}
                        </Item.Description>
                      </Item.Content>
                    </a>
                  </Item>
                ))}
              </Item.Group>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="comments">
            <Card size="tiny">
              <Item.Group variant="bordered" aria-label="쓴 댓글">
                {COMMENTS.map((comment) => (
                  <Item key={comment.id} asChild>
                    <a href={`#${comment.id}`}>
                      <Item.Content>
                        <Item.Title>{comment.text}</Item.Title>
                        <Item.Description>
                          {comment.on}에 · {comment.when}
                        </Item.Description>
                      </Item.Content>
                    </a>
                  </Item>
                ))}
              </Item.Group>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="clubs">
            <Item.Group variant="separated" aria-label="동아리">
              {CLUBS.map((club) => (
                <Item key={club.id} asChild>
                  <a href={`#${club.id}`}>
                    <Item.Media>
                      <Avatar name={club.name} shape="square" />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>
                        {club.name}
                        {club.lead && (
                          <Badge content="운영진" variant="soft" colorScheme="primary" />
                        )}
                      </Item.Title>
                      <Item.Description>{club.role}</Item.Description>
                    </Item.Content>
                  </a>
                </Item>
              ))}
            </Item.Group>
          </Tabs.Content>
        </Tabs>
      </main>
    );
  },
};
