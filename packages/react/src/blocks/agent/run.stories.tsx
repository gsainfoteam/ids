import { useState, type FormEvent } from 'react';

import {
  ArrowDownTrayIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ScaleIcon,
  StopIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Accordion } from '../../components/data/accordion';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Table } from '../../components/data/table';
import { Alert } from '../../components/feedback/alert';
import { Progress } from '../../components/feedback/progress';
import { Spinner } from '../../components/feedback/spinner';
import { toast } from '../../components/feedback/toast';
import { TextArea } from '../../components/form/text-area';
import { Divider } from '../../components/layout/divider';
import { Spacer } from '../../components/layout/spacer';
import { Breadcrumb } from '../../components/navigation/breadcrumb';
import { Stepper } from '../../components/navigation/stepper';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Agent/Run',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const PLAN = [
  { title: '요청 이해하기', description: '비울 시간과 꼭 넣을 과목' },
  { title: '성적표 읽기', description: '들은 과목 31개' },
  { title: '개설 과목 찾기', description: '2학기 38과목' },
  { title: '시간표 3안 만들기', description: '겹치는 시간 빼고 맞추기' },
  { title: '결과 정리하기', description: '세 안을 견주는 표' },
];

const MAKING_TIMETABLES = 3;

const DRAFT = [
  { course: '운영체제', time: '화, 목 13:00' },
  { course: '컴퓨터 구조', time: '월, 수 10:30' },
  { course: '소프트웨어 공학', time: '목 15:00' },
  { course: '과학 글쓰기', time: '금 10:30' },
];

const TOOLS = [
  { name: '성적표 읽기', approval: false },
  { name: '학사 시스템 찾기', approval: false },
  { name: '수강 바구니에 담기', approval: true },
];

type Decision = 'pending' | 'approved' | 'skipped';

export const PC: Story = {
  render: function Render() {
    const [decision, setDecision] = useState<Decision>('pending');
    const [draft, setDraft] = useState('');

    const instruct = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast('에이전트에게 전했어요', { description: draft });
      setDraft('');
    };

    return (
      <div className="flex min-h-dvh flex-col break-keep">
        <header className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Breadcrumb aria-label="위치">
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#agents">에이전트</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#timetable-agent">시간표 도우미</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>실행 #128</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb>
          <Spacer />
          <Badge content="실행 중" variant="soft" colorScheme="info" />
          <Button variant="outline" size="tiny" onClick={() => toast('실행을 멈췄어요')}>
            <StopIcon />
            멈추기
          </Button>
        </header>
        <Divider />

        <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-5">
            <Item variant="soft">
              <Item.Media>
                <Avatar name="김지수" size="tiny" />
              </Item.Media>
              <Item.Content>
                <Item.Title>김지수의 요청 · 2분 전</Item.Title>
                <Item.Description>
                  다음 학기 시간표를 3안으로 짜 줘. 화요일 오전은 비우고, 남은 전공 필수를 먼저 넣어
                  줘.
                </Item.Description>
              </Item.Content>
            </Item>

            <ol aria-label="실행 기록" className="text-body-b2-regular flex flex-col gap-3">
              <li>
                <Item size="tiny">
                  <Item.Media>
                    <CheckCircleIcon />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>성적표_2026-1.pdf 를 읽었어요</Item.Title>
                    <Item.Description>0:12 · 들은 과목 31개, 이수 학점 98</Item.Description>
                  </Item.Content>
                </Item>
              </li>
              <li>
                <Accordion type="single" variant="soft">
                  <Accordion.Item value="course-search">
                    <Accordion.Trigger>
                      학사 시스템에서 2학기 개설 과목을 찾았어요{' '}
                      <Badge content="38과목" variant="soft" colorScheme="success" />
                    </Accordion.Trigger>
                    <Accordion.Content>
                      <Table aria-label="학사 시스템 찾기에 넘긴 값" size="tiny">
                        <Table.Header>
                          <Table.Row>
                            <Table.Head>값</Table.Head>
                            <Table.Head>내용</Table.Head>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          <Table.Row>
                            <Table.Cell>학기</Table.Cell>
                            <Table.Cell>2026학년도 2학기</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>학과</Table.Cell>
                            <Table.Cell>전기전자컴퓨터공학과, 기초교육학부</Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion>
              </li>
              <li>
                <Item size="tiny">
                  <Item.Media>
                    <ScaleIcon />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>졸업 요건과 견줬어요</Item.Title>
                    <Item.Description>1:30 · 남은 전공 필수 3과목, 교양 6학점</Item.Description>
                  </Item.Content>
                </Item>
              </li>
              <li>
                {decision === 'pending' ? (
                  <Alert colorScheme="warning">
                    <Alert.Title>수강 바구니에 전공 필수 3과목을 담을까요?</Alert.Title>
                    <Alert.Description>
                      운영체제, 컴퓨터 구조, 소프트웨어 공학. 담은 과목은 수강신청 날 아침 9시에
                      먼저 신청돼요.
                    </Alert.Description>
                    <Alert.Actions>
                      <Button size="tiny" onClick={() => setDecision('approved')}>
                        담기
                      </Button>
                      <Button variant="outline" size="tiny" onClick={() => setDecision('skipped')}>
                        담지 않기
                      </Button>
                    </Alert.Actions>
                  </Alert>
                ) : (
                  <Alert colorScheme={decision === 'approved' ? 'success' : 'neutral'}>
                    <Alert.Title>
                      {decision === 'approved'
                        ? '수강 바구니에 3과목을 담았어요'
                        : '담지 않고 넘어갔어요'}
                    </Alert.Title>
                  </Alert>
                )}
              </li>
              <li>
                <p role="status" className="text-body-b3-regular flex items-center gap-2 px-2">
                  <Spinner size="tiny" decorative />
                  시간표 3안을 만드는 중이에요 · 2:05
                </p>
              </li>
            </ol>

            <Card>
              <Card.Header>
                <Card.Description>결과물 · 초안</Card.Description>
                <Card.Title asChild>
                  <h2>시간표 1안</h2>
                </Card.Title>
                <Card.Action>
                  <IconButton
                    variant="outline"
                    size="tiny"
                    aria-label="시간표 1안 내려받기"
                    icon={<ArrowDownTrayIcon />}
                  />
                </Card.Action>
              </Card.Header>
              <Card.Content>
                <Table aria-label="시간표 1안" size="tiny">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>과목</Table.Head>
                      <Table.Head>시간</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {DRAFT.map((row) => (
                      <Table.Row key={row.course}>
                        <Table.Cell>{row.course}</Table.Cell>
                        <Table.Cell>{row.time}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Card.Content>
              <Card.Footer className="border-t">
                <Item variant="outline" size="tiny" className="w-auto">
                  <Item.Media variant="soft">
                    <DocumentTextIcon />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>시간표_1안.pdf</Item.Title>
                    <Item.Description>12학점 · 화요일 오전 비움</Item.Description>
                  </Item.Content>
                </Item>
              </Card.Footer>
            </Card>

            <form onSubmit={instruct}>
              <TextArea
                aria-label="에이전트에게 더 말하기"
                placeholder="에이전트에게 더 말하기"
                rows={1}
                maxRows={6}
                value={draft}
                onValueChange={setDraft}
              >
                <TextArea.Input />
                <Spacer />
                <IconButton
                  type="submit"
                  variant="solid"
                  size="tiny"
                  aria-label="보내기"
                  icon={<ArrowUpIcon />}
                  disabled={draft.trim() === ''}
                />
              </TextArea>
            </form>
          </div>

          <aside
            aria-label="실행 정보"
            className="order-first flex flex-col gap-4 lg:sticky lg:top-6 lg:order-none"
          >
            <Card>
              <Card.Header>
                <Card.Title asChild>
                  <h2>계획</h2>
                </Card.Title>
                <Card.Description>
                  {PLAN.length}단계 중 {MAKING_TIMETABLES + 1}단계
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <Stepper
                  value={MAKING_TIMETABLES}
                  orientation="vertical"
                  size="tiny"
                  aria-label="계획"
                >
                  {PLAN.map((step) => (
                    <Stepper.Item key={step.title}>
                      <Stepper.Title>{step.title}</Stepper.Title>
                      <Stepper.Description>{step.description}</Stepper.Description>
                    </Stepper.Item>
                  ))}
                </Stepper>
              </Card.Content>
            </Card>

            <Card size="tiny">
              <Card.Header>
                <Card.Title asChild>
                  <h2>이번 실행</h2>
                </Card.Title>
                <Card.Description>깊게 생각하는 모델 · 2분 5초 · 도구 6번</Card.Description>
              </Card.Header>
              <Card.Content>
                <Progress value={41}>
                  <Progress.Label>문맥 82K / 200K</Progress.Label>
                  <Progress.Value />
                </Progress>
              </Card.Content>
            </Card>

            <Card size="tiny">
              <Card.Header>
                <Card.Title asChild>
                  <h2>쓸 수 있는 도구</h2>
                </Card.Title>
              </Card.Header>
              <Item.Group size="tiny" aria-label="쓸 수 있는 도구">
                {TOOLS.map((tool) => (
                  <Item key={tool.name}>
                    <Item.Content>
                      <Item.Title>{tool.name}</Item.Title>
                    </Item.Content>
                    <Item.Actions>
                      <Badge
                        content={tool.approval ? '물어보고 써요' : '바로 써요'}
                        variant="soft"
                        colorScheme={tool.approval ? 'warning' : 'neutral'}
                      />
                    </Item.Actions>
                  </Item>
                ))}
              </Item.Group>
            </Card>
          </aside>
        </main>
      </div>
    );
  },
};
