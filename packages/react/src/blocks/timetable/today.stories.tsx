import { MapPinIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Progress } from '../../components/feedback/progress';
import { Stepper } from '../../components/navigation/stepper';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Timetable/Today',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const CLASSES = [
  { id: 'algo', name: '알고리즘', time: '09:00 – 10:15', room: '대학 C동 102호' },
  { id: 'prob', name: '확률과 통계', time: '14:30 – 15:45', room: '대학 B동 301호' },
  { id: 'club', name: '인포팀 정기 회의', time: '19:00 – 20:30', room: '학생회관 204호' },
];

const NOW_INDEX = 1;

export const PC: Story = {
  render: () => (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 break-keep">
      <div className="flex flex-col gap-2">
        <p className="text-body-b3-regular">10월 1일 수요일</p>
        <h1 className="text-headline-h3-bold">오늘 수업 {CLASSES.length}개</h1>
      </div>

      <Card>
        <Card.Header>
          <Card.Description>다음 수업까지 16분</Card.Description>
          <Card.Title asChild>
            <h2>
              <span className="text-headline-h5-bold block">{CLASSES[NOW_INDEX].name}</span>
            </h2>
          </Card.Title>
          <Card.Action>
            <Chip variant="soft" colorScheme="primary">
              14:30
            </Chip>
          </Card.Action>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col gap-4">
            <Progress value={68} aria-label="다음 수업까지 남은 시간" />
            <p>{CLASSES[NOW_INDEX].room}</p>
          </div>
        </Card.Content>
        <Card.Footer>
          <div className="grid flex-1">
            <Button variant="outline">
              <MapPinIcon />
              강의실 가는 길
            </Button>
          </div>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title asChild>
            <h2>오늘 순서</h2>
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <Stepper value={NOW_INDEX} orientation="vertical" aria-label="오늘 순서">
            {CLASSES.map((item) => (
              <Stepper.Item key={item.id}>
                <Stepper.Title>{item.name}</Stepper.Title>
                <Stepper.Description>
                  {item.time} · {item.room}
                </Stepper.Description>
              </Stepper.Item>
            ))}
          </Stepper>
        </Card.Content>
      </Card>
    </main>
  ),
};
