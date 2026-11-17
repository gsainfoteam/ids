import { useState } from 'react';

import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Item } from '../item';

import { Scheduler } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const at = (day: number, hour: number, minute = 0) =>
  new CalendarDateTime(2026, 11, day, hour, minute);
const on = (day: number) => new CalendarDate(2026, 11, day);

const NOW = at(17, 10, 30);
const TODAY = on(17);

const EVENTS: Scheduler.EventData[] = [
  { id: 'standup', title: '팀 회의', start: at(16, 9), end: at(16, 9, 30) },
  { id: 'algo', title: '알고리즘', start: at(17, 9), end: at(17, 10, 30) },
  {
    id: 'room',
    title: '스터디룸 B',
    start: at(17, 10),
    end: at(17, 12),
    colorScheme: 'secondary',
  },
  { id: 'lunch', title: '점심', start: at(17, 12), end: at(17, 13), colorScheme: 'neutral' },
  { id: 'os', title: '운영체제', start: at(18, 13), end: at(18, 14, 30), colorScheme: 'tertiary' },
  { id: 'review', title: '코드 리뷰', start: at(18, 13, 30), end: at(18, 14), colorScheme: 'info' },
  { id: 'deadline', title: '과제 제출', start: at(19, 23), end: at(20, 1), colorScheme: 'danger' },
  { id: 'lab', title: '물리 실험', start: at(20, 14), end: at(20, 17), colorScheme: 'success' },
  {
    id: 'festival',
    title: '지스트 축제',
    start: on(19),
    end: on(20),
    allDay: true,
    colorScheme: 'warning',
  },
];

const SCHEMES = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'success',
  'warning',
  'danger',
  'info',
] as const;

const SCHEME_EVENTS: Scheduler.EventData[] = SCHEMES.map((colorScheme, index) => ({
  id: colorScheme,
  title: colorScheme,
  start: at(17, 8 + index),
  end: at(17, 9 + index),
  colorScheme,
}));

const ROOMS = [
  { id: 'a', title: '알고리즘', room: 'C 102', start: at(16, 9), end: at(16, 10, 30) },
  { id: 'b', title: '운영체제', room: 'C 205', start: at(17, 13), end: at(17, 14, 30) },
  { id: 'c', title: '확률과 통계', room: 'B 301', start: at(18, 9), end: at(18, 10, 30) },
];

const meta = {
  title: 'Data/Scheduler',
  component: Scheduler,
  tags: ['autodocs'],
  argTypes: {
    defaultView: { control: 'radio', options: ['week', 'day'] },
    locale: { control: 'radio', options: ['ko-KR', 'en-US', 'de-DE', 'ja-JP'] },
    weekStartsOn: { control: { type: 'number', min: 0, max: 6 } },
  },
  args: {
    events: EVENTS,
    defaultDate: TODAY,
    now: NOW,
    onViewChange: fn(),
    onDateChange: fn(),
  },
} satisfies Meta<typeof Scheduler>;

export default meta;
type Story = StoryObj<typeof meta>;

const range = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLButtonElement>('[data-scheduler-range]')!;
const shownDays = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll('[data-scheduler-day]')].map((node) =>
    node.getAttribute('data-scheduler-day'),
  );
const eventBox = (canvasElement: HTMLElement, id: string) =>
  canvasElement.querySelector(`[data-scheduler-event="${id}"]`)!.getBoundingClientRect();

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="View"
        description="week는 locale의 첫 요일부터 7일, day는 하루입니다. 오늘 열은 머리줄 숫자를 칠하고, 지금 시각에 선을 긋습니다."
      >
        <Showcase.Row label="week">
          <Scheduler
            events={EVENTS}
            defaultDate={TODAY}
            now={NOW}
            aria-label="주 보기"
            className="h-120"
          />
        </Showcase.Row>
        <Showcase.Row label="day">
          <Scheduler
            events={EVENTS}
            defaultView="day"
            defaultDate={TODAY}
            now={NOW}
            aria-label="일 보기"
            className="h-120"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Color scheme"
        description="일정마다 colorScheme을 줍니다. 기본은 primary입니다."
      >
        <Showcase.Row label="colorScheme">
          <Scheduler
            events={SCHEME_EVENTS}
            defaultView="day"
            defaultDate={TODAY}
            now={NOW}
            aria-label="색"
            className="h-120"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Locale"
        description="요일, 날짜, 시각과 첫 요일을 locale에서 읽습니다."
      >
        <Showcase.Row label="en-US">
          <Scheduler
            events={EVENTS}
            defaultDate={TODAY}
            now={NOW}
            locale="en-US"
            aria-label="en-US"
            className="h-96"
          />
        </Showcase.Row>
        <Showcase.Row label="de-DE">
          <Scheduler
            events={EVENTS}
            defaultDate={TODAY}
            now={NOW}
            locale="de-DE"
            aria-label="de-DE"
            className="h-96"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <Scheduler
            events={[]}
            defaultDate={TODAY}
            now={NOW}
            aria-label="빈 주"
            className="h-80"
          />
        </Showcase.Row>
        <Showcase.Row label="another week">
          <Scheduler
            events={EVENTS}
            defaultDate={on(25)}
            now={NOW}
            aria-label="다른 주"
            className="h-80"
          />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Navigation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '이전, 오늘, 다음은 보기만큼(주 또는 하루) 옮깁니다. 바뀐 기간은 화면 읽기 프로그램에 status로 알립니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    await expect(shownDays(canvasElement)).toEqual([
      '2026-11-15',
      '2026-11-16',
      '2026-11-17',
      '2026-11-18',
      '2026-11-19',
      '2026-11-20',
      '2026-11-21',
    ]);
    await expect(range(canvasElement)).toHaveTextContent('2026년 11월 15일 ~ 21일');

    await userEvent.click(canvas.getByRole('button', { name: '다음 주' }));
    await expect(args.onDateChange).toHaveBeenLastCalledWith(on(24));
    await expect(range(canvasElement)).toHaveTextContent('2026년 11월 22일 ~ 28일');
    await expect(canvas.getByRole('status')).toHaveTextContent('2026년 11월 22일 ~ 28일');

    await userEvent.click(canvas.getByRole('button', { name: '오늘' }));
    await expect(args.onDateChange).toHaveBeenLastCalledWith(TODAY);

    await userEvent.click(canvas.getByRole('radio', { name: '일' }));
    await expect(args.onViewChange).toHaveBeenLastCalledWith('day');
    await expect(shownDays(canvasElement)).toEqual(['2026-11-17']);

    await userEvent.click(canvas.getByRole('button', { name: '이전 날' }));
    await expect(args.onDateChange).toHaveBeenLastCalledWith(on(16));
    await expect(shownDays(canvasElement)).toEqual(['2026-11-16']);
  },
};

export const GoToDate: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '기간 버튼은 Calendar를 담은 Popover를 엽니다. 포커스는 고른 날로 들어가고, 날을 고르면 그날이 든 주로 옮기며 닫힙니다.',
      },
    },
  },
  play: async ({ canvasElement, args, userEvent }) => {
    await userEvent.click(range(canvasElement));
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('data-calendar-day', '2026-11-17'),
    );
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await expect(args.onDateChange).toHaveBeenLastCalledWith(new CalendarDate(2026, 12, 1));
    await waitFor(() => expect(document.querySelector('[data-calendar]')).toBeNull());
    await expect(shownDays(canvasElement)[0]).toBe('2026-11-29');
  },
};

export const ViewByKeyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Tab은 이전, 오늘, 다음, 기간, 보기 순서로 멈춥니다. 보기는 라디오 그룹이라 화살표가 포커스와 보기를 함께 바꿉니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    const stops = ['이전 주', '오늘', '다음 주'];
    for (const name of stops) {
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name })).toHaveFocus();
    }
    await userEvent.tab();
    await expect(document.activeElement).toHaveAttribute('data-scheduler-range');
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: '주' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: '일' })).toHaveFocus();
    await expect(args.onViewChange).toHaveBeenLastCalledWith('day');
    await expect(canvas.getByRole('button', { name: '이전 날' })).toBeVisible();
  },
};

export const ClickableEvents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '자식 함수가 일정마다 `Scheduler.Event` 를 돌려줍니다. `onClick` 을 주면 제목이 버튼이 되어 Tab 순서에 들어갑니다. 순서는 날짜, 시작 시각 순입니다.',
      },
    },
  },
  render: function Render() {
    const [opened, setOpened] = useState('');

    return (
      <div className="flex w-full flex-col gap-3">
        <Scheduler events={EVENTS} defaultDate={TODAY} now={NOW}>
          {(event) => <Scheduler.Event onClick={() => setOpened(event.title)} />}
        </Scheduler>
        <p className="text-body-b3-regular" data-testid="opened">
          {opened}
        </p>
      </div>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const titles = [...canvasElement.querySelectorAll('[data-scheduler-event] button')].map(
      (button) => button.textContent,
    );
    await expect(titles).toEqual([
      '지스트 축제',
      '지스트 축제',
      '팀 회의',
      '알고리즘',
      '스터디룸 B',
      '점심',
      '운영체제',
      '코드 리뷰',
      '과제 제출',
      '과제 제출',
      '물리 실험',
    ]);
    await userEvent.click(canvas.getByRole('button', { name: '스터디룸 B' }));
    await expect(canvas.getByTestId('opened')).toHaveTextContent('스터디룸 B');
  },
};

export const CustomContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`events` 에 앱의 필드를 더해도 자식 함수가 그 타입 그대로 받습니다. `Scheduler.Event` 에 children 을 주면 기본 제목과 시각 대신 그 내용을 그립니다.',
      },
    },
  },
  render: () => (
    <Scheduler events={ROOMS} defaultDate={TODAY} now={NOW}>
      {(event) => (
        <Scheduler.Event colorScheme="tertiary">
          <Item.Content>
            <Item.Title truncate>{event.title}</Item.Title>
            <Item.Description>{event.room}</Item.Description>
          </Item.Content>
        </Scheduler.Event>
      )}
    </Scheduler>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('C 205')).toBeInTheDocument();
  },
};

export const Overlap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '겹치는 일정은 칸을 나눠 나란히 섭니다. 겹침이 끝나면 다음 일정은 다시 칸 폭 전체를 씁니다. 자정을 넘는 일정은 두 날에 나눠 그립니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const algo = eventBox(canvasElement, 'algo');
    const room = eventBox(canvasElement, 'room');
    const lunch = eventBox(canvasElement, 'lunch');
    await expect(Math.abs(algo.width - room.width)).toBeLessThan(1);
    await expect(room.left).toBeGreaterThan(algo.left);
    await expect(lunch.width).toBeGreaterThan(algo.width * 1.5);
    await expect(canvasElement.querySelectorAll('[data-scheduler-event="deadline"]')).toHaveLength(
      2,
    );
  },
};

export const Controlled: Story = {
  render: function Render() {
    const [view, setView] = useState<Scheduler.View>('day');
    const [date, setDate] = useState(on(18));

    return (
      <div className="flex w-full flex-col gap-3">
        <Scheduler
          events={EVENTS}
          view={view}
          onViewChange={setView}
          date={date}
          onDateChange={setDate}
          now={NOW}
        />
        <p className="text-body-b3-regular" data-testid="state">
          {view} · {date.toString()}
        </p>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '다음 날' }));
    await expect(canvas.getByTestId('state')).toHaveTextContent('day · 2026-11-19');
    await userEvent.click(canvas.getByRole('radio', { name: '주' }));
    await expect(canvas.getByTestId('state')).toHaveTextContent('week · 2026-11-19');
  },
};

export const Locale: Story = {
  args: { locale: 'en-US' },
  parameters: {
    docs: {
      description: {
        story:
          '`locale` 이 없으면 IdsProvider 의 locale 을 씁니다. 첫 요일은 locale 을 따르고 `weekStartsOn` 으로 바꿉니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(range(canvasElement)).toHaveTextContent('November 15 – 21, 2026');
    await expect(
      canvas.getByRole('region', { name: /Tuesday, November 17, 2026/ }),
    ).toHaveAttribute('data-scheduler-column', '2026-11-17');
  },
};
