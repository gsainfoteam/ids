import { useState, type FormEvent } from 'react';

import {
  ChatBubbleLeftRightIcon,
  HashtagIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { AvatarGroup } from '../../components/data/avatar-group';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { TextArea } from '../../components/form/text-area';
import { Divider } from '../../components/layout/divider';
import { ScrollArea } from '../../components/layout/scroll-area';
import { Spacer } from '../../components/layout/spacer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Chat/Channel',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Message = {
  id: string;
  author: string;
  time: string;
  lines: string[];
  replies?: number;
  attachment?: { name: string; size: string };
};

const DAYS: { day: string; messages: Message[] }[] = [
  {
    day: '어제',
    messages: [
      {
        id: 'm1',
        author: '박서연',
        time: '오후 4:12',
        lines: [
          '부스 배치도 나왔어요! 우리는 B-4 자리예요.',
          '전기가 들어와서 모니터 두 대까지 놓을 수 있대요.',
        ],
        attachment: { name: '광장 배치도.png', size: '1.2MB' },
      },
      {
        id: 'm2',
        author: '이도윤',
        time: '오후 4:20',
        lines: ['좋다! 데모는 Ziggle 새 게시판으로 가요.'],
        replies: 3,
      },
    ],
  },
  {
    day: '오늘',
    messages: [
      {
        id: 'm3',
        author: '김지수',
        time: '오전 10:02',
        lines: ['금요일 회의 전에 굿즈 시안 한번 봐 주세요.', '스티커 두 종류랑 키링 하나예요.'],
      },
      {
        id: 'm4',
        author: '정예린',
        time: '오전 10:15',
        lines: ['키링 너무 귀여워요 🥹 스티커는 두 번째가 더 좋아요.'],
      },
    ],
  },
];

const MEMBERS = ['김지수', '박서연', '이도윤', '정예린', '최하준'];

export const PC: Story = {
  render: function Render() {
    const [draft, setDraft] = useState('');

    const send = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setDraft('');
    };

    return (
      <div className="flex h-dvh flex-col break-keep">
        <header>
          <Item>
            <Item.Media variant="soft">
              <HashtagIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title asChild>
                <h1>프론트엔드</h1>
              </Item.Title>
              <Item.Description>Ziggle 과 IDS 이야기</Item.Description>
            </Item.Content>
            <Item.Actions>
              <AvatarGroup max={3} size="tiny" aria-label={`멤버 ${MEMBERS.length}명`}>
                {MEMBERS.map((member) => (
                  <Avatar key={member} name={member} />
                ))}
              </AvatarGroup>
              <IconButton variant="outline" aria-label="멤버 초대" icon={<UserPlusIcon />} />
            </Item.Actions>
          </Item>
        </header>
        <Divider />

        <ScrollArea fade className="min-h-0 flex-1">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
            {DAYS.map(({ day, messages }) => (
              <section key={day} aria-label={day} className="flex flex-col gap-6">
                <Divider>{day}</Divider>
                {messages.map((message) => (
                  <article key={message.id} className="flex gap-3">
                    <Avatar name={message.author} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="text-body-b3-semibold flex items-center gap-2">
                        {message.author}
                        <span className="text-caption-c1-regular">{message.time}</span>
                      </p>
                      {message.lines.map((line) => (
                        <p key={line} className="text-body-b2-regular">
                          {line}
                        </p>
                      ))}
                      {message.attachment && (
                        <Card size="tiny" className="mt-2 max-w-xs">
                          <Card.Header>
                            <Card.Title>{message.attachment.name}</Card.Title>
                            <Card.Description>{message.attachment.size}</Card.Description>
                          </Card.Header>
                        </Card>
                      )}
                      {message.replies && (
                        <Button variant="soft" size="tiny" className="mt-1 self-start">
                          <ChatBubbleLeftRightIcon />
                          답글 {message.replies}개
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            ))}
            <p className="text-caption-c1-regular flex items-center gap-2">
              <Badge dot colorScheme="success" aria-hidden />
              이도윤님이 입력하고 있어요
            </p>
          </div>
        </ScrollArea>

        <form onSubmit={send} className="mx-auto w-full max-w-3xl px-4 pb-4 md:px-6">
          <TextArea
            aria-label="#프론트엔드에 메시지 보내기"
            placeholder="#프론트엔드에 메시지 보내기"
            rows={1}
            maxRows={6}
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
            <Spacer />
            <IconButton
              type="submit"
              variant="solid"
              size="tiny"
              aria-label="보내기"
              icon={<PaperAirplaneIcon />}
              disabled={draft.trim() === ''}
            />
          </TextArea>
        </form>
      </div>
    );
  },
};
