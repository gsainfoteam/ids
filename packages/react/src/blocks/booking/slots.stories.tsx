import { useState, type FormEvent } from 'react';

import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CalendarDate } from '@internationalized/date';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Calendar } from '../../components/data/calendar';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Field } from '../../components/form/field';
import { TextArea } from '../../components/form/text-area';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Booking/Slots',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const TODAY = new CalendarDate(2026, 10, 1);

const TIMES = ['10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '16:30'];

const timesOn = (date: CalendarDate) => TIMES.filter((_, index) => (index + date.day) % 3 !== 0);

const dayOf = (date: CalendarDate) => `${date.month}월 ${date.day}일`;

export const PC: Story = {
  render: function Render() {
    const [date, setDate] = useState<CalendarDate | null>(TODAY.add({ days: 1 }));
    const [time, setTime] = useState<string | null>(null);
    const [step, setStep] = useState<'pick' | 'details' | 'done'>('pick');

    const book = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStep('done');
    };

    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
        <Card className="w-full max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-[260px_auto_minmax(0,1fr)]">
            <div className="flex flex-col gap-4">
              <Avatar name="강현우" />
              <div className="flex flex-col gap-1">
                <p className="text-body-b3-regular">강현우 교수 · 전기전자컴퓨터공학과</p>
                <h1 className="text-headline-h4-bold">지도 교수 면담</h1>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge content="30분" variant="outline" colorScheme="neutral" />
                <Badge content="연구동 B 312호" variant="outline" colorScheme="neutral" />
                {date && time && (
                  <Badge content={`${dayOf(date)} ${time}`} variant="soft" colorScheme="primary" />
                )}
              </div>
            </div>

            <Divider orientation="vertical" className="hidden lg:block" />

            {step === 'pick' && (
              <div className="flex flex-col gap-6 md:flex-row">
                <Calendar
                  aria-label="면담 날짜"
                  value={date}
                  onValueChange={(next) => {
                    setDate(next);
                    setTime(null);
                  }}
                  min={TODAY}
                  max={TODAY.add({ days: 30 })}
                  disabled={{ dayOfWeek: [0, 6] }}
                />
                {date && (
                  <section aria-labelledby="times" className="flex min-w-40 flex-1 flex-col gap-3">
                    <h2 id="times" className="text-body-b3-semibold">
                      {dayOf(date)}
                    </h2>
                    <div className="flex flex-col gap-2">
                      {timesOn(date).map((option) =>
                        option === time ? (
                          <div key={option} className="grid grid-cols-2 gap-2">
                            <Button variant="soft" aria-pressed onClick={() => setTime(null)}>
                              {option}
                            </Button>
                            <Button onClick={() => setStep('details')}>다음</Button>
                          </div>
                        ) : (
                          <Button key={option} variant="outline" onClick={() => setTime(option)}>
                            {option}
                          </Button>
                        ),
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {step === 'details' && (
              <form onSubmit={book} className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="tiny"
                  className="self-start"
                  onClick={() => setStep('pick')}
                >
                  <ArrowLeftIcon />
                  시간 다시 고르기
                </Button>
                <h2 className="text-headline-h5-bold">내 정보</h2>
                <Field>
                  <Field.Label>이름</Field.Label>
                  <TextField name="name" autoComplete="name" required />
                </Field>
                <Field>
                  <Field.Label>GIST 메일</Field.Label>
                  <TextField type="email" name="email" autoComplete="email" required />
                </Field>
                <Field>
                  <Field.Label>면담 주제</Field.Label>
                  <TextArea
                    name="topic"
                    rows={3}
                    maxLength={300}
                    placeholder="예: 다음 학기 연구 참여"
                  >
                    <TextArea.Input />
                    <TextArea.Count />
                  </TextArea>
                </Field>
                <Button type="submit" className="self-end">
                  예약하기
                </Button>
              </form>
            )}

            {step === 'done' && date && (
              <Empty variant="soft">
                <Empty.Media>
                  <CheckCircleIcon />
                </Empty.Media>
                <Empty.Title>
                  {dayOf(date)} {time}에 뵈어요
                </Empty.Title>
                <Empty.Description>
                  확인 메일과 캘린더 초대를 보냈어요. 바꾸려면 메일의 링크를 누르세요.
                </Empty.Description>
                <Empty.Actions>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTime(null);
                      setStep('pick');
                    }}
                  >
                    처음으로
                  </Button>
                </Empty.Actions>
              </Empty>
            )}
          </div>
        </Card>
      </main>
    );
  },
};
