import { useState } from 'react';

import { CalendarDaysIcon, MapPinIcon, ShareIcon, TicketIcon } from '@heroicons/react/24/outline';

import { IconButton } from '../../components/action/icon-button';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Accordion } from '../../components/data/accordion';
import { Avatar } from '../../components/data/avatar';
import { AvatarGroup } from '../../components/data/avatar-group';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';
import { Breadcrumb } from '../../components/navigation/breadcrumb';
import { Stepper } from '../../components/navigation/stepper';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Event/Detail',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const FACTS = [
  {
    id: 'when',
    label: '10월 16일 (목) – 17일 (금)',
    detail: '낮 1시부터 밤 9시까지',
    icon: <CalendarDaysIcon />,
  },
  { id: 'where', label: '학생회관 앞 광장', detail: '비가 오면 체육관', icon: <MapPinIcon /> },
  { id: 'fee', label: '무료', detail: '푸드 트럭은 학생증 할인', icon: <TicketIcon /> },
];

const SCHEDULE = [
  { time: '13:00', title: '개막과 부스 열기', description: '학생회관 앞 광장' },
  { time: '15:00', title: '동아리 공연', description: '야외 무대, 밴드부와 댄스 동아리' },
  { time: '18:00', title: '푸드 트럭', description: '광장 옆 주차장' },
  { time: '20:00', title: '불꽃놀이', description: '운동장에서 10분 동안' },
];

const FAQ = [
  {
    id: 'guests',
    question: '외부 사람도 올 수 있나요?',
    answer: '네, 누구나 올 수 있어요. 푸드 트럭만 학생증으로 할인돼요.',
  },
  {
    id: 'rain',
    question: '비가 오면 어떻게 되나요?',
    answer: '공연은 체육관으로 옮기고, 부스는 학생회관 1층에서 열어요.',
  },
  {
    id: 'parking',
    question: '주차할 수 있나요?',
    answer: '행사 날에는 캠퍼스 안에 차를 댈 수 없어요. 셔틀을 타 주세요.',
  },
];

const ATTENDEES = ['박서연', '이도윤', '최하준', '정예린', '한지우', '오세린', '윤태오'];

const ATTENDING_ALREADY = 213;

export const PC: Story = {
  render: function Render() {
    const [answer, setAnswer] = useState<string | null>(null);

    const count = ATTENDING_ALREADY + (answer === 'going' ? 1 : 0);

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <Breadcrumb aria-label="위치">
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#events">행사</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Page>가을 축제</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="flex flex-col gap-8">
            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge content="축제" variant="soft" colorScheme="primary" />
                <Badge content="D-15" variant="soft" colorScheme="warning" />
              </div>
              <h1 className="text-headline-h2-bold">2026 GIST 가을 축제</h1>
              <p className="text-body-b1-regular">
                부스 30곳, 동아리 공연, 푸드 트럭, 그리고 마지막 밤의 불꽃놀이까지. 이틀 동안
                캠퍼스가 한 무대가 돼요.
              </p>
            </header>

            <Card size="tiny">
              <Item.Group variant="bordered" aria-label="행사 정보">
                {FACTS.map((fact) => (
                  <Item key={fact.id}>
                    <Item.Media variant="soft">{fact.icon}</Item.Media>
                    <Item.Content>
                      <Item.Title>{fact.label}</Item.Title>
                      <Item.Description>{fact.detail}</Item.Description>
                    </Item.Content>
                  </Item>
                ))}
              </Item.Group>
            </Card>

            <section aria-labelledby="schedule" className="flex flex-col gap-4">
              <h2 id="schedule" className="text-headline-h5-bold">
                첫날 순서
              </h2>
              <Stepper progress={false} orientation="vertical" aria-label="첫날 순서">
                {SCHEDULE.map((step) => (
                  <Stepper.Item key={step.time}>
                    <Stepper.Title>
                      {step.time} {step.title}
                    </Stepper.Title>
                    <Stepper.Description>{step.description}</Stepper.Description>
                  </Stepper.Item>
                ))}
              </Stepper>
            </section>

            <section aria-labelledby="faq" className="flex flex-col gap-4">
              <h2 id="faq" className="text-headline-h5-bold">
                자주 묻는 질문
              </h2>
              <Accordion type="single" variant="outline">
                {FAQ.map((item) => (
                  <Accordion.Item key={item.id} value={item.id}>
                    <Accordion.Trigger>{item.question}</Accordion.Trigger>
                    <Accordion.Content>{item.answer}</Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </section>
          </article>

          <aside aria-label="참석" className="flex flex-col gap-4 lg:sticky lg:top-6">
            <Card>
              <Card.Header>
                <Card.Title asChild>
                  <h2>갈 건가요?</h2>
                </Card.Title>
                <Card.Description>
                  {answer === 'going'
                    ? '캘린더에 넣고 하루 전에 알려 드릴게요.'
                    : '참석한다고 하면 하루 전에 알려 드려요.'}
                </Card.Description>
                <Card.Action>
                  <IconButton
                    variant="outline"
                    size="tiny"
                    aria-label="공유"
                    icon={<ShareIcon />}
                    onClick={() => toast.success('주소를 복사했어요')}
                  />
                </Card.Action>
              </Card.Header>
              <Card.Content>
                <ToggleGroup
                  variant="outline"
                  aria-label="참석 여부"
                  value={answer}
                  onValueChange={setAnswer}
                  className="w-full"
                >
                  <Toggle value="going" className="flex-1">
                    갈게요
                  </Toggle>
                  <Toggle value="maybe" className="flex-1">
                    아마도
                  </Toggle>
                  <Toggle value="no" className="flex-1">
                    못 가요
                  </Toggle>
                </ToggleGroup>
              </Card.Content>
              <Card.Footer className="border-t">
                <AvatarGroup max={4} size="tiny" aria-label="참석하는 사람">
                  {ATTENDEES.map((name) => (
                    <Avatar key={name} name={name} />
                  ))}
                </AvatarGroup>
                {count}명이 가요
              </Card.Footer>
            </Card>

            <Card size="tiny">
              <Item>
                <Item.Media>
                  <Avatar name="총학생회" />
                </Item.Media>
                <Item.Content>
                  <Item.Title>총학생회</Item.Title>
                  <Item.Description>여는 곳 · 문의 student@gist.ac.kr</Item.Description>
                </Item.Content>
              </Item>
            </Card>
          </aside>
        </div>
      </main>
    );
  },
};
