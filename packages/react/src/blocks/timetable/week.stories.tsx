import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Item } from '../../components/data/item';
import { ItemGroup } from '../../components/data/item-group';
import { Table } from '../../components/data/table';
import { IdsProvider, defineIdsTheme } from '../../components/utility/ids-provider';

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

const COURSE_THEMES = {
  blue: defineIdsTheme({
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bedbff',
      300: '#8ec5ff',
      400: '#51a2ff',
      500: '#2b7fff',
      600: '#155dfc',
      700: '#1447e6',
      800: '#193cb8',
      900: '#1c398e',
      950: '#162456',
    },
  }),
  violet: defineIdsTheme({
    primary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6ff',
      300: '#c4b4ff',
      400: '#a684ff',
      500: '#8e51ff',
      600: '#7f22fe',
      700: '#7008e7',
      800: '#5d0ec0',
      900: '#4d179a',
      950: '#2f0d68',
    },
  }),
  teal: defineIdsTheme({
    primary: {
      50: '#f0fdfa',
      100: '#cbfbf1',
      200: '#96f7e4',
      300: '#46ecd5',
      400: '#00d5be',
      500: '#00bba7',
      600: '#009689',
      700: '#00786f',
      800: '#005f5a',
      900: '#0b4f4a',
      950: '#022f2e',
    },
  }),
  orange: defineIdsTheme({
    primary: {
      50: '#fff6f2',
      100: '#ffe8de',
      200: '#ffc8b4',
      300: '#ffa082',
      400: '#ff7650',
      500: '#ff5722',
      600: '#ff4500',
      700: '#d63a00',
      800: '#a32d00',
      900: '#7a2200',
      950: '#451300',
    },
  }),
  pink: defineIdsTheme({
    primary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fccee8',
      300: '#fda5d5',
      400: '#fb64b6',
      500: '#f6339a',
      600: '#e60076',
      700: '#c6005c',
      800: '#a3004c',
      900: '#861043',
      950: '#510424',
    },
  }),
  lime: defineIdsTheme({
    primary: {
      50: '#f7fee7',
      100: '#ecfcca',
      200: '#d8f999',
      300: '#bbf451',
      400: '#9ae600',
      500: '#7ccf00',
      600: '#5ea500',
      700: '#497d00',
      800: '#3c6300',
      900: '#35530e',
      950: '#192e03',
    },
  }),
};

const COURSES: {
  id: string;
  name: string;
  room: string;
  professor: string;
  credits: number;
  color: keyof typeof COURSE_THEMES;
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
                          <IdsProvider.Scope theme={COURSE_THEMES[course.color]} asChild>
                            <Chip variant="soft" colorScheme="primary">
                              {course.name}
                            </Chip>
                          </IdsProvider.Scope>
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
          <ItemGroup size="tiny" aria-label="듣는 과목">
            {COURSES.map((course) => (
              <Item key={course.id}>
                <Item.Content>
                  <Item.Title>
                    <IdsProvider.Scope theme={COURSE_THEMES[course.color]} asChild>
                      <Chip variant="solid" colorScheme="primary" aria-hidden />
                    </IdsProvider.Scope>
                    {course.name}
                  </Item.Title>
                  <Item.Description>
                    {course.professor} · {course.room}
                  </Item.Description>
                </Item.Content>
                <Item.Actions>
                  <Chip variant="outline">{`${course.credits}학점`}</Chip>
                </Item.Actions>
              </Item>
            ))}
          </ItemGroup>
        </Card>
      </div>
    </main>
  ),
};
