import { useState } from 'react';

import { ArrowPathIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { IconButton } from '../../action/icon-button';
import { Marker } from '../../feedback/marker';
import { Accordion } from '../accordion';
import { Avatar } from '../avatar';
import { Bubble } from '../bubble';

import { Message } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const froms = ['user', 'assistant'] as const;
const aligns = ['start', 'end'] as const;
const statuses = ['sent', 'pending', 'error', 'read'] as const;

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
    from: { control: 'radio', options: froms },
    align: { control: 'radio', options: aligns },
    status: { control: 'radio', options: statuses },
    avatar: { control: false },
    time: { control: false },
  },
  args: {
    from: 'user',
    name: '김지수',
    time: SENT_AT,
    status: 'sent',
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

export const Gallery: Story = {
  render: () => (
    <Showcase className="break-keep">
      <Showcase.Section
        title="From"
        description="from=user 는 끝에 붙고 본문을 Bubble 로 감쌉니다. assistant 는 시작에 붙고 본문을 그대로 그립니다."
      >
        <Showcase.Row label="user">
          <div className="w-96">
            <Message from="user">오늘 셔틀 몇 시에 와?</Message>
          </div>
        </Showcase.Row>
        <Showcase.Row label="assistant">
          <div className="w-96">
            <Message from="assistant" name="GIST 도우미" time={ANSWERED_AT}>
              <Marker>
                <GlobeAltIcon />웹 검색 3건
              </Marker>
              12시 20분에 광주송정역행 셔틀이 학생회관 앞에서 출발해요.
              <Message.Actions />
            </Message>
          </div>
        </Showcase.Row>
      </Showcase.Section>
      <Showcase.Section
        title="Status"
        description="Footer 가 시간과 상태 문구를 그리고, error 는 실패 줄과 다시 보내기 버튼을 그립니다."
      >
        {statuses.map((status) => (
          <Showcase.Row key={status} label={status}>
            <div className="w-96">
              <Message from="user" time={SENT_AT} status={status} onRetry={() => {}}>
                학식 메뉴 알려 줘
                <Message.Footer />
              </Message>
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>
      <Showcase.Section
        title="Group"
        description="첫 메시지만 아바타와 이름을, 마지막 메시지만 시간을 보입니다."
      >
        <Showcase.Row label="start">
          <div className="w-96">
            <Message.Group align="start" aria-label="김지수의 메시지">
              <Message name="김지수" avatar={JISU} time={SENT_AT}>
                <Bubble>학식 메뉴 알려 줘</Bubble>
              </Message>
              <Message name="김지수" avatar={JISU} time={SENT_AT}>
                <Bubble>오늘 거</Bubble>
              </Message>
            </Message.Group>
          </div>
        </Showcase.Row>
        <Showcase.Row label="end">
          <div className="w-96">
            <Message.Group align="end" aria-label="내 메시지">
              <Message name="나" time={ANSWERED_AT}>
                <Bubble align="end" variant="solid">
                  돈가스랑 우동이야
                </Bubble>
              </Message>
              <Message name="나" time={ANSWERED_AT} status="read">
                <Bubble align="end" variant="solid">
                  같이 갈래?
                </Bubble>
                <Message.Footer />
              </Message>
            </Message.Group>
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

export const AssistantAnswer: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6 break-keep">
      <Message from="user">다음 학기 전공 필수 과목 정리해 줘</Message>
      <Message from="assistant" name="GIST 도우미" time={ANSWERED_AT}>
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

export const Copy: Story = {
  render: () => (
    <div className="w-96 break-keep">
      <Message from="assistant" name="GIST 도우미">
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

export const Retry: Story = {
  args: { onRetry: fn() },
  render: function Render(args) {
    const [status, setStatus] = useState<Message.Status>('error');

    return (
      <div className="w-96 break-keep">
        <Message
          from="user"
          time={SENT_AT}
          status={status}
          onRetry={() => {
            args.onRetry?.();
            setStatus('pending');
          }}
        >
          보내기 실패한 글
          <Message.Footer />
        </Message>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`status="error"` 면 본문 아래에 실패 줄을 그리고, `onRetry` 가 있으면 다시 보내기 버튼을 둡니다. 실패 줄은 `role="status"` 라 상태가 바뀌면 스크린 리더가 읽습니다.',
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('보내지 못했어요');
    await userEvent.click(canvas.getByRole('button', { name: '다시 보내기' }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
    await expect(canvas.getByRole('article')).toHaveAttribute('data-status', 'pending');
    await expect(canvas.queryByRole('button', { name: '다시 보내기' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('article')).toHaveTextContent('보내는 중');
  },
};

export const Group: Story = {
  render: () => (
    <div className="w-96 break-keep">
      <Message.Group align="start" aria-label="김지수의 메시지">
        <Message name="김지수" avatar={JISU} time={SENT_AT}>
          <Bubble>학식 메뉴 알려 줘</Bubble>
        </Message>
        <Message name="김지수" avatar={JISU} time={SENT_AT}>
          <Bubble>오늘 거</Bubble>
        </Message>
        <Message name="김지수" avatar={JISU} time={ANSWERED_AT} status="read">
          <Bubble>2층 식당</Bubble>
          <Message.Footer />
        </Message>
      </Message.Group>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`Message.Group` 은 같은 사람의 연속 메시지를 `role="group"` 으로 묶고 `align` 을 안의 Message 에 줍니다. 첫 메시지만 아바타와 이름을 보이고, 다음 메시지는 아바타 자리를 비워 두고 이름을 스크린 리더에만 남깁니다. 시간은 마지막 메시지의 Footer 에 섭니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const articles = canvas.getAllByRole('article', { name: '김지수' });
    await expect(articles).toHaveLength(3);
    const headers = articles.map((article) => article.querySelector('header'));
    await expect(headers[0]).not.toHaveClass('sr-only');
    await expect(headers[1]).toHaveClass('sr-only');
    await expect(articles[1]!.querySelector('[data-message-avatar]')).toHaveClass('invisible');
    await expect(articles[0]!.querySelector('time')).toBeNull();
    await expect(articles[2]!.querySelector('footer time')).toHaveAttribute(
      'datetime',
      ANSWERED_AT.toISOString(),
    );
    await expect(articles[2]).toHaveTextContent('읽음');
  },
};

export const Keyboard: Story = {
  render: () => (
    <div className="w-96 break-keep">
      <Message from="assistant" name="GIST 도우미">
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
