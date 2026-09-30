import { useState, type FormEvent } from 'react';

import { CalendarDate } from '@internationalized/date';

import { Button } from '../../components/action/button';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Badge } from '../../components/data/badge';
import { Calendar } from '../../components/data/calendar';
import { Card } from '../../components/data/card';
import { Alert } from '../../components/feedback/alert';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { NumberField } from '../../components/form/number-field';
import { RadioGroup } from '../../components/form/radio-group';
import { Select } from '../../components/form/select';
import { Label } from '../../components/typography/label';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Booking',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const TODAY = new CalendarDate(2026, 10, 1);

const ROOMS = [
  { id: 'a', name: '스터디룸 A', seats: 4, features: ['모니터', '화이트보드'] },
  { id: 'b', name: '스터디룸 B', seats: 6, features: ['모니터', '화상 회의'] },
  { id: 'seminar', name: '세미나실', seats: 12, features: ['빔 프로젝터', '마이크'] },
];

const SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

const BOOKED: Record<string, string[]> = {
  a: ['10:00', '11:00', '15:00'],
  b: ['09:00', '13:00', '14:00', '19:00'],
  seminar: ['16:00', '17:00'],
};

const PURPOSES = ['조별 과제', '스터디', '동아리 회의', '면접 연습'];

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

function dayLabel(date: CalendarDate) {
  const weekday =
    WEEKDAYS[(new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() + 6) % 7];
  return `${date.month}월 ${date.day}일 ${weekday}요일`;
}

function endOf(slot: string, hours: number) {
  return `${Number(slot.slice(0, 2)) + hours}:00`;
}

const step = cn('text-subtitle-s2-semibold');

const summaryRow = cn('flex items-center justify-between gap-4 text-body-b3-regular');

export const Default: Story = {
  render: function Render() {
    const [date, setDate] = useState<CalendarDate | null>(TODAY);
    const [roomId, setRoomId] = useState('a');
    const [slot, setSlot] = useState<string | null>(null);
    const [hours, setHours] = useState('1');
    const [people, setPeople] = useState(3);

    const room = ROOMS.find(({ id }) => id === roomId) ?? ROOMS[0];
    const booked = BOOKED[room.id] ?? [];
    const ready = date !== null && slot !== null;

    const book = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!ready) return;
      toast.success('예약했어요', {
        description: `${dayLabel(date)} ${slot}부터 ${endOf(slot, Number(hours))}까지, ${room.name}`,
      });
    };

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-12">
        <header className="flex flex-col gap-1">
          <h1 className="text-headline-h3-bold">스터디룸 예약</h1>
          <p className="text-body-b2-regular text-(--ids-color-on-muted)">
            중앙도서관 3층. 하루에 3시간까지, 2주 앞까지 예약할 수 있어요.
          </p>
        </header>

        <form onSubmit={book} className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <Card>
              <Card.Header>
                <Card.Title>
                  <span className={step}>1. 날짜</span>
                </Card.Title>
                <Card.Description>주말에는 문을 닫아요.</Card.Description>
              </Card.Header>
              <Card.Content className="flex justify-center">
                <Calendar
                  aria-label="예약 날짜"
                  value={date}
                  onValueChange={setDate}
                  min={TODAY}
                  max={TODAY.add({ days: 14 })}
                  disabled={{ dayOfWeek: [0, 6] }}
                />
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>
                  <span className={step}>2. 방</span>
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <RadioGroup<string>
                  aria-label="방"
                  value={roomId}
                  onValueChange={(next) => {
                    setRoomId(next);
                    setSlot(null);
                  }}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {({ Item: Radio }) =>
                    ROOMS.map(({ id, name, seats, features }) => (
                      <Label
                        key={id}
                        className="rounded-standard flex items-start gap-3 p-4 inset-ring-1 inset-ring-(--ids-color-border) has-data-[state=checked]:inset-ring-2 has-data-[state=checked]:inset-ring-(--ids-color-primary)"
                      >
                        <Radio value={id} />
                        <span className="flex flex-col gap-1">
                          <span className="text-body-b2-semibold">{name}</span>
                          <span className="text-body-b3-regular text-(--ids-color-on-muted)">
                            {seats}명까지
                          </span>
                          <span className="flex flex-wrap gap-1 pt-1">
                            {features.map((feature) => (
                              <Badge
                                key={feature}
                                content={feature}
                                variant="soft"
                                colorScheme="neutral"
                              />
                            ))}
                          </span>
                        </span>
                      </Label>
                    ))
                  }
                </RadioGroup>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>
                  <span className={step}>3. 시작 시간</span>
                </Card.Title>
                <Card.Description>흐린 칸은 이미 예약된 시간이에요.</Card.Description>
              </Card.Header>
              <Card.Content>
                <ToggleGroup
                  variant="outline"
                  aria-label="시작 시간"
                  value={slot}
                  onValueChange={setSlot}
                  className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6"
                >
                  {SLOTS.map((time) => (
                    <Toggle
                      key={time}
                      value={time}
                      variant="outline"
                      disabled={booked.includes(time)}
                    >
                      {time}
                    </Toggle>
                  ))}
                </ToggleGroup>
              </Card.Content>
            </Card>
          </div>

          <Card className="lg:sticky lg:top-6">
            <Card.Header>
              <Card.Title>예약 내용</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <dl className="flex flex-col gap-2">
                <div className={summaryRow}>
                  <dt className="text-(--ids-color-on-muted)">날짜</dt>
                  <dd>{date ? dayLabel(date) : '고르지 않음'}</dd>
                </div>
                <div className={summaryRow}>
                  <dt className="text-(--ids-color-on-muted)">방</dt>
                  <dd>{room.name}</dd>
                </div>
                <div className={summaryRow}>
                  <dt className="text-(--ids-color-on-muted)">시간</dt>
                  <dd>{slot ? `${slot}부터 ${endOf(slot, Number(hours))}까지` : '고르지 않음'}</dd>
                </div>
              </dl>
              <div className="grid grid-cols-2 items-start gap-3">
                <Field>
                  <Field.Label>이용 시간</Field.Label>
                  <Select value={hours} onValueChange={(next) => setHours(next ?? '1')}>
                    <Select.Item value="1">1시간</Select.Item>
                    <Select.Item value="2">2시간</Select.Item>
                    <Select.Item value="3">3시간</Select.Item>
                  </Select>
                </Field>
                <Field>
                  <Field.Label>인원</Field.Label>
                  <NumberField
                    value={people}
                    onValueChange={(next) => setPeople(next ?? 1)}
                    min={1}
                    max={room.seats}
                  >
                    <NumberField.Decrement />
                    <NumberField.Input className="text-center" />
                    <NumberField.Increment />
                  </NumberField>
                </Field>
              </div>
              <Field>
                <Field.Label>쓰는 목적</Field.Label>
                <Select name="purpose" defaultValue="조별 과제">
                  {PURPOSES.map((purpose) => (
                    <Select.Item key={purpose} value={purpose}>
                      {purpose}
                    </Select.Item>
                  ))}
                </Select>
              </Field>
              {people > room.seats && (
                <Alert colorScheme="warning">
                  <Alert.Title>
                    {room.name}은 {room.seats}명까지예요
                  </Alert.Title>
                </Alert>
              )}
            </Card.Content>
            <Card.Footer className="flex-col items-stretch gap-2">
              <Button type="submit" disabled={!ready}>
                예약하기
              </Button>
              <p className="text-caption-c1-regular text-center text-(--ids-color-on-muted)">
                시작 10분이 지나도 오지 않으면 자동으로 취소돼요.
              </p>
            </Card.Footer>
          </Card>
        </form>
      </main>
    );
  },
};
