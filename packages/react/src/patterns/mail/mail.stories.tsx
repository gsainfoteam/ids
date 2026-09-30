import { useState, type FormEvent, type ReactNode } from 'react';

import {
  ArchiveBoxIcon,
  ArrowLeftIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  DocumentIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';
import { Select } from '../../components/form/select';
import { TextArea } from '../../components/form/text-area';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';
import { ScrollArea } from '../../components/layout/scroll-area';
import { Splitter } from '../../components/layout/splitter';
import { Menu } from '../../components/overlay/menu';
import { Tooltip } from '../../components/overlay/tooltip';
import { IdsProvider } from '../../components/utility/ids-provider';
import { cn } from '../../utils';

import type { IdsColor } from '../../tokens/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Mail',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const FOLDERS: { id: string; label: string; icon: ReactNode }[] = [
  { id: 'inbox', label: '받은편지함', icon: <InboxIcon /> },
  { id: 'starred', label: '별표', icon: <StarIcon /> },
  { id: 'sent', label: '보낸편지함', icon: <PaperAirplaneIcon /> },
  { id: 'drafts', label: '임시보관함', icon: <DocumentIcon /> },
  { id: 'spam', label: '스팸', icon: <ExclamationTriangleIcon /> },
  { id: 'trash', label: '휴지통', icon: <TrashIcon /> },
];

const LABELS: { name: string; color: IdsColor }[] = [
  { name: '학사', color: 'blue' },
  { name: '동아리', color: 'violet' },
  { name: '개인', color: 'emerald' },
];

type Mail = {
  id: string;
  folder: string;
  from: string;
  email: string;
  subject: string;
  receivedAt: string;
  unread: boolean;
  labels: string[];
  body: string[];
};

const MAILS: Mail[] = [
  {
    id: 'add-drop',
    folder: 'inbox',
    from: '학사팀',
    email: 'academic@gist.ac.kr',
    subject: '수강 정정 마감 하루 전 안내',
    receivedAt: '오전 9:41',
    unread: true,
    labels: ['학사'],
    body: [
      '안녕하세요, 학사팀입니다.',
      '2026학년도 2학기 수강 정정이 내일(10월 2일) 18시에 끝납니다. 정정 기간이 지나면 과목을 더할 수 없고 취소만 할 수 있습니다.',
      '졸업 요건에 필요한 과목을 다시 한번 확인해 주세요. 궁금한 점은 이 메일에 답장하시면 됩니다.',
    ],
  },
  {
    id: 'booth-map',
    folder: 'inbox',
    from: '박서연',
    email: 'seoyeon@gm.gist.ac.kr',
    subject: '축제 부스 배치도 공유드려요',
    receivedAt: '어제',
    unread: true,
    labels: ['동아리'],
    body: [
      '지수 님, 축제 부스 배치도가 나와서 공유드려요.',
      '우리 동아리는 학생회관 앞 B-4 자리예요. 전기가 들어오는 자리라 모니터를 두 대까지 놓을 수 있어요.',
      '금요일 회의 전에 한번 보시고 의견 주세요!',
    ],
  },
  {
    id: 'agenda',
    folder: 'inbox',
    from: '인포팀',
    email: 'team@gistory.me',
    subject: '10월 정기 회의 안건',
    receivedAt: '어제',
    unread: false,
    labels: ['동아리'],
    body: [
      '10월 정기 회의 안건입니다.',
      '1. 신입 부원 온보딩 일정',
      '2. Ziggle 새 게시판 출시',
      '3. 해커톤 참가 팀 구성',
    ],
  },
  {
    id: 'book',
    folder: 'inbox',
    from: '학술정보처',
    email: 'library@gist.ac.kr',
    subject: '예약하신 도서가 도착했습니다',
    receivedAt: '9월 28일',
    unread: false,
    labels: ['개인'],
    body: [
      '예약하신 「디자인의 디자인」이 도착했습니다.',
      '10월 5일까지 1층 대출 창구에서 받아 가세요.',
    ],
  },
  {
    id: 'maintenance',
    folder: 'inbox',
    from: '이도윤',
    email: 'doyun@gm.gist.ac.kr',
    subject: 'Re: 서버 점검 시간 조정',
    receivedAt: '9월 27일',
    unread: false,
    labels: [],
    body: [
      '점검은 10월 3일 새벽 2시로 옮기는 게 좋겠어요.',
      '그 시간에 접속하는 사람이 가장 적더라고요.',
    ],
  },
  {
    id: 'work-study',
    folder: 'inbox',
    from: '장학팀',
    email: 'scholarship@gist.ac.kr',
    subject: '근로 장학생 선발 결과',
    receivedAt: '9월 26일',
    unread: false,
    labels: ['학사'],
    body: ['2학기 교내 근로 장학생으로 선발되었습니다.', '첫 근무는 10월 6일 도서관 2층입니다.'],
  },
  {
    id: 'photo',
    folder: 'inbox',
    from: '정예린',
    email: 'yerin@gm.gist.ac.kr',
    subject: '사진전 참여 의사 확인',
    receivedAt: '9월 25일',
    unread: false,
    labels: ['동아리'],
    body: [
      '사진부 가을 사진전에 작품을 내실 건가요?',
      '10월 10일까지 알려 주시면 자리를 잡아 둘게요.',
    ],
  },
];

const hint = cn('text-caption-c1-regular text-(--ids-color-on-muted)');

export const Default: Story = {
  render: function Render() {
    const [mails, setMails] = useState(MAILS);
    const [folder, setFolder] = useState('inbox');
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState('add-drop');
    const [reading, setReading] = useState(false);

    const shown = mails.filter(
      (mail) =>
        mail.folder === folder &&
        (filter === 'all' || mail.unread) &&
        `${mail.from} ${mail.subject}`.includes(query.trim()),
    );
    const selected = mails.find(({ id }) => id === selectedId);
    const unread = mails.filter((mail) => mail.folder === 'inbox' && mail.unread).length;
    const folderLabel = FOLDERS.find(({ id }) => id === folder)?.label;

    const open = (id: string) => {
      setSelectedId(id);
      setReading(true);
      setMails((current) =>
        current.map((mail) => (mail.id === id ? { ...mail, unread: false } : mail)),
      );
    };

    const reply = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.currentTarget.reset();
      toast.success('답장을 보냈어요');
    };

    const folders = (
      <div className="flex h-full flex-col gap-4 bg-(--ids-color-muted) p-3">
        <Button className="w-full">
          <PencilSquareIcon />새 메일
        </Button>
        <nav aria-label="편지함">
          <ul className="flex flex-col gap-0.5">
            {FOLDERS.map(({ id, label, icon }) => (
              <li key={id}>
                <Item
                  asChild
                  size="tiny"
                  selected={id === folder}
                  aria-current={id === folder ? 'page' : undefined}
                >
                  <a
                    href={`#${id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      setFolder(id);
                    }}
                  >
                    <Item.Media>{icon}</Item.Media>
                    <Item.Content>
                      <Item.Title>{label}</Item.Title>
                    </Item.Content>
                    {id === 'inbox' && unread > 0 && (
                      <Item.Actions className="text-caption-c1-medium tabular-nums">
                        {unread}
                      </Item.Actions>
                    )}
                  </a>
                </Item>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-1">
          <p className={cn(hint, 'px-2')}>라벨</p>
          <ul aria-label="라벨" className="flex flex-col gap-0.5">
            {LABELS.map(({ name, color }) => (
              <li key={name}>
                <Item asChild size="tiny">
                  <a href={`#label-${name}`}>
                    <Item.Media>
                      <IdsProvider
                        color={color}
                        className="mx-auto size-2.5 rounded-full bg-(--ids-color-primary)"
                      />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{name}</Item.Title>
                    </Item.Content>
                  </a>
                </Item>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );

    const list = (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex flex-col gap-3 border-b border-(--ids-color-border) p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-headline-h5-bold">{folderLabel}</h2>
            <ToggleGroup
              variant="outline"
              aria-label="보기"
              size="tiny"
              value={filter}
              onValueChange={(next) => {
                if (next !== null) setFilter(next);
              }}
            >
              <Toggle value="all">전체</Toggle>
              <Toggle value="unread">안 읽음</Toggle>
            </ToggleGroup>
          </div>
          <TextField
            type="search"
            aria-label="메일 검색"
            placeholder="보낸 사람이나 제목"
            value={query}
            onValueChange={setQuery}
          >
            <MagnifyingGlassIcon />
            <TextField.Input />
          </TextField>
        </div>
        <ScrollArea fade="y" className="min-h-0 flex-1">
          {shown.length === 0 ? (
            <Empty variant="soft" size="tiny" className="m-4">
              <Empty.Media>
                <EnvelopeIcon />
              </Empty.Media>
              <Empty.Title>메일이 없어요</Empty.Title>
            </Empty>
          ) : (
            <Item.Group variant="separated" aria-label="메일" className="p-3">
              {shown.map((mail) => (
                <Item key={mail.id} selected={mail.id === selectedId} onClick={() => open(mail.id)}>
                  <Item.Content className="gap-1">
                    <span className="flex items-center gap-2">
                      {mail.unread && (
                        <span className="size-2 shrink-0 rounded-full bg-(--ids-color-primary)">
                          <span className="sr-only">안 읽음</span>
                        </span>
                      )}
                      <span
                        className={cn(
                          'truncate',
                          mail.unread ? 'text-body-b3-bold' : 'text-body-b3-medium',
                        )}
                      >
                        {mail.from}
                      </span>
                      <span className={cn(hint, 'ms-auto shrink-0')}>{mail.receivedAt}</span>
                    </span>
                    <Item.Title>{mail.subject}</Item.Title>
                    <Item.Description className="line-clamp-2">
                      {mail.body.join(' ')}
                    </Item.Description>
                    {mail.labels.length > 0 && (
                      <span className="flex gap-1 pt-1">
                        {mail.labels.map((label) => (
                          <Badge key={label} content={label} variant="soft" colorScheme="neutral" />
                        ))}
                      </span>
                    )}
                  </Item.Content>
                </Item>
              ))}
            </Item.Group>
          )}
        </ScrollArea>
      </div>
    );

    const view = selected ? (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center gap-1 border-b border-(--ids-color-border) p-2">
          <IconButton
            variant="outline"
            aria-label="목록으로"
            icon={<ArrowLeftIcon />}
            onClick={() => setReading(false)}
            className="lg:hidden"
          />
          <Tooltip content="보관">
            <IconButton variant="outline" aria-label="보관" icon={<ArchiveBoxIcon />} />
          </Tooltip>
          <Tooltip content="스팸으로">
            <IconButton
              variant="outline"
              aria-label="스팸으로"
              icon={<ExclamationTriangleIcon />}
            />
          </Tooltip>
          <Tooltip content="휴지통으로">
            <IconButton variant="outline" aria-label="휴지통으로" icon={<TrashIcon />} />
          </Tooltip>
          <div className="ms-auto flex items-center gap-1">
            <Tooltip content="답장">
              <IconButton variant="outline" aria-label="답장" icon={<ArrowUturnLeftIcon />} />
            </Tooltip>
            <Tooltip content="전달">
              <IconButton variant="outline" aria-label="전달" icon={<ArrowUturnRightIcon />} />
            </Tooltip>
            <Menu>
              <Menu.Trigger asChild>
                <IconButton
                  variant="outline"
                  aria-label="더 보기"
                  icon={<EllipsisHorizontalIcon />}
                />
              </Menu.Trigger>
              <Menu.Content>
                <Menu.Item
                  onSelect={() =>
                    setMails((current) =>
                      current.map((mail) =>
                        mail.id === selected.id ? { ...mail, unread: true } : mail,
                      ),
                    )
                  }
                >
                  <EnvelopeIcon />안 읽음으로 표시
                </Menu.Item>
                <Menu.Item>
                  <StarIcon />
                  별표
                </Menu.Item>
              </Menu.Content>
            </Menu>
          </div>
        </div>

        <ScrollArea fade="y" className="min-h-0 flex-1">
          <article className="flex flex-col gap-5 p-6">
            <header className="flex items-start gap-3">
              <Avatar name={selected.from} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <h2 className="text-headline-h5-bold">{selected.subject}</h2>
                <p className="text-body-b3-medium truncate">
                  {selected.from}{' '}
                  <span className="text-(--ids-color-on-muted)">{selected.email}</span>
                </p>
                <p className={hint}>받는 사람 김지수</p>
              </div>
              <p className={cn(hint, 'shrink-0')}>{selected.receivedAt}</p>
            </header>
            <Divider />
            <div className="text-body-b2-regular flex flex-col gap-4">
              {selected.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        </ScrollArea>

        <form onSubmit={reply} className="border-t border-(--ids-color-border) p-4">
          <TextArea
            name="reply"
            aria-label={`${selected.from}에게 답장`}
            placeholder={`${selected.from}에게 답장`}
            rows={2}
            maxRows={8}
          >
            <TextArea.Input />
            <Button type="submit" size="tiny" className="ms-auto">
              <PaperAirplaneIcon />
              보내기
            </Button>
          </TextArea>
        </form>
      </div>
    ) : (
      <Empty variant="soft" className="m-auto">
        <Empty.Media>
          <EnvelopeIcon />
        </Empty.Media>
        <Empty.Title>메일을 고르세요</Empty.Title>
      </Empty>
    );

    return (
      <div className="flex h-dvh min-h-[640px] flex-col break-keep">
        <Splitter className="hidden min-h-0 flex-1 lg:flex">
          <Splitter.Panel defaultSize={18} minSize={14} maxSize={26}>
            {folders}
          </Splitter.Panel>
          <Splitter.Panel defaultSize={34} minSize={26}>
            {list}
          </Splitter.Panel>
          <Splitter.Panel minSize={30}>{view}</Splitter.Panel>
        </Splitter>

        <div className="flex min-h-0 flex-1 flex-col lg:hidden">
          {reading ? (
            view
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-(--ids-color-border) p-3">
                <Select
                  aria-label="편지함"
                  value={folder}
                  onValueChange={(next) => setFolder(next ?? 'inbox')}
                  className="flex-1"
                >
                  {FOLDERS.map(({ id, label }) => (
                    <Select.Item key={id} value={id}>
                      {label}
                    </Select.Item>
                  ))}
                </Select>
                <IconButton aria-label="새 메일" icon={<PencilSquareIcon />} />
              </div>
              {list}
            </>
          )}
        </div>
      </div>
    );
  },
};
