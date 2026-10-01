import {
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Alert } from '../../components/feedback/alert';
import { Progress } from '../../components/feedback/progress';
import { Spinner } from '../../components/feedback/spinner';
import { toast } from '../../components/feedback/toast';
import { Tabs } from '../../components/navigation/tabs';
import { Menu } from '../../components/overlay/menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Agent/Queue',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type State = 'running' | 'waiting' | 'done';

const STATES: { value: State; label: string }[] = [
  { value: 'running', label: '하는 중' },
  { value: 'waiting', label: '기다리는 중' },
  { value: 'done', label: '끝남' },
];

const JOBS: {
  id: string;
  state: State;
  title: string;
  agent: string;
  detail: string;
  progress?: number;
  needsApproval?: boolean;
  failed?: boolean;
}[] = [
  {
    id: 'j1',
    state: 'running',
    title: '다음 학기 시간표 3안 짜기',
    agent: '시간표 도우미',
    detail: '2분 전 시작 · 도구 6번',
    progress: 64,
  },
  {
    id: 'j2',
    state: 'running',
    title: '가을 축제 부스 운영 계획',
    agent: '행사 준비 도우미',
    detail: '8분 전 시작 · 도구 11번',
    progress: 32,
  },
  {
    id: 'j3',
    state: 'waiting',
    title: '수강 바구니에 3과목 담기',
    agent: '시간표 도우미',
    detail: '승인을 기다려요',
    needsApproval: true,
  },
  {
    id: 'j4',
    state: 'waiting',
    title: '세미나실 10월 16일 예약',
    agent: '행사 준비 도우미',
    detail: '승인을 기다려요',
    needsApproval: true,
  },
  {
    id: 'j5',
    state: 'waiting',
    title: '논문 세 편 요약',
    agent: '연구 도우미',
    detail: '앞의 작업이 끝나면 시작해요',
  },
  {
    id: 'j6',
    state: 'done',
    title: '중간고사 기출 정리',
    agent: '공부 도우미',
    detail: '어제 · 4분 걸림',
  },
  {
    id: 'j7',
    state: 'done',
    title: '동아리 예산 표 만들기',
    agent: '행사 준비 도우미',
    detail: '어제 · 도구 호출에서 멈춤',
    failed: true,
  },
];

const waitingForApproval = JOBS.filter((job) => job.needsApproval).length;

export const PC: Story = {
  render: () => (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-h3-bold">에이전트 작업</h1>
          <p className="text-body-b2-regular">
            에이전트가 맡은 일을 한곳에서 보고 멈추거나 승인해요.
          </p>
        </div>
        <Button>
          <PlusIcon />새 작업
        </Button>
      </div>

      <Alert colorScheme="warning">
        <Alert.Title>승인을 기다리는 작업이 {waitingForApproval}개 있어요</Alert.Title>
        <Alert.Description>승인할 때까지 그 작업은 멈춰 있어요.</Alert.Description>
      </Alert>

      <Tabs defaultValue="running" className="flex flex-col gap-6">
        <Tabs.List aria-label="작업 상태">
          {STATES.map((state) => (
            <Tabs.Trigger key={state.value} value={state.value}>
              {state.label} {JOBS.filter((job) => job.state === state.value).length}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {STATES.map((state) => (
          <Tabs.Content key={state.value} value={state.value}>
            <Card size="tiny">
              <Item.Group variant="bordered" aria-label={`${state.label} 작업`}>
                {JOBS.filter((job) => job.state === state.value).map((job) => (
                  <Item key={job.id}>
                    <Item.Media variant="soft">
                      {job.state === 'running' ? (
                        <Spinner size="tiny" decorative />
                      ) : job.failed ? (
                        <ExclamationTriangleIcon />
                      ) : job.state === 'done' ? (
                        <CheckCircleIcon />
                      ) : (
                        <QueueListIcon />
                      )}
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>
                        {job.title}
                        {job.failed && <Badge content="멈춤" variant="soft" colorScheme="danger" />}
                      </Item.Title>
                      <Item.Description>
                        {job.agent} · {job.detail}
                      </Item.Description>
                      {job.progress !== undefined && (
                        <Progress value={job.progress} aria-label={`${job.title} 진행`} />
                      )}
                    </Item.Content>
                    <Item.Actions>
                      {job.needsApproval && (
                        <Button
                          size="tiny"
                          aria-label={`${job.title} 승인`}
                          onClick={() => toast.success(`${job.title}를 승인했어요`)}
                        >
                          승인
                        </Button>
                      )}
                      <Menu>
                        <Menu.Trigger asChild>
                          <IconButton
                            variant="outline"
                            size="tiny"
                            aria-label={`${job.title} 메뉴`}
                            icon={<EllipsisHorizontalIcon />}
                          />
                        </Menu.Trigger>
                        <Menu.Content>
                          <Menu.Item>실행 기록 보기</Menu.Item>
                          {job.state === 'done' ? (
                            <Menu.Item>다시 실행</Menu.Item>
                          ) : (
                            <Menu.Item>멈추기</Menu.Item>
                          )}
                        </Menu.Content>
                      </Menu>
                    </Item.Actions>
                  </Item>
                ))}
              </Item.Group>
            </Card>
          </Tabs.Content>
        ))}
      </Tabs>
    </main>
  ),
};
