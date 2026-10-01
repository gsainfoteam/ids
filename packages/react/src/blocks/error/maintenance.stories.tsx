import { type FormEvent } from 'react';

import { Button } from '../../components/action/button';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Progress } from '../../components/feedback/progress';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { TextField } from '../../components/form/text-field';
import { Stepper } from '../../components/navigation/stepper';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Error/Maintenance',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SCHEDULE = [
  { title: '점검 시작', time: '오전 2:00' },
  { title: '데이터 옮기기', time: '오전 2:30부터' },
  { title: '확인하고 다시 열기', time: '오전 6:00까지' },
];

export const PC: Story = {
  render: () => (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge content="점검 중" variant="soft" colorScheme="warning" />
          <h1 className="text-headline-h2-bold">더 빨라지려고 잠시 쉬어요</h1>
          <p className="text-body-b2-regular">
            10월 3일 새벽 2시부터 6시까지 서버를 옮겨요. 끝나면 이 페이지가 저절로 새로 고쳐져요.
          </p>
        </div>

        <Card>
          <Card.Header>
            <Card.Title asChild>
              <h2>점검 일정</h2>
            </Card.Title>
            <Card.Description>10월 3일 금요일</Card.Description>
            <Card.Action>
              <Badge content="약 2시간 남음" variant="soft" colorScheme="neutral" />
            </Card.Action>
          </Card.Header>
          <Card.Content className="flex flex-col gap-6">
            <Progress value={45}>
              <Progress.Label>진행</Progress.Label>
              <Progress.Value />
            </Progress>
            <Stepper value={1} orientation="vertical" size="tiny" aria-label="점검 일정">
              {SCHEDULE.map((step) => (
                <Stepper.Item key={step.title}>
                  <Stepper.Title>{step.title}</Stepper.Title>
                  <Stepper.Description>{step.time}</Stepper.Description>
                </Stepper.Item>
              ))}
            </Stepper>
          </Card.Content>
        </Card>

        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            toast.success('점검이 끝나면 메일로 알려 드릴게요');
          }}
          className="flex items-end gap-2"
        >
          <Field className="flex-1">
            <Field.Label>끝나면 알려 드릴까요?</Field.Label>
            <TextField
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@gm.gist.ac.kr"
              required
            />
          </Field>
          <Button type="submit" variant="outline">
            알림 받기
          </Button>
        </form>
      </div>
    </main>
  ),
};
