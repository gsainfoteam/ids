import { useState, type FormEvent } from 'react';

import {
  ArrowUpIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { FloatingButton } from '../../components/action/floating-button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Item } from '../../components/data/item';
import { Skeleton } from '../../components/feedback/skeleton';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';
import { ScrollArea } from '../../components/layout/scroll-area';
import { Popover } from '../../components/overlay/popover';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Chatbot/Widget',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const QUICK_REPLIES = ['비밀번호를 잊었어요', '계정이 잠겼어요', '사람과 이야기할래요'];

export const PC: Story = {
  render: function Render() {
    const [asked, setAsked] = useState<string[]>([QUICK_REPLIES[0]]);
    const [draft, setDraft] = useState('');

    const ask = (text: string) => setAsked([...asked, text]);

    const send = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      ask(draft.trim());
      setDraft('');
    };

    const bot = (
      <Avatar name="인포팀 도우미" size="tiny" aria-hidden>
        <Avatar.Fallback>
          <SparklesIcon />
        </Avatar.Fallback>
      </Avatar>
    );

    return (
      <div className="min-h-dvh break-keep">
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
          <Skeleton className="h-8 w-56" />
          <Skeleton shape="text" lines={4} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="aspect-video" />
            <Skeleton className="aspect-video" />
            <Skeleton className="aspect-video" />
          </div>
        </main>

        <Popover defaultOpen>
          <Popover.Trigger asChild>
            <FloatingButton aria-label="인포팀 도우미에게 묻기">
              <ChatBubbleOvalLeftEllipsisIcon />
            </FloatingButton>
          </Popover.Trigger>
          <Popover.Content side="top" align="end" className="flex w-80 flex-col gap-3 sm:w-96">
            <div className="flex items-center gap-2">
              <Item size="tiny" className="min-w-0 flex-1">
                <Item.Media>{bot}</Item.Media>
                <Item.Content>
                  <Item.Title asChild>
                    <h2>인포팀 도우미</h2>
                  </Item.Title>
                  <Item.Description>보통 바로 답해요 · 사람은 평일 9시부터 6시</Item.Description>
                </Item.Content>
              </Item>
              <Popover.Close asChild>
                <IconButton variant="outline" size="tiny" aria-label="닫기" icon={<XMarkIcon />} />
              </Popover.Close>
            </div>
            <Divider />

            <ScrollArea fade className="h-72">
              <ol aria-label="대화" className="flex flex-col gap-4 pe-2">
                <li className="flex gap-2">
                  {bot}
                  <div className="text-body-b3-regular flex flex-col gap-3">
                    <p>안녕하세요. 인포팀 서비스를 쓰다 막힌 곳이 있으면 물어보세요.</p>
                    <div role="group" aria-label="자주 묻는 것" className="flex flex-wrap gap-1.5">
                      {QUICK_REPLIES.map((reply) => (
                        <Chip key={reply} size="tiny" onClick={() => ask(reply)}>
                          {reply}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </li>
                {asked.map((text, index) => (
                  <li key={`${text}-${index}`} className="flex flex-col gap-4">
                    <div className="flex justify-end">
                      <Card variant="soft" size="tiny" className="max-w-[85%]">
                        <Card.Content>{text}</Card.Content>
                      </Card>
                    </div>
                    <div className="flex gap-2">
                      {bot}
                      <p className="text-body-b3-regular">
                        로그인 화면의 비밀번호 찾기에서 GIST 메일로 재설정 링크를 받을 수 있어요.
                        링크가 오지 않으면 스팸함을 봐 주세요.
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </ScrollArea>

            <form onSubmit={send}>
              <TextField
                aria-label="메시지"
                placeholder="메시지를 적어 주세요"
                value={draft}
                onValueChange={setDraft}
              >
                <TextField.Input />
                <IconButton
                  type="submit"
                  variant="solid"
                  aria-label="보내기"
                  icon={<ArrowUpIcon />}
                  disabled={draft.trim() === ''}
                />
              </TextField>
            </form>
            <p className="text-caption-c1-regular text-center">인포팀이 운영해요</p>
          </Popover.Content>
        </Popover>
      </div>
    );
  },
};
