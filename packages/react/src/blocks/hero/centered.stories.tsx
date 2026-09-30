import { ArrowRightIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { AvatarGroup } from '../../components/data/avatar-group';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Progress } from '../../components/feedback/progress';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Hero/Centered',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const STUDENTS = ['박서연', '이도윤', '최하준', '정예린', '한지우'];

const NOTICES = [
  { id: 'n1', title: '2학기 수강 정정 안내', board: '학사', time: '방금' },
  { id: 'n2', title: '가을 축제 부스 모집', board: '행사', time: '1시간 전' },
  { id: 'n3', title: '근로 장학생 추가 모집', board: '장학', time: '어제' },
];

export const PC: Story = {
  render: () => (
    <main className="flex flex-col items-center gap-16 px-4 py-20 break-keep md:py-28">
      <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
        <Button asChild variant="soft" size="tiny">
          <a href="#assistant">
            새로 나온 GIST 도우미 써 보기
            <ArrowRightIcon />
          </a>
        </Button>
        <h1 className="text-headline-h1-bold">GIST 학생이 쓰는 모든 서비스, 한 계정으로</h1>
        <p className="text-body-b1-regular max-w-xl">
          공지, 셔틀, 학식, 도서관까지. 인포팀이 학교생활에 필요한 서비스를 하나로 묶었어요.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <a href="#start">
              GIST 계정으로 시작하기
              <ArrowRightIcon />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="#services">서비스 둘러보기</a>
          </Button>
        </div>
        <div className="text-body-b3-regular flex items-center gap-3">
          <AvatarGroup size="tiny" aria-hidden>
            {STUDENTS.map((name) => (
              <Avatar key={name} name={name} />
            ))}
          </AvatarGroup>
          학생 4,200명이 매일 써요
        </div>
      </div>

      <Card variant="soft" aria-hidden className="w-full max-w-4xl">
        <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
          <Card>
            <Card.Header>
              <Card.Title>새 공지</Card.Title>
              <Card.Action>
                <Badge content="3" variant="soft" colorScheme="primary" />
              </Card.Action>
            </Card.Header>
            <Item.Group variant="bordered" size="tiny">
              {NOTICES.map((notice) => (
                <Item key={notice.id}>
                  <Item.Media variant="soft">
                    <MegaphoneIcon />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{notice.title}</Item.Title>
                    <Item.Description>
                      {notice.board} · {notice.time}
                    </Item.Description>
                  </Item.Content>
                </Item>
              ))}
            </Item.Group>
          </Card>
          <div className="flex flex-col gap-3">
            <Card>
              <Card.Header>
                <Card.Description>다음 셔틀 · 학생회관</Card.Description>
                <Card.Title>8분 뒤 광주송정역행</Card.Title>
                <Card.Action>
                  <Badge content="12:20" variant="soft" colorScheme="primary" />
                </Card.Action>
              </Card.Header>
              <Card.Content>
                <Progress value={72} aria-label="다음 셔틀까지" />
              </Card.Content>
            </Card>
            <Card>
              <Card.Header>
                <Card.Description>오늘 점심 · 학생식당</Card.Description>
                <Card.Title>제육볶음, 된장찌개</Card.Title>
                <Card.Action>
                  <Badge content="5,000원" variant="outline" colorScheme="neutral" />
                </Card.Action>
              </Card.Header>
            </Card>
          </div>
        </div>
      </Card>
    </main>
  ),
};
