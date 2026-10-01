import { useState, type FormEvent } from 'react';

import {
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  DocumentIcon,
  EnvelopeOpenIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';
import { TextArea } from '../../components/form/text-area';
import { Divider } from '../../components/layout/divider';
import { ScrollArea } from '../../components/layout/scroll-area';
import { Spacer } from '../../components/layout/spacer';
import { Splitter } from '../../components/layout/splitter';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Mail/Inbox',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const FOLDERS = [
  { id: 'inbox', label: '받은편지함', icon: <InboxIcon />, count: 2 },
  { id: 'starred', label: '별표', icon: <StarIcon /> },
  { id: 'sent', label: '보낸편지함', icon: <PaperAirplaneIcon /> },
  { id: 'drafts', label: '임시보관함', icon: <DocumentIcon />, count: 1 },
  { id: 'archive', label: '보관함', icon: <ArchiveBoxIcon /> },
  { id: 'trash', label: '휴지통', icon: <TrashIcon /> },
];

const MAILS = [
  {
    id: 'add-drop',
    from: '학사팀',
    email: 'academic@gist.ac.kr',
    subject: '수강 정정 마감 하루 전 안내',
    receivedAt: '오전 9:41',
    label: '학사',
    body: [
      '안녕하세요, 학사팀입니다.',
      '2026학년도 2학기 수강 정정이 내일(10월 2일) 18시에 끝납니다. 정정 기간이 지나면 과목을 더할 수 없고 취소만 할 수 있습니다.',
      '졸업 요건에 필요한 과목을 다시 한번 확인해 주세요. 궁금한 점은 이 메일에 답장하시면 됩니다.',
    ],
  },
  {
    id: 'booth-map',
    from: '박서연',
    email: 'seoyeon@gm.gist.ac.kr',
    subject: '축제 부스 배치도 공유드려요',
    receivedAt: '어제',
    label: '동아리',
    body: [
      '지수 님, 축제 부스 배치도가 나와서 공유드려요.',
      '우리 동아리는 학생회관 앞 B-4 자리예요. 전기가 들어오는 자리라 모니터를 두 대까지 놓을 수 있어요.',
      '금요일 회의 전에 한번 보시고 의견 주세요!',
    ],
  },
  {
    id: 'agenda',
    from: '인포팀',
    email: 'team@gistory.me',
    subject: '10월 정기 회의 안건',
    receivedAt: '어제',
    label: '동아리',
    body: [
      '10월 정기 회의 안건입니다.',
      '1. 신입 부원 온보딩 일정',
      '2. Ziggle 새 게시판 출시',
      '3. 해커톤 참가 팀 구성',
    ],
  },
  {
    id: 'book',
    from: '학술정보처',
    email: 'library@gist.ac.kr',
    subject: '예약하신 도서가 도착했습니다',
    receivedAt: '9월 28일',
    label: '개인',
    body: [
      '예약하신 「디자인의 디자인」이 도착했습니다.',
      '10월 5일까지 1층 대출 창구에서 받아 가세요.',
    ],
  },
  {
    id: 'maintenance',
    from: '이도윤',
    email: 'doyun@gm.gist.ac.kr',
    subject: 'Re: 서버 점검 시간 조정',
    receivedAt: '9월 27일',
    label: null,
    body: [
      '점검은 10월 3일 새벽 2시로 옮기는 게 좋겠어요.',
      '그 시간에 접속하는 사람이 가장 적더라고요.',
    ],
  },
  {
    id: 'work-study',
    from: '장학팀',
    email: 'scholarship@gist.ac.kr',
    subject: '근로 장학생 선발 결과',
    receivedAt: '9월 26일',
    label: '학사',
    body: ['2학기 교내 근로 장학생으로 선발되었습니다.', '첫 근무는 10월 6일 도서관 2층입니다.'],
  },
];

const UNREAD_AT_FIRST = ['add-drop', 'booth-map'];

export const PC: Story = {
  render: function Render() {
    const [folder, setFolder] = useState('inbox');
    const [openId, setOpenId] = useState<string | null>(null);
    const [unread, setUnread] = useState<string[]>(UNREAD_AT_FIRST);
    const [reply, setReply] = useState('');

    const opened = MAILS.find((mail) => mail.id === openId) ?? null;

    const open = (id: string) => {
      setOpenId(id);
      setUnread(unread.filter((other) => other !== id));
    };

    const sendReply = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setReply('');
      toast.success('답장을 보냈어요');
    };

    const folders = (
      <nav aria-label="편지함" className="flex flex-col gap-4 p-3">
        <Button asChild className="w-full">
          <a href="#compose">
            <PencilSquareIcon />
            편지 쓰기
          </a>
        </Button>
        <Item.Group size="tiny" aria-label="편지함">
          {FOLDERS.map((item) => (
            <Item
              key={item.id}
              asChild
              selected={item.id === folder}
              aria-current={item.id === folder ? 'page' : undefined}
            >
              <a
                href={`#${item.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  setFolder(item.id);
                }}
              >
                <Item.Media>{item.icon}</Item.Media>
                <Item.Content>
                  <Item.Title>{item.label}</Item.Title>
                </Item.Content>
                {item.count && (
                  <Item.Actions>
                    <Badge content={item.count} variant="soft" colorScheme="neutral" />
                  </Item.Actions>
                )}
              </a>
            </Item>
          ))}
        </Item.Group>
      </nav>
    );

    const list = (
      <ScrollArea fade className="h-full">
        <Item.Group variant="bordered" aria-label="받은 메일" className="p-2">
          {MAILS.map((mail) => (
            <Item key={mail.id} selected={mail.id === openId} onClick={() => open(mail.id)}>
              <Item.Content>
                <Item.Title>
                  {mail.from}
                  {unread.includes(mail.id) && (
                    <Badge dot colorScheme="primary" aria-label="읽지 않음" />
                  )}
                </Item.Title>
                <Item.Description>
                  {mail.receivedAt} · {mail.subject}
                </Item.Description>
              </Item.Content>
            </Item>
          ))}
        </Item.Group>
      </ScrollArea>
    );

    const reading = opened && (
      <ScrollArea fade className="h-full">
        <article className="flex flex-col gap-6 p-4 md:p-6">
          <div className="flex items-center gap-2">
            <IconButton
              variant="outline"
              aria-label="목록으로"
              icon={<ChevronLeftIcon />}
              onClick={() => setOpenId(null)}
              className="md:hidden"
            />
            <div className="ms-auto flex gap-2">
              <IconButton variant="outline" aria-label="답장" icon={<ArrowUturnLeftIcon />} />
              <IconButton
                variant="outline"
                aria-label="보관"
                icon={<ArchiveBoxIcon />}
                onClick={() => toast('보관함으로 옮겼어요')}
              />
              <IconButton
                variant="outline"
                colorScheme="danger"
                aria-label="삭제"
                icon={<TrashIcon />}
                onClick={() => toast('휴지통으로 옮겼어요')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {opened.label && (
              <Badge
                content={opened.label}
                variant="soft"
                colorScheme="neutral"
                className="self-start"
              />
            )}
            <h2 className="text-headline-h4-bold">{opened.subject}</h2>
            <Item variant="soft" size="tiny">
              <Item.Media>
                <Avatar name={opened.from} size="tiny" />
              </Item.Media>
              <Item.Content>
                <Item.Title>{opened.from}</Item.Title>
                <Item.Description>
                  {opened.email} · {opened.receivedAt}
                </Item.Description>
              </Item.Content>
            </Item>
          </div>

          <div className="text-body-b2-regular flex flex-col gap-3">
            {opened.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <form onSubmit={sendReply}>
            <TextArea
              aria-label={`${opened.from}에게 답장`}
              placeholder={`${opened.from}에게 답장`}
              rows={3}
              value={reply}
              onValueChange={setReply}
            >
              <TextArea.Input />
              <Spacer />
              <Button type="submit" size="tiny" disabled={reply.trim() === ''}>
                <PaperAirplaneIcon />
                보내기
              </Button>
            </TextArea>
          </form>
        </article>
      </ScrollArea>
    );

    return (
      <div className="flex h-dvh flex-col break-keep">
        <header className="flex items-center gap-3 px-4 py-3">
          <h1 className="text-subtitle-s1-bold">메일</h1>
          <Badge content={`안 읽은 메일 ${unread.length}`} variant="soft" colorScheme="primary" />
          <IconButton
            asChild
            variant="outline"
            aria-label="편지 쓰기"
            icon={<PencilSquareIcon />}
            className="ms-auto md:hidden"
          >
            <a href="#compose" />
          </IconButton>
        </header>
        <Divider />

        <Splitter aria-label="메일" className="hidden md:flex">
          <Splitter.Panel defaultSize={20} minSize={14} maxSize={28}>
            {folders}
          </Splitter.Panel>
          <Splitter.Panel defaultSize={32} minSize={24}>
            {list}
          </Splitter.Panel>
          <Splitter.Panel minSize={30}>
            {reading ?? (
              <div className="flex h-full items-center justify-center p-6">
                <Empty variant="soft">
                  <Empty.Media variant="outline">
                    <EnvelopeOpenIcon />
                  </Empty.Media>
                  <Empty.Title>읽을 메일을 고르세요</Empty.Title>
                  <Empty.Description>안 읽은 메일이 {unread.length}통 있어요.</Empty.Description>
                </Empty>
              </div>
            )}
          </Splitter.Panel>
        </Splitter>

        <div className="min-h-0 flex-1 md:hidden">{opened ? reading : list}</div>
      </div>
    );
  },
};
