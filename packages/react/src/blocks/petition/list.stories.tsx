import { PencilSquareIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Progress } from '../../components/feedback/progress';
import { Tabs } from '../../components/navigation/tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Petition/List',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type State = 'open' | 'review' | 'answered';

const STATES: { value: State; label: string }[] = [
  { value: 'open', label: '동의 모으는 중' },
  { value: 'review', label: '검토 중' },
  { value: 'answered', label: '답변 완료' },
];

const GOAL = 500;

const PETITIONS: {
  id: string;
  state: State;
  topic: string;
  title: string;
  signed: number;
  left: string;
}[] = [
  {
    id: 'p1',
    state: 'open',
    topic: '교통',
    title: '평일 셔틀 막차를 밤 11시 30분으로 늦춰 주세요',
    signed: 412,
    left: '20일 남음',
  },
  {
    id: 'p2',
    state: 'open',
    topic: '식당',
    title: '학생식당 주말 저녁도 열어 주세요',
    signed: 386,
    left: '12일 남음',
  },
  {
    id: 'p3',
    state: 'open',
    topic: '시설',
    title: '기숙사 세탁기를 앱으로 예약하게 해 주세요',
    signed: 97,
    left: '27일 남음',
  },
  {
    id: 'p4',
    state: 'review',
    topic: '학사',
    title: '중간고사 기간 과제 마감을 한 주 미뤄 주세요',
    signed: 612,
    left: '답변 기한 10월 20일',
  },
  {
    id: 'p5',
    state: 'answered',
    topic: '시설',
    title: '도서관 열람실 24시간 개방',
    signed: 1204,
    left: '9월 12일 답변',
  },
];

const count = new Intl.NumberFormat('ko-KR');

export const PC: Story = {
  render: () => (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-h3-bold">학생 청원</h1>
          <p className="text-body-b2-regular">
            {count.format(GOAL)}명이 동의하면 총학생회가 한 달 안에 답해요.
          </p>
        </div>
        <Button asChild>
          <a href="#new-petition">
            <PencilSquareIcon />
            청원하기
          </a>
        </Button>
      </div>

      <Tabs defaultValue="open" className="flex flex-col gap-6">
        <Tabs.List aria-label="청원 상태">
          {STATES.map((state) => (
            <Tabs.Trigger key={state.value} value={state.value}>
              {state.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {STATES.map((state) => {
          const shown = PETITIONS.filter((petition) => petition.state === state.value);

          return (
            <Tabs.Content key={state.value} value={state.value}>
              {shown.length === 0 ? (
                <Empty variant="outline">
                  <Empty.Title>이 상태의 청원이 없어요</Empty.Title>
                </Empty>
              ) : (
                <ul className="flex flex-col gap-3">
                  {shown.map((petition) => (
                    <li key={petition.id}>
                      <Card asChild interactive>
                        <a href={`#${petition.id}`}>
                          <Card.Header>
                            <Card.Description>
                              {petition.topic} · {petition.left}
                            </Card.Description>
                            <Card.Title>{petition.title}</Card.Title>
                            <Card.Action>
                              <Badge
                                content={`${count.format(petition.signed)}명`}
                                variant="soft"
                                colorScheme={petition.signed >= GOAL ? 'success' : 'primary'}
                              />
                            </Card.Action>
                          </Card.Header>
                          {petition.state === 'open' && (
                            <Card.Content>
                              <Progress
                                value={(petition.signed / GOAL) * 100}
                                aria-label={`${petition.title} 목표까지`}
                              />
                            </Card.Content>
                          )}
                        </a>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </Tabs.Content>
          );
        })}
      </Tabs>
    </main>
  ),
};
