import { useState } from 'react';

import {
  CheckIcon,
  ClockIcon,
  HandRaisedIcon,
  LinkIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { Progress } from '../../components/feedback/progress';
import { toast } from '../../components/feedback/toast';
import { Divider } from '../../components/layout/divider';
import { Breadcrumb } from '../../components/navigation/breadcrumb';
import { Stepper } from '../../components/navigation/stepper';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/PC/Petition',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const GOAL = 500;

const SIGNED = 412;

const VOICES = [
  {
    name: '박서연',
    text: '밤 11시에 실험 끝나고 기숙사까지 걸어가기 무서웠어요. 꼭 생기면 좋겠어요.',
    time: '1시간 전',
  },
  { name: '이도윤', text: '주말 막차도 30분만 늦춰 주세요.', time: '3시간 전' },
  { name: '정예린', text: '동의합니다!', time: '어제' },
];

const RELATED = [
  { id: 'rel-1', title: '도서관 열람실 24시간 개방', signed: 1204, answered: true },
  { id: 'rel-2', title: '학생식당 주말 저녁 운영', signed: 386, answered: false },
];

const count = new Intl.NumberFormat('ko-KR');

export const Default: Story = {
  render: function Render() {
    const [signed, setSigned] = useState(false);

    const total = SIGNED + (signed ? 1 : 0);

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-10">
        <Breadcrumb aria-label="위치">
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#petitions">청원</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Page>셔틀 막차 연장</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
          <article className="flex flex-col gap-6">
            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge content="교통" variant="soft" colorScheme="neutral" />
                <Badge content="진행 중" variant="soft" colorScheme="primary" />
              </div>
              <h1 className="text-headline-h2-bold">
                평일 셔틀 막차를 밤 11시 30분으로 늦춰 주세요
              </h1>
              <div className="text-body-b3-regular flex items-center gap-2 text-(--ids-color-on-muted)">
                <Avatar name="한지우" size="tiny" />
                한지우 · 9월 21일에 시작
              </div>
            </header>

            <div className="text-body-b1-regular flex flex-col gap-4">
              <p>
                지금 평일 셔틀 막차는 밤 9시예요. 실험과 스터디가 늦게 끝나는 날이 많은데, 그 뒤로는
                광주송정역과 기숙사 사이를 오갈 방법이 택시뿐이에요.
              </p>
              <p>막차를 밤 11시 30분으로 늦추고, 9시 이후에는 한 시간에 한 번만 다녀도 좋겠어요.</p>
            </div>

            <section aria-labelledby="progress-of-petition" className="flex flex-col gap-4">
              <h2 id="progress-of-petition" className="text-headline-h5-bold">
                진행 상황
              </h2>
              <Stepper value={1} aria-label="청원 진행 상황">
                <Stepper.Item>
                  <Stepper.Title>동의 모으기</Stepper.Title>
                </Stepper.Item>
                <Stepper.Item>
                  <Stepper.Title>총학생회 검토</Stepper.Title>
                </Stepper.Item>
                <Stepper.Item>
                  <Stepper.Title>답변</Stepper.Title>
                </Stepper.Item>
              </Stepper>
              <Empty variant="soft" size="tiny">
                <Empty.Media>
                  <ClockIcon />
                </Empty.Media>
                <Empty.Title>아직 답변이 없어요</Empty.Title>
                <Empty.Description>
                  500명이 동의하면 총학생회가 한 달 안에 답해요.
                </Empty.Description>
              </Empty>
            </section>

            <Divider />

            <section aria-labelledby="voices" className="flex flex-col gap-4">
              <h2 id="voices" className="text-headline-h5-bold">
                동의한 사람들의 말
              </h2>
              <ul className="flex flex-col gap-5">
                {VOICES.map((voice) => (
                  <li key={voice.name} className="flex gap-3">
                    <Avatar name={voice.name} size="tiny" />
                    <div className="flex flex-col gap-1">
                      <p className="flex items-center gap-2">
                        <span className="text-body-b3-semibold">{voice.name}</span>
                        <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                          {voice.time}
                        </span>
                      </p>
                      <p className="text-body-b2-regular">{voice.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </article>

          <aside aria-label="동의하기" className="flex flex-col gap-4 lg:sticky lg:top-6">
            <Card>
              <Card.Header>
                <Card.Title asChild>
                  <p className="text-headline-h3-bold tabular-nums">{count.format(total)}명</p>
                </Card.Title>
                <Card.Description>
                  목표 {count.format(GOAL)}명까지 {count.format(GOAL - total)}명 남았어요
                </Card.Description>
              </Card.Header>
              <Card.Content className="flex flex-col gap-4">
                <Progress value={(total / GOAL) * 100} aria-label="목표 대비 동의" />
                <div className="text-body-b3-regular flex flex-col gap-2 text-(--ids-color-on-muted)">
                  <p className="flex items-center gap-1.5">
                    <ClockIcon aria-hidden className="size-4" />
                    10월 21일까지, 20일 남음
                  </p>
                  <p className="flex items-center gap-1.5">
                    <UsersIcon aria-hidden className="size-4" />
                    오늘 38명이 동의했어요
                  </p>
                </div>
              </Card.Content>
              <Card.Footer className="gap-2">
                <Button
                  variant={signed ? 'soft' : 'solid'}
                  className="flex-1"
                  onClick={() => {
                    setSigned(!signed);
                    if (!signed)
                      toast.success('동의했어요', { description: '답변이 나오면 알려 드릴게요.' });
                  }}
                >
                  {signed ? <CheckIcon /> : <HandRaisedIcon />}
                  {signed ? '동의했어요' : '동의하기'}
                </Button>
                <IconButton
                  variant="outline"
                  aria-label="주소 복사"
                  icon={<LinkIcon />}
                  onClick={() => toast.success('주소를 복사했어요')}
                />
              </Card.Footer>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>비슷한 청원</Card.Title>
              </Card.Header>
              <Item.Group variant="bordered" size="tiny" aria-label="비슷한 청원">
                {RELATED.map((petition) => (
                  <Item key={petition.id} asChild>
                    <a href={`#${petition.id}`}>
                      <Item.Content>
                        <Item.Title>{petition.title}</Item.Title>
                        <Item.Description>{count.format(petition.signed)}명 동의</Item.Description>
                      </Item.Content>
                      <Item.Actions>
                        <Badge
                          content={petition.answered ? '답변 완료' : '진행 중'}
                          variant="soft"
                          colorScheme={petition.answered ? 'success' : 'primary'}
                        />
                      </Item.Actions>
                    </a>
                  </Item>
                ))}
              </Item.Group>
            </Card>
          </aside>
        </div>
      </main>
    );
  },
};
