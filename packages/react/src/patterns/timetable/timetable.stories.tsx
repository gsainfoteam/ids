import { useState } from 'react';

import { MapPinIcon, PlusIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { Select } from '../../components/form/select';
import { IdsProvider } from '../../components/utility/ids-provider';
import { cn } from '../../utils';

import type { IdsColor } from '../../tokens/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/PC/Timetable',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const DAYS = ['월', '화', '수', '목', '금'];

const FIRST_HOUR = 9;

const LAST_HOUR = 18;

const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, index) => FIRST_HOUR + index);

type Course = {
  id: string;
  name: string;
  professor: string;
  room: string;
  credits: number;
  color: IdsColor;
  slots: { day: number; start: string; end: string }[];
};

const COURSES: Course[] = [
  {
    id: 'ds',
    name: '자료구조',
    professor: '김교수',
    room: 'C207',
    credits: 3,
    color: 'blue',
    slots: [
      { day: 0, start: '09:00', end: '10:30' },
      { day: 2, start: '09:00', end: '10:30' },
    ],
  },
  {
    id: 'la',
    name: '선형대수',
    professor: '이교수',
    room: 'B104',
    credits: 3,
    color: 'violet',
    slots: [
      { day: 1, start: '10:30', end: '12:00' },
      { day: 3, start: '10:30', end: '12:00' },
    ],
  },
  {
    id: 'os',
    name: '운영체제',
    professor: '박교수',
    room: 'C207',
    credits: 3,
    color: 'emerald',
    slots: [
      { day: 0, start: '13:00', end: '14:30' },
      { day: 2, start: '13:00', end: '14:30' },
    ],
  },
  {
    id: 'ca',
    name: '컴퓨터구조',
    professor: '최교수',
    room: 'A112',
    credits: 3,
    color: 'amber',
    slots: [
      { day: 1, start: '13:00', end: '14:30' },
      { day: 3, start: '13:00', end: '14:30' },
    ],
  },
  {
    id: 'writing',
    name: '글쓰기',
    professor: '정교수',
    room: '인문관 201',
    credits: 3,
    color: 'rose',
    slots: [{ day: 4, start: '10:00', end: '12:00' }],
  },
  {
    id: 'lab',
    name: '일반물리실험',
    professor: '한교수',
    room: '실험동 3층',
    credits: 1,
    color: 'cyan',
    slots: [{ day: 3, start: '15:00', end: '18:00' }],
  },
  {
    id: 'pe',
    name: '체육',
    professor: '윤교수',
    room: '체육관',
    credits: 1,
    color: 'lime',
    slots: [{ day: 4, start: '14:00', end: '15:30' }],
  },
];

const TODAY = 3;

function halfHoursFromTop(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return (hour - FIRST_HOUR) * 2 + (minute >= 30 ? 1 : 0);
}

const block = cn(
  'flex flex-col gap-0.5 overflow-hidden rounded-standard border-s-4 border-(--ids-color-primary) bg-(--ids-color-secondary) px-2 py-1.5 text-(--ids-color-on-secondary)',
);

export const Default: Story = {
  render: function Render() {
    const [day, setDay] = useState(String(TODAY));
    const [semester, setSemester] = useState('2026-2');

    const credits = COURSES.reduce((total, course) => total + course.credits, 0);
    const ofDay = COURSES.flatMap((course) =>
      course.slots.filter((slot) => slot.day === Number(day)).map((slot) => ({ course, slot })),
    ).sort((a, b) => a.slot.start.localeCompare(b.slot.start));

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-h3-bold">시간표</h1>
            <p className="text-body-b2-regular text-(--ids-color-on-muted)">
              {COURSES.length}과목, {credits}학점
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              aria-label="학기"
              value={semester}
              onValueChange={(next) => setSemester(next ?? '2026-2')}
              className="w-36"
            >
              <Select.Item value="2026-1">2026년 1학기</Select.Item>
              <Select.Item value="2026-2">2026년 2학기</Select.Item>
            </Select>
            <Button>
              <PlusIcon />
              과목 더하기
            </Button>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_280px]">
          <section aria-label="요일별 수업" className="flex flex-col gap-4 sm:hidden">
            <ToggleGroup
              variant="outline"
              aria-label="요일"
              value={day}
              onValueChange={(next) => {
                if (next !== null) setDay(next);
              }}
              className="grid grid-cols-5"
            >
              {DAYS.map((label, index) => (
                <Toggle key={label} value={String(index)} variant="outline">
                  {label}
                </Toggle>
              ))}
            </ToggleGroup>
            {ofDay.length === 0 ? (
              <Empty variant="soft" size="tiny">
                <Empty.Title>수업이 없는 날이에요</Empty.Title>
              </Empty>
            ) : (
              <ul className="flex flex-col gap-2">
                {ofDay.map(({ course, slot }) => (
                  <li key={`${course.id}-${slot.start}`}>
                    <IdsProvider color={course.color} className={block}>
                      <span className="text-body-b2-semibold">{course.name}</span>
                      <span className="text-body-b3-regular">
                        {slot.start}부터 {slot.end}까지, {course.room}
                      </span>
                    </IdsProvider>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-label="주간 시간표"
            className="rounded-container hidden overflow-hidden border border-(--ids-color-border) sm:block"
          >
            <div
              className="grid grid-cols-[3.5rem_repeat(5,minmax(0,1fr))]"
              style={{ gridTemplateRows: `auto repeat(${HOURS.length * 2}, 1.75rem)` }}
            >
              <div className="border-b border-(--ids-color-border)" />
              {DAYS.map((label, index) => (
                <div
                  key={label}
                  className={cn(
                    'text-body-b3-semibold border-s border-b border-(--ids-color-border) py-2 text-center',
                    index === TODAY && 'text-(--ids-color-accent)',
                  )}
                >
                  {label}
                  {index === TODAY && <span className="sr-only">, 오늘</span>}
                </div>
              ))}

              {HOURS.map((hour, index) => (
                <div
                  key={hour}
                  className="text-caption-c1-regular pe-2 pt-1 text-end text-(--ids-color-on-muted)"
                  style={{ gridColumn: 1, gridRow: `${index * 2 + 2} / span 2` }}
                >
                  {hour}시
                </div>
              ))}

              {DAYS.map((label, dayIndex) =>
                HOURS.map((hour, hourIndex) => (
                  <div
                    key={`${label}-${hour}`}
                    aria-hidden
                    className={cn(
                      'border-s border-t border-(--ids-color-border)',
                      dayIndex === TODAY && 'bg-(--ids-color-muted)',
                    )}
                    style={{ gridColumn: dayIndex + 2, gridRow: `${hourIndex * 2 + 2} / span 2` }}
                  />
                )),
              )}

              {COURSES.flatMap((course) =>
                course.slots.map((slot) => {
                  const top = halfHoursFromTop(slot.start);
                  const span = halfHoursFromTop(slot.end) - top;

                  return (
                    <IdsProvider
                      key={`${course.id}-${slot.day}`}
                      color={course.color}
                      className={cn(block, 'm-0.5')}
                      style={{ gridColumn: slot.day + 2, gridRow: `${top + 2} / span ${span}` }}
                    >
                      <span className="text-body-b3-semibold truncate">{course.name}</span>
                      <span className="text-caption-c1-regular truncate">
                        <span className="sr-only">
                          {DAYS[slot.day]}요일 {slot.start}부터 {slot.end}까지,{' '}
                        </span>
                        {course.room}
                      </span>
                    </IdsProvider>
                  );
                }),
              )}
            </div>
          </section>

          <Card>
            <Card.Header>
              <Card.Title>수강 과목</Card.Title>
              <Card.Action>
                <Badge content={`${credits}학점`} variant="soft" colorScheme="primary" />
              </Card.Action>
            </Card.Header>
            <Item.Group variant="bordered" size="tiny" aria-label="수강 과목">
              {COURSES.map((course) => (
                <Item key={course.id}>
                  <Item.Media>
                    <IdsProvider
                      color={course.color}
                      className="mx-auto size-3 rounded-full bg-(--ids-color-primary)"
                    />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{course.name}</Item.Title>
                    <Item.Description className="flex items-center gap-1">
                      {course.professor}
                      <MapPinIcon aria-hidden className="ms-1 size-3.5" />
                      {course.room}
                    </Item.Description>
                  </Item.Content>
                  <Item.Actions className="text-caption-c1-medium tabular-nums">
                    {course.credits}학점
                  </Item.Actions>
                </Item>
              ))}
            </Item.Group>
          </Card>
        </div>
      </main>
    );
  },
};
