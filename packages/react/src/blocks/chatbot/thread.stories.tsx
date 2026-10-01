import { useEffect, useRef, useState, type FormEvent } from 'react';

import {
  ArrowPathIcon,
  ArrowUpIcon,
  Bars3Icon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  GlobeAltIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  PaperClipIcon,
  PencilSquareIcon,
  ShareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { IconToggle } from '../../components/action/icon-toggle';
import { Toggle } from '../../components/action/toggle';
import { Accordion } from '../../components/data/accordion';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Item } from '../../components/data/item';
import { Table } from '../../components/data/table';
import { Spinner } from '../../components/feedback/spinner';
import { toast } from '../../components/feedback/toast';
import { TextArea } from '../../components/form/text-area';
import { Divider } from '../../components/layout/divider';
import { ScrollArea } from '../../components/layout/scroll-area';
import { Spacer } from '../../components/layout/spacer';
import { Drawer } from '../../components/overlay/drawer';
import { Menu } from '../../components/overlay/menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Chatbot/Thread',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const HISTORY = [
  {
    day: '오늘',
    chats: [
      { id: 'timetable', title: '다음 학기 시간표 상담' },
      { id: 'shuttle', title: '셔틀 막차 시간' },
    ],
  },
  { day: '어제', chats: [{ id: 'scholarship', title: '근로 장학 서류 준비' }] },
  {
    day: '지난 7일',
    chats: [
      { id: 'algorithm', title: '알고리즘 과제 질문' },
      { id: 'budget', title: '동아리 예산 정리' },
    ],
  },
];

const REQUIRED = [
  { course: '운영체제', time: '화, 목 13:00', credits: 3 },
  { course: '컴퓨터 구조', time: '월, 수 10:30', credits: 3 },
  { course: '소프트웨어 공학', time: '목 15:00', credits: 3 },
];

const SOURCES = ['2026 학사 요람', '2026-2 개설 과목'];

const FOLLOW_UPS = ['목요일 오후도 비워 줘', '다른 안도 보여 줘', '교양 과목도 추천해 줘'];

const ANSWER_TAKES_MS = 2400;

const NEAR_THE_END_PX = 48;

type Sent = { id: number; text: string; answered: boolean };

export const PC: Story = {
  render: function Render() {
    const [rearranged, setRearranged] = useState(false);
    const [sent, setSent] = useState<Sent[]>([]);
    const [draft, setDraft] = useState('');

    const scroller = useRef<HTMLDivElement>(null);
    const followingTheEnd = useRef(true);

    useEffect(() => {
      const timer = window.setTimeout(() => setRearranged(true), ANSWER_TAKES_MS);
      return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
      const element = scroller.current;
      if (element && followingTheEnd.current) element.scrollTo({ top: element.scrollHeight });
    }, [rearranged, sent]);

    const ask = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const id = sent.length;
      followingTheEnd.current = true;
      setSent([...sent, { id, text: draft.trim(), answered: false }]);
      setDraft('');
      window.setTimeout(
        () =>
          setSent((current) =>
            current.map((message) =>
              message.id === id ? { ...message, answered: true } : message,
            ),
          ),
        ANSWER_TAKES_MS,
      );
    };

    const history = (
      <nav aria-label="대화 기록" className="flex flex-col gap-5">
        {HISTORY.map((group) => (
          <div key={group.day} className="flex flex-col gap-1">
            <h2 className="text-caption-c1-medium px-2">{group.day}</h2>
            <Item.Group size="tiny" aria-label={group.day}>
              {group.chats.map((chat) => (
                <Item
                  key={chat.id}
                  asChild
                  selected={chat.id === 'timetable'}
                  aria-current={chat.id === 'timetable' ? 'page' : undefined}
                >
                  <a href={`#${chat.id}`}>
                    <Item.Content>
                      <Item.Title truncate title={chat.title}>
                        {chat.title}
                      </Item.Title>
                    </Item.Content>
                  </a>
                </Item>
              ))}
            </Item.Group>
          </div>
        ))}
      </nav>
    );

    const assistant = (
      <Avatar name="GIST 도우미" size="tiny" aria-hidden>
        <Avatar.Fallback>
          <SparklesIcon />
        </Avatar.Fallback>
      </Avatar>
    );

    const feedback = (
      <div className="flex gap-1">
        <IconButton
          variant="outline"
          size="tiny"
          aria-label="답 복사"
          icon={<DocumentDuplicateIcon />}
          onClick={() => toast.success('답을 복사했어요')}
        />
        <IconToggle variant="outline" size="tiny" aria-label="좋은 답" icon={<HandThumbUpIcon />} />
        <IconToggle
          variant="outline"
          size="tiny"
          aria-label="아쉬운 답"
          icon={<HandThumbDownIcon />}
        />
        <IconButton
          variant="outline"
          size="tiny"
          aria-label="다시 답하기"
          icon={<ArrowPathIcon />}
        />
      </div>
    );

    const thinking = (label: string) => (
      <p role="status" className="text-body-b3-regular flex items-center gap-2">
        <Spinner size="tiny" decorative />
        {label}
      </p>
    );

    return (
      <div className="flex h-dvh break-keep">
        <aside className="hidden w-64 shrink-0 flex-col gap-5 p-3 md:flex">
          <Button variant="outline" className="w-full">
            <PencilSquareIcon />새 대화
          </Button>
          {history}
        </aside>
        <Divider orientation="vertical" className="hidden md:block" />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-1 pe-3">
            <Drawer side="left">
              <Drawer.Trigger asChild>
                <IconButton
                  variant="outline"
                  aria-label="대화 기록"
                  icon={<Bars3Icon />}
                  className="ms-3 md:hidden"
                />
              </Drawer.Trigger>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>대화 기록</Drawer.Title>
                </Drawer.Header>
                {history}
              </Drawer.Content>
            </Drawer>
            <Item className="min-w-0 flex-1">
              <Item.Content>
                <Item.Title asChild>
                  <h1>다음 학기 시간표 상담</h1>
                </Item.Title>
                <Item.Description>GIST 도우미 · 깊게 생각</Item.Description>
              </Item.Content>
            </Item>
            <IconButton variant="outline" aria-label="대화 공유" icon={<ShareIcon />} />
            <Menu>
              <Menu.Trigger asChild>
                <IconButton
                  variant="outline"
                  aria-label="대화 메뉴"
                  icon={<EllipsisHorizontalIcon />}
                />
              </Menu.Trigger>
              <Menu.Content>
                <Menu.Item>이름 바꾸기</Menu.Item>
                <Menu.Item>보관하기</Menu.Item>
                <Menu.Separator />
                <Menu.Item>지우기</Menu.Item>
              </Menu.Content>
            </Menu>
          </header>
          <Divider />

          <ScrollArea fade className="min-h-0 flex-1">
            <ScrollArea.Viewport
              ref={scroller}
              onScroll={(event) => {
                const element = event.currentTarget;
                followingTheEnd.current =
                  element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_THE_END_PX;
              }}
            >
              <ol
                aria-label="대화"
                className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6"
              >
                <li className="flex flex-col items-end gap-2">
                  <Item variant="outline" size="tiny" className="w-auto">
                    <Item.Media variant="soft">
                      <DocumentTextIcon />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>성적표_2026-1.pdf</Item.Title>
                      <Item.Description>PDF · 182KB</Item.Description>
                    </Item.Content>
                  </Item>
                  <Card variant="soft" className="max-w-[80%]">
                    <Card.Content>남은 전공 필수를 찾아서 다음 학기 시간표에 넣어 줘.</Card.Content>
                  </Card>
                </li>

                <li className="flex gap-3">
                  {assistant}
                  <div className="text-body-b2-regular flex min-w-0 flex-1 flex-col gap-4">
                    <Accordion type="multiple" variant="soft">
                      <Accordion.Item value="reasoning">
                        <Accordion.Trigger>12초 동안 생각했어요</Accordion.Trigger>
                        <Accordion.Content>
                          성적표에서 들은 과목 31개를 찾고, 2026 학사 요람의 전공 필수와 견줬어요.
                          남은 전공 필수는 세 과목이라, 2학기에 열리는 분반 중 서로 시간이 겹치지
                          않는 것을 골랐어요.
                        </Accordion.Content>
                      </Accordion.Item>
                      <Accordion.Item value="tool">
                        <Accordion.Trigger>
                          학사 시스템에서 개설 과목을 찾았어요{' '}
                          <Badge content="38과목" variant="soft" colorScheme="success" />
                        </Accordion.Trigger>
                        <Accordion.Content>
                          <Table aria-label="도구에 넘긴 값" size="tiny">
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
                                <Table.Cell>전기전자컴퓨터공학과</Table.Cell>
                              </Table.Row>
                            </Table.Body>
                          </Table>
                        </Accordion.Content>
                      </Accordion.Item>
                    </Accordion>

                    <p>남은 전공 필수는 세 과목이에요. 2학기에 모두 열려서 이렇게 넣었어요.</p>
                    <Table aria-label="넣은 전공 필수">
                      <Table.Header>
                        <Table.Row>
                          <Table.Head>과목</Table.Head>
                          <Table.Head>시간</Table.Head>
                          <Table.Head align="end">학점</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {REQUIRED.map((row) => (
                          <Table.Row key={row.course}>
                            <Table.Cell>{row.course}</Table.Cell>
                            <Table.Cell>{row.time}</Table.Cell>
                            <Table.Cell align="end">{row.credits}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                    <p>모두 9학점이라, 교양이나 선택 과목을 9학점 더 넣을 수 있어요.</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-caption-c1-medium">출처</span>
                      {SOURCES.map((source) => (
                        <Button key={source} asChild variant="outline" size="tiny">
                          <a href={`#${source}`}>{source}</a>
                        </Button>
                      ))}
                    </div>
                    {feedback}
                  </div>
                </li>

                <li className="flex justify-end">
                  <Card variant="soft" className="max-w-[80%]">
                    <Card.Content>화요일 오전 수업은 빼 줘. 그날은 근로 장학이 있어.</Card.Content>
                  </Card>
                </li>

                <li className="flex gap-3">
                  {assistant}
                  <div className="text-body-b2-regular flex min-w-0 flex-1 flex-col gap-4">
                    {rearranged ? (
                      <>
                        <p>
                          화요일 오전에는 원래 수업이 없어서 그대로 두면 돼요. 운영체제가 화요일
                          오후 1시라 근로가 12시에 끝나면 늦지 않아요.
                        </p>
                        {feedback}
                      </>
                    ) : (
                      thinking('시간표를 다시 맞추는 중이에요')
                    )}
                  </div>
                </li>

                {sent.map((message) => (
                  <li key={message.id} className="flex flex-col gap-8">
                    <div className="flex justify-end">
                      <Card variant="soft" className="max-w-[80%]">
                        <Card.Content>{message.text}</Card.Content>
                      </Card>
                    </div>
                    <div className="flex gap-3">
                      {assistant}
                      <div className="text-body-b2-regular flex min-w-0 flex-1 flex-col gap-4">
                        {message.answered ? (
                          <p>알겠어요. 바꾼 시간표를 다시 정리했어요.</p>
                        ) : (
                          thinking('답을 쓰는 중이에요')
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </ScrollArea.Viewport>
          </ScrollArea>

          <form onSubmit={ask} className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pb-4">
            <div role="group" aria-label="이어서 물어보기" className="flex flex-wrap gap-2">
              {FOLLOW_UPS.map((followUp) => (
                <Chip key={followUp} onClick={() => setDraft(followUp)}>
                  {followUp}
                </Chip>
              ))}
            </div>
            <TextArea
              aria-label="GIST 도우미에게 묻기"
              placeholder="이어서 물어보세요"
              rows={1}
              maxRows={8}
              value={draft}
              onValueChange={setDraft}
            >
              <TextArea.Input />
              <IconButton
                variant="outline"
                size="tiny"
                aria-label="파일 붙이기"
                icon={<PaperClipIcon />}
              />
              <Toggle variant="outline" size="tiny">
                <GlobeAltIcon />웹 검색
              </Toggle>
              <Spacer />
              <IconButton
                type="submit"
                variant="solid"
                size="tiny"
                aria-label="묻기"
                icon={<ArrowUpIcon />}
                disabled={draft.trim() === ''}
              />
            </TextArea>
          </form>
        </div>
      </div>
    );
  },
};
