import { useState, type FormEvent } from 'react';

import { ArrowsUpDownIcon, ClockIcon, PlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import { CalendarDate, Time } from '@internationalized/date';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { AvatarGroup } from '../../components/data/avatar-group';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Empty } from '../../components/data/empty';
import { Progress } from '../../components/feedback/progress';
import { toast } from '../../components/feedback/toast';
import { DateField } from '../../components/form/date-field';
import { Field } from '../../components/form/field';
import { NumberField } from '../../components/form/number-field';
import { Select } from '../../components/form/select';
import { TimeField } from '../../components/form/time-field';
import { Drawer } from '../../components/overlay/drawer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Carpool',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const PLACES = ['GIST 기숙사', '광주송정역', '유스퀘어 터미널', '광주공항', '첨단 상무지구'];

const TODAY = new CalendarDate(2026, 10, 1);

type Ride = {
  id: string;
  from: string;
  to: string;
  leaves: string;
  seats: number;
  riders: string[];
  note?: string;
};

const RIDES: Ride[] = [
  {
    id: 'r1',
    from: 'GIST 기숙사',
    to: '광주송정역',
    leaves: '17:40',
    seats: 4,
    riders: ['박서연', '이도윤'],
    note: 'KTX 18:25 타요',
  },
  {
    id: 'r2',
    from: 'GIST 기숙사',
    to: '광주송정역',
    leaves: '18:10',
    seats: 4,
    riders: ['최하준', '정예린', '한지우'],
  },
  {
    id: 'r3',
    from: 'GIST 기숙사',
    to: '유스퀘어 터미널',
    leaves: '19:00',
    seats: 3,
    riders: ['오세린'],
  },
  {
    id: 'r4',
    from: 'GIST 기숙사',
    to: '광주공항',
    leaves: '20:30',
    seats: 4,
    riders: ['윤태오', '김지수', '박서연', '이도윤'],
  },
];

const FARE_TO: Record<string, number> = {
  광주송정역: 18000,
  '유스퀘어 터미널': 22000,
  광주공항: 26000,
};

const won = new Intl.NumberFormat('ko-KR');

export const Default: Story = {
  render: function Render() {
    const [from, setFrom] = useState('GIST 기숙사');
    const [to, setTo] = useState('광주송정역');
    const [date, setDate] = useState<CalendarDate | null>(TODAY);
    const [joined, setJoined] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    const shown = RIDES.filter(
      (ride) => ride.from === from && (to === 'anywhere' || ride.to === to),
    );

    const create = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setOpen(false);
      toast.success('합승을 열었어요', { description: '같은 방향 사람에게 알림을 보냈어요.' });
    };

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-h3-bold">택시 합승</h1>
            <p className="text-body-b2-regular text-(--ids-color-on-muted)">
              같은 방향으로 가는 학생과 요금을 나눠요.
            </p>
          </div>
          <Drawer side="bottom" open={open} onOpenChange={setOpen}>
            <Drawer.Trigger asChild>
              <Button>
                <PlusIcon />
                합승 열기
              </Button>
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>합승 열기</Drawer.Title>
                <Drawer.Description>
                  출발 30분 전까지 사람이 모이지 않으면 저절로 닫혀요.
                </Drawer.Description>
              </Drawer.Header>
              <form onSubmit={create} className="flex flex-col gap-4">
                <div className="grid items-start gap-4 sm:grid-cols-2">
                  <Field>
                    <Field.Label>출발</Field.Label>
                    <Select name="from" defaultValue="GIST 기숙사">
                      {PLACES.map((place) => (
                        <Select.Item key={place} value={place}>
                          {place}
                        </Select.Item>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    <Field.Label>도착</Field.Label>
                    <Select name="to" defaultValue="광주송정역">
                      {PLACES.map((place) => (
                        <Select.Item key={place} value={place}>
                          {place}
                        </Select.Item>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    <Field.Label>날짜</Field.Label>
                    <DateField name="date" defaultValue={TODAY} min={TODAY} required />
                  </Field>
                  <Field>
                    <Field.Label>출발 시간</Field.Label>
                    <TimeField name="time" defaultValue={new Time(18, 0)} step={10} required />
                  </Field>
                  <Field>
                    <Field.Label>모을 인원</Field.Label>
                    <NumberField name="seats" defaultValue={4} min={2} max={4}>
                      <NumberField.Decrement />
                      <NumberField.Input className="text-center" />
                      <NumberField.Increment />
                    </NumberField>
                  </Field>
                </div>
                <Button type="submit">열기</Button>
              </form>
            </Drawer.Content>
          </Drawer>
        </header>

        <Card>
          <Card.Content className="flex flex-col gap-3">
            <div className="grid items-end gap-2 sm:grid-cols-[1fr_auto_1fr]">
              <Field>
                <Field.Label>출발</Field.Label>
                <Select value={from} onValueChange={(next) => setFrom(next ?? from)}>
                  {PLACES.map((place) => (
                    <Select.Item key={place} value={place}>
                      {place}
                    </Select.Item>
                  ))}
                </Select>
              </Field>
              <IconButton
                variant="outline"
                aria-label="출발과 도착 바꾸기"
                icon={<ArrowsUpDownIcon />}
                onClick={() => {
                  setFrom(to === 'anywhere' ? from : to);
                  setTo(from);
                }}
                className="justify-self-center sm:rotate-90"
              />
              <Field>
                <Field.Label>도착</Field.Label>
                <Select value={to} onValueChange={(next) => setTo(next ?? to)}>
                  <Select.Item value="anywhere">어디든</Select.Item>
                  {PLACES.map((place) => (
                    <Select.Item key={place} value={place}>
                      {place}
                    </Select.Item>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DateField
                aria-label="날짜"
                value={date}
                onValueChange={setDate}
                min={TODAY}
                className="w-44"
              />
              <Chip defaultSelected>저녁</Chip>
              <Chip>자리 남음</Chip>
            </div>
          </Card.Content>
        </Card>

        <section aria-label="합승 목록" className="flex flex-col gap-3">
          <p aria-live="polite" className="text-body-b3-medium text-(--ids-color-on-muted)">
            {shown.length}개 모이는 중
          </p>
          {shown.length === 0 ? (
            <Empty variant="outline" className="py-12">
              <Empty.Media>
                <UsersIcon />
              </Empty.Media>
              <Empty.Title>이 방향 합승이 아직 없어요</Empty.Title>
              <Empty.Description>먼저 열면 같은 방향 사람에게 알림이 가요.</Empty.Description>
              <Empty.Actions>
                <Button onClick={() => setOpen(true)}>합승 열기</Button>
              </Empty.Actions>
            </Empty>
          ) : (
            <ul className="flex flex-col gap-3">
              {shown.map((ride) => {
                const riders = joined.includes(ride.id) ? [...ride.riders, '김지수'] : ride.riders;
                const full = riders.length >= ride.seats;
                const fare = FARE_TO[ride.to] ?? 20000;

                return (
                  <li key={ride.id}>
                    <Card>
                      <Card.Header>
                        <Card.Title>
                          {ride.from}에서 {ride.to}
                        </Card.Title>
                        <Card.Description className="flex items-center gap-1.5">
                          <ClockIcon aria-hidden className="size-4" />
                          오늘 {ride.leaves} 출발
                          {ride.note && `, ${ride.note}`}
                        </Card.Description>
                        <Card.Action>
                          {full ? (
                            <Badge content="마감" variant="soft" colorScheme="neutral" />
                          ) : (
                            <Badge
                              content={`${ride.seats - riders.length}자리 남음`}
                              variant="soft"
                              colorScheme="success"
                            />
                          )}
                        </Card.Action>
                      </Card.Header>
                      <Card.Content className="flex flex-col gap-3">
                        <Progress
                          value={(riders.length / ride.seats) * 100}
                          aria-label={`${ride.seats}명 중 ${riders.length}명`}
                        />
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <AvatarGroup aria-label={`함께 타는 사람 ${riders.length}명`} max={4}>
                            {riders.map((name) => (
                              <Avatar key={name} name={name} size="tiny" />
                            ))}
                          </AvatarGroup>
                          <p className="text-body-b3-regular text-(--ids-color-on-muted)">
                            한 사람당 약{' '}
                            <span className="text-body-b2-semibold text-(--ids-color-on-surface) tabular-nums">
                              {won.format(
                                Math.round(fare / Math.max(riders.length, 2) / 100) * 100,
                              )}
                              원
                            </span>
                          </p>
                        </div>
                      </Card.Content>
                      <Card.Footer className="justify-end">
                        {joined.includes(ride.id) ? (
                          <Button
                            variant="outline"
                            onClick={() =>
                              setJoined((current) => current.filter((id) => id !== ride.id))
                            }
                          >
                            빠지기
                          </Button>
                        ) : (
                          <Button
                            variant="soft"
                            disabled={full}
                            onClick={() => {
                              setJoined((current) => [...current, ride.id]);
                              toast.success('합승에 들어갔어요', {
                                description: '출발 10분 전에 알려 드릴게요.',
                              });
                            }}
                          >
                            같이 타기
                          </Button>
                        )}
                      </Card.Footer>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    );
  },
};
