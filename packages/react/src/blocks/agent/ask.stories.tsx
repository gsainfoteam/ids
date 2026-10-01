import { useState } from 'react';

import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Progress } from '../../components/feedback/progress';
import { Spinner } from '../../components/feedback/spinner';
import { Field } from '../../components/form/field';
import { RadioGroup } from '../../components/form/radio-group';
import { TextField } from '../../components/form/text-field';
import { Spacer } from '../../components/layout/spacer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Agent/Ask',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const QUESTIONS = [
  {
    id: 'size',
    title: '부스는 몇 칸을 쓸까요?',
    description: '한 칸은 가로 3미터, 세로 2미터예요.',
    choices: [
      { value: 'one', label: '한 칸', description: '굿즈 판매만 해요' },
      { value: 'two', label: '두 칸', description: '판매와 체험을 함께 해요' },
    ],
  },
  {
    id: 'people',
    title: '부스를 지킬 사람은 몇 명인가요?',
    description: '이틀 동안 시간을 나눠 짜 드릴게요.',
    choices: [
      { value: 'few', label: '4명 이하', description: '두 사람씩 번갈아요' },
      { value: 'many', label: '5명 이상', description: '세 사람씩 번갈아요' },
    ],
  },
  {
    id: 'budget',
    title: '예산은 어느 정도인가요?',
    description: '굿즈와 장식에 쓸 돈이에요.',
    choices: [
      { value: 'small', label: '20만 원 아래', description: '스티커와 엽서 위주' },
      { value: 'large', label: '20만 원 이상', description: '키링과 현수막까지' },
    ],
  },
];

export const PC: Story = {
  render: function Render() {
    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [other, setOther] = useState('');

    const done = index === QUESTIONS.length;
    const current = QUESTIONS[Math.min(index, QUESTIONS.length - 1)];
    const answer = answers[current.id];

    const next = () => {
      if (other.trim() !== '') setAnswers({ ...answers, [current.id]: other.trim() });
      setOther('');
      setIndex(index + 1);
    };

    const agent = (
      <Avatar name="행사 준비 도우미" size="tiny" aria-hidden>
        <Avatar.Fallback>
          <SparklesIcon />
        </Avatar.Fallback>
      </Avatar>
    );

    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex justify-end">
          <Card variant="soft" className="max-w-[80%]">
            <Card.Content>가을 축제 부스 준비 계획 세워 줘.</Card.Content>
          </Card>
        </div>

        <div className="flex gap-3">
          {agent}
          <div className="text-body-b2-regular flex min-w-0 flex-1 flex-col gap-4">
            <p>좋아요. 계획을 세우기 전에 세 가지만 물어볼게요.</p>

            {done ? (
              <>
                <Card size="tiny">
                  <Item.Group variant="bordered" size="tiny" aria-label="고른 답">
                    {QUESTIONS.map((question) => {
                      const chosen = question.choices.find(
                        (choice) => choice.value === answers[question.id],
                      );

                      return (
                        <Item key={question.id}>
                          <Item.Content>
                            <Item.Description>{question.title}</Item.Description>
                            <Item.Title>
                              {chosen?.label ?? answers[question.id] ?? '건너뜀'}
                            </Item.Title>
                          </Item.Content>
                        </Item>
                      );
                    })}
                  </Item.Group>
                </Card>
                <p role="status" className="flex items-center gap-2">
                  <Spinner size="tiny" decorative />
                  답을 바탕으로 계획을 세우는 중이에요
                </p>
              </>
            ) : (
              <Card>
                <Card.Header>
                  <Card.Description>
                    질문 {index + 1} / {QUESTIONS.length}
                  </Card.Description>
                  <Card.Title asChild>
                    <h2 id={`${current.id}-question`}>{current.title}</h2>
                  </Card.Title>
                  <Card.Description>{current.description}</Card.Description>
                </Card.Header>
                <Card.Content className="flex flex-col gap-4">
                  <Progress value={(index / QUESTIONS.length) * 100} aria-label="질문 진행" />
                  <RadioGroup<string>
                    key={current.id}
                    name={current.id}
                    value={answer ?? null}
                    onValueChange={(value) => {
                      setAnswers({ ...answers, [current.id]: value });
                      setOther('');
                    }}
                    aria-labelledby={`${current.id}-question`}
                  >
                    {({ Item: Radio }) => (
                      <div className="flex flex-col gap-2">
                        {current.choices.map((choice) => (
                          <Item
                            key={choice.value}
                            variant="outline"
                            asChild
                            selected={answer === choice.value}
                          >
                            <label>
                              <Item.Content>
                                <Item.Title>{choice.label}</Item.Title>
                                <Item.Description>{choice.description}</Item.Description>
                              </Item.Content>
                              <Item.Actions>
                                <Radio value={choice.value} />
                              </Item.Actions>
                            </label>
                          </Item>
                        ))}
                      </div>
                    )}
                  </RadioGroup>
                  <Field>
                    <Field.Label>직접 적기</Field.Label>
                    <TextField
                      value={other}
                      onValueChange={setOther}
                      placeholder="다른 답이 있으면 적어 주세요"
                    />
                  </Field>
                </Card.Content>
                <Card.Footer className="border-t">
                  <Button
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => setIndex(index - 1)}
                  >
                    <ArrowLeftIcon />
                    이전
                  </Button>
                  <Spacer />
                  <Button variant="outline" onClick={() => setIndex(index + 1)}>
                    건너뛰기
                  </Button>
                  <Button disabled={!answer && other.trim() === ''} onClick={next}>
                    {index === QUESTIONS.length - 1 ? '계획 세우기' : '다음'}
                  </Button>
                </Card.Footer>
              </Card>
            )}
          </div>
        </div>
      </main>
    );
  },
};
