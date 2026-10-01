import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Table } from '../../components/data/table';
import { IdsProvider } from '../../components/utility/ids-provider';

import type { IdsColor } from '../../tokens/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Timetable/Week',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const DAYS = ['월', '화', '수', '목', '금'];

const PERIODS = ['09:00', '10:30', '13:00', '14:30', '16:00'];

const COURSES: {
  id: string;
  name: string;
  room: string;
  professor: string;
  credits: number;
  color: IdsColor;
  slots: [day: number, period: number][];
}[] = [
  {
    id: 'algo',
    name: '알고리즘',
    room: 'C 102',
    professor: '강현우',
    credits: 3,
    color: 'blue',
    slots: [
      [0, 0],
      [2, 0],
    ],
  },
  {
    id: 'os',
    name: '운영체제',
    room: 'C 205',
    professor: '윤지아',
    credits: 3,
    color: 'violet',
    slots: [
      [1, 2],
      [3, 2],
    ],
  },
  {
    id: 'prob',
    name: '확률과 통계',
    room: 'B 301',
    professor: '서민재',
    credits: 3,
    color: 'teal',
    slots: [
      [0, 3],
      [2, 3],
    ],
  },
  {
    id: 'hci',
    name: '인간-컴퓨터 상호작용',
    room: 'D 110',
    professor: '문하린',
    credits: 3,
    color: 'orange',
    slots: [
      [1, 1],
      [3, 1],
    ],
  },
  {
    id: 'writing',
    name: '과학 글쓰기',
    room: 'A 204',
    professor: '백승호',
    credits: 2,
    color: 'pink',
    slots: [[4, 1]],
  },
  {
    id: 'lab',
    name: '컴퓨터 실험',
    room: '실습실 2',
    professor: '조은비',
    credits: 1,
    color: 'lime',
    slots: [[4, 3]],
  },
];

const courseAt = (day: number, period: number) =>
  COURSES.find((course) =>
    course.slots.some(([slotDay, slotPeriod]) => slotDay === day && slotPeriod === period),
  );

export const PC: Story = {
  render: () => (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="text-headline-h3-bold">2026학년도 2학기 시간표</h1>
        <p className="text-body-b2-regular">
          {COURSES.length}과목 · {COURSES.reduce((sum, course) => sum + course.credits, 0)}학점
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Table aria-label="주간 시간표" layout="fixed">
          <Table.Header>
            <Table.Row>
              <Table.Head>시간</Table.Head>
              {DAYS.map((day) => (
                <Table.Head key={day}>{day}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {PERIODS.map((start, period) => (
              <Table.Row key={start}>
                <Table.Cell>{start}</Table.Cell>
                {DAYS.map((day, dayIndex) => {
                  const course = courseAt(dayIndex, period);

                  return (
                    <Table.Cell key={day}>
                      {course && (
                        <div className="flex flex-col items-start gap-1">
                          <IdsProvider color={course.color} asChild>
                            <Badge content={course.name} variant="soft" colorScheme="primary" />
                          </IdsProvider>
                          <span className="text-caption-c1-regular">{course.room}</span>
                        </div>
                      )}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <Card size="tiny">
          <Card.Header>
            <Card.Title asChild>
              <h2>듣는 과목</h2>
            </Card.Title>
          </Card.Header>
          <Item.Group variant="bordered" size="tiny" aria-label="듣는 과목">
            {COURSES.map((course) => (
              <Item key={course.id}>
                <Item.Content>
                  <Item.Title>
                    <IdsProvider color={course.color} asChild>
                      <Badge dot colorScheme="primary" aria-hidden />
                    </IdsProvider>
                    {course.name}
                  </Item.Title>
                  <Item.Description>
                    {course.professor} · {course.room}
                  </Item.Description>
                </Item.Content>
                <Item.Actions>
                  <Badge
                    content={`${course.credits}학점`}
                    variant="outline"
                    colorScheme="neutral"
                  />
                </Item.Actions>
              </Item>
            ))}
          </Item.Group>
        </Card>
      </div>
    </main>
  ),
};
