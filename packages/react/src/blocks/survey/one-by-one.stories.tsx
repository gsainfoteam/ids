import { useState } from 'react';

import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { Progress } from '../../components/feedback/progress';
import { RadioGroup } from '../../components/form/radio-group';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Survey/OneByOne',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const QUESTIONS = [
  {
    id: 'meal',
    question: '학생식당에서 주로 무엇을 먹나요?',
    options: [
      { value: 'korean', label: '한식', description: '밥과 국, 반찬 세 가지' },
      { value: 'western', label: '양식', description: '파스타, 돈가스, 샐러드' },
      { value: 'snack', label: '분식', description: '김밥, 라면, 떡볶이' },
      { value: 'none', label: '잘 안 먹어요', description: '밖에서 먹거나 굶어요' },
    ],
  },
  {
    id: 'time',
    question: '점심은 몇 시쯤 먹나요?',
    options: [
      { value: '1130', label: '11시 30분 전', description: '줄 서기 싫어요' },
      { value: '1200', label: '12시 무렵', description: '수업 끝나고 바로' },
      { value: '1300', label: '1시 넘어서', description: '한가할 때' },
    ],
  },
  {
    id: 'wish',
    question: '가장 바라는 것은?',
    options: [
      { value: 'price', label: '더 싼 가격', description: '지금은 5,000원' },
      { value: 'taste', label: '더 나은 맛', description: '메뉴를 다양하게' },
      { value: 'hours', label: '더 긴 운영 시간', description: '저녁 8시까지' },
    ],
  },
];

export const PC: Story = {
  render: function Render() {
    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const done = index === QUESTIONS.length;
    const current = QUESTIONS[Math.min(index, QUESTIONS.length - 1)];

    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
        <Card className="w-full max-w-lg">
          <Card.Header>
            <Card.Description>학생식당 만족도 조사 · 총학생회</Card.Description>
            <Progress
              value={(index / QUESTIONS.length) * 100}
              aria-label={`${QUESTIONS.length}문항 중 ${Math.min(index + 1, QUESTIONS.length)}번째`}
            />
          </Card.Header>

          {done ? (
            <Empty variant="soft">
              <Empty.Media>
                <CheckCircleIcon />
              </Empty.Media>
              <Empty.Title>답해 줘서 고마워요</Empty.Title>
              <Empty.Description>결과는 다음 주 월요일 게시판에 올라와요.</Empty.Description>
              <Empty.Actions>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIndex(0);
                    setAnswers({});
                  }}
                >
                  처음부터 다시
                </Button>
              </Empty.Actions>
            </Empty>
          ) : (
            <>
              <Card.Content className="flex flex-col gap-5">
                <p className="text-body-b3-semibold">
                  {index + 1} / {QUESTIONS.length}
                </p>
                <h1 id={`${current.id}-question`} className="text-headline-h4-bold">
                  {current.question}
                </h1>
                <RadioGroup<string>
                  key={current.id}
                  name={current.id}
                  value={answers[current.id] ?? null}
                  onValueChange={(value) => setAnswers({ ...answers, [current.id]: value })}
                  aria-labelledby={`${current.id}-question`}
                >
                  {({ Item: Radio }) => (
                    <div className="flex flex-col gap-2">
                      {current.options.map((option) => (
                        <Item
                          key={option.value}
                          variant="outline"
                          asChild
                          selected={answers[current.id] === option.value}
                        >
                          <label>
                            <Item.Content>
                              <Item.Title>{option.label}</Item.Title>
                              <Item.Description>{option.description}</Item.Description>
                            </Item.Content>
                            <Item.Actions>
                              <Radio value={option.value} />
                            </Item.Actions>
                          </label>
                        </Item>
                      ))}
                    </div>
                  )}
                </RadioGroup>
              </Card.Content>
              <Card.Footer className="justify-between border-t">
                <Button
                  variant="outline"
                  disabled={index === 0}
                  onClick={() => setIndex(index - 1)}
                >
                  <ArrowLeftIcon />
                  이전
                </Button>
                <Button disabled={!answers[current.id]} onClick={() => setIndex(index + 1)}>
                  {index === QUESTIONS.length - 1 ? '보내기' : '다음'}
                </Button>
              </Card.Footer>
            </>
          )}
        </Card>
      </main>
    );
  },
};
