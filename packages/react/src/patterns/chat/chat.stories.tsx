import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

import {
  BellSlashIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Chip } from '../../components/data/chip';
import { Item } from '../../components/data/item';
import { Spinner } from '../../components/feedback/spinner';
import { TextArea } from '../../components/form/text-area';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';
import { ScrollArea } from '../../components/layout/scroll-area';
import { Menu } from '../../components/overlay/menu';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Chat',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const CONVERSATIONS = [
  { id: 'bot', name: 'GIST 도우미', preview: '셔틀은 10분 뒤에 와요.', time: '방금', unread: 0 },
  { id: 'seoyeon', name: '박서연', preview: '배치도 봤어요?', time: '10분', unread: 2 },
  {
    id: 'team',
    name: '인포팀 운영진',
    preview: '이도윤: 회의록 올렸어요',
    time: '1시간',
    unread: 0,
  },
  { id: 'doyun', name: '이도윤', preview: '고마워요!', time: '어제', unread: 0 },
];

type Message = { id: number; mine: boolean; text: string; time: string };

const GREETING: Message[] = [
  { id: 1, mine: true, text: '오늘 학식 뭐야?', time: '12:01' },
  {
    id: 2,
    mine: false,
    text: '제1학생식당 점심은 돈까스 정식(5,000원), 제2학생식당은 비빔밥과 된장국(4,500원)이에요.',
    time: '12:01',
  },
  { id: 3, mine: true, text: '셔틀은 언제 와?', time: '12:09' },
  {
    id: 4,
    mine: false,
    text: '학생회관 정류장에 광주송정역으로 가는 셔틀이 10분 뒤, 12시 20분에 와요.',
    time: '12:10',
  },
];

const QUICK_QUESTIONS = ['도서관 몇 시까지 열어?', '내일 날씨 어때?', '셔틀 시간표 보여 줘'];

const BOT_THINKS_FOR_MS = 900;

function answerTo(question: string) {
  if (question.includes('도서관'))
    return '중앙도서관 열람실은 평일 새벽 2시까지, 주말은 밤 10시까지 열어요.';
  if (question.includes('날씨'))
    return '내일 광주는 맑고, 낮 기온은 24도예요. 일교차가 커서 겉옷을 챙기세요.';
  if (question.includes('셔틀'))
    return '평일 셔틀은 8시 30분부터 30분마다 학생회관 앞에서 출발해요.';
  return '지금은 학식, 셔틀, 도서관, 날씨만 답할 수 있어요.';
}

function now() {
  return '12:14';
}

export const Default: Story = {
  render: function Render() {
    const [messages, setMessages] = useState<Message[]>(GREETING);
    const [draft, setDraft] = useState('');
    const [thinking, setThinking] = useState(false);
    const endOfLog = useRef<HTMLDivElement>(null);

    useEffect(() => {
      endOfLog.current?.scrollIntoView({ block: 'end' });
    }, [messages, thinking]);

    const ask = (question: string) => {
      const text = question.trim();
      if (text === '') return;

      setMessages((current) => [
        ...current,
        { id: current.length + 1, mine: true, text, time: now() },
      ]);
      setDraft('');
      setThinking(true);
      window.setTimeout(() => {
        setThinking(false);
        setMessages((current) => [
          ...current,
          { id: current.length + 1, mine: false, text: answerTo(text), time: now() },
        ]);
      }, BOT_THINKS_FOR_MS);
    };

    const send = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      ask(draft);
    };

    const sendOnEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
      event.preventDefault();
      ask(draft);
    };

    return (
      <div className="flex h-dvh min-h-[600px] break-keep">
        <aside
          aria-label="대화 목록"
          className="hidden w-80 shrink-0 flex-col border-e border-(--ids-color-border) bg-(--ids-color-muted) md:flex"
        >
          <div className="flex flex-col gap-3 p-4">
            <h1 className="text-headline-h5-bold">채팅</h1>
            <TextField type="search" aria-label="대화 찾기" placeholder="대화 찾기">
              <MagnifyingGlassIcon />
              <TextField.Input />
            </TextField>
          </div>
          <ScrollArea fade="y" className="min-h-0 flex-1">
            <Item.Group variant="bordered" aria-label="대화" size="tiny" className="px-2 pb-2">
              {CONVERSATIONS.map((conversation) => (
                <Item key={conversation.id} asChild selected={conversation.id === 'bot'}>
                  <a
                    href={`#${conversation.id}`}
                    aria-current={conversation.id === 'bot' ? 'page' : undefined}
                  >
                    <Item.Media>
                      {conversation.id === 'bot' ? (
                        <Avatar name={conversation.name}>
                          <Avatar.Fallback>
                            <SparklesIcon />
                          </Avatar.Fallback>
                        </Avatar>
                      ) : (
                        <Avatar name={conversation.name} />
                      )}
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{conversation.name}</Item.Title>
                      <Item.Description className="truncate">
                        {conversation.preview}
                      </Item.Description>
                    </Item.Content>
                    <Item.Actions className="flex-col items-end gap-1">
                      <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                        {conversation.time}
                      </span>
                      {conversation.unread > 0 && (
                        <Badge
                          content={conversation.unread}
                          colorScheme="primary"
                          aria-label={`안 읽은 메시지 ${conversation.unread}개`}
                        />
                      )}
                    </Item.Actions>
                  </a>
                </Item>
              ))}
            </Item.Group>
          </ScrollArea>
        </aside>

        <section aria-label="GIST 도우미와의 대화" className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-(--ids-color-border) px-4">
            <Avatar name="GIST 도우미">
              <Avatar.Fallback>
                <SparklesIcon />
              </Avatar.Fallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <h2 className="text-body-b2-semibold flex items-center gap-1.5">
                GIST 도우미
                <SparklesIcon aria-hidden className="size-4 text-(--ids-color-accent)" />
              </h2>
              <p className="text-caption-c1-regular text-(--ids-color-on-muted)">
                보통 바로 답해요
              </p>
            </div>
            <div className="ms-auto flex items-center gap-1">
              <IconButton
                variant="outline"
                aria-label="대화에서 찾기"
                icon={<MagnifyingGlassIcon />}
              />
              <Menu>
                <Menu.Trigger asChild>
                  <IconButton
                    variant="outline"
                    aria-label="대화 설정"
                    icon={<EllipsisVerticalIcon />}
                  />
                </Menu.Trigger>
                <Menu.Content>
                  <Menu.Item>
                    <BellSlashIcon />
                    알림 끄기
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item onSelect={() => setMessages([])}>
                    <TrashIcon />
                    대화 지우기
                  </Menu.Item>
                </Menu.Content>
              </Menu>
            </div>
          </header>

          <ScrollArea fade="y" className="min-h-0 flex-1">
            <div
              role="log"
              aria-label="메시지"
              className="mx-auto flex max-w-3xl flex-col gap-4 p-4"
            >
              <Divider className="text-caption-c1-regular">오늘</Divider>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex max-w-[85%] items-end gap-2',
                    message.mine && 'ms-auto flex-row-reverse',
                  )}
                >
                  {!message.mine && (
                    <Avatar name="GIST 도우미" size="tiny">
                      <Avatar.Fallback>
                        <SparklesIcon />
                      </Avatar.Fallback>
                    </Avatar>
                  )}
                  <p
                    className={cn(
                      'rounded-container text-body-b2-regular px-4 py-2.5',
                      message.mine
                        ? 'bg-(--ids-color-primary) text-(--ids-color-on-primary)'
                        : 'bg-(--ids-color-muted) text-(--ids-color-on-surface)',
                    )}
                  >
                    <span className="sr-only">{message.mine ? '나: ' : 'GIST 도우미: '}</span>
                    {message.text}
                  </p>
                  <time className="text-caption-c1-regular shrink-0 text-(--ids-color-on-muted)">
                    {message.time}
                  </time>
                </div>
              ))}
              {thinking && (
                <div className="flex items-end gap-2">
                  <Avatar name="GIST 도우미" size="tiny">
                    <Avatar.Fallback>
                      <SparklesIcon />
                    </Avatar.Fallback>
                  </Avatar>
                  <p className="rounded-container text-body-b3-regular flex items-center gap-2 bg-(--ids-color-muted) px-4 py-2.5 text-(--ids-color-on-muted)">
                    <Spinner size="tiny" />
                    답을 쓰는 중
                  </p>
                </div>
              )}
              <div ref={endOfLog} />
            </div>
          </ScrollArea>

          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 p-4 pt-0">
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((question) => (
                <Chip key={question} onClick={() => ask(question)} disabled={thinking}>
                  {question}
                </Chip>
              ))}
            </div>
            <form onSubmit={send}>
              <TextArea
                aria-label="메시지"
                placeholder="GIST 도우미에게 물어보기"
                rows={1}
                maxRows={6}
                value={draft}
                onValueChange={setDraft}
              >
                <TextArea.Input onKeyDown={sendOnEnter} />
                <IconButton
                  variant="outline"
                  size="tiny"
                  aria-label="파일 붙이기"
                  icon={<PaperClipIcon />}
                />
                <IconButton
                  variant="outline"
                  size="tiny"
                  aria-label="사진 붙이기"
                  icon={<PhotoIcon />}
                />
                <IconButton
                  type="submit"
                  size="tiny"
                  aria-label="보내기"
                  icon={<PaperAirplaneIcon />}
                  disabled={draft.trim() === '' || thinking}
                  className="ms-auto"
                />
              </TextArea>
            </form>
          </div>
        </section>
      </div>
    );
  },
};
