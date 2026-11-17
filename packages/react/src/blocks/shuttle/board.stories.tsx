import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chart } from '../../components/data/chart';
import { Table } from '../../components/data/table';
import { Alert } from '../../components/feedback/alert';
import { Progress } from '../../components/feedback/progress';
import { toast } from '../../components/feedback/toast';
import { Switch } from '../../components/form/switch';
import { Stepper } from '../../components/navigation/stepper';
import { Tabs } from '../../components/navigation/tabs';
import { Label } from '../../components/typography/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Shuttle/Board',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const NOW = '12:14';

const ROUTES = [
  {
    id: 'station',
    name: '광주송정역',
    minutes: 25,
    stops: ['학생회관', '기숙사 A동', '첨단 우체국', '광주송정역'],
    waits: [
      { hour: '8시', wait: 7 },
      { hour: '10시', wait: 12 },
      { hour: '12시', wait: 9 },
      { hour: '15시', wait: 18 },
      { hour: '17시', wait: 14 },
      { hour: '21시', wait: 22 },
    ],
    departures: [
      '08:30',
      '09:30',
      '10:30',
      '11:30',
      '12:20',
      '13:30',
      '15:30',
      '17:30',
      '18:30',
      '21:00',
    ],
  },
  {
    id: 'campus',
    name: '교내 순환',
    minutes: 15,
    stops: ['학생회관', '대학 A동', '도서관', '체육관', '기숙사 B동'],
    waits: [
      { hour: '8시', wait: 5 },
      { hour: '10시', wait: 6 },
      { hour: '12시', wait: 4 },
      { hour: '14시', wait: 8 },
      { hour: '16시', wait: 7 },
      { hour: '18시', wait: 9 },
    ],
    departures: [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '12:30',
      '13:00',
      '14:00',
      '16:00',
      '18:00',
    ],
  },
  {
    id: 'terminal',
    name: '유스퀘어 터미널',
    minutes: 40,
    stops: ['학생회관', '첨단 상무지구', '광주 터미널'],
    waits: [
      { hour: '9시', wait: 15 },
      { hour: '12시', wait: 20 },
      { hour: '15시', wait: 24 },
      { hour: '18시', wait: 31 },
    ],
    departures: ['09:00', '12:40', '15:00', '18:00'],
  },
];

const minutesOf = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

const clockOf = (total: number) =>
  `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

const WAIT_SHOWN_AS_FULL_BAR = 30;

const WAIT_CONFIG = { wait: { label: '평균 대기(분)' } } satisfies Chart.Config;

export const PC: Story = {
  render: () => (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="text-headline-h3-bold">셔틀 시간표</h1>
        <p className="text-body-b2-regular">지금 {NOW} · 평일 시간표</p>
      </div>

      <Alert colorScheme="info">
        <Alert.Title>10월 3일 개천절에는 주말 시간표로 다녀요</Alert.Title>
      </Alert>

      <Tabs defaultValue="station" className="flex flex-col gap-6">
        <Tabs.List aria-label="노선">
          {ROUTES.map((route) => (
            <Tabs.Trigger key={route.id} value={route.id}>
              {route.name}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {ROUTES.map((route) => {
          const next = route.departures.find((departure) => minutesOf(departure) >= minutesOf(NOW));
          const wait = next ? minutesOf(next) - minutesOf(NOW) : null;

          return (
            <Tabs.Content
              key={route.id}
              value={route.id}
              className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"
            >
              <div className="flex flex-col gap-6">
                <Card>
                  <Card.Header>
                    <Card.Description>
                      학생회관에서 타요 · {route.name}까지 {route.minutes}분
                    </Card.Description>
                    <Card.Title className="text-headline-h3-bold" asChild>
                      <h2>
                        {wait === null
                          ? '오늘은 끝났어요'
                          : wait === 0
                            ? '곧 떠나요'
                            : `${wait}분 뒤`}
                      </h2>
                    </Card.Title>
                    {next && (
                      <Card.Action>
                        <Badge content={`${next} 출발`} variant="soft" colorScheme="primary" />
                      </Card.Action>
                    )}
                  </Card.Header>
                  {wait !== null && (
                    <Card.Content>
                      <Progress
                        value={Math.max(0, 100 - (wait / WAIT_SHOWN_AS_FULL_BAR) * 100)}
                        aria-label="다음 셔틀까지 남은 시간"
                      />
                    </Card.Content>
                  )}
                  <Card.Footer className="border-t">
                    <Label>
                      <Switch
                        onCheckedChange={(checked) => {
                          if (checked) toast.success('출발 5분 전에 알려 드릴게요');
                        }}
                      />
                      5분 전에 알려 주기
                    </Label>
                  </Card.Footer>
                </Card>

                <Table aria-label={`${route.name} 오늘 시간표`} highlightOnHover>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>출발</Table.Head>
                      <Table.Head>도착</Table.Head>
                      <Table.Head align="end">상태</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {route.departures.map((departure) => {
                      const gone = minutesOf(departure) < minutesOf(NOW);

                      return (
                        <Table.Row key={departure} selected={departure === next}>
                          <Table.Cell>{departure}</Table.Cell>
                          <Table.Cell>{clockOf(minutesOf(departure) + route.minutes)}</Table.Cell>
                          <Table.Cell align="end">
                            {departure === next ? (
                              <Badge content="다음 차" variant="soft" colorScheme="primary" />
                            ) : gone ? (
                              <Badge content="떠남" variant="outline" />
                            ) : null}
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>

                <Card>
                  <Card.Content>
                    <Chart config={WAIT_CONFIG} ratio={2} legend={false}>
                      <Chart.Title>시간대별 대기 시간</Chart.Title>
                      <Chart.Description>학생회관 정류장 · 지난 4주 평균</Chart.Description>
                      <BarChart data={route.waits}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="hour" name="시간대" tickLine={false} axisLine={false} />
                        <YAxis width={28} tickLine={false} axisLine={false} />
                        <Bar dataKey="wait" radius={4} />
                      </BarChart>
                    </Chart>
                  </Card.Content>
                </Card>
              </div>

              <Card>
                <Card.Header>
                  <Card.Title asChild>
                    <h2>정류장</h2>
                  </Card.Title>
                  <Card.Description>{route.stops.length}곳 · 다음 셔틀 기준</Card.Description>
                </Card.Header>
                <Card.Content>
                  <Stepper
                    value={0}
                    orientation="vertical"
                    size="tiny"
                    aria-label={`${route.name} 정류장`}
                  >
                    {route.stops.map((stop, index) => (
                      <Stepper.Item key={stop}>
                        <Stepper.Title>{stop}</Stepper.Title>
                        {next && (
                          <Stepper.Description>
                            {clockOf(
                              minutesOf(next) +
                                Math.round((route.minutes / (route.stops.length - 1)) * index),
                            )}
                          </Stepper.Description>
                        )}
                      </Stepper.Item>
                    ))}
                  </Stepper>
                </Card.Content>
              </Card>
            </Tabs.Content>
          );
        })}
      </Tabs>
    </main>
  ),
};
