import { useState } from 'react';

import { BellAlertIcon, MegaphoneIcon, SparklesIcon, TruckIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { Carousel } from '../../components/data/carousel';
import { Chip } from '../../components/data/chip';
import { toast } from '../../components/feedback/toast';
import { Switch } from '../../components/form/switch';
import { Stepper } from '../../components/navigation/stepper';
import { Label } from '../../components/typography/label';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Onboarding',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const FEATURES = [
  {
    id: 'board',
    icon: <MegaphoneIcon />,
    title: '공지를 놓치지 않아요',
    description:
      '학사, 장학, 행사 공지를 한곳에서 보고, 구독한 게시판에 글이 오면 바로 알려 드려요.',
  },
  {
    id: 'shuttle',
    icon: <TruckIcon />,
    title: '셔틀이 언제 오는지 알아요',
    description: '정류장마다 다음 셔틀까지 남은 시간을 보여 주고, 5분 전에 알려 드려요.',
  },
  {
    id: 'assistant',
    icon: <SparklesIcon />,
    title: '궁금한 건 GIST 도우미에게',
    description: '학식 메뉴, 도서관 시간, 셔틀 시간표를 물어보면 바로 답해요.',
  },
];

const BOARDS = ['학사', '장학', '행사', '모집', '동아리', '기숙사', '분실물', '자유'];

const ALERTS = [
  { id: 'notices', label: '구독한 게시판의 새 글', on: true },
  { id: 'shuttle', label: '셔틀 도착 5분 전', on: true },
  { id: 'comments', label: '내 글의 댓글', on: false },
];

const tile = cn(
  'grid size-14 place-items-center rounded-container bg-(--ids-color-secondary) text-(--ids-color-on-secondary) [&_svg]:size-7',
);

export const Default: Story = {
  render: function Render() {
    const [step, setStep] = useState(0);
    const [boards, setBoards] = useState<string[]>(['학사', '행사']);

    const toggleBoard = (board: string, selected: boolean) =>
      setBoards((current) =>
        selected ? [...current, board] : current.filter((item) => item !== board),
      );

    return (
      <main className="grid min-h-dvh place-items-center bg-(--ids-color-muted) px-4 py-10 break-keep">
        <Card className="w-full max-w-md">
          <Card.Header className="gap-4">
            <h1 className="sr-only">인포팀 시작하기</h1>
            <Stepper value={step} aria-label="시작 단계" size="tiny">
              <Stepper.Item>
                <Stepper.Title>둘러보기</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Title>관심 게시판</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Title>알림</Stepper.Title>
              </Stepper.Item>
            </Stepper>
          </Card.Header>

          <Card.Content>
            {step === 0 && (
              <Carousel aria-label="인포팀 서비스 소개" className="flex flex-col gap-4">
                <Carousel.Content>
                  {FEATURES.map((feature) => (
                    <Carousel.Slide
                      key={feature.id}
                      className="flex flex-col items-center gap-4 px-2 py-6 text-center"
                    >
                      <span aria-hidden className={tile}>
                        {feature.icon}
                      </span>
                      <h2 className="text-headline-h4-bold">{feature.title}</h2>
                      <p className="text-body-b2-regular text-(--ids-color-on-muted)">
                        {feature.description}
                      </p>
                    </Carousel.Slide>
                  ))}
                </Carousel.Content>
                <div className="flex items-center justify-center gap-3">
                  <Carousel.Prev variant="outline" />
                  <Carousel.Indicators />
                  <Carousel.Next variant="outline" />
                </div>
              </Carousel>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-headline-h4-bold">어떤 글을 받아 볼까요?</h2>
                  <p className="text-body-b2-regular text-(--ids-color-on-muted)">
                    나중에 설정에서 바꿀 수 있어요.
                  </p>
                </div>
                <ul aria-label="게시판" className="flex flex-wrap gap-2">
                  {BOARDS.map((board) => (
                    <li key={board}>
                      <Chip
                        selected={boards.includes(board)}
                        onSelectedChange={(selected) => toggleBoard(board, selected)}
                      >
                        {board}
                      </Chip>
                    </li>
                  ))}
                </ul>
                <p aria-live="polite" className="text-body-b3-medium text-(--ids-color-on-muted)">
                  {boards.length}개 골랐어요
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <span aria-hidden className={tile}>
                  <BellAlertIcon />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-headline-h4-bold">알림을 켤까요?</h2>
                  <p className="text-body-b2-regular text-(--ids-color-on-muted)">
                    중요한 것만 골라 보내요.
                  </p>
                </div>
                <ul className="flex flex-col divide-y divide-(--ids-color-border)">
                  {ALERTS.map((alert) => (
                    <li key={alert.id} className="py-3 first:pt-0 last:pb-0">
                      <Label className="text-body-b2-regular flex items-center justify-between gap-3">
                        {alert.label}
                        <Switch defaultChecked={alert.on} />
                      </Label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card.Content>

          <Card.Footer className="justify-between">
            <Button
              variant="outline"
              onClick={() => (step === 0 ? toast('나중에 다시 볼 수 있어요') : setStep(step - 1))}
            >
              {step === 0 ? '건너뛰기' : '이전'}
            </Button>
            <Button
              disabled={step === 1 && boards.length === 0}
              onClick={() => (step === 2 ? toast.success('준비를 마쳤어요') : setStep(step + 1))}
            >
              {step === 2 ? '시작하기' : '다음'}
            </Button>
          </Card.Footer>
        </Card>
      </main>
    );
  },
};
