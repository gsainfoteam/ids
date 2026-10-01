import { useState, type ReactNode } from 'react';

import {
  AcademicCapIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { Select } from '../../components/form/select';
import { TextField } from '../../components/form/text-field';
import { Pagination } from '../../components/navigation/pagination';
import { Tabs } from '../../components/navigation/tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/PostList/List',
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

const CATEGORY_ICON: Record<Category, ReactNode> = {
  academic: <AcademicCapIcon />,
  scholarship: <BanknotesIcon />,
  event: <CalendarDaysIcon />,
  recruit: <UserGroupIcon />,
};

const TABS = [
  { value: 'all', label: '전체' },
  ...(Object.keys(CATEGORY_LABEL) as Category[]).map((value) => ({
    value,
    label: CATEGORY_LABEL[value],
  })),
];

type Sort = 'recent' | 'comments' | 'views';

const isSort = (value: string): value is Sort => ['recent', 'comments', 'views'].includes(value);

const PAGE_SIZE = 6;

export const PC: Story = {
  render: function Render() {
    const [category, setCategory] = useState('all');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<Sort>('recent');
    const [page, setPage] = useState(1);

    const found = POSTS.filter(
      (post) =>
        (category === 'all' || post.category === category) &&
        (query === '' || post.title.includes(query) || post.excerpt.includes(query)),
    ).sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sort === 'comments') return b.comments - a.comments;
      if (sort === 'views') return b.views - a.views;
      return b.postedOn.localeCompare(a.postedOn);
    });
    const pageCount = Math.ceil(found.length / PAGE_SIZE);
    const shown = found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-h3-bold">게시판</h1>
            <p className="text-body-b2-regular">학사, 장학, 행사, 모집 소식을 한곳에서 봐요.</p>
          </div>
          <Button asChild>
            <a href="#write">
              <PencilSquareIcon />
              글쓰기
            </a>
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <TextField
            type="search"
            aria-label="게시판에서 찾기"
            placeholder="제목이나 내용으로 찾기"
            value={query}
            onValueChange={(next) => {
              setQuery(next);
              setPage(1);
            }}
            className="flex-1"
          >
            <MagnifyingGlassIcon />
            <TextField.Input />
            <TextField.Clear />
          </TextField>
          <Select
            aria-label="정렬"
            value={sort}
            onValueChange={(next) => {
              if (next !== null && isSort(next)) setSort(next);
            }}
            className="sm:w-40"
          >
            <Select.Item value="recent">최신순</Select.Item>
            <Select.Item value="comments">댓글 많은 순</Select.Item>
            <Select.Item value="views">많이 본 순</Select.Item>
          </Select>
        </div>

        <Tabs
          value={category}
          className="flex flex-col gap-6"
          onValueChange={(next) => {
            setCategory(next);
            setPage(1);
          }}
        >
          <Tabs.List aria-label="분류">
            {TABS.map((tab) => (
              <Tabs.Trigger key={tab.value} value={tab.value}>
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {TABS.map((tab) => (
            <Tabs.Content key={tab.value} value={tab.value} className="flex flex-col gap-6">
              {shown.length === 0 ? (
                <Empty variant="outline">
                  <Empty.Media>
                    <MagnifyingGlassIcon />
                  </Empty.Media>
                  <Empty.Title>‘{query}’에 맞는 글이 없어요</Empty.Title>
                  <Empty.Description>
                    다른 낱말로 찾거나 분류를 전체로 바꿔 보세요.
                  </Empty.Description>
                </Empty>
              ) : (
                <Card size="tiny">
                  <Item.Group variant="bordered" aria-label="글 목록">
                    {shown.map((post) => (
                      <Item key={post.id} asChild>
                        <a href={`#${post.id}`}>
                          <Item.Media variant="soft">{CATEGORY_ICON[post.category]}</Item.Media>
                          <Item.Content>
                            <Item.Title>
                              {post.pinned && (
                                <Badge content="고정" variant="soft" colorScheme="primary" />
                              )}
                              {post.title}
                            </Item.Title>
                            <Item.Description>
                              {CATEGORY_LABEL[post.category]} · {post.author} ·{' '}
                              {dayOf(post.postedOn)}
                            </Item.Description>
                          </Item.Content>
                          <Item.Actions>
                            <Badge
                              content={`댓글 ${post.comments}`}
                              variant="outline"
                              colorScheme="neutral"
                            />
                          </Item.Actions>
                        </a>
                      </Item>
                    ))}
                  </Item.Group>
                </Card>
              )}

              {pageCount > 1 && (
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onPageChange={setPage}
                  className="self-center"
                />
              )}
            </Tabs.Content>
          ))}
        </Tabs>
      </main>
    );
  },
};
