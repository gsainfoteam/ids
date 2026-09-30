import { useState, type FormEvent } from 'react';

import { CalendarDate, Time } from '@internationalized/date';

import { Button } from '../../components/action/button';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';
import { DateField } from '../../components/form/date-field';
import { Field } from '../../components/form/field';
import { NumberField } from '../../components/form/number-field';
import { Select } from '../../components/form/select';
import { Switch } from '../../components/form/switch';
import { TextArea } from '../../components/form/text-area';
import { TextField } from '../../components/form/text-field';
import { TimeField } from '../../components/form/time-field';
import { Label } from '../../components/typography/label';

import type { DateRange } from '../../components/data/calendar';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Editor/Event',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const PLACES = ['학생회관 앞 광장', '오룡관 대강당', '중앙도서관 세미나실', '체육관'];

const dayOf = (date: CalendarDate | null) => (date ? `${date.month}월 ${date.day}일` : '…');

const timeOf = (time: Time | null) =>
  time
    ? `${time.hour < 12 ? '오전' : '오후'} ${time.hour % 12 || 12}:${String(time.minute).padStart(2, '0')}`
    : '…';

export const PC: Story = {
  render: function Render() {
    const [name, setName] = useState('가을 축제');
    const [dates, setDates] = useState<DateRange | null>({
      start: new CalendarDate(2026, 10, 16),
      end: new CalendarDate(2026, 10, 17),
    });
    const [startsAt, setStartsAt] = useState<Time | null>(new Time(12, 0));
    const [place, setPlace] = useState<string | null>(PLACES[0]);
    const [capacity, setCapacity] = useState<number | null>(300);
    const [signUp, setSignUp] = useState(true);

    const create = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success('행사를 만들었어요', { description: '게시판에 소식을 올렸어요.' });
    };

    return (
      <main className="mx-auto grid w-full max-w-6xl items-start gap-6 px-4 py-10 break-keep sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-14">
        <Card asChild>
          <form onSubmit={create}>
            <Card.Header className="border-b">
              <Card.Title asChild>
                <h1>행사 만들기</h1>
              </Card.Title>
              <Card.Description>만든 행사는 게시판과 캘린더에 함께 올라가요.</Card.Description>
            </Card.Header>

            <Card.Content className="flex flex-col gap-5">
              <Field>
                <Field.Label>행사 이름</Field.Label>
                <TextField name="name" value={name} onValueChange={setName} required />
              </Field>
              <Field>
                <Field.Label>소개</Field.Label>
                <TextArea
                  name="description"
                  rows={3}
                  maxLength={300}
                  defaultValue="동아리 부스, 푸드트럭, 저녁 공연까지. 이틀 동안 광장이 축제가 돼요."
                >
                  <TextArea.Input />
                  <TextArea.Count />
                </TextArea>
              </Field>
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <Field>
                  <Field.Label>날짜</Field.Label>
                  <DateField
                    name="dates"
                    selectionMode="range"
                    value={dates}
                    onValueChange={setDates}
                    required
                  />
                </Field>
                <Field>
                  <Field.Label>시작 시간</Field.Label>
                  <TimeField
                    name="startsAt"
                    value={startsAt}
                    onValueChange={setStartsAt}
                    step={30}
                  />
                </Field>
              </div>
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <Field>
                  <Field.Label>장소</Field.Label>
                  <Select name="place" value={place} onValueChange={setPlace}>
                    {PLACES.map((option) => (
                      <Select.Item key={option} value={option}>
                        {option}
                      </Select.Item>
                    ))}
                  </Select>
                </Field>
                <Field>
                  <Field.Label>정원</Field.Label>
                  <NumberField
                    name="capacity"
                    value={capacity}
                    onValueChange={setCapacity}
                    min={1}
                    max={1000}
                    step={10}
                  />
                </Field>
              </div>
              <Label>
                <Switch name="signUp" checked={signUp} onCheckedChange={setSignUp} />
                참가 신청 받기
              </Label>
              {signUp && (
                <Field>
                  <Field.Label>신청 마감</Field.Label>
                  <DateField name="closesOn" defaultValue={new CalendarDate(2026, 10, 12)} />
                  <Field.Hint>마감하면 신청 버튼이 꺼져요.</Field.Hint>
                </Field>
              )}
            </Card.Content>

            <Card.Footer className="justify-end border-t">
              <Button variant="outline">취소</Button>
              <Button type="submit">만들기</Button>
            </Card.Footer>
          </form>
        </Card>

        <section aria-labelledby="preview" className="flex flex-col gap-3 lg:sticky lg:top-6">
          <h2 id="preview" className="text-body-b3-semibold">
            미리 보기
          </h2>
          <Card>
            <Card.Header>
              <Badge
                content="행사"
                variant="soft"
                colorScheme="primary"
                className="justify-self-start"
              />
              <Card.Title className="text-headline-h5-bold">{name || '행사 이름'}</Card.Title>
            </Card.Header>
            <Item.Group variant="bordered" size="tiny" aria-label="행사 정보">
              <Item>
                <Item.Content>
                  <Item.Description>날짜</Item.Description>
                  <Item.Title>
                    {dayOf(dates?.start ?? null)} – {dayOf(dates?.end ?? null)}
                  </Item.Title>
                </Item.Content>
              </Item>
              <Item>
                <Item.Content>
                  <Item.Description>시작</Item.Description>
                  <Item.Title>{timeOf(startsAt)}</Item.Title>
                </Item.Content>
              </Item>
              <Item>
                <Item.Content>
                  <Item.Description>장소</Item.Description>
                  <Item.Title>{place ?? '…'}</Item.Title>
                </Item.Content>
              </Item>
              <Item>
                <Item.Content>
                  <Item.Description>정원</Item.Description>
                  <Item.Title>{capacity ? `${capacity}명` : '제한 없음'}</Item.Title>
                </Item.Content>
              </Item>
            </Item.Group>
            <Card.Footer>
              <Button className="w-full" disabled={!signUp}>
                {signUp ? '신청하기' : '신청을 받지 않아요'}
              </Button>
            </Card.Footer>
          </Card>
        </section>
      </main>
    );
  },
};
