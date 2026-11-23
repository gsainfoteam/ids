import { useState } from 'react';

import { ArrowPathIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Marker } from '../../feedback/marker';
import { Accordion } from '../accordion';
import { Avatar } from '../avatar';
import { Bubble } from '../bubble';

import { Message } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const shapes = ['bubble', 'plain'] as const;
const aligns = ['start', 'end'] as const;
const statuses = ['sent', 'pending', 'error'] as const;

function photo(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="hsl(${hue} 70% 78%)"/><circle cx="80" cy="66" r="30" fill="hsl(${hue} 40% 36%)"/><path d="M22 160c6-36 31-54 58-54s52 18 58 54z" fill="hsl(${hue} 40% 36%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const JISU = photo(210);
const SENT_AT = new Date('2026-11-17T12:20:00+09:00');
const ANSWERED_AT = new Date('2026-11-17T12:21:00+09:00');

const meta = {
  title: 'Data/Message',
  component: Message,
  tags: ['autodocs'],
  argTypes: {
    shape: { control: 'radio', options: shapes },
    align: { control: 'radio', options: aligns },
    status: { control: 'radio', options: statuses },
    avatar: { control: false },
    time: { control: false },
  },
  args: {
    shape: 'bubble',
    align: 'end',
    name: '김지수',
    time: SENT_AT,
    status: 'sent',
    unread: 1,
    children: '오늘 셔틀 몇 시에 와?',
  },
  render: (args) => (
    <div className="w-96 break-keep">
      <Message {...args} />
    </div>
  ),
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <div className="w-96 break-keep">
      <Message name="김지수" avatar={JISU} time={SENT_AT}>
        오늘 셔틀 몇 시에 와?
      </Message>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase className="break-keep">
      <Showcase.Section
        title="Shape × Align"
        description="shape 은 모양을, align 은 붙는 쪽을 고릅니다. bubble 은 본문을 Bubble 로 감싸고, plain 은 본문을 메시지 폭 그대로 그립니다. 누가 말하는지와는 상관없습니다."
      >
        <Showcase.Row label="bubble · start">
          <div className="w-96">
            <Message name="김지수" time={SENT_AT}>
              오늘 셔틀 몇 시에 와?
            </Message>
          </div>
        </Showcase.Row>
        <Showcase.Row label="bubble · end">
          <div className="w-96">
            <Message align="end" time={SENT_AT}>
              오늘 셔틀 몇 시에 와?
            </Message>
          </div>
        </Showcase.Row>
        <Showcase.Row label="plain · start">
          <div className="w-96">
            <Message shape="plain" name="GIST 도우미" time={ANSWERED_AT}>
              <Marker>
                <GlobeAltIcon />웹 검색 3건
              </Marker>
              12시 20분에 광주송정역행 셔틀이 학생회관 앞에서 출발해요.
              <Message.Actions />
            </Message>
          </div>
        </Showcase.Row>
        <Showcase.Row label="plain · start (내 말)">
          <div className="w-96">
            <Message shape="plain" name="나" time={SENT_AT}>
              다음 학기 전공 필수 과목을 성적표와 견줘서, 남은 과목과 들을 수 있는 학기를 정리해 줘.
            </Message>
          </div>
        </Showcase.Row>
      </Showcase.Section>
      <Showcase.Section
        title="Status"
        description="pending 은 말풍선을 옅게 하고 빛을 지나가게 합니다. error 는 테두리를 빨갛게 하고, 시간 자리에 다시 보내기 버튼을, 아래에 실패 줄을 둡니다."
      >
        {statuses.map((status) => (
          <Showcase.Row key={status} label={status}>
            <div className="w-96">
              <Message align="end" time={SENT_AT} status={status} onRetry={() => {}}>
                학식 메뉴 알려 줘
              </Message>
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>
      <Showcase.Section
        title="Unread"
        description="unread 에 숫자를 주면 안 읽은 사람 수를, true 를 주면 점을 말풍선 옆에 그립니다. 0 이나 false 가 되면 줄어들며 사라집니다."
      >
        <Showcase.Row label="3">
          <div className="w-96">
            <Message align="end" time={SENT_AT} unread={3}>
              12시 20분 셔틀 타자
            </Message>
          </div>
        </Showcase.Row>
        <Showcase.Row label="true">
          <div className="w-96">
            <Message align="end" time={SENT_AT} unread>
              도착했어?
            </Message>
          </div>
        </Showcase.Row>
        <Showcase.Row label="0">
          <div className="w-96">
            <Message align="end" time={SENT_AT} unread={0}>
              다 읽었어
            </Message>
          </div>
        </Showcase.Row>
      </Showcase.Section>
      <Showcase.Section title="Avatar">
        <Showcase.Row label="src">
          <div className="w-96">
            <Message name="김지수" avatar={JISU} time={SENT_AT}>
              <Bubble>내일 수업 휴강이래</Bubble>
            </Message>
          </div>
        </Showcase.Row>
        <Showcase.Row label="initials">
          <div className="w-96">
            <Message name="Alice Kim" time={SENT_AT}>
              <Message.Avatar />
              <Bubble>See you at the library</Bubble>
            </Message>
          </div>
        </Showcase.Row>
        <Showcase.Row label="node">
          <div className="w-96">
            <Message
              name="GIST 도우미"
              avatar={
                <Avatar name="GIST 도우미" size="tiny">
                  <Avatar.Fallback>
                    <SparklesIcon />
                  </Avatar.Fallback>
                </Avatar>
              }
            >
              무엇을 도와 드릴까요?
            </Message>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const FoldReasoningAndToolSteps: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6 break-keep">
      <Message align="end">다음 학기 전공 필수 과목 정리해 줘</Message>
      <Message shape="plain" name="GIST 도우미" time={ANSWERED_AT}>
        <Accordion type="multiple">
          <Accordion.Item value="reasoning">
            <Accordion.Header asChild>
              <h3>
                <Accordion.Trigger>
                  <Marker asChild>
                    <span>
                      <SparklesIcon />
                      12초 동안 생각했어요
                    </span>
                  </Marker>
                </Accordion.Trigger>
              </h3>
            </Accordion.Header>
            <Accordion.Content>
              성적표에서 들은 과목을 찾고, 학사 요람의 전공 필수와 견줬어요.
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
        <p>남은 전공 필수는 운영체제, 컴퓨터 구조, 소프트웨어 공학 세 과목이에요.</p>
        <Message.Actions>
          <Message.Copy />
          <IconButton aria-label="다시 답하기" icon={<ArrowPathIcon />} />
        </Message.Actions>
      </Message>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '추론과 도구 줄은 Marker 를 Accordion.Trigger 에 넣어 접습니다. `Message.Actions` 에 자식을 주면 복사 버튼 대신 그 버튼들을 그립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const answer = canvas.getByRole('article', { name: 'GIST 도우미' });
    await expect(answer).toHaveAttribute('data-align', 'start');
    await expect(canvas.getByRole('group', { name: '메시지 동작' })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: '12초 동안 생각했어요' }));
    await expect(canvas.getByRole('button', { name: '12초 동안 생각했어요' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  },
};

export const CopyAnAnswer: Story = {
  render: () => (
    <div className="w-96 break-keep">
      <Message shape="plain" name="GIST 도우미">
        12시 20분에 광주송정역행 셔틀이 와요.
        <Message.Actions />
      </Message>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`Message.Actions` 에 자식이 없으면 복사 버튼 하나를 그립니다. 본문(`Message.Content`)의 글자를 복사하고, 잠깐 체크로 바뀌며 스크린 리더에 알립니다. 다른 글을 복사하려면 `<Message.Copy text={markdown} />` 를 둡니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const copied: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => void copied.push(text) },
    });
    await userEvent.click(await canvas.findByRole('button', { name: '메시지 복사' }));
    await waitFor(() => expect(copied).toEqual(['12시 20분에 광주송정역행 셔틀이 와요.']));
    await expect(canvas.getByRole('status')).toHaveTextContent('복사했습니다');
  },
};

export const ResendAFailedMessage: Story = {
  args: { onRetry: fn() },
  render: function Render(args) {
    const [status, setStatus] = useState<Message.Status>('error');

    return (
      <div className="w-96 break-keep">
        <Message
          align="end"
          time={SENT_AT}
          status={status}
          onRetry={() => {
            args.onRetry?.();
            setStatus('pending');
          }}
        >
          보내기 실패한 글
        </Message>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`status="error"` 면 말풍선 테두리가 빨개지고, 아래에 실패 줄을 그립니다. 보내지 못한 메시지에는 보낸 시간이 없으므로 시간 자리에 다시 보내기 버튼(`onRetry`)이 섭니다. 실패 줄은 `role="status"` 라 상태가 바뀌면 스크린 리더가 읽습니다. 다시 보내면 `pending` 이 되어 말풍선이 옅어지고 빛이 지나갑니다.',
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('보내지 못했어요');
    await expect(canvas.getByRole('article').querySelector('time')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: '다시 보내기' }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
    await expect(canvas.getByRole('article')).toHaveAttribute('data-status', 'pending');
    await expect(canvas.queryByRole('button', { name: '다시 보내기' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('article')).toHaveTextContent('보내는 중');
    await expect(canvas.getByRole('article').querySelector('time')).not.toBeNull();
  },
};

export const CountWhoHasNotReadIt: Story = {
  render: function Render() {
    const [unread, setUnread] = useState(2);
    const [seen, setSeen] = useState(false);

    return (
      <div className="flex w-96 flex-col gap-4 break-keep">
        <Message align="end" time={SENT_AT} unread={unread}>
          12시 20분 셔틀 타자
        </Message>
        <Message align="end" time={ANSWERED_AT} unread={!seen}>
          도착했어?
        </Message>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="tiny"
            onClick={() => setUnread((count) => Math.max(0, count - 1))}
          >
            한 명 읽음
          </Button>
          <Button variant="outline" size="tiny" onClick={() => setSeen(true)}>
            1대1 읽음
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '단체방은 `unread` 에 안 읽은 사람 수를, 1대1은 `true` 를 줍니다. 숫자와 점은 말풍선 옆, 시간 위에 서고, 스크린 리더는 "2명 안 읽음", "안 읽음" 으로 읽습니다. 0 이나 `false` 가 되면 줄어들며 사라집니다. 보내는 중이거나 실패한 메시지에는 그리지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const [group, direct] = canvas.getAllByRole('article');
    await expect(group).toHaveTextContent('2명 안 읽음');
    await expect(direct).toHaveTextContent('안 읽음');

    await userEvent.click(canvas.getByRole('button', { name: '한 명 읽음' }));
    await expect(canvas.getAllByRole('article')[0]).toHaveTextContent('1명 안 읽음');
    await userEvent.click(canvas.getByRole('button', { name: '한 명 읽음' }));
    await waitFor(() =>
      expect(canvas.getAllByRole('article')[0]!.querySelector('[data-message-unread]')).toBeNull(),
    );

    await userEvent.click(canvas.getByRole('button', { name: '1대1 읽음' }));
    await waitFor(() =>
      expect(canvas.getAllByRole('article')[1]!.querySelector('[data-message-unread]')).toBeNull(),
    );
  },
};

export const Keyboard: Story = {
  tags: ['verification'],
  render: () => (
    <div className="w-96 break-keep">
      <Message shape="plain" name="GIST 도우미">
        도서관은 밤 11시까지 열어요.
        <Message.Actions>
          <Message.Copy />
          <IconButton aria-label="다시 답하기" icon={<ArrowPathIcon />} />
        </Message.Actions>
      </Message>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '동작 버튼은 평범한 버튼이라 Tab 으로 차례로 갑니다. 줄 자체는 포커스를 받지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => {} },
    });
    const copy = await canvas.findByRole('button', { name: '메시지 복사' });
    await userEvent.tab();
    await expect(copy).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: '다시 답하기' })).toHaveFocus();
  },
};
