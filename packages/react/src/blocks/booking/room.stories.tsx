import { useState } from 'react';

import {
  ComputerDesktopIcon,
  PresentationChartLineIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { CalendarDate } from '@internationalized/date';

import { Button } from '../../components/action/button';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Calendar } from '../../components/data/calendar';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Alert } from '../../components/feedback/alert';
import { toast } from '../../components/feedback/toast';
import { RadioGroup } from '../../components/form/radio-group';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Booking/Room',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const TODAY = new CalendarDate(2026, 10, 1);

const ROOMS = [
  { id: 'a', name: '스터디룸 A', capacity: 4, feature: '화이트보드', icon: <UsersIcon /> },
  {
    id: 'b',
    name: '스터디룸 B',
    capacity: 6,
    feature: '모니터 연결',
    icon: <ComputerDesktopIcon />,
  },
  {
    id: 'c',
    name: '세미나실',
    capacity: 12,
    feature: '빔 프로젝터',
    icon: <PresentationChartLineIcon />,
  },
];

const SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '19:00',
  '20:00',
];

const TAKEN = ['11:00', '14:00', '15:00'];

const dayOf = (date: CalendarDate) => `${date.month}월 ${date.day}일`;

const endOf = (slot: string) => `${String(Number(slot.slice(0, 2)) + 2).padStart(2, '0')}:00`;

export const PC: Story = {
  render: function Render() {
    const [date, setDate] = useState<CalendarDate | null>(TODAY.add({ days: 1 }));
    const [room, setRoom] = useState('b');
    const [slot, setSlot] = useState<string | null>('13:00');

    const chosenRoom = ROOMS.find(({ id }) => id === room)!;

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-h3-bold">스터디룸 예약</h1>
          <p className="text-body-b2-regular">
            중앙도서관 3층 · 한 번에 두 시간까지, 하루 한 번 예약할 수 있어요.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
          <Card className="justify-self-start">
            <Card.Header>
              <Card.Title asChild>
                <h2>날짜</h2>
              </Card.Title>
              <Card.Description>2주 안의 평일만 고를 수 있어요.</Card.Description>
            </Card.Header>
            <Card.Content>
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

          <div className="flex flex-col gap-6">
            <section aria-labelledby="rooms" className="flex flex-col gap-3">
              <h2 id="rooms" className="text-body-b3-semibold">
                방
              </h2>
              <RadioGroup<string> name="room" value={room} onValueChange={setRoom} aria-label="방">
                {({ Item: Radio }) => (
                  <div className="grid gap-2 sm:grid-cols-3">
                    {ROOMS.map((option) => (
                      <Item key={option.id} variant="outline" asChild selected={option.id === room}>
                        <label>
                          <Item.Media variant="soft">{option.icon}</Item.Media>
                          <Item.Content>
                            <Item.Title>{option.name}</Item.Title>
                            <Item.Description>
                              {option.capacity}명 · {option.feature}
                            </Item.Description>
                          </Item.Content>
                          <Item.Actions>
                            <Radio value={option.id} />
                          </Item.Actions>
                        </label>
                      </Item>
                    ))}
                  </div>
                )}
              </RadioGroup>
            </section>

            <section aria-labelledby="slots" className="flex flex-col gap-3">
              <h2 id="slots" className="text-body-b3-semibold">
                시작 시간
              </h2>
              <ToggleGroup
                variant="outline"
                attached={false}
                aria-labelledby="slots"
                value={slot}
                onValueChange={setSlot}
                className="flex-wrap"
              >
                {SLOTS.map((option) => (
                  <Toggle key={option} value={option} disabled={TAKEN.includes(option)}>
                    {option}
                  </Toggle>
                ))}
              </ToggleGroup>
              <p className="text-caption-c1-regular">흐린 시간은 이미 예약됐어요.</p>
            </section>

            <Card variant="soft">
              <Card.Header>
                <Card.Title asChild>
                  <h2>예약 내용</h2>
                </Card.Title>
                <Card.Description>
                  {date && slot
                    ? `${dayOf(date)} ${slot}–${endOf(slot)} · ${chosenRoom.name} (${chosenRoom.capacity}명)`
                    : '날짜와 시작 시간을 골라 주세요.'}
                </Card.Description>
              </Card.Header>
              <Card.Footer>
                <Button
                  className="w-full"
                  disabled={!date || !slot}
                  onClick={() =>
                    toast.success('예약했어요', { description: '시작 10분 전에 알려 드릴게요.' })
                  }
                >
                  예약하기
                </Button>
              </Card.Footer>
            </Card>

            <Alert colorScheme="info">
              <Alert.Description>
                시작하고 15분 안에 체크인하지 않으면 예약이 저절로 취소돼요.
              </Alert.Description>
            </Alert>
          </div>
        </div>
      </main>
    );
  },
};
