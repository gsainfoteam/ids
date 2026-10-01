import { useState } from 'react';

import { ArrowRightIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Item } from '../../components/data/item';
import { Table } from '../../components/data/table';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Hero/Split',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const POINTS = [
  '학식, 셔틀, 학사 일정을 한 번에',
  '공지 속 날짜는 캘린더로 바로',
  '밤 11시에도 답하는 도우미',
];

const ANSWERS = [
  {
    question: '오늘 학식 뭐야?',
    answer: '오늘(10월 1일) 학생식당 점심이에요.',
    source: '학생식당 주간 메뉴표',
  },
  {
    question: '막차 몇 시야?',
    answer: '평일 광주송정역행 막차는 밤 9시, 주말은 8시예요.',
    source: '2학기 셔틀 시간표 공지',
  },
  {
    question: '수강 정정 언제까지야?',
    answer: '10월 2일 목요일 저녁 6시까지예요. 그 뒤로는 취소만 돼요.',
    source: '학사팀 수강 정정 안내',
  },
];

const MENU = [
  { corner: '한식', dishes: '제육볶음, 된장찌개' },
  { corner: '양식', dishes: '크림 파스타' },
  { corner: '분식', dishes: '참치김밥, 라면' },
];

export const PC: Story = {
  render: function Render() {
    const [index, setIndex] = useState(0);

    const current = ANSWERS[index];

    return (
      <main className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 break-keep sm:px-6 md:py-28 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h1 className="text-headline-h1-bold">물어보면 바로 답하는 GIST 도우미</h1>
          <p className="text-body-b1-regular">
            학교 공지와 시간표를 읽어 두었다가, 궁금한 걸 물으면 출처와 함께 알려 줘요.
          </p>
          <Item.Group size="tiny" dense aria-label="도우미가 하는 일">
            {POINTS.map((point) => (
              <Item key={point}>
                <Item.Media variant="soft">
                  <CheckIcon />
                </Item.Media>
                <Item.Content>
                  <Item.Title>{point}</Item.Title>
                </Item.Content>
              </Item>
            ))}
          </Item.Group>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="#assistant">
                도우미에게 물어보기
                <ArrowRightIcon />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="#about">어떻게 답하나요?</a>
            </Button>
          </div>
        </div>

        <Card variant="soft">
          <div role="group" aria-label="예시 질문" className="flex flex-wrap gap-2">
            {ANSWERS.map((option, optionIndex) => (
              <Chip
                key={option.question}
                selected={optionIndex === index}
                onSelectedChange={() => setIndex(optionIndex)}
              >
                {option.question}
              </Chip>
            ))}
          </div>
          <Card>
            <Card.Header>
              <Avatar name="GIST 도우미" size="tiny" aria-hidden>
                <Avatar.Fallback>
                  <SparklesIcon />
                </Avatar.Fallback>
              </Avatar>
              <Card.Title>{current.question}</Card.Title>
              <Card.Description>{current.answer}</Card.Description>
            </Card.Header>
            {index === 0 && (
              <Card.Content>
                <Table aria-label="오늘 점심 메뉴" size="tiny">
                  <Table.Body>
                    {MENU.map((row) => (
                      <Table.Row key={row.corner}>
                        <Table.Cell>{row.corner}</Table.Cell>
                        <Table.Cell>{row.dishes}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Card.Content>
            )}
            <Card.Footer className="border-t">출처 · {current.source}</Card.Footer>
          </Card>
        </Card>
      </main>
    );
  },
};
