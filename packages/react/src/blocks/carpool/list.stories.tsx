import { useState } from 'react';

import { PlusIcon } from '@heroicons/react/24/outline';
import { Time } from '@internationalized/date';

import { Button } from '../../components/action/button';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Avatar } from '../../components/data/avatar';
import { AvatarGroup } from '../../components/data/avatar-group';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Empty } from '../../components/data/empty';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { TextField } from '../../components/form/text-field';
import { TimeField } from '../../components/form/time-field';
import { Drawer } from '../../components/overlay/drawer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Carpool/List',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Direction = 'out' | 'in';

const RIDES: {
  id: string;
  direction: Direction;
  day: '오늘' | '내일';
  time: string;
  place: string;
  riders: string[];
  seats: number;
  fare: string;
}[] = [
  {
    id: 'r1',
    direction: 'out',
    day: '오늘',
    time: '13:20',
    place: '광주송정역',
    riders: ['박서연', '이도윤'],
    seats: 4,
    fare: '약 4,500원',
  },
  {
    id: 'r2',
    direction: 'out',
    day: '오늘',
    time: '17:40',
    place: '유스퀘어 터미널',
    riders: ['정예린', '한지우', '오세린'],
    seats: 4,
    fare: '약 3,000원',
  },
  {
    id: 'r3',
    direction: 'out',
    day: '내일',
    time: '08:10',
    place: '광주공항',
    riders: ['최하준'],
    seats: 3,
    fare: '약 7,000원',
  },
  {
    id: 'r4',
    direction: 'in',
    day: '오늘',
    time: '21:30',
    place: '광주송정역',
    riders: ['윤태오', '김지수', '박서연', '이도윤'],
    seats: 4,
    fare: '약 4,500원',
  },
  {
    id: 'r5',
    direction: 'in',
    day: '내일',
    time: '11:00',
    place: '유스퀘어 터미널',
    riders: ['한지우'],
    seats: 4,
    fare: '약 3,000원',
  },
];

const isDirection = (value: string): value is Direction => value === 'out' || value === 'in';

export const PC: Story = {
  render: function Render() {
    const [direction, setDirection] = useState<Direction>('out');
    const [day, setDay] = useState<'오늘' | '내일'>('오늘');
    const [joined, setJoined] = useState<string[]>([]);

    const shown = RIDES.filter((ride) => ride.direction === direction && ride.day === day);

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-h3-bold">택시 합승</h1>
            <p className="text-body-b2-regular">같은 곳에 가는 학생과 택시비를 나눠요.</p>
          </div>
          <Drawer>
            <Drawer.Trigger asChild>
              <Button>
                <PlusIcon />
                모집하기
              </Button>
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>합승 모집</Drawer.Title>
                <Drawer.Description>
                  출발 30분 전까지 사람이 모이지 않으면 저절로 닫혀요.
                </Drawer.Description>
              </Drawer.Header>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  toast.success('합승을 열었어요');
                }}
                className="flex flex-col gap-4"
              >
                <Field>
                  <Field.Label>가는 곳</Field.Label>
                  <TextField name="place" placeholder="광주송정역" required />
                </Field>
                <Field>
                  <Field.Label>출발 시간</Field.Label>
                  <TimeField name="time" defaultValue={new Time(13, 20)} step={10} />
                </Field>
                <Drawer.Footer>
                  <Drawer.Close asChild>
                    <Button variant="outline">취소</Button>
                  </Drawer.Close>
                  <Button type="submit">열기</Button>
                </Drawer.Footer>
              </form>
            </Drawer.Content>
          </Drawer>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup
            variant="outline"
            aria-label="방향"
            value={direction}
            onValueChange={(next) => {
              if (next !== null && isDirection(next)) setDirection(next);
            }}
          >
            <Toggle value="out">학교에서 출발</Toggle>
            <Toggle value="in">학교로 돌아오기</Toggle>
          </ToggleGroup>
          <div role="group" aria-label="날짜" className="flex gap-2">
            {(['오늘', '내일'] as const).map((option) => (
              <Chip key={option} selected={option === day} onSelectedChange={() => setDay(option)}>
                {option}
              </Chip>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <Empty variant="outline">
            <Empty.Title>{day} 모집 중인 합승이 없어요</Empty.Title>
            <Empty.Description>
              직접 모집해 보세요. 같은 시간에 가는 사람이 알림을 받아요.
            </Empty.Description>
          </Empty>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((ride) => {
              const riders = joined.includes(ride.id) ? [...ride.riders, '김지수'] : ride.riders;
              const left = ride.seats - riders.length;

              return (
                <li key={ride.id} className="flex">
                  <Card className="w-full">
                    <Card.Header>
                      <Card.Description>
                        {ride.day} {ride.time} 출발
                      </Card.Description>
                      <Card.Title className="text-headline-h5-bold">
                        {direction === 'out' ? `학교 → ${ride.place}` : `${ride.place} → 학교`}
                      </Card.Title>
                      <Card.Action>
                        <Badge
                          content={left > 0 ? `${left}자리 남음` : '다 찼어요'}
                          variant="soft"
                          colorScheme={left > 0 ? 'primary' : 'neutral'}
                        />
                      </Card.Action>
                    </Card.Header>
                    <Card.Content className="flex items-center gap-3">
                      <AvatarGroup size="tiny" aria-label={`${riders.length}명 모임`}>
                        {riders.map((name) => (
                          <Avatar key={name} name={name} />
                        ))}
                      </AvatarGroup>
                      {riders.length}/{ride.seats}명 · 1인 {ride.fare}
                    </Card.Content>
                    <Card.Footer className="border-t">
                      <Button
                        className="w-full"
                        variant={joined.includes(ride.id) ? 'outline' : 'solid'}
                        disabled={left === 0 && !joined.includes(ride.id)}
                        onClick={() =>
                          setJoined(
                            joined.includes(ride.id)
                              ? joined.filter((id) => id !== ride.id)
                              : [...joined, ride.id],
                          )
                        }
                      >
                        {joined.includes(ride.id)
                          ? '같이 타기 취소'
                          : left === 0
                            ? '마감'
                            : '같이 타기'}
                      </Button>
                    </Card.Footer>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    );
  },
};
