import { useState, type FormEvent } from 'react';

import { ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { CalendarDate, Time } from '@internationalized/date';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Card } from '../../components/data/card';
import { Alert } from '../../components/feedback/alert';
import { toast } from '../../components/feedback/toast';
import { Checkbox } from '../../components/form/checkbox';
import { DateField } from '../../components/form/date-field';
import { Field } from '../../components/form/field';
import { Select } from '../../components/form/select';
import { TextArea } from '../../components/form/text-area';
import { TimeField } from '../../components/form/time-field';
import { Label } from '../../components/typography/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Carpool/Create',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const PLACES = ['GIST 학생회관', 'GIST 기숙사', '광주송정역', '유스퀘어 터미널', '광주공항'];

const FARES: Record<string, number> = {
  광주송정역: 18000,
  '유스퀘어 터미널': 12000,
  광주공항: 28000,
};

const won = new Intl.NumberFormat('ko-KR');

export const PC: Story = {
  render: function Render() {
    const [from, setFrom] = useState<string | null>(PLACES[0]);
    const [to, setTo] = useState<string | null>(PLACES[2]);
    const [people, setPeople] = useState<string | null>('4');

    const fare = FARES[to ?? ''] ?? FARES[from ?? ''];
    const each = fare && people ? Math.ceil(fare / Number(people) / 100) * 100 : null;

    const open = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success('합승을 열었어요', {
        description: '같은 시간에 가는 학생에게 알림을 보냈어요.',
      });
    };

    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
        <Card asChild className="w-full max-w-lg">
          <form onSubmit={open}>
            <Card.Header>
              <Card.Title asChild>
                <h1>합승 모집</h1>
              </Card.Title>
              <Card.Description>같은 곳에 가는 학생과 택시비를 나눠요.</Card.Description>
            </Card.Header>

            <Card.Content className="flex flex-col gap-5">
              <div className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-4">
                  <Field>
                    <Field.Label>출발</Field.Label>
                    <Select name="from" value={from} onValueChange={setFrom}>
                      {PLACES.map((place) => (
                        <Select.Item key={place} value={place}>
                          {place}
                        </Select.Item>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    <Field.Label>도착</Field.Label>
                    <Select name="to" value={to} onValueChange={setTo}>
                      {PLACES.map((place) => (
                        <Select.Item key={place} value={place}>
                          {place}
                        </Select.Item>
                      ))}
                    </Select>
                  </Field>
                </div>
                <IconButton
                  variant="outline"
                  aria-label="출발과 도착 바꾸기"
                  icon={<ArrowsUpDownIcon />}
                  onClick={() => {
                    setFrom(to);
                    setTo(from);
                  }}
                />
              </div>

              <div className="grid items-start gap-4 sm:grid-cols-2">
                <Field>
                  <Field.Label>날짜</Field.Label>
                  <DateField name="date" defaultValue={new CalendarDate(2026, 10, 1)} />
                </Field>
                <Field>
                  <Field.Label>출발 시간</Field.Label>
                  <TimeField name="time" defaultValue={new Time(13, 20)} step={10} />
                </Field>
              </div>

              <Field>
                <Field.Label>모을 인원 (나 포함)</Field.Label>
                <ToggleGroup variant="outline" value={people} onValueChange={setPeople}>
                  <Toggle value="2">2명</Toggle>
                  <Toggle value="3">3명</Toggle>
                  <Toggle value="4">4명</Toggle>
                </ToggleGroup>
              </Field>

              <Field>
                <Field.Label>하고 싶은 말</Field.Label>
                <TextArea
                  name="memo"
                  rows={2}
                  maxLength={100}
                  placeholder="학생회관 앞 벤치에서 만나요"
                >
                  <TextArea.Input />
                  <TextArea.Count />
                </TextArea>
              </Field>

              <Label>
                <Checkbox name="luggage" />
                캐리어가 있어요
              </Label>

              {each && (
                <Alert colorScheme="info">
                  <Alert.Title>1인 약 {won.format(each)}원</Alert.Title>
                  <Alert.Description>
                    택시비 {won.format(fare)}원을 {people}명이 나눈 값이에요. 실제 요금과 다를 수
                    있어요.
                  </Alert.Description>
                </Alert>
              )}
            </Card.Content>

            <Card.Footer className="justify-end border-t">
              <Button variant="outline">취소</Button>
              <Button type="submit" disabled={from === to}>
                모집 열기
              </Button>
            </Card.Footer>
          </form>
        </Card>
      </main>
    );
  },
};
