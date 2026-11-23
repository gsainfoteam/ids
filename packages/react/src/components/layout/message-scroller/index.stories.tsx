import { useState } from 'react';

import { ArrowDownCircleIcon } from '@heroicons/react/16/solid';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase, holdTheNextCall } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Bubble } from '../../data/bubble';
import { Message } from '../../data/message';

import { MessageScroller } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Layout/MessageScroller',
  component: MessageScroller,
  tags: ['autodocs'],
  argTypes: {
    stickToBottom: { control: 'boolean' },
    scrollOnAppend: { control: 'radio', options: ['end', 'start'] },
    'aria-busy': { control: 'boolean' },
  },
  args: { stickToBottom: true, scrollOnAppend: 'end', 'aria-busy': false },
} satisfies Meta<typeof MessageScroller>;

export default meta;
type Story = StoryObj<typeof meta>;

type Line = { id: string; mine: boolean; text: string };

const CONVERSATION: Line[] = [
  { id: 'c1', mine: false, text: '내일 동아리 회의 몇 시였지?' },
  { id: 'c2', mine: true, text: '저녁 7시, 학생회관 2층이야.' },
  { id: 'c3', mine: false, text: '발표 자료는 누가 가져와?' },
  { id: 'c4', mine: true, text: '내가 노트북에 담아 갈게.' },
  { id: 'c5', mine: false, text: '좋아. 간식은 내가 사 갈게.' },
  { id: 'c6', mine: true, text: '고마워. 음료도 부탁해.' },
  { id: 'c7', mine: false, text: '몇 명 오는지 알아?' },
  { id: 'c8', mine: true, text: '지금까지 열두 명이 온다고 했어.' },
  { id: 'c9', mine: false, text: '그럼 의자를 더 빌려야겠다.' },
  { id: 'c10', mine: true, text: '관리실에 내가 말해 둘게.' },
  { id: 'c11', mine: false, text: '회의 끝나고 저녁도 같이 먹을래?' },
  { id: 'c12', mine: true, text: '좋아, 학교 앞 국밥집 어때?' },
];

const EARLIER: Line[] = [
  { id: 'e1', mine: false, text: '지난주 회의록 올려 줄 수 있어?' },
  { id: 'e2', mine: true, text: '응, 오늘 밤에 올릴게.' },
  { id: 'e3', mine: false, text: '다음 회의 장소도 정해야 해.' },
  { id: 'e4', mine: true, text: '학생회관 2층을 빌려 볼게.' },
  { id: 'e5', mine: false, text: '고마워!' },
];

const INCOMING = ['방금 관리실에서 의자 열 개 빌려 준대.', '국밥집 7시 반에 예약했어.', '내일 봐!'];

const ANSWER = [
  '전공 필수 세 과목이 남았어요. 2학기에 모두 열립니다.',
  '운영체제는 화요일과 목요일 오후 1시예요.',
  '컴퓨터 구조는 월요일과 수요일 오전 10시 반이에요.',
  '소프트웨어 공학은 목요일 오후 3시라 다른 과목과 겹치지 않아요.',
  '모두 9학점이라 교양을 9학점 더 들을 수 있어요.',
  '근로 장학 시간과도 겹치지 않게 골랐어요.',
];

const frame = cn('h-80 w-full max-w-md overflow-hidden rounded-container border border-neutral');

const viewportIn = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('[data-message-scroller] [role="log"]')!;

const jumpIn = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('[data-message-scroller-jump]')!;

const distanceToEnd = (viewport: HTMLElement) =>
  viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

const topWithin = (element: Element, viewport: HTMLElement) =>
  element.getBoundingClientRect().top - viewport.getBoundingClientRect().top;

const AT_THE_END_PX = 1;
const SAME_PLACE_PX = 1;
const LIST_PADDING_PX = 16;

export const Playground: Story = {
  render: (args) => (
    <div className={frame}>
      <MessageScroller {...args}>
        {CONVERSATION.map((line) => (
          <Message key={line.id} align={line.mine ? 'end' : 'start'}>
            <Bubble variant={line.mine ? 'solid' : 'soft'}>{line.text}</Bubble>
          </Message>
        ))}
      </MessageScroller>
    </div>
  ),
};

export const Usage: Story = {
  render: () => (
    <div className="rounded-container border-neutral h-80 w-full max-w-md overflow-hidden border">
      <MessageScroller>
        <Message align="start">
          <Bubble variant="soft">내일 동아리 회의 몇 시였지?</Bubble>
        </Message>
        <Message align="end">
          <Bubble variant="solid">저녁 7시, 학생회관 2층이야.</Bubble>
        </Message>
        <Message align="start">
          <Bubble variant="soft">발표 자료는 누가 가져와?</Bubble>
        </Message>
        <Message align="end">
          <Bubble variant="solid">내가 노트북에 담아 갈게.</Bubble>
        </Message>
        <Message align="start">
          <Bubble variant="soft">좋아. 간식은 내가 사 갈게.</Bubble>
        </Message>
        <Message align="end">
          <Bubble variant="solid">고마워. 음료도 부탁해.</Bubble>
        </Message>
        <Message align="start">
          <Bubble variant="soft">몇 명 오는지 알아?</Bubble>
        </Message>
        <Message align="end">
          <Bubble variant="solid">지금까지 열두 명이 온다고 했어.</Bubble>
        </Message>
      </MessageScroller>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Messages"
        description="자식마다 <li> 로 감싼 <ol> 이 role=log 인 스크롤 영역 안에 놓입니다. 처음에는 맨 아래에서 시작합니다."
      >
        <Showcase.Row label="end (기본)">
          <div className={frame}>
            <MessageScroller>
              {CONVERSATION.map((line) => (
                <Message key={line.id} align={line.mine ? 'end' : 'start'}>
                  <Bubble variant={line.mine ? 'solid' : 'soft'}>{line.text}</Bubble>
                </Message>
              ))}
            </MessageScroller>
          </div>
        </Showcase.Row>
        <Showcase.Row label="넘치지 않음">
          <div className={frame}>
            <MessageScroller>
              {CONVERSATION.slice(0, 3).map((line) => (
                <Message key={line.id} align={line.mine ? 'end' : 'start'}>
                  <Bubble variant={line.mine ? 'solid' : 'soft'}>{line.text}</Bubble>
                </Message>
              ))}
            </MessageScroller>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Loading"
        description="aria-busy 면 위쪽 가운데에 Spinner 가 내용 위로 뜹니다. 목록을 밀지 않습니다."
      >
        <Showcase.Row label="aria-busy">
          <div className={frame}>
            <MessageScroller aria-busy>
              {CONVERSATION.map((line) => (
                <Message key={line.id} align={line.mine ? 'end' : 'start'}>
                  <Bubble variant={line.mine ? 'solid' : 'soft'}>{line.text}</Bubble>
                </Message>
              ))}
            </MessageScroller>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const FollowNewMessages: Story = {
  render: function Render() {
    const [lines, setLines] = useState(CONVERSATION);

    return (
      <div className="flex w-full max-w-md flex-col items-start gap-3">
        <div className={frame}>
          <MessageScroller>
            {lines.map((line) => (
              <Message key={line.id} align={line.mine ? 'end' : 'start'}>
                <Bubble variant={line.mine ? 'solid' : 'soft'}>{line.text}</Bubble>
              </Message>
            ))}
          </MessageScroller>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            setLines((current) => [
              ...current,
              {
                id: `in${current.length}`,
                mine: false,
                text: INCOMING[current.length % INCOMING.length],
              },
            ])
          }
        >
          메시지 받기
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '채팅 목록을 MessageScroller 로 감싸면 따로 설정하지 않아도 맨 아래에 있을 때 새 메시지를 따라갑니다(`stickToBottom`). 위로 올려 읽는 중에는 따라가지 않고, 아래로 가기 버튼에 새 메시지 수를 셉니다. 버튼을 누르거나 맨 아래로 내리면 다시 따라갑니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const viewport = () => viewportIn(canvasElement);

    await waitFor(() => expect(distanceToEnd(viewport())).toBeLessThanOrEqual(AT_THE_END_PX));
    await expect(jumpIn(canvasElement)).toHaveAttribute('inert');

    await userEvent.click(canvas.getByRole('button', { name: '메시지 받기' }));
    await waitFor(() => expect(distanceToEnd(viewport())).toBeLessThanOrEqual(AT_THE_END_PX));

    viewport().scrollTo({ top: 0 });
    await waitFor(() => expect(jumpIn(canvasElement)).not.toHaveAttribute('inert'));

    await userEvent.click(canvas.getByRole('button', { name: '메시지 받기' }));
    await waitFor(() => expect(viewport().scrollTop).toBe(0));
    const toBottom = await canvas.findByRole('button', { name: '맨 아래로, 새 메시지 1개' });

    await userEvent.click(toBottom);
    await waitFor(() => expect(distanceToEnd(viewport())).toBeLessThanOrEqual(AT_THE_END_PX));
    await waitFor(() => expect(jumpIn(canvasElement)).toHaveAttribute('inert'));

    await userEvent.click(canvas.getByRole('button', { name: '메시지 받기' }));
    await waitFor(() => expect(distanceToEnd(viewport())).toBeLessThanOrEqual(AT_THE_END_PX));
  },
};

export const KeepTheQuestionInViewInAnAiChat: Story = {
  render: function Render() {
    const [turns, setTurns] = useState([{ id: 0, question: '남은 전공 필수가 뭐야?', answer: 2 }]);

    return (
      <div className="flex w-full max-w-md flex-col gap-3">
        <div className={frame}>
          <MessageScroller scrollOnAppend="start">
            {turns.map((turn) => (
              <div key={turn.id} className="flex flex-col gap-3">
                <Message align="end">
                  <Bubble variant="solid">{turn.question}</Bubble>
                </Message>
                {ANSWER.slice(0, turn.answer).map((paragraph) => (
                  <p key={paragraph} className="text-body-b2-regular">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </MessageScroller>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setTurns((current) => [
                ...current,
                { id: current.length, question: '시간표로 정리해 줘', answer: 0 },
              ])
            }
          >
            질문하기
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setTurns((current) =>
                current.map((turn, index) =>
                  index === current.length - 1
                    ? { ...turn, answer: Math.min(turn.answer + 1, ANSWER.length) }
                    : turn,
                ),
              )
            }
          >
            답 이어 쓰기
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'AI 대화는 scrollOnAppend="start" 를 줍니다. 새로 붙은 자식(질문과 답을 묶은 한 차례)을 위쪽에 맞추고, 답은 그 아래로 자랍니다. 답이 화면을 넘겨도 질문은 위쪽에 남습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const viewport = () => viewportIn(canvasElement);
    const lastTurn = () => [...viewport().querySelectorAll('li')].at(-1)!;

    await userEvent.click(canvas.getByRole('button', { name: '질문하기' }));
    await waitFor(() =>
      expect(Math.abs(topWithin(lastTurn(), viewport()) - LIST_PADDING_PX)).toBeLessThanOrEqual(
        SAME_PLACE_PX,
      ),
    );

    for (let written = 0; written < ANSWER.length; written++)
      await userEvent.click(canvas.getByRole('button', { name: '답 이어 쓰기' }));

    await waitFor(() =>
      expect(Math.abs(topWithin(lastTurn(), viewport()) - LIST_PADDING_PX)).toBeLessThanOrEqual(
        SAME_PLACE_PX,
      ),
    );
    await waitFor(() => expect(jumpIn(canvasElement)).not.toHaveAttribute('inert'));
  },
};

export const LoadEarlierMessages: Story = {
  args: { onReachStart: fn() },
  render: function Render(args) {
    const [lines, setLines] = useState(CONVERSATION);
    const [loading, setLoading] = useState(false);
    const [more, setMore] = useState(true);

    return (
      <div className={frame}>
        <MessageScroller
          aria-busy={loading}
          onReachStart={async () => {
            if (!more) return;
            setLoading(true);
            await args.onReachStart?.();
            setLines((current) => [...EARLIER, ...current]);
            setMore(false);
            setLoading(false);
          }}
        >
          {lines.map((line) => (
            <Message key={line.id} align={line.mine ? 'end' : 'start'}>
              <Bubble variant={line.mine ? 'solid' : 'soft'}>{line.text}</Bubble>
            </Message>
          ))}
        </MessageScroller>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '맨 위에 닿으면 `onReachStart` 를 부릅니다. 불러오는 동안 `aria-busy` 로 Spinner 를 띄우고 스크롤 영역을 바쁨으로 표시하며, 앞 기록이 붙어도 읽던 메시지는 제자리에 있습니다.',
      },
    },
  },
  play: async ({ args, canvas, canvasElement }) => {
    const finishLoading = holdTheNextCall(args.onReachStart);
    const viewport = () => viewportIn(canvasElement);
    const firstLine = () => canvas.getByText(CONVERSATION[0].text);

    viewport().scrollTo({ top: 0 });
    await waitFor(() => expect(args.onReachStart).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-message-scroller-loader]')).not.toBeNull(),
    );
    const before = topWithin(firstLine(), viewport());

    finishLoading();
    await canvas.findByText(EARLIER[0].text);
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-message-scroller-loader]')).toBeNull(),
    );
    await expect(Math.abs(topWithin(firstLine(), viewport()) - before)).toBeLessThanOrEqual(
      SAME_PLACE_PX,
    );
    await expect(viewport().scrollTop).toBeGreaterThan(0);
  },
};

export const ReplaceTheJumpButton: Story = {
  render: () => (
    <div className={frame}>
      <MessageScroller>
        {CONVERSATION.map((line) => (
          <Message key={line.id} align={line.mine ? 'end' : 'start'}>
            <Bubble variant={line.mine ? 'solid' : 'soft'}>{line.text}</Bubble>
          </Message>
        ))}
        <MessageScroller.Jump variant="soft" colorScheme="primary">
          <ArrowDownCircleIcon />
          최신 메시지
        </MessageScroller.Jump>
      </MessageScroller>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '아래로 가기 버튼은 기본으로 붙습니다. 바꿀 때만 MessageScroller.Jump 를 자식으로 둡니다. Button 의 속성을 그대로 받고, 스크롤 영역 아래 가운데에 뜹니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const viewport = () => viewportIn(canvasElement);

    viewport().scrollTo({ top: 0 });
    await waitFor(() => expect(jumpIn(canvasElement)).not.toHaveAttribute('inert'));
    const button = canvas.getByRole('button', { name: '최신 메시지' });

    const area = canvasElement.querySelector('[data-message-scroller]')!.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    await expect(rect.bottom).toBeLessThanOrEqual(area.bottom);
    await expect(rect.left).toBeGreaterThanOrEqual(area.left);
    await expect(
      Math.abs((rect.left + rect.right) / 2 - (area.left + area.right) / 2),
    ).toBeLessThanOrEqual(SAME_PLACE_PX);

    await userEvent.click(button);
    await waitFor(() => expect(distanceToEnd(viewport())).toBeLessThanOrEqual(AT_THE_END_PX));
  },
};

export const NarrowTheListInAWideChat: Story = {
  tags: ['custom-design'],
  render: () => (
    <div className="border-neutral rounded-container h-80 w-full max-w-2xl overflow-hidden border">
      <MessageScroller>
        <MessageScroller.List className="mx-auto w-full max-w-sm gap-6 px-6">
          {CONVERSATION.map((line) => (
            <Message key={line.id} align={line.mine ? 'end' : 'start'}>
              <Bubble variant={line.mine ? 'solid' : 'soft'}>{line.text}</Bubble>
            </Message>
          ))}
        </MessageScroller.List>
      </MessageScroller>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'IDS 의 목록 간격(`gap-4 p-4`)을 바꾼 앱의 디자인입니다. 메시지를 `MessageScroller.List` 로 감싸고 그 `className` 으로 넓은 화면에서 목록을 가운데의 좁은 단으로 모으고 간격을 넓힙니다.',
      },
    },
  },
};
