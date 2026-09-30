import { useState, type FormEvent } from 'react';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Progress } from '../../components/feedback/progress';
import { CheckboxGroup } from '../../components/form/checkbox-group';
import { RadioGroup } from '../../components/form/radio-group';
import { Rating } from '../../components/form/rating';
import { Slider } from '../../components/form/slider';
import { TextArea } from '../../components/form/text-area';
import { Label } from '../../components/typography/label';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Survey',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const QUESTIONS = 5;

const USES = ['게시판', '학식', '셔틀', '택시 합승', '스터디룸 예약'];

const option = cn(
  'flex items-center gap-3 rounded-standard px-4 py-3 text-body-b2-regular inset-ring-1 inset-ring-(--ids-color-border)',
  'has-data-[state=checked]:inset-ring-2 has-data-[state=checked]:inset-ring-(--ids-color-primary)',
);

const question = cn('flex flex-col gap-4');

const legend = cn('flex items-center gap-2 text-subtitle-s2-semibold');

export const Default: Story = {
  render: function Render() {
    const [frequency, setFrequency] = useState<string | null>(null);
    const [uses, setUses] = useState<string[]>([]);
    const [satisfaction, setSatisfaction] = useState(0);
    const [recommend, setRecommend] = useState(7);
    const [touched, setTouched] = useState(false);
    const [comment, setComment] = useState('');
    const [sent, setSent] = useState(false);

    const answered = [
      frequency !== null,
      uses.length > 0,
      satisfaction > 0,
      touched,
      comment.trim() !== '',
    ].filter(Boolean).length;

    const submit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSent(true);
    };

    if (sent)
      return (
        <main className="grid min-h-dvh place-items-center px-4 py-12 break-keep">
          <Empty variant="soft" className="w-full max-w-md py-12">
            <Empty.Media>
              <CheckCircleIcon />
            </Empty.Media>
            <Empty.Title>답해 주셔서 고마워요</Empty.Title>
            <Empty.Description>결과는 11월에 인포팀 블로그에 올릴게요.</Empty.Description>
            <Empty.Actions>
              <Button variant="outline" onClick={() => setSent(false)}>
                답 고치기
              </Button>
            </Empty.Actions>
          </Empty>
        </main>
      );

    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-12">
        <header className="flex flex-col gap-3">
          <Badge
            content="3분이면 끝나요"
            variant="soft"
            colorScheme="primary"
            className="self-start"
          />
          <h1 className="text-headline-h3-bold">인포팀 서비스 만족도 조사</h1>
          <p className="text-body-b2-regular text-(--ids-color-on-muted)">
            더 나은 서비스를 만들기 위해 묻습니다. 답은 이름 없이 모아요.
          </p>
          <Progress value={(answered / QUESTIONS) * 100}>
            <Progress.Label>
              {answered} / {QUESTIONS} 문항
            </Progress.Label>
            <Progress.Value />
          </Progress>
        </header>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Card>
            <Card.Content>
              <fieldset className={question}>
                <legend className={legend}>
                  1. 인포팀 서비스를 얼마나 자주 쓰나요?
                  <Badge content="필수" variant="soft" colorScheme="danger" />
                </legend>
                <RadioGroup<string>
                  aria-label="쓰는 빈도"
                  value={frequency}
                  onValueChange={setFrequency}
                  required
                >
                  {({ Item: Radio }) =>
                    ['매일', '일주일에 몇 번', '한 달에 몇 번', '거의 안 써요'].map((label) => (
                      <Label key={label} className={option}>
                        <Radio value={label} />
                        {label}
                      </Label>
                    ))
                  }
                </RadioGroup>
              </fieldset>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content>
              <fieldset className={question}>
                <legend className={legend}>2. 자주 쓰는 기능을 모두 골라 주세요</legend>
                <CheckboxGroup<string>
                  aria-label="자주 쓰는 기능"
                  value={uses}
                  onValueChange={setUses}
                  className="grid gap-2 sm:grid-cols-2"
                >
                  {({ Item: Check }) =>
                    USES.map((use) => (
                      <Label key={use} className={option}>
                        <Check value={use} />
                        {use}
                      </Label>
                    ))
                  }
                </CheckboxGroup>
              </fieldset>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content>
              <fieldset className={question}>
                <legend className={legend}>3. 전체적으로 얼마나 만족하나요?</legend>
                <Rating aria-label="만족도" value={satisfaction} onValueChange={setSatisfaction} />
              </fieldset>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content>
              <fieldset className={question}>
                <legend className={legend}>4. 친구에게 추천할 마음은 몇 점인가요?</legend>
                <div className="flex flex-col gap-2">
                  <Slider
                    aria-label="추천 점수"
                    min={0}
                    max={10}
                    step={1}
                    value={recommend}
                    onValueChange={(next) => {
                      setRecommend(next);
                      setTouched(true);
                    }}
                  />
                  <div className="text-caption-c1-regular flex justify-between text-(--ids-color-on-muted)">
                    <span>0 전혀 아니에요</span>
                    <span className="text-body-b2-semibold text-(--ids-color-on-surface) tabular-nums">
                      {recommend}점
                    </span>
                    <span>10 꼭 추천해요</span>
                  </div>
                </div>
              </fieldset>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content>
              <fieldset className={question}>
                <legend className={legend}>5. 바라는 점을 자유롭게 적어 주세요</legend>
                <TextArea
                  aria-label="바라는 점"
                  rows={4}
                  maxLength={500}
                  value={comment}
                  onValueChange={setComment}
                  placeholder="예: 셔틀 도착 알림을 조금 더 일찍 받고 싶어요"
                >
                  <TextArea.Input />
                  <TextArea.Count />
                </TextArea>
              </fieldset>
            </Card.Content>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <p className="text-body-b3-regular text-(--ids-color-on-muted)">
              1번만 답하면 낼 수 있어요.
            </p>
            <Button type="submit">내기</Button>
          </div>
        </form>
      </main>
    );
  },
};
