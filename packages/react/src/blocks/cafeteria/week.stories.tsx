import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { IconButton } from '../../components/action/icon-button';
import { Badge } from '../../components/data/badge';
import { Table } from '../../components/data/table';
import { Alert } from '../../components/feedback/alert';
import { Tabs } from '../../components/navigation/tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Cafeteria/Week',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const TODAY = '10월 1일';

const WEEK = [
  {
    day: '9월 29일',
    weekday: '월',
    breakfast: '북엇국',
    lunch: '돈가스와 우동',
    dinner: '김치볶음밥',
  },
  {
    day: '9월 30일',
    weekday: '화',
    breakfast: '미역국',
    lunch: '닭볶음탕',
    dinner: '짜장면과 탕수육',
  },
  { day: '10월 1일', weekday: '수', breakfast: '북엇국', lunch: '제육볶음', dinner: '닭갈비 덮밥' },
  { day: '10월 2일', weekday: '목', breakfast: '콩나물국', lunch: '카레라이스', dinner: '비빔밥' },
  { day: '10월 3일', weekday: '금', breakfast: null, lunch: null, dinner: null },
];

export const PC: Story = {
  render: () => (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
      <div className="flex items-center gap-2">
        <div className="me-auto flex flex-col gap-2">
          <h1 className="text-headline-h3-bold">이번 주 학식</h1>
          <p className="text-body-b2-regular">9월 29일부터 10월 3일까지</p>
        </div>
        <IconButton variant="outline" aria-label="지난주" icon={<ChevronLeftIcon />} />
        <IconButton variant="outline" aria-label="다음 주" icon={<ChevronRightIcon />} />
      </div>

      <Alert colorScheme="warning">
        <Alert.Description>
          10월 3일 개천절에는 학생식당이 쉬어요. 기숙사식당은 열어요.
        </Alert.Description>
      </Alert>

      <Tabs defaultValue="student" className="flex flex-col gap-6">
        <Tabs.List aria-label="식당">
          <Tabs.Trigger value="student">학생식당</Tabs.Trigger>
          <Tabs.Trigger value="dorm">기숙사식당</Tabs.Trigger>
        </Tabs.List>
        {['student', 'dorm'].map((restaurant) => (
          <Tabs.Content key={restaurant} value={restaurant}>
            <Table
              aria-label={`${restaurant === 'student' ? '학생식당' : '기숙사식당'} 이번 주 메뉴`}
            >
              <Table.Header>
                <Table.Row>
                  <Table.Head>날짜</Table.Head>
                  <Table.Head>아침</Table.Head>
                  <Table.Head>점심</Table.Head>
                  <Table.Head>저녁</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {WEEK.map((row) => {
                  const closed = restaurant === 'student' && row.lunch === null;
                  const menu =
                    restaurant === 'dorm' && row.lunch === null
                      ? { breakfast: '토스트', lunch: '김치찌개', dinner: '소불고기' }
                      : row;

                  return (
                    <Table.Row key={row.day} selected={row.day === TODAY}>
                      <Table.Cell>
                        {row.day} ({row.weekday}){' '}
                        {row.day === TODAY && (
                          <Badge content="오늘" variant="soft" colorScheme="primary" />
                        )}
                      </Table.Cell>
                      {closed ? (
                        <Table.Cell colSpan={3}>
                          <Badge content="쉬는 날" variant="outline" colorScheme="neutral" />
                        </Table.Cell>
                      ) : (
                        <>
                          <Table.Cell>{menu.breakfast}</Table.Cell>
                          <Table.Cell>{menu.lunch}</Table.Cell>
                          <Table.Cell>{menu.dinner}</Table.Cell>
                        </>
                      )}
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Tabs.Content>
        ))}
      </Tabs>
    </main>
  ),
};
