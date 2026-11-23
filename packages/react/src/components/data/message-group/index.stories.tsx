import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Bubble } from '../bubble';
import { Message } from '../message';

import { MessageGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const aligns = ['start', 'end'] as const;

function photo(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="hsl(${hue} 70% 78%)"/><circle cx="80" cy="66" r="30" fill="hsl(${hue} 40% 36%)"/><path d="M22 160c6-36 31-54 58-54s52 18 58 54z" fill="hsl(${hue} 40% 36%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const JISU = photo(210);
const SENT_AT = new Date('2026-11-17T12:20:00+09:00');
const ANSWERED_AT = new Date('2026-11-17T12:21:00+09:00');

const meta = {
  title: 'Data/MessageGroup',
  component: MessageGroup,
  tags: ['autodocs'],
  argTypes: {
    align: { control: 'radio', options: aligns },
  },
  args: {
    align: 'start',
    'aria-label': '김지수의 메시지',
  },
  render: (args) => (
    <div className="w-96 break-keep">
      <MessageGroup {...args}>
        <Message name="김지수" avatar={JISU} time={SENT_AT}>
          <Bubble>학식 메뉴 알려 줘</Bubble>
        </Message>
        <Message name="김지수" avatar={JISU} time={SENT_AT}>
          <Bubble>오늘 거</Bubble>
        </Message>
        <Message name="김지수" avatar={JISU} time={SENT_AT}>
          <Bubble>2학생회관 기준으로</Bubble>
        </Message>
      </MessageGroup>
    </div>
  ),
} satisfies Meta<typeof MessageGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <div className="w-96 break-keep">
      <MessageGroup aria-label="김지수의 메시지">
        <Message name="김지수" avatar={JISU} time={SENT_AT}>
          <Bubble>학식 메뉴 알려 줘</Bubble>
        </Message>
        <Message name="김지수" avatar={JISU} time={SENT_AT}>
          <Bubble>오늘 거</Bubble>
        </Message>
      </MessageGroup>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Align"
        description="첫 메시지만 아바타와 이름을, 마지막 메시지만 시간을 보입니다. 이어지는 말풍선은 맞닿는 모서리가 작아집니다."
      >
        <Showcase.Row label="start">
          <div className="w-96 break-keep">
            <MessageGroup align="start" aria-label="김지수의 메시지">
              <Message name="김지수" avatar={JISU} time={SENT_AT}>
                <Bubble>학식 메뉴 알려 줘</Bubble>
              </Message>
              <Message name="김지수" avatar={JISU} time={SENT_AT}>
                <Bubble>오늘 거</Bubble>
              </Message>
              <Message name="김지수" avatar={JISU} time={SENT_AT}>
                <Bubble>2학생회관 기준으로</Bubble>
              </Message>
            </MessageGroup>
          </div>
        </Showcase.Row>
        <Showcase.Row label="end">
          <div className="w-96 break-keep">
            <MessageGroup align="end" aria-label="내 메시지">
              <Message name="나" time={ANSWERED_AT} unread={2}>
                <Bubble variant="solid">돈가스랑 우동이야</Bubble>
              </Message>
              <Message name="나" time={ANSWERED_AT} unread={2}>
                <Bubble variant="solid">같이 갈래?</Bubble>
              </Message>
            </MessageGroup>
          </div>
        </Showcase.Row>
      </Showcase.Section>
      <Showcase.Section
        title="Without a Bubble"
        description="본문에 Bubble 이 없는 메시지는 마지막 메시지의 아래 줄에 시간을 그립니다."
      >
        <Showcase.Row label="본문">
          <div className="w-96 break-keep">
            <MessageGroup aria-label="GIST 도우미의 메시지">
              <Message name="GIST 도우미" time={ANSWERED_AT}>
                12시 20분에 광주송정역행 셔틀이 학생회관 앞에서 출발해요.
              </Message>
              <Message name="GIST 도우미" time={ANSWERED_AT}>
                다음 셔틀은 1시 20분이에요.
              </Message>
            </MessageGroup>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const GroupMessagesFromOnePerson: Story = {
  render: () => (
    <div className="w-96 break-keep">
      <MessageGroup align="start" aria-label="김지수의 메시지">
        <Message name="김지수" avatar={JISU} time={SENT_AT}>
          <Bubble>학식 메뉴 알려 줘</Bubble>
        </Message>
        <Message name="김지수" avatar={JISU} time={SENT_AT}>
          <Bubble>오늘 거</Bubble>
        </Message>
        <Message name="김지수" avatar={JISU} time={ANSWERED_AT}>
          <Bubble>2층 식당</Bubble>
        </Message>
      </MessageGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'MessageGroup 은 같은 사람의 연속 메시지를 `role="group"` 으로 묶고 `align` 을 안의 Message 에 줍니다. 첫 메시지만 아바타와 이름을 보이고, 다음 메시지는 아바타 자리를 비워 두고 이름을 스크린 리더에만 남깁니다. 이어지는 말풍선은 맞닿는 꼬리 쪽 모서리가 작아져 한 덩어리로 보입니다. 시간은 마지막 메시지의 말풍선 옆에 섭니다.',
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
    await expect(articles[2]!.querySelector('[data-message-side] time')).toHaveAttribute(
      'datetime',
      ANSWERED_AT.toISOString(),
    );
    const bubbles = articles.map((article) => article.querySelector('[data-bubble]')!);
    const corner = (bubble: Element) => getComputedStyle(bubble).borderStartStartRadius;
    await expect(corner(bubbles[1]!)).toBe(getComputedStyle(bubbles[1]!).borderEndStartRadius);
    await expect(corner(bubbles[0]!)).not.toBe(corner(bubbles[1]!));
  },
};
