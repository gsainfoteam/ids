import { useState } from 'react';

import { SparklesIcon } from '@heroicons/react/24/outline';

import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { ItemGroup } from '../../components/data/item-group';
import { Spinner } from '../../components/feedback/spinner';
import { Questionnaire } from '../../components/form/questionnaire';

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
    const [answers, setAnswers] = useState<Questionnaire.Answers | null>(null);

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

            {answers ? (
              <>
                <Card size="tiny">
                  <ItemGroup size="tiny" aria-label="고른 답">
                    {QUESTIONS.map((question) => {
                      const answer = answers[question.id];
                      const chosen = question.choices.find((choice) => choice.value === answer);

                      return (
                        <Item key={question.id}>
                          <Item.Content>
                            <Item.Description>{question.title}</Item.Description>
                            <Item.Title>{chosen?.label ?? answer ?? '건너뜀'}</Item.Title>
                          </Item.Content>
                        </Item>
                      );
                    })}
                  </ItemGroup>
                </Card>
                <p role="status" className="flex items-center gap-2">
                  <Spinner size="tiny" aria-hidden />
                  답을 바탕으로 계획을 세우는 중이에요
                </p>
              </>
            ) : (
              <Card>
                <Card.Content>
                  <Questionnaire submitLabel="계획 세우기" onComplete={setAnswers}>
                    {QUESTIONS.map((question) => (
                      <Questionnaire.Question key={question.id} name={question.id} optional>
                        {question.title}
                        <Questionnaire.Description>
                          {question.description}
                        </Questionnaire.Description>
                        {question.choices.map((choice) => (
                          <Questionnaire.Option
                            key={choice.value}
                            value={choice.value}
                            description={choice.description}
                          >
                            {choice.label}
                          </Questionnaire.Option>
                        ))}
                        <Questionnaire.Other placeholder="다른 답이 있으면 적어 주세요" />
                      </Questionnaire.Question>
                    ))}
                  </Questionnaire>
                </Card.Content>
              </Card>
            )}
          </div>
        </div>
      </main>
    );
  },
};
