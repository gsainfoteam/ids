import { useState } from 'react';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Spacer } from '../../components/layout/spacer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/PostList/Cards',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Category = 'academic' | 'scholarship' | 'event' | 'recruit';

type Post = {
  id: string;
  category: Category;
  title: string;
  excerpt: string;
  author: string;
  postedOn: string;
  comments: number;
  views: number;
  pinned?: boolean;
};

const CATEGORY_LABEL: Record<Category, string> = {
  academic: '학사',
  scholarship: '장학',
  event: '행사',
  recruit: '모집',
};

const POSTS: Post[] = [
  {
    id: 'add-drop',
    category: 'academic',
    title: '2026학년도 2학기 수강 정정 안내',
    excerpt:
      '10월 2일 18시까지 포털에서 수강 과목을 바꿀 수 있습니다. 정정 기간이 끝나면 취소만 됩니다.',
    author: '학사팀',
    postedOn: '2026-09-30',
    comments: 12,
    views: 2841,
    pinned: true,
  },
  {
    id: 'festival-booth',
    category: 'event',
    title: '가을 축제 부스 운영 동아리 모집',
    excerpt:
      '10월 16일부터 이틀 동안 학생회관 앞 광장에서 열리는 축제에 부스를 낼 동아리를 찾습니다.',
    author: '총학생회',
    postedOn: '2026-09-29',
    comments: 8,
    views: 1320,
  },
  {
    id: 'infoteam',
    category: 'recruit',
    title: '인포팀 2026 가을 신입 부원 모집',
    excerpt:
      '지스트 학생들이 매일 쓰는 서비스를 함께 만들 개발자와 디자이너를 모십니다. 경험이 없어도 괜찮아요.',
    author: '인포팀',
    postedOn: '2026-09-29',
    comments: 24,
    views: 3105,
  },
  {
    id: 'work-study',
    category: 'scholarship',
    title: '교내 근로 장학생 추가 모집',
    excerpt:
      '도서관과 학생식당에서 일할 근로 장학생 12명을 더 뽑습니다. 주 10시간 이내로 일합니다.',
    author: '학생처',
    postedOn: '2026-09-28',
    comments: 5,
    views: 980,
  },
  {
    id: 'library-24h',
    category: 'academic',
    title: '중간고사 기간 도서관 24시간 개방',
    excerpt:
      '10월 13일부터 24일까지 중앙도서관 1, 2층 열람실을 밤새 엽니다. 학생증을 찍고 들어옵니다.',
    author: '학술정보처',
    postedOn: '2026-09-27',
    comments: 3,
    views: 1766,
  },
  {
    id: 'hackathon',
    category: 'event',
    title: 'GIST 해커톤 참가 신청',
    excerpt:
      '48시간 동안 캠퍼스의 불편을 푸는 해커톤입니다. 한 팀은 3명에서 5명, 상금은 모두 500만 원입니다.',
    author: '창업진흥센터',
    postedOn: '2026-09-26',
    comments: 17,
    views: 2210,
  },
  {
    id: 'national-scholarship',
    category: 'scholarship',
    title: '국가장학금 2차 신청 기간 안내',
    excerpt: '한국장학재단 누리집에서 10월 8일까지 신청합니다. 가구원 동의를 먼저 마쳐 주세요.',
    author: '학생처',
    postedOn: '2026-09-25',
    comments: 2,
    views: 1432,
  },
  {
    id: 'dorm-council',
    category: 'recruit',
    title: '기숙사 자치회 신입 위원 모집',
    excerpt: '생활관 규칙을 함께 정하고 행사를 여는 자치회에서 위원 6명을 모집합니다.',
    author: '생활관',
    postedOn: '2026-09-24',
    comments: 4,
    views: 612,
  },
  {
    id: 'busking',
    category: 'event',
    title: '금요일 저녁 교내 버스킹',
    excerpt: '10월 매주 금요일 19시, 기숙사 앞 잔디밭에서 동아리 연합 공연이 열립니다.',
    author: '문화 동아리 연합',
    postedOn: '2026-09-23',
    comments: 9,
    views: 874,
  },
  {
    id: 'thesis',
    category: 'academic',
    title: '졸업 논문 제출 일정',
    excerpt: '2027년 2월 졸업 예정자는 11월 28일까지 지도 교수의 승인을 받아 논문을 올립니다.',
    author: '학사팀',
    postedOn: '2026-09-22',
    comments: 1,
    views: 530,
  },
  {
    id: 'tutoring',
    category: 'scholarship',
    title: '튜터링 장학 튜터 모집',
    excerpt: '1학년 기초 과목을 가르칠 튜터를 뽑습니다. 활동비는 시간당 1만 5천 원입니다.',
    author: '기초교육학부',
    postedOn: '2026-09-21',
    comments: 6,
    views: 745,
  },
  {
    id: 'photo-club',
    category: 'recruit',
    title: '사진부 가을 출사 참가자 모집',
    excerpt: '10월 11일 무등산 출사에 함께할 부원과 비부원을 모집합니다. 카메라가 없어도 됩니다.',
    author: '사진부',
    postedOn: '2026-09-20',
    comments: 3,
    views: 402,
  },
];

const dayOf = (iso: string) => {
  const [, month, day] = iso.split('-').map(Number);
  return `${month}월 ${day}일`;
};

const COUNT = new Intl.NumberFormat('ko-KR');

const FIRST_PAGE = 6;

export const PC: Story = {
  render: function Render() {
    const [category, setCategory] = useState<Category | null>(null);
    const [shownCount, setShownCount] = useState(FIRST_PAGE);

    const found = POSTS.filter((post) => category === null || post.category === category);
    const shown = found.slice(0, shownCount);

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-h3-bold">이번 주 소식</h1>
          <p className="text-body-b2-regular">놓치면 아쉬운 공지와 모집을 모았어요.</p>
        </div>

        <div role="group" aria-label="분류" className="flex flex-wrap gap-2">
          <Chip
            selected={category === null}
            onSelectedChange={() => {
              setCategory(null);
              setShownCount(FIRST_PAGE);
            }}
          >
            전체
          </Chip>
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((value) => (
            <Chip
              key={value}
              selected={category === value}
              onSelectedChange={() => {
                setCategory(value);
                setShownCount(FIRST_PAGE);
              }}
            >
              {CATEGORY_LABEL[value]}
            </Chip>
          ))}
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((post) => (
            <li key={post.id} className="flex">
              <Card asChild className="w-full">
                <a href={`#${post.id}`}>
                  <Card.Header>
                    <Card.Description>
                      {CATEGORY_LABEL[post.category]} · {dayOf(post.postedOn)}
                    </Card.Description>
                    <Card.Title>{post.title}</Card.Title>
                    {post.pinned && (
                      <Card.Action>
                        <Badge content="고정" variant="soft" colorScheme="primary" />
                      </Card.Action>
                    )}
                  </Card.Header>
                  <Card.Content>{post.excerpt}</Card.Content>
                  <Card.Footer className="border-t">
                    <Avatar name={post.author} size="tiny" />
                    {post.author}
                    <Spacer />
                    댓글 {post.comments} · 조회 {COUNT.format(post.views)}
                  </Card.Footer>
                </a>
              </Card>
            </li>
          ))}
        </ul>

        {shownCount < found.length && (
          <Button
            variant="outline"
            className="self-center"
            onClick={() => setShownCount(shownCount + FIRST_PAGE)}
          >
            더 보기
          </Button>
        )}
      </main>
    );
  },
};
