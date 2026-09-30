import { useMemo, useState } from 'react';

import { MagnifyingGlassIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Badge } from '../../components/data/badge';
import { DataTable } from '../../components/data/data-table';
import { TextField } from '../../components/form/text-field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/PostList/Table',
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

const column = DataTable.createColumnHelper<Post>();

const COLUMNS = column.columns([
  column.accessor('category', {
    header: '분류',
    cell: ({ getValue }) => (
      <Badge content={CATEGORY_LABEL[getValue()]} variant="soft" colorScheme="neutral" />
    ),
    size: 88,
  }),
  column.accessor('title', {
    header: '제목',
    enableSorting: false,
    cell: ({ row, getValue }) => (
      <a href={`#${row.original.id}`}>
        {row.original.pinned && (
          <>
            <Badge content="고정" variant="soft" colorScheme="primary" />{' '}
          </>
        )}
        {getValue()}
      </a>
    ),
    size: 360,
  }),
  column.accessor('author', { header: '글쓴이', size: 140 }),
  column.accessor('postedOn', {
    header: '날짜',
    cell: ({ getValue }) => dayOf(getValue()),
    size: 104,
  }),
  column.accessor('comments', { header: '댓글', meta: { align: 'end' }, size: 80 }),
  column.accessor('views', {
    header: '조회',
    cell: ({ getValue }) => COUNT.format(getValue()),
    meta: { align: 'end' },
    size: 88,
  }),
]);

export const PC: Story = {
  render: function Render() {
    const [query, setQuery] = useState('');

    const rows = useMemo(
      () =>
        POSTS.filter(
          (post) => query === '' || post.title.includes(query) || post.author.includes(query),
        ),
      [query],
    );

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-h3-bold">공지사항</h1>
            <p className="text-body-b2-regular">
              글 {COUNT.format(POSTS.length)}개 · 머리글을 누르면 정렬돼요.
            </p>
          </div>
          <Button asChild>
            <a href="#write">
              <PencilSquareIcon />
              글쓰기
            </a>
          </Button>
        </div>

        <TextField
          type="search"
          aria-label="제목이나 글쓴이로 찾기"
          placeholder="제목이나 글쓴이로 찾기"
          value={query}
          onValueChange={setQuery}
        >
          <MagnifyingGlassIcon />
          <TextField.Input />
          <TextField.Clear />
        </TextField>

        <DataTable
          columns={COLUMNS}
          data={rows}
          getRowId={(post) => post.id}
          defaultSorting={[{ id: 'postedOn', desc: true }]}
          enablePagination
          defaultPagination={{ pageIndex: 0, pageSize: 8 }}
          highlightOnHover
          aria-label="공지사항"
          empty={`‘${query}’에 맞는 글이 없어요.`}
        />
      </main>
    );
  },
};
