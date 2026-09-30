import { useState, type ReactNode } from 'react';

import {
  AcademicCapIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ChatBubbleOvalLeftIcon,
  EyeIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconToggle } from '../../components/action/icon-toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Image } from '../../components/data/image';
import { Item } from '../../components/data/item';
import { Select } from '../../components/form/select';
import { TextField } from '../../components/form/text-field';
import { Pagination } from '../../components/navigation/pagination';
import { Tabs } from '../../components/navigation/tabs';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/PC/PostList',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function scene(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 80%)"/><stop offset="1" stop-color="hsl(${hue} 60% 94%)"/></linearGradient></defs><rect width="640" height="480" fill="url(#sky)"/><circle cx="460" cy="144" r="48" fill="hsl(${(hue + 40) % 360} 90% 68%)"/><path d="M0 480 L180 221 L333 355 L474 240 L640 480 Z" fill="hsl(${hue} 32% 38%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

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
  cover?: string;
};

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'academic', label: '학사' },
  { value: 'scholarship', label: '장학' },
  { value: 'event', label: '행사' },
  { value: 'recruit', label: '모집' },
];

const CATEGORY_LABEL: Record<Category, string> = {
  academic: '학사',
  scholarship: '장학',
  event: '행사',
  recruit: '모집',
};

const CATEGORY_ICON: Record<Category, ReactNode> = {
  academic: <AcademicCapIcon />,
  scholarship: <BanknotesIcon />,
  event: <CalendarDaysIcon />,
  recruit: <UserGroupIcon />,
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
    cover: scene(20),
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
    cover: scene(215),
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
    cover: scene(265),
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
    cover: scene(140),
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
    cover: scene(40),
  },
];

const POSTED_WITHIN_A_DAY_FROM = '2026-09-29';

const POSTS_PER_PAGE = 5;

const SORT_KEYS = {
  recent: (post: Post) => post.postedOn,
  views: (post: Post) => post.views,
  comments: (post: Post) => post.comments,
};

type Sort = keyof typeof SORT_KEYS;

function isSort(value: string): value is Sort {
  return value in SORT_KEYS;
}

function postsIn(category: string, query: string, sort: Sort) {
  const words = query.trim().toLowerCase();
  const key = SORT_KEYS[sort];

  return POSTS.filter(
    (post) =>
      (category === 'all' || post.category === category) &&
      `${post.title} ${post.excerpt}`.toLowerCase().includes(words),
  ).sort(
    (a, b) =>
      Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
      (key(b) > key(a) ? 1 : key(b) < key(a) ? -1 : 0),
  );
}

function dayOf(date: string) {
  const [, month, day] = date.split('-').map(Number);
  return `${month}월 ${day}일`;
}

const count = new Intl.NumberFormat('ko-KR');

const labels = cn('flex flex-wrap items-center gap-1.5');

const postMeta = cn(
  'flex flex-wrap items-center gap-x-3 gap-y-1 text-caption-c1-regular text-(--ids-color-on-muted)',
);

const stat = cn('inline-flex items-center gap-1');

export const Default: Story = {
  render: function Render() {
    const [category, setCategory] = useState('all');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<Sort>('recent');
    const [view, setView] = useState('list');
    const [page, setPage] = useState(1);

    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-h3-bold">게시판</h1>
            <p className="text-body-b2-regular text-(--ids-color-on-muted)">
              GIST의 공지와 행사, 모집 글을 한곳에서 봅니다.
            </p>
          </div>
          <Button>
            <PencilSquareIcon />
            글쓰기
          </Button>
        </header>

        <Tabs
          value={category}
          onValueChange={(next) => {
            setCategory(next);
            setPage(1);
          }}
          className="flex flex-col gap-4"
        >
          <Tabs.List aria-label="분류">
            {CATEGORIES.map(({ value, label }) => (
              <Tabs.Trigger key={value} value={value}>
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <div className="flex flex-wrap items-center gap-2">
            <TextField
              type="search"
              aria-label="게시글 검색"
              placeholder="제목이나 내용으로 찾기"
              value={query}
              onValueChange={(next) => {
                setQuery(next);
                setPage(1);
              }}
              className="w-full sm:w-auto sm:flex-1"
            >
              <MagnifyingGlassIcon />
              <TextField.Input />
            </TextField>
            <Select
              aria-label="정렬"
              value={sort}
              onValueChange={(next) => {
                if (next !== null && isSort(next)) setSort(next);
                setPage(1);
              }}
              className="w-28"
            >
              <Select.Item value="recent">최신순</Select.Item>
              <Select.Item value="views">조회순</Select.Item>
              <Select.Item value="comments">댓글순</Select.Item>
            </Select>
            <ToggleGroup
              variant="outline"
              aria-label="보기"
              className="ms-auto sm:ms-0"
              value={view}
              onValueChange={(next) => {
                if (next !== null) setView(next);
              }}
            >
              <IconToggle value="list" icon={<ListBulletIcon />} aria-label="목록으로 보기" />
              <IconToggle value="grid" icon={<Squares2X2Icon />} aria-label="카드로 보기" />
            </ToggleGroup>
          </div>

          {CATEGORIES.map(({ value }) => {
            const posts = postsIn(value, query, sort);
            const pageCount = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
            const shown = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

            return (
              <Tabs.Content key={value} value={value} className="flex flex-col gap-4">
                <p aria-live="polite" className="text-body-b3-medium text-(--ids-color-on-muted)">
                  게시글 {posts.length}개
                </p>

                {posts.length === 0 ? (
                  <Empty variant="outline" className="py-12">
                    <Empty.Media>
                      <MagnifyingGlassIcon />
                    </Empty.Media>
                    <Empty.Title>찾는 글이 없어요</Empty.Title>
                    <Empty.Description>다른 낱말로 찾거나 분류를 바꿔 보세요.</Empty.Description>
                    {query !== '' && (
                      <Empty.Actions>
                        <Button variant="outline" onClick={() => setQuery('')}>
                          검색어 지우기
                        </Button>
                      </Empty.Actions>
                    )}
                  </Empty>
                ) : view === 'list' ? (
                  <Item.Group variant="bordered" aria-label="게시글">
                    {shown.map((post) => (
                      <Item key={post.id} asChild>
                        <a href={`#${post.id}`}>
                          <Item.Content className="gap-1.5">
                            <span className={labels}>
                              {post.pinned && <Badge content="고정" colorScheme="primary" />}
                              <Badge
                                content={CATEGORY_LABEL[post.category]}
                                variant="soft"
                                colorScheme="neutral"
                              />
                              {post.postedOn >= POSTED_WITHIN_A_DAY_FROM && (
                                <Badge content="새 글" variant="outline" colorScheme="primary" />
                              )}
                            </span>
                            <Item.Title>{post.title}</Item.Title>
                            <Item.Description className="line-clamp-2">
                              {post.excerpt}
                            </Item.Description>
                            <span className={postMeta}>
                              <span>{post.author}</span>
                              <span>{dayOf(post.postedOn)}</span>
                              <span className={stat}>
                                <ChatBubbleOvalLeftIcon aria-hidden className="size-4" />
                                <span className="sr-only">댓글</span>
                                {post.comments}
                              </span>
                              <span className={stat}>
                                <EyeIcon aria-hidden className="size-4" />
                                <span className="sr-only">조회</span>
                                {count.format(post.views)}
                              </span>
                            </span>
                          </Item.Content>
                          {post.cover && (
                            <Image
                              src={post.cover}
                              alt=""
                              ratio={4 / 3}
                              className="rounded-standard w-24 shrink-0 self-center sm:w-32"
                            />
                          )}
                        </a>
                      </Item>
                    ))}
                  </Item.Group>
                ) : (
                  <ul aria-label="게시글" className="grid gap-4 sm:grid-cols-2">
                    {shown.map((post) => (
                      <li key={post.id} className="flex">
                        <Card asChild interactive className="w-full">
                          <a href={`#${post.id}`}>
                            <Card.Media>
                              <Image src={post.cover} alt="" ratio={16 / 9}>
                                <Image.Fallback>{CATEGORY_ICON[post.category]}</Image.Fallback>
                              </Image>
                            </Card.Media>
                            <Card.Header>
                              <span className={labels}>
                                {post.pinned && <Badge content="고정" colorScheme="primary" />}
                                <Badge
                                  content={CATEGORY_LABEL[post.category]}
                                  variant="soft"
                                  colorScheme="neutral"
                                />
                                {post.postedOn >= POSTED_WITHIN_A_DAY_FROM && (
                                  <Badge content="새 글" variant="outline" colorScheme="primary" />
                                )}
                              </span>
                              <Card.Title>{post.title}</Card.Title>
                              <Card.Description className="line-clamp-2">
                                {post.excerpt}
                              </Card.Description>
                            </Card.Header>
                            <Card.Footer className={postMeta}>
                              <span>{post.author}</span>
                              <span>{dayOf(post.postedOn)}</span>
                              <span className={stat}>
                                <ChatBubbleOvalLeftIcon aria-hidden className="size-4" />
                                <span className="sr-only">댓글</span>
                                {post.comments}
                              </span>
                              <span className={stat}>
                                <EyeIcon aria-hidden className="size-4" />
                                <span className="sr-only">조회</span>
                                {count.format(post.views)}
                              </span>
                            </Card.Footer>
                          </a>
                        </Card>
                      </li>
                    ))}
                  </ul>
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
            );
          })}
        </Tabs>
      </main>
    );
  },
};
