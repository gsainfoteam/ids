import { useState } from 'react';

import {
  CalendarDaysIcon,
  ClockIcon,
  LinkIcon,
  MapPinIcon,
  ShareIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Accordion } from '../../components/data/accordion';
import { Avatar } from '../../components/data/avatar';
import { AvatarGroup } from '../../components/data/avatar-group';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Image } from '../../components/data/image';
import { Progress } from '../../components/feedback/progress';
import { toast } from '../../components/feedback/toast';
import { Stepper } from '../../components/navigation/stepper';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/PC/EventDetail',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function poster(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600"><defs><radialGradient id="glow" cx="0.7" cy="0.3" r="0.8"><stop offset="0" stop-color="hsl(${(hue + 40) % 360} 90% 70%)"/><stop offset="1" stop-color="hsl(${hue} 70% 30%)"/></radialGradient></defs><rect width="1200" height="600" fill="url(#glow)"/><g fill="hsl(${hue} 90% 88% / 0.35)"><circle cx="180" cy="140" r="90"/><circle cx="980" cy="460" r="140"/><circle cx="620" cy="80" r="40"/></g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SCHEDULE = [
  { time: '13:00', title: '개막과 부스 열기', description: '학생회관 앞 광장' },
  { time: '15:00', title: '동아리 공연', description: '야외 무대, 밴드부와 댄스 동아리' },
  { time: '18:00', title: '푸드 트럭', description: '광장 옆 주차장' },
  { time: '20:00', title: '불꽃놀이', description: '운동장에서 10분 동안' },
];

const FAQ = [
  {
    id: 'fee',
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

const fact = cn(
  'flex items-start gap-3 text-body-b2-regular [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-(--ids-color-on-muted)',
);

export const Default: Story = {
  render: function Render() {
    const [answer, setAnswer] = useState<string | null>(null);

    const going = answer === 'going';

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 break-keep sm:px-6 lg:py-10">
        <Image
          src={poster(275)}
          alt="보랏빛 조명이 번지는 가을 축제 포스터"
          ratio={2}
          className="rounded-container"
        />

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
          <article className="flex flex-col gap-8">
            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge content="축제" variant="soft" colorScheme="primary" />
                <Badge content="무료" variant="soft" colorScheme="success" />
              </div>
              <h1 className="text-headline-h2-bold">2026 GIST 가을 축제</h1>
              <p className="text-body-b1-regular text-(--ids-color-on-muted)">
                부스 30곳, 동아리 공연, 푸드 트럭, 그리고 마지막 밤의 불꽃놀이까지. 이틀 동안
                캠퍼스가 한 무대가 돼요.
              </p>
            </header>

            <section aria-labelledby="schedule" className="flex flex-col gap-4">
              <h2 id="schedule" className="text-headline-h5-bold">
                첫째 날 순서
              </h2>
              <Stepper progress={false} orientation="vertical" aria-label="첫째 날 순서">
                {SCHEDULE.map(({ time, title, description }) => (
                  <Stepper.Item key={time}>
                    <Stepper.Title>
                      {time} {title}
                    </Stepper.Title>
                    <Stepper.Description>{description}</Stepper.Description>
                  </Stepper.Item>
                ))}
              </Stepper>
            </section>

            <section aria-labelledby="faq" className="flex flex-col gap-4">
              <h2 id="faq" className="text-headline-h5-bold">
                자주 묻는 질문
              </h2>
              <Accordion type="single" variant="outline">
                {FAQ.map(({ id, question, answer: reply }) => (
                  <Accordion.Item key={id} value={id}>
                    <Accordion.Trigger>{question}</Accordion.Trigger>
                    <Accordion.Content>{reply}</Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </section>
          </article>

          <aside aria-label="참가 신청" className="flex flex-col gap-4 lg:sticky lg:top-6">
            <Card>
              <Card.Content className="flex flex-col gap-4">
                <p className={fact}>
                  <CalendarDaysIcon aria-hidden />
                  10월 16일 금요일부터 17일 토요일까지
                </p>
                <p className={fact}>
                  <ClockIcon aria-hidden />
                  매일 13:00부터 21:00까지
                </p>
                <p className={fact}>
                  <MapPinIcon aria-hidden />
                  학생회관 앞 광장과 운동장
                </p>
                <p className={fact}>
                  <TicketIcon aria-hidden />
                  무료, 푸드 트럭은 학생증 할인
                </p>
              </Card.Content>
              <Card.Footer className="flex-col items-stretch gap-3">
                <p className="text-body-b3-semibold">참석하나요?</p>
                <ToggleGroup
                  variant="outline"
                  aria-label="참석 여부"
                  value={answer}
                  onValueChange={(next) => {
                    setAnswer(next);
                    if (next === 'going')
                      toast.success('참석으로 알렸어요', {
                        description: '전날 알림을 보내 드릴게요.',
                      });
                  }}
                  className="grid grid-cols-3"
                >
                  <Toggle value="going" variant="outline">
                    참석
                  </Toggle>
                  <Toggle value="maybe" variant="outline">
                    아마도
                  </Toggle>
                  <Toggle value="not-going" variant="outline">
                    불참
                  </Toggle>
                </ToggleGroup>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex-1">
                    <CalendarDaysIcon />
                    캘린더에 넣기
                  </Button>
                  <IconButton variant="outline" aria-label="주소 복사" icon={<LinkIcon />} />
                  <IconButton variant="outline" aria-label="공유" icon={<ShareIcon />} />
                </div>
              </Card.Footer>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>참석자</Card.Title>
                <Card.Description>{going ? 213 : 212}명이 가요</Card.Description>
              </Card.Header>
              <Card.Content className="flex flex-col gap-3">
                <AvatarGroup aria-label={`참석자 ${going ? 213 : 212}명`} max={6}>
                  {ATTENDEES.map((name) => (
                    <Avatar key={name} name={name} />
                  ))}
                </AvatarGroup>
                <Progress value={going ? 71 : 70}>
                  <Progress.Label>자원봉사자 모집</Progress.Label>
                  <Progress.Value />
                </Progress>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>주최</Card.Title>
              </Card.Header>
              <Card.Content className="flex items-center gap-3">
                <Avatar name="총학생회" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-body-b2-semibold">제15대 총학생회</span>
                  <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                    행사 42개를 열었어요
                  </span>
                </div>
                <Button variant="soft" size="tiny">
                  구독
                </Button>
              </Card.Content>
            </Card>
          </aside>
        </div>
      </main>
    );
  },
};
