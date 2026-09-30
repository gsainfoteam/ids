import { useState, type ReactNode } from 'react';

import {
  BellAlertIcon,
  BookmarkIcon,
  CheckIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Progress } from '../../components/feedback/progress';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Onboarding/Checklist',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const TASKS: { id: string; title: string; description: string; action: string; icon: ReactNode }[] =
  [
    {
      id: 'profile',
      title: '프로필 채우기',
      description: '사진과 학과를 넣으면 동아리 사람들이 알아봐요.',
      action: '채우기',
      icon: <UserCircleIcon />,
    },
    {
      id: 'boards',
      title: '게시판 구독하기',
      description: '학사, 장학, 행사 중 궁금한 곳을 골라요.',
      action: '고르기',
      icon: <BookmarkIcon />,
    },
    {
      id: 'alerts',
      title: '알림 켜기',
      description: '셔틀 도착과 댓글을 놓치지 않아요.',
      action: '켜기',
      icon: <BellAlertIcon />,
    },
    {
      id: 'app',
      title: '앱 설치하기',
      description: 'QR 로그인과 도서관 출입을 휴대폰으로 해요.',
      action: '설치',
      icon: <DevicePhoneMobileIcon />,
    },
    {
      id: 'assistant',
      title: 'GIST 도우미에게 물어보기',
      description: '"오늘 학식 뭐야?" 처럼 물어보세요.',
      action: '물어보기',
      icon: <SparklesIcon />,
    },
  ];

export const PC: Story = {
  render: function Render() {
    const [finished, setFinished] = useState<string[]>(['profile', 'boards']);

    const percent = Math.round((finished.length / TASKS.length) * 100);

    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-h3-bold">지수님, 반가워요</h1>
          <p className="text-body-b2-regular">
            몇 가지만 해 두면 인포팀을 훨씬 편하게 쓸 수 있어요.
          </p>
        </div>

        <Card>
          <Card.Header>
            <Card.Title asChild>
              <h2>시작하기</h2>
            </Card.Title>
            <Card.Description>
              {TASKS.length}개 중 {finished.length}개 했어요
            </Card.Description>
            <Card.Action>
              <Badge content={`${percent}%`} variant="soft" colorScheme="primary" />
            </Card.Action>
          </Card.Header>
          <Card.Content>
            <Progress value={percent} aria-label="시작하기 진행" />
          </Card.Content>
          <Item.Group variant="bordered" aria-label="할 일">
            {TASKS.map((task) => {
              const done = finished.includes(task.id);

              return (
                <Item key={task.id}>
                  <Item.Media variant={done ? 'soft' : 'outline'}>
                    {done ? <CheckIcon /> : task.icon}
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{task.title}</Item.Title>
                    <Item.Description>{task.description}</Item.Description>
                  </Item.Content>
                  <Item.Actions>
                    {done ? (
                      <Badge content="했어요" variant="soft" colorScheme="success" />
                    ) : (
                      <Button
                        variant="soft"
                        size="tiny"
                        aria-label={`${task.title}: ${task.action}`}
                        onClick={() => setFinished([...finished, task.id])}
                      >
                        {task.action}
                      </Button>
                    )}
                  </Item.Actions>
                </Item>
              );
            })}
          </Item.Group>
        </Card>

        <Card variant="soft" size="tiny">
          <Item>
            <Item.Media>
              <Avatar name="GIST 도우미" aria-hidden>
                <Avatar.Fallback>
                  <SparklesIcon />
                </Avatar.Fallback>
              </Avatar>
            </Item.Media>
            <Item.Content>
              <Item.Title>막히는 게 있나요?</Item.Title>
              <Item.Description>GIST 도우미에게 물어보면 바로 알려 드려요.</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Button variant="outline" size="tiny">
                물어보기
              </Button>
            </Item.Actions>
          </Item>
        </Card>
      </main>
    );
  },
};
