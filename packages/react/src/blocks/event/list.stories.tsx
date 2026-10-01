import { useState } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { IconButton } from '../../components/action/icon-button';
import { Toggle } from '../../components/action/toggle';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Event/List',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Kind = 'festival' | 'academic' | 'club' | 'career';

const KIND_LABEL: Record<Kind, string> = {
  festival: '축제',
  academic: '학술',
  club: '동아리',
  career: '진로',
};

const EVENTS: {
  id: string;
  day: number;
  weekday: string;
  kind: Kind;
  title: string;
  time: string;
  place: string;
  full?: boolean;
}[] = [
  {
    id: 'e1',
    day: 3,
    weekday: '금',
    kind: 'club',
    title: '사진부 가을 출사',
    time: '오전 9:00',
    place: '무등산 입구',
  },
  {
    id: 'e2',
    day: 8,
    weekday: '수',
    kind: 'career',
    title: '반도체 기업 채용 설명회',
    time: '오후 4:00',
    place: '오룡관 대강당',
  },
  {
    id: 'e3',
    day: 10,
    weekday: '금',
    kind: 'academic',
    title: 'AI 대학원 콜로키움',
    time: '오후 3:00',
    place: '대학 C동 102호',
    full: true,
  },
  {
    id: 'e4',
    day: 16,
    weekday: '목',
    kind: 'festival',
    title: '2026 GIST 가을 축제',
    time: '오후 1:00',
    place: '학생회관 앞 광장',
  },
  {
    id: 'e5',
    day: 17,
    weekday: '금',
    kind: 'festival',
    title: '축제 폐막 불꽃놀이',
    time: '오후 8:00',
    place: '운동장',
  },
  {
    id: 'e6',
    day: 23,
    weekday: '목',
    kind: 'club',
    title: '보드게임 동아리 번개',
    time: '오후 7:00',
    place: '학생회관 2층',
  },
];

export const PC: Story = {
  render: function Render() {
    const [kind, setKind] = useState<Kind | null>(null);
    const [going, setGoing] = useState<string[]>(['e4']);

    const shown = EVENTS.filter((event) => kind === null || event.kind === kind);

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex items-center gap-2">
          <h1 className="text-headline-h3-bold me-auto">10월 행사</h1>
          <IconButton variant="outline" aria-label="9월" icon={<ChevronLeftIcon />} />
          <IconButton variant="outline" aria-label="11월" icon={<ChevronRightIcon />} />
        </div>

        <div role="group" aria-label="분류" className="flex flex-wrap gap-2">
          <Chip selected={kind === null} onSelectedChange={() => setKind(null)}>
            전체
          </Chip>
          {(Object.keys(KIND_LABEL) as Kind[]).map((value) => (
            <Chip key={value} selected={kind === value} onSelectedChange={() => setKind(value)}>
              {KIND_LABEL[value]}
            </Chip>
          ))}
        </div>

        {shown.length === 0 ? (
          <Empty variant="outline">
            <Empty.Title>이 분류의 행사가 없어요</Empty.Title>
          </Empty>
        ) : (
          <Card size="tiny">
            <Item.Group variant="bordered" aria-label="10월 행사">
              {shown.map((event) => (
                <Item key={event.id}>
                  <Item.Media variant="outline" aria-hidden>
                    {event.day}
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>
                      {event.title}
                      {event.full && <Badge content="마감" variant="soft" colorScheme="neutral" />}
                    </Item.Title>
                    <Item.Description>
                      10월 {event.day}일 ({event.weekday}) {event.time} · {event.place}
                    </Item.Description>
                  </Item.Content>
                  <Item.Actions>
                    <Toggle
                      variant="outline"
                      size="tiny"
                      disabled={event.full}
                      pressed={going.includes(event.id)}
                      onPressedChange={(pressed) =>
                        setGoing(
                          pressed ? [...going, event.id] : going.filter((id) => id !== event.id),
                        )
                      }
                      aria-label={`${event.title} 참석`}
                    >
                      {going.includes(event.id) ? '가요' : '참석'}
                    </Toggle>
                  </Item.Actions>
                </Item>
              ))}
            </Item.Group>
          </Card>
        )}
      </main>
    );
  },
};
