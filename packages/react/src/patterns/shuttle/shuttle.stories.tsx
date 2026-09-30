import { BellAlertIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Table } from '../../components/data/table';
import { Alert } from '../../components/feedback/alert';
import { Progress } from '../../components/feedback/progress';
import { toast } from '../../components/feedback/toast';
import { Switch } from '../../components/form/switch';
import { Stepper } from '../../components/navigation/stepper';
import { Tabs } from '../../components/navigation/tabs';
import { Label } from '../../components/typography/label';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Shuttle',
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
    departures: ['09:00', '12:40', '15:00', '18:00'],
  },
];

function minutesBetween(from: string, to: string) {
  const [fromHour, fromMinute] = from.split(':').map(Number);
  const [toHour, toMinute] = to.split(':').map(Number);
  return toHour * 60 + toMinute - (fromHour * 60 + fromMinute);
}

function arrival(departure: string, minutes: number) {
  const [hour, minute] = departure.split(':').map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

const WAIT_SHOWN_AS_FULL_BAR = 30;

export const Default: Story = {
  render: () => (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-headline-h3-bold">셔틀 시간표</h1>
          <p className="text-body-b2-regular flex items-center gap-1.5 text-(--ids-color-on-muted)">
            <ClockIcon aria-hidden className="size-4" />
            지금 {NOW}, 평일 시간표
          </p>
        </div>
      </header>

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
          const next = route.departures.find((departure) => minutesBetween(NOW, departure) >= 0);
          const wait = next ? minutesBetween(NOW, next) : null;

          return (
            <Tabs.Content
              key={route.id}
              value={route.id}
              className="grid items-start gap-6 lg:grid-cols-[1fr_300px]"
            >
              <div className="flex flex-col gap-6">
                <Card>
                  <Card.Header>
                    <Card.Description>다음 셔틀</Card.Description>
                    <Card.Title asChild>
                      <p className="text-headline-h2-bold">
                        {wait === null
                          ? '오늘은 끝났어요'
                          : wait === 0
                            ? '곧 출발해요'
                            : `${wait}분 뒤`}
                      </p>
                    </Card.Title>
                    {next && (
                      <Card.Action>
                        <Badge content={`${next} 출발`} variant="soft" colorScheme="primary" />
                      </Card.Action>
                    )}
                  </Card.Header>
                  <Card.Content className="flex flex-col gap-4">
                    {wait !== null && (
                      <Progress
                        value={Math.max(0, 100 - (wait / WAIT_SHOWN_AS_FULL_BAR) * 100)}
                        aria-label="다음 셔틀까지 남은 시간"
                      />
                    )}
                    <p className="text-body-b3-regular flex items-center gap-1.5 text-(--ids-color-on-muted)">
                      <MapPinIcon aria-hidden className="size-4" />
                      {route.stops[0]} 정류장에서 타요. {route.name}까지 {route.minutes}분 걸려요.
                    </p>
                  </Card.Content>
                  <Card.Footer>
                    <Label className="text-body-b2-medium flex w-full items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <BellAlertIcon aria-hidden className="size-5" />
                        5분 전에 알려 주기
                      </span>
                      <Switch
                        onCheckedChange={(checked) => {
                          if (checked) toast.success('출발 5분 전에 알려 드릴게요');
                        }}
                      />
                    </Label>
                  </Card.Footer>
                </Card>

                <Table aria-label={`${route.name} 오늘 시간표`} highlightOnHover>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>출발</Table.Head>
                      <Table.Head>도착</Table.Head>
                      <Table.Head>
                        <span className="sr-only">상태</span>
                      </Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {route.departures.map((departure) => {
                      const past = minutesBetween(NOW, departure) < 0;

                      return (
                        <Table.Row
                          key={departure}
                          className={cn(past && 'text-(--ids-color-on-muted)')}
                        >
                          <Table.Cell className="tabular-nums">{departure}</Table.Cell>
                          <Table.Cell className="tabular-nums">
                            {arrival(departure, route.minutes)}
                          </Table.Cell>
                          <Table.Cell className="text-end">
                            {departure === next ? (
                              <Badge content="다음 차" variant="soft" colorScheme="primary" />
                            ) : past ? (
                              <span className="text-caption-c1-regular">떠남</span>
                            ) : null}
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              </div>

              <Card>
                <Card.Header>
                  <Card.Title>정류장</Card.Title>
                  <Card.Description>{route.stops.length}곳</Card.Description>
                </Card.Header>
                <Card.Content>
                  <Stepper
                    progress={false}
                    orientation="vertical"
                    size="tiny"
                    aria-label={`${route.name} 정류장`}
                  >
                    {route.stops.map((stop, index) => (
                      <Stepper.Item key={stop} completed={index === 0}>
                        <Stepper.Title>{stop}</Stepper.Title>
                        {next && (
                          <Stepper.Description>
                            {arrival(
                              next,
                              Math.round((route.minutes / (route.stops.length - 1)) * index),
                            )}{' '}
                            도착
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
