import { useState, type FormEvent, type ReactNode } from 'react';

import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { TextField } from '../../components/form/text-field';
import { Tabs } from '../../components/navigation/tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Search/Results',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Kind = 'posts' | 'places' | 'people';

type Result = {
  id: string;
  kind: Kind;
  title: string;
  description: string;
  icon?: ReactNode;
  person?: string;
};

const RESULTS: Result[] = [
  {
    id: 'shuttle-timetable',
    kind: 'posts',
    title: '2학기 셔틀 시간표',
    description: '셔틀 · 평일과 주말, 광주송정역과 교내 순환 시간표예요.',
    icon: <TruckIcon />,
  },
  {
    id: 'shuttle-holiday',
    kind: 'posts',
    title: '개천절 셔틀은 주말 시간표로 다녀요',
    description: '공지 · 10월 3일에는 광주송정역 노선이 두 시간마다 다녀요.',
    icon: <DocumentTextIcon />,
  },
  {
    id: 'shuttle-late',
    kind: 'posts',
    title: '평일 셔틀 막차를 밤 11시 30분으로 늦춰 주세요',
    description: '청원 · 412명이 동의했어요. 500명이 넘으면 총학생회가 답해요.',
    icon: <DocumentTextIcon />,
  },
  {
    id: 'stop-student-union',
    kind: 'places',
    title: '학생회관 정류장',
    description: '모든 셔틀이 서요. 다음 셔틀은 12:20 광주송정역행이에요.',
    icon: <MapPinIcon />,
  },
  {
    id: 'stop-dorm',
    kind: 'places',
    title: '기숙사 A동 정류장',
    description: '광주송정역행과 교내 순환이 서요.',
    icon: <MapPinIcon />,
  },
  {
    id: 'hajun',
    kind: 'people',
    title: '최하준',
    description: '인포팀 인프라 · 셔틀 알림 서버를 만들어요.',
    person: '최하준',
  },
];

const KINDS: { value: 'all' | Kind; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'posts', label: '글' },
  { value: 'places', label: '장소' },
  { value: 'people', label: '사람' },
];

const SUGGESTIONS = ['셔틀 막차', '광주송정역', '주말 셔틀', '셔틀 알림'];

export const PC: Story = {
  render: function Render() {
    const [draft, setDraft] = useState('셔틀');
    const [query, setQuery] = useState('셔틀');

    const found = RESULTS.filter(
      (result) =>
        query !== '' && (result.title.includes(query) || result.description.includes(query)),
    );

    const search = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setQuery(draft.trim());
    };

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <form role="search" onSubmit={search} className="flex gap-2">
          <TextField
            type="search"
            aria-label="인포팀에서 찾기"
            placeholder="인포팀에서 찾기"
            value={draft}
            onValueChange={setDraft}
            className="flex-1"
          >
            <MagnifyingGlassIcon />
            <TextField.Input />
            <TextField.Clear />
          </TextField>
          <Button type="submit">찾기</Button>
        </form>

        <p className="text-body-b2-regular" aria-live="polite">
          {query === '' ? '찾을 낱말을 적어 주세요.' : `‘${query}’ 검색 결과 ${found.length}개`}
        </p>

        <Tabs defaultValue="all" className="flex flex-col gap-6">
          <Tabs.List aria-label="결과 종류">
            {KINDS.map((kind) => (
              <Tabs.Trigger key={kind.value} value={kind.value}>
                {kind.label}{' '}
                {kind.value === 'all'
                  ? found.length
                  : found.filter((result) => result.kind === kind.value).length}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {KINDS.map((kind) => {
            const ofKind = found.filter(
              (result) => kind.value === 'all' || result.kind === kind.value,
            );

            return (
              <Tabs.Content key={kind.value} value={kind.value} className="flex flex-col gap-6">
                {ofKind.length === 0 ? (
                  <Empty variant="outline">
                    <Empty.Media>
                      <MagnifyingGlassIcon />
                    </Empty.Media>
                    <Empty.Title>찾는 결과가 없어요</Empty.Title>
                    <Empty.Description>
                      낱말을 줄이거나 아래 추천 검색어로 찾아 보세요.
                    </Empty.Description>
                  </Empty>
                ) : (
                  <Card size="tiny">
                    <Item.Group variant="bordered" aria-label={`${kind.label} 결과`}>
                      {ofKind.map((result) => (
                        <Item key={result.id} asChild>
                          <a href={`#${result.id}`}>
                            <Item.Media variant="soft">
                              {result.icon ?? <Avatar name={result.person} size="tiny" />}
                            </Item.Media>
                            <Item.Content>
                              <Item.Title>{result.title}</Item.Title>
                              <Item.Description>{result.description}</Item.Description>
                            </Item.Content>
                          </a>
                        </Item>
                      ))}
                    </Item.Group>
                  </Card>
                )}
              </Tabs.Content>
            );
          })}
        </Tabs>

        <section aria-labelledby="suggestions" className="flex flex-col gap-3">
          <h2 id="suggestions" className="text-body-b3-semibold">
            이런 검색어는 어때요?
          </h2>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <Chip
                key={suggestion}
                onClick={() => {
                  setDraft(suggestion);
                  setQuery(suggestion);
                }}
              >
                {suggestion}
              </Chip>
            ))}
          </div>
        </section>
      </main>
    );
  },
};
