import { Fragment, useState } from 'react';

import {
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { CheckboxGroup } from '../../components/form/checkbox-group';
import { RadioGroup } from '../../components/form/radio-group';
import { Select } from '../../components/form/select';
import { TextField } from '../../components/form/text-field';
import { Drawer } from '../../components/overlay/drawer';
import { Label } from '../../components/typography/label';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Search',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Kind = 'post' | 'person' | 'file';

const KINDS: { value: Kind; label: string }[] = [
  { value: 'post', label: '게시글' },
  { value: 'person', label: '사람' },
  { value: 'file', label: '파일' },
];

const PERIODS = [
  { value: 'all', label: '전체 기간' },
  { value: 'week', label: '일주일' },
  { value: 'month', label: '한 달' },
];

const POSTS = [
  {
    id: 'p1',
    title: 'IDS 로 예제 페이지 만든 후기',
    excerpt: '컴포넌트만 있으면 화면이 금방 나올 줄 알았는데, IDS 의 조합 규칙이 더 중요했어요.',
    board: '개발',
    daysAgo: 1,
  },
  {
    id: 'p2',
    title: '인포팀 디자인 시스템 IDS 0.2 출시',
    excerpt: '17가지 테마 색과 새 컴포넌트 20개가 들어간 IDS 0.2 를 소개합니다.',
    board: '공지',
    daysAgo: 6,
  },
  {
    id: 'p3',
    title: '동아리 홈페이지를 IDS 로 옮겼어요',
    excerpt: '사진부 홈페이지를 한 주말 만에 IDS 로 다시 짰습니다.',
    board: '자유',
    daysAgo: 20,
  },
];

const PEOPLE = [
  { id: 'u1', name: '김지수', detail: 'IDS 프론트엔드 리드' },
  { id: 'u2', name: '정예린', detail: 'IDS 디자이너' },
];

const FILES = [{ id: 'f1', name: 'IDS 발표 자료.pdf', detail: '인포팀 자료실, 3.4MB' }];

const RECENT = ['셔틀 시간표', '근로 장학', 'IDS'];

function highlight(text: string, query: string) {
  const word = query.trim();
  if (word === '') return text;

  return text.split(word).map((part, index, parts) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 && (
        <mark className="rounded-indicator bg-(--ids-color-secondary) px-0.5 text-(--ids-color-on-secondary)">
          {word}
        </mark>
      )}
    </Fragment>
  ));
}

const heading = cn('text-body-b2-semibold');

const option = cn('inline-flex items-center gap-2 text-body-b3-medium');

export const Default: Story = {
  render: function Render() {
    const [query, setQuery] = useState('IDS');
    const [kinds, setKinds] = useState<Kind[]>(['post', 'person', 'file']);
    const [period, setPeriod] = useState('all');
    const [sort, setSort] = useState('relevance');
    const [recent, setRecent] = useState(RECENT);

    const word = query.trim();
    const matches = (text: string) => word !== '' && text.includes(word);
    const days = period === 'week' ? 7 : period === 'month' ? 31 : Infinity;

    const posts = kinds.includes('post')
      ? POSTS.filter(
          (post) => (matches(post.title) || matches(post.excerpt)) && post.daysAgo <= days,
        ).sort((a, b) => (sort === 'recent' ? a.daysAgo - b.daysAgo : 0))
      : [];
    const people = kinds.includes('person')
      ? PEOPLE.filter((person) => matches(person.detail) || matches(person.name))
      : [];
    const files = kinds.includes('file') ? FILES.filter((file) => matches(file.name)) : [];
    const total = posts.length + people.length + files.length;

    const filters = (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className={heading}>종류</p>
          <CheckboxGroup<Kind> aria-label="종류" value={kinds} onValueChange={setKinds}>
            {({ Item: Check }) =>
              KINDS.map(({ value, label }) => (
                <Label key={value} className={option}>
                  <Check value={value} />
                  {label}
                </Label>
              ))
            }
          </CheckboxGroup>
        </div>
        <div className="flex flex-col gap-3">
          <p className={heading}>기간</p>
          <RadioGroup<string> aria-label="기간" value={period} onValueChange={setPeriod}>
            {({ Item: Radio }) =>
              PERIODS.map(({ value, label }) => (
                <Label key={value} className={option}>
                  <Radio value={value} />
                  {label}
                </Label>
              ))
            }
          </RadioGroup>
        </div>
      </div>
    );

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-10">
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="flex flex-col gap-3"
        >
          <h1 className="sr-only">통합 검색</h1>
          <TextField
            type="search"
            aria-label="인포팀 서비스 전체에서 찾기"
            placeholder="게시글, 사람, 파일 찾기"
            value={query}
            onValueChange={setQuery}
            className="text-body-b1-regular"
          >
            <MagnifyingGlassIcon />
            <TextField.Input />
          </TextField>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption-c1-medium text-(--ids-color-on-muted)">최근 검색어</span>
            {recent.map((term) => (
              <Chip
                key={term}
                size="tiny"
                onClick={() => setQuery(term)}
                onRemove={() => setRecent((current) => current.filter((item) => item !== term))}
              >
                {term}
              </Chip>
            ))}
          </div>
        </form>

        <div className="grid items-start gap-8 lg:grid-cols-[200px_1fr]">
          <aside aria-label="필터" className="hidden lg:block">
            {filters}
          </aside>

          <section aria-label="검색 결과" className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <p aria-live="polite" className="text-body-b2-regular me-auto">
                {word === '' ? '찾을 낱말을 넣어 주세요' : `'${word}' 결과 ${total}개`}
              </p>
              <Drawer side="bottom">
                <Drawer.Trigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <AdjustmentsHorizontalIcon />
                    필터
                  </Button>
                </Drawer.Trigger>
                <Drawer.Content>
                  <Drawer.Header>
                    <Drawer.Title>필터</Drawer.Title>
                  </Drawer.Header>
                  {filters}
                </Drawer.Content>
              </Drawer>
              <Select
                aria-label="정렬"
                value={sort}
                onValueChange={(next) => setSort(next ?? 'relevance')}
                className="w-32"
              >
                <Select.Item value="relevance">관련도순</Select.Item>
                <Select.Item value="recent">최신순</Select.Item>
              </Select>
            </div>

            {total === 0 ? (
              <Empty variant="outline" className="py-12">
                <Empty.Media>
                  <MagnifyingGlassIcon />
                </Empty.Media>
                <Empty.Title>찾는 결과가 없어요</Empty.Title>
                <Empty.Description>낱말을 줄이거나 필터를 넓혀 보세요.</Empty.Description>
              </Empty>
            ) : (
              <>
                {posts.length > 0 && (
                  <section aria-labelledby="result-posts" className="flex flex-col gap-3">
                    <h2 id="result-posts" className={heading}>
                      게시글 {posts.length}
                    </h2>
                    <Item.Group variant="separated" aria-label="게시글 결과">
                      {posts.map((post) => (
                        <Item key={post.id} asChild>
                          <a href={`#${post.id}`}>
                            <Item.Content className="gap-1">
                              <Badge
                                content={post.board}
                                variant="soft"
                                colorScheme="neutral"
                                className="self-start"
                              />
                              <Item.Title>{highlight(post.title, word)}</Item.Title>
                              <Item.Description>{highlight(post.excerpt, word)}</Item.Description>
                            </Item.Content>
                          </a>
                        </Item>
                      ))}
                    </Item.Group>
                  </section>
                )}

                {people.length > 0 && (
                  <section aria-labelledby="result-people" className="flex flex-col gap-3">
                    <h2 id="result-people" className={heading}>
                      사람 {people.length}
                    </h2>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {people.map((person) => (
                        <li key={person.id}>
                          <Card asChild interactive size="tiny">
                            <a href={`#${person.id}`} className="flex-row items-center gap-3">
                              <Avatar name={person.name} />
                              <span className="flex flex-col">
                                <span className="text-body-b2-semibold">
                                  {highlight(person.name, word)}
                                </span>
                                <span className="text-body-b3-regular text-(--ids-color-on-muted)">
                                  {highlight(person.detail, word)}
                                </span>
                              </span>
                            </a>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {files.length > 0 && (
                  <section aria-labelledby="result-files" className="flex flex-col gap-3">
                    <h2 id="result-files" className={heading}>
                      파일 {files.length}
                    </h2>
                    <Item.Group variant="separated" size="tiny" aria-label="파일 결과">
                      {files.map((file) => (
                        <Item key={file.id} asChild>
                          <a href={`#${file.id}`}>
                            <Item.Media variant="soft">
                              <DocumentTextIcon />
                            </Item.Media>
                            <Item.Content>
                              <Item.Title>{highlight(file.name, word)}</Item.Title>
                              <Item.Description>{file.detail}</Item.Description>
                            </Item.Content>
                          </a>
                        </Item>
                      ))}
                    </Item.Group>
                  </section>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    );
  },
};
