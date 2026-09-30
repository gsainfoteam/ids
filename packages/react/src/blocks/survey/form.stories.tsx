import { useState, type FormEvent } from 'react';

import { Button } from '../../components/action/button';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Progress } from '../../components/feedback/progress';
import { toast } from '../../components/feedback/toast';
import { CheckboxGroup } from '../../components/form/checkbox-group';
import { Field } from '../../components/form/field';
import { RadioGroup } from '../../components/form/radio-group';
import { Rating } from '../../components/form/rating';
import { Slider } from '../../components/form/slider';
import { TextArea } from '../../components/form/text-area';
import { Label } from '../../components/typography/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Survey/Form',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const HELPFUL = ['강의 영상', '과제', '실습', '조교 면담', '시험 해설'];

const QUESTIONS = 5;

const DIFFICULTY: Record<number, string> = { 1: '쉬움', 3: '보통', 5: '어려움' };

export const PC: Story = {
  render: function Render() {
    const [overall, setOverall] = useState(0);
    const [pace, setPace] = useState<string | null>(null);
    const [helpful, setHelpful] = useState<string[]>([]);
    const [difficulty, setDifficulty] = useState(3);
    const [comment, setComment] = useState('');

    const answered = [
      overall > 0,
      pace !== null,
      helpful.length > 0,
      true,
      comment.trim() !== '',
    ].filter(Boolean).length;

    const submit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success('평가를 보냈어요', { description: '성적 공개 뒤에 교수님께 전달돼요.' });
    };

    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-col gap-3">
          <Badge content="익명" variant="soft" colorScheme="neutral" className="self-start" />
          <h1 className="text-headline-h3-bold">EC3101 알고리즘 강의 평가</h1>
          <p className="text-body-b2-regular">
            답은 이름 없이 모아서, 성적이 공개된 뒤에 교수님께 전달돼요. 3분이면 끝나요.
          </p>
          <Progress value={(answered / QUESTIONS) * 100}>
            <Progress.Label>
              {answered} / {QUESTIONS} 문항
            </Progress.Label>
          </Progress>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Card>
            <Card.Header>
              <Card.Description>1번</Card.Description>
              <Card.Title id="overall-question">강의에 몇 점을 주고 싶나요?</Card.Title>
            </Card.Header>
            <Card.Content>
              <Rating
                name="overall"
                value={overall}
                onValueChange={setOverall}
                aria-labelledby="overall-question"
                required
              />
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Description>2번</Card.Description>
              <Card.Title id="pace-question">진도는 어땠나요?</Card.Title>
            </Card.Header>
            <Card.Content>
              <RadioGroup<string>
                name="pace"
                value={pace}
                onValueChange={setPace}
                aria-labelledby="pace-question"
              >
                {({ Item: Radio }) => (
                  <div className="flex flex-col gap-3">
                    <Label>
                      <Radio value="slow" />
                      느렸어요
                    </Label>
                    <Label>
                      <Radio value="good" />
                      알맞았어요
                    </Label>
                    <Label>
                      <Radio value="fast" />
                      빨랐어요
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Description>3번 · 여러 개 고를 수 있어요</Card.Description>
              <Card.Title id="helpful-question">배우는 데 도움이 된 것은?</Card.Title>
            </Card.Header>
            <Card.Content>
              <CheckboxGroup<string>
                name="helpful"
                value={helpful}
                onValueChange={setHelpful}
                aria-labelledby="helpful-question"
              >
                {({ Item: Check }) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {HELPFUL.map((option) => (
                      <Label key={option}>
                        <Check value={option} />
                        {option}
                      </Label>
                    ))}
                  </div>
                )}
              </CheckboxGroup>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Description>4번</Card.Description>
              <Card.Title id="difficulty-question">과제는 얼마나 어려웠나요?</Card.Title>
            </Card.Header>
            <Card.Content>
              <Slider
                name="difficulty"
                min={1}
                max={5}
                value={difficulty}
                onValueChange={setDifficulty}
                marks={[1, 3, 5]}
                formatLabel={(value) => DIFFICULTY[value] ?? String(value)}
                aria-labelledby="difficulty-question"
              />
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Description>5번 · 선택</Card.Description>
              <Card.Title>교수님께 하고 싶은 말</Card.Title>
            </Card.Header>
            <Card.Content>
              <Field aria-label="교수님께 하고 싶은 말">
                <TextArea
                  name="comment"
                  rows={4}
                  maxLength={1000}
                  value={comment}
                  onValueChange={setComment}
                  placeholder="좋았던 점과 바라는 점을 적어 주세요"
                >
                  <TextArea.Input />
                  <TextArea.Count />
                </TextArea>
              </Field>
            </Card.Content>
          </Card>

          <Button type="submit" className="self-end" disabled={overall === 0}>
            평가 보내기
          </Button>
        </form>
      </main>
    );
  },
};
