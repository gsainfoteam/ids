import { useState } from 'react';

import {
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/16/solid';
import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { en } from '../../../locales/en';
import { Menu } from '../../overlay/menu';
import { IdsProvider } from '../../utility/ids-provider';
import { Item } from '../item';

import { Scheduler } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const at = (day: number, hour: number, minute = 0) =>
  new CalendarDateTime(2026, 11, day, hour, minute);
const on = (day: number) => new CalendarDate(2026, 11, day);

const NOW = at(17, 10, 30);
const TODAY = on(17);

const WALL_CLOCK = 'UTC';
const weekRange = (from: CalendarDate, to: CalendarDate, locale = 'ko-KR') =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: WALL_CLOCK,
  }).formatRange(from.toDate(WALL_CLOCK), to.toDate(WALL_CLOCK));

const EVENTS: Scheduler.EventData[] = [
  {
    id: 'festival',
    title: '지스트 축제',
    start: on(19),
    end: on(21),
    allDay: true,
    colorScheme: 'warning',
  },
  {
    id: 'conference',
    title: '해외 학회 출장',
    start: on(26),
    end: new CalendarDate(2026, 12, 5),
    allDay: true,
    colorScheme: 'success',
  },
  {
    id: 'no-class',
    title: '휴강',
    start: on(18),
    end: on(19),
    allDay: true,
    colorScheme: 'neutral',
  },
  {
    id: 'grades',
    title: '중간고사 성적 공개',
    start: on(20),
    end: on(21),
    allDay: true,
    colorScheme: 'info',
  },
  {
    id: 'hackathon',
    title: 'GIST 해커톤',
    start: on(21),
    end: on(23),
    allDay: true,
    colorScheme: 'secondary',
  },
  {
    id: 'finals',
    title: '기말고사',
    start: new CalendarDate(2026, 12, 14),
    end: new CalendarDate(2026, 12, 19),
    allDay: true,
    colorScheme: 'danger',
  },

  { id: 'brunch', title: '브런치', start: at(15, 11), end: at(15, 12, 30), colorScheme: 'neutral' },
  { id: 'laundry', title: '빨래', start: at(15, 15), end: at(15, 15, 30), colorScheme: 'tertiary' },
  { id: 'retro', title: '주간 회고', start: at(15, 21), end: at(15, 22), colorScheme: 'tertiary' },

  {
    id: 'run',
    title: '아침 러닝',
    start: at(16, 7, 30),
    end: at(16, 8, 30),
    colorScheme: 'success',
  },
  { id: 'mon-lunch', title: '점심', start: at(16, 12), end: at(16, 13), colorScheme: 'neutral' },
  { id: 'graph-mon', title: '그래프 이론', start: at(16, 13), end: at(16, 14, 15) },
  { id: 'office-hour', title: '조교 면담', start: at(16, 14, 30), end: at(16, 15) },
  {
    id: 'compiler-mon',
    title: '프로그래밍 언어 및 컴파일러',
    start: at(16, 16),
    end: at(16, 17, 15),
  },
  {
    id: 'team-mon',
    title: '행복의 조건 조모임',
    start: at(16, 18),
    end: at(16, 21),
    colorScheme: 'secondary',
  },
  {
    id: 'ids-review',
    title: 'IDS 리뷰',
    start: at(16, 19),
    end: at(16, 19, 30),
    colorScheme: 'info',
  },

  { id: 'algo', title: '알고리즘 스터디', start: at(17, 9), end: at(17, 10, 30) },
  {
    id: 'room',
    title: '스터디룸 B',
    start: at(17, 10),
    end: at(17, 12),
    colorScheme: 'secondary',
  },
  { id: 'lunch', title: '점심', start: at(17, 12), end: at(17, 13), colorScheme: 'neutral' },
  { id: 'hair', title: '미용실', start: at(17, 14), end: at(17, 15, 40), colorScheme: 'tertiary' },
  {
    id: 'design',
    title: 'IDS 디자인 리뷰',
    start: at(17, 16),
    end: at(17, 17),
    colorScheme: 'info',
  },
  {
    id: 'pairing',
    title: 'Scheduler 페어링',
    start: at(17, 16, 30),
    end: at(17, 17, 30),
    colorScheme: 'info',
  },
  {
    id: 'one-on-one',
    title: '1:1',
    start: at(17, 16, 45),
    end: at(17, 17, 15),
    colorScheme: 'info',
  },
  {
    id: 'team-tue',
    title: '행복의 조건 조모임',
    start: at(17, 18),
    end: at(17, 21, 30),
    colorScheme: 'secondary',
  },

  { id: 'attendance', title: '출석 체크', start: at(18, 9), end: at(18, 9, 15) },
  {
    id: 'compiler-hw',
    title: '컴파일러 과제',
    start: at(18, 10),
    end: at(18, 12),
    colorScheme: 'tertiary',
  },
  { id: 'graph-wed', title: '그래프 이론', start: at(18, 13), end: at(18, 14, 15) },
  {
    id: 'compiler-wed',
    title: '프로그래밍 언어 및 컴파일러',
    start: at(18, 16),
    end: at(18, 17, 15),
  },
  {
    id: 'club',
    title: '동아리 세션',
    start: at(18, 20),
    end: at(18, 22),
    colorScheme: 'secondary',
  },

  { id: 'happiness', title: '행복의 조건', start: at(19, 10, 30), end: at(19, 11, 45) },
  { id: 'network', title: '컴퓨터네트워킹', start: at(19, 13), end: at(19, 14, 15) },
  { id: 'linear', title: '선형대수학과 응용', start: at(19, 14, 30), end: at(19, 15, 45) },
  { id: 'colloquium', title: 'GIST대학 콜로퀴움', start: at(19, 16), end: at(19, 17, 15) },
  {
    id: 'exam-check',
    title: '선대 중간고사 시험지 확인',
    start: at(19, 17),
    end: at(19, 18),
    colorScheme: 'warning',
  },
  { id: 'deadline', title: '과제 제출', start: at(19, 23), end: at(20, 1), colorScheme: 'danger' },

  { id: 'lab-meeting', title: '랩 미팅', start: at(20, 10), end: at(20, 11, 30) },
  {
    id: 'fri-lunch',
    title: '점심 약속',
    start: at(20, 12),
    end: at(20, 13),
    colorScheme: 'neutral',
  },
  {
    id: 'network-hw',
    title: '네트워킹 과제',
    start: at(20, 14),
    end: at(20, 17),
    colorScheme: 'tertiary',
  },
  { id: 'movie', title: '영화', start: at(20, 19, 30), end: at(20, 22), colorScheme: 'success' },
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
    defaultView: { control: 'radio', options: ['month', 'week', 'days', 'day'] },
    defaultDayCount: { control: { type: 'number', min: 2, max: 14 } },
    weekStartsOn: { control: { type: 'number', min: 0, max: 6 } },
  },
  args: {
    'aria-label': '일정표',
    events: EVENTS,
    defaultDate: TODAY,
    now: NOW,
    onViewChange: fn(),
    onDateChange: fn(),
    onDayCountChange: fn(),
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

export const Usage: Story = {
  render: () => (
    <Scheduler
      aria-label="일정표"
      events={EVENTS}
      defaultDate={TODAY}
      now={NOW}
      className="h-120"
    />
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="View"
        description="month는 그달이 든 주들, week는 locale의 첫 요일부터 7일, days는 고른 날부터 dayCount일, day는 하루입니다. 오늘은 날짜 숫자를 칠하고, 지금 시각에 선을 긋습니다."
      >
        <Showcase.Row label="month">
          <Scheduler
            events={EVENTS}
            defaultView="month"
            defaultDate={TODAY}
            now={NOW}
            aria-label="월 보기"
            className="h-160"
          />
        </Showcase.Row>
        <Showcase.Row label="week">
          <Scheduler
            events={EVENTS}
            defaultDate={TODAY}
            now={NOW}
            aria-label="주 보기"
            className="h-120"
          />
        </Showcase.Row>
        <Showcase.Row label="days">
          <Scheduler
            events={EVENTS}
            defaultView="days"
            defaultDayCount={3}
            defaultDate={TODAY}
            now={NOW}
            aria-label="3일 보기"
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
          <IdsProvider.Scope locale={en}>
            <Scheduler
              events={EVENTS}
              defaultDate={TODAY}
              now={NOW}
              aria-label="en-US"
              className="h-96"
            />
          </IdsProvider.Scope>
        </Showcase.Row>
        <Showcase.Row label="de-DE">
          <IdsProvider.Scope locale={{ ...en, language: 'de', tag: 'de-DE' }}>
            <Scheduler
              events={EVENTS}
              defaultDate={TODAY}
              now={NOW}
              aria-label="de-DE"
              className="h-96"
            />
          </IdsProvider.Scope>
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

export const MoveBetweenPeriods: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '이전, 오늘, 다음은 보기만큼(한 달, 한 주, `dayCount` 일, 하루) 옮깁니다. 바뀐 기간은 화면 읽기 프로그램에 status로 알립니다.',
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
    await expect(range(canvasElement)).toHaveTextContent(weekRange(on(15), on(21)));

    await userEvent.click(canvas.getByRole('button', { name: '다음 주' }));
    await expect(args.onDateChange).toHaveBeenLastCalledWith(on(24));
    await expect(range(canvasElement)).toHaveTextContent(weekRange(on(22), on(28)));
    await expect(canvas.getByRole('status')).toHaveTextContent(weekRange(on(22), on(28)));

    await userEvent.click(canvas.getByRole('button', { name: '오늘' }));
    await expect(args.onDateChange).toHaveBeenLastCalledWith(TODAY);

    await userEvent.click(canvas.getByRole('radio', { name: '일' }));
    await expect(args.onViewChange).toHaveBeenLastCalledWith('day');
    await expect(shownDays(canvasElement)).toEqual(['2026-11-17']);

    await userEvent.click(canvas.getByRole('button', { name: '1일 전' }));
    await expect(args.onDateChange).toHaveBeenLastCalledWith(on(16));
    await expect(shownDays(canvasElement)).toEqual(['2026-11-16']);
  },
};

export const ShowAWholeMonth: Story = {
  args: { defaultView: 'month' },
  parameters: {
    docs: {
      description: {
        story:
          '월 보기는 그달의 1일이 든 주부터 마지막 날이 든 주까지 보여 줍니다. 하루 종일과 여러 날 일정은 막대로 이어지고, 시간이 있는 일정은 시작 시각과 제목을 한 줄에 씁니다. 하루에 세 줄을 넘는 일정은 `+N개` 로 접고, 누르면 그날의 일 보기로 갑니다. 이전과 다음은 한 달씩 옮깁니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    const monthDays = () => canvasElement.querySelectorAll('[data-scheduler-month-day]');

    await expect(range(canvasElement)).toHaveTextContent('2026년 11월');
    await expect(monthDays()).toHaveLength(35);
    await expect(monthDays()[0]).toHaveAttribute('data-scheduler-month-day', '2026-11-01');
    await expect(canvas.getByText('알고리즘 스터디')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: '다음 달' }));
    await expect(args.onDateChange).toHaveBeenLastCalledWith(new CalendarDate(2026, 12, 17));
    await expect(range(canvasElement)).toHaveTextContent('2026년 12월');
    await expect(monthDays()[0]).toHaveAttribute('data-scheduler-month-day', '2026-11-29');

    await userEvent.click(canvas.getByRole('button', { name: '지난달' }));
    await userEvent.click(
      canvas.getByRole('button', { name: '2026년 11월 17일 화요일 일정 5개 더 보기' }),
    );
    await expect(args.onViewChange).toHaveBeenLastCalledWith('day');
    await expect(shownDays(canvasElement)).toEqual(['2026-11-17']);
  },
};

export const ShowAChosenNumberOfDays: Story = {
  args: { defaultView: 'days' },
  parameters: {
    docs: {
      description: {
        story:
          '`view="days"` 는 고른 날부터 `dayCount` 일(기본 3일)을 주 보기와 같은 시간 격자로 보여 줍니다. 툴바의 날 수 칸에 2일부터 14일까지 직접 입력하거나 위아래 버튼과 방향키로 바꿉니다. 이전과 다음은 `dayCount` 일씩 옮깁니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    await expect(canvas.getByRole('radio', { name: '3일' })).toBeChecked();
    await expect(shownDays(canvasElement)).toEqual(['2026-11-17', '2026-11-18', '2026-11-19']);

    await userEvent.click(canvas.getByRole('button', { name: '3일 후' }));
    await expect(args.onDateChange).toHaveBeenLastCalledWith(on(20));
    await expect(shownDays(canvasElement)).toEqual(['2026-11-20', '2026-11-21', '2026-11-22']);

    const count = canvas.getByRole('spinbutton', { name: '보여 줄 날 수' });
    await userEvent.tripleClick(count);
    await userEvent.keyboard('{Backspace}10');
    await expect(args.onDayCountChange).toHaveBeenLastCalledWith(10);
    await expect(shownDays(canvasElement)).toHaveLength(10);

    await userEvent.tripleClick(count);
    await userEvent.keyboard('{Backspace}');
    await userEvent.click(canvasElement.querySelector('[data-scheduler-range]')!);
    await userEvent.keyboard('{Escape}');
    await expect(count).toHaveValue('10일');

    await userEvent.tripleClick(count);
    await userEvent.keyboard('5');
    await expect(args.onDayCountChange).toHaveBeenLastCalledWith(5);
    await expect(shownDays(canvasElement)).toHaveLength(5);
    await expect(canvas.getByRole('radio', { name: '5일' })).toBeChecked();

    await userEvent.type(count, '{ArrowUp}');
    await expect(args.onDayCountChange).toHaveBeenLastCalledWith(6);
    await expect(canvas.getByRole('button', { name: '6일 후' })).toBeVisible();
  },
};

export const JumpToADate: Story = {
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

export const OpenAnEventOnClick: Story = {
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
        <Scheduler aria-label="일정표" events={EVENTS} defaultDate={TODAY} now={NOW}>
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
    await expect(titles.slice(0, 8)).toEqual([
      '휴강',
      '지스트 축제',
      '중간고사 성적 공개',
      'GIST 해커톤',
      '브런치',
      '빨래',
      '주간 회고',
      '아침 러닝',
    ]);
    await expect(titles.filter((title) => title === '과제 제출')).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: '스터디룸 B' }));
    await expect(canvas.getByTestId('opened')).toHaveTextContent('스터디룸 B');
  },
};

export const DragAnEventToANewTime: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`onEventChange` 를 주면 시각이 있는 일정을 끌어 옮기고 아래 끝을 끌어 길이를 바꿉니다. 둘 다 15분 단위로 맞고, 놓을 때 한 번 새 `start` 와 `end` 를 알립니다. 키보드로는 일정에서 Space 로 집고, 위아래 방향키로 15분(Shift 와 함께 1시간), 좌우 방향키로 하루씩 옮긴 뒤 Enter 로 놓습니다. 아래 끝은 Tab 으로 가는 separator "끝 시각"이라 위아래 방향키로 15분씩 바꿉니다. 앱이 `events` 를 바꿔야 자리가 바뀝니다.',
      },
    },
  },
  render: function Render() {
    const [events, setEvents] = useState(EVENTS);
    const [changed, setChanged] = useState('');

    return (
      <div className="flex w-full flex-col gap-3">
        <Scheduler
          aria-label="일정표"
          events={events}
          defaultDate={TODAY}
          now={NOW}
          onEventChange={(event, { start, end }) => {
            setEvents((previous) =>
              previous.map((item) => (item.id === event.id ? { ...item, start, end } : item)),
            );
            setChanged(`${event.title} ${start.toString()} – ${end.toString()}`);
          }}
        >
          {(event) => <Scheduler.Event onClick={() => setChanged(event.title)} />}
        </Scheduler>
        <p className="text-body-b3-regular" data-testid="changed">
          {changed}
        </p>
      </div>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const changed = canvas.getByTestId('changed');
    const column = (id: string) =>
      canvasElement
        .querySelector(`[data-scheduler-slot="${id}"]`)
        ?.closest('[data-scheduler-column]')
        ?.getAttribute('data-scheduler-column');

    canvas.getByRole('button', { name: '알고리즘 스터디' }).focus();
    await userEvent.keyboard('[Space]');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
    await expect(canvas.getByText(/^11월 18일 수요일 오전 9:30/)).toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(changed).toHaveTextContent(
        '알고리즘 스터디 2026-11-18T09:30:00 – 2026-11-18T11:00:00',
      ),
    );
    await waitFor(() => expect(column('algo')).toBe('2026-11-18'));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: '알고리즘 스터디' })).toHaveFocus(),
    );

    const end = canvas.getByRole('separator', { name: '알고리즘 스터디 끝 시각' });
    await expect(end).toHaveAttribute('aria-valuetext', '오전 11:00');
    end.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(changed).toHaveTextContent(
        '알고리즘 스터디 2026-11-18T09:30:00 – 2026-11-18T11:15:00',
      ),
    );
    await expect(end).toHaveAttribute('aria-valuetext', '오전 11:15');

    canvas.getAllByRole('button', { name: '점심' })[0]!.focus();
    await userEvent.keyboard('[Space]{ArrowDown}{Escape}');
    await expect(changed).not.toHaveTextContent('점심');
    await expect(canvas.getByText('제자리에 두었습니다: 점심')).toBeInTheDocument();
  },
};

export const AddRightClickMenus: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Scheduler.EventMenu` 는 일정을 우클릭했을 때, `Scheduler.SlotMenu` 는 빈 시간 칸을 우클릭했을 때 열 `Menu.Item` 들을 children 함수로 돌려줍니다. 빈 칸은 포인터 아래의 30분 `{ start, end }` 로 넘어옵니다. 메뉴를 주지 않은 곳은 브라우저 메뉴가 그대로 뜹니다. 이 스토리는 `onEventChange` 도 줘서, 메뉴와 함께 일정을 끌어 옮기고 길이를 바꿀 수 있습니다.',
      },
    },
  },
  render: function Render() {
    const [events, setEvents] = useState(EVENTS);
    const [done, setDone] = useState('');

    return (
      <div className="flex w-full flex-col gap-3">
        <Scheduler
          aria-label="일정표"
          events={events}
          defaultDate={TODAY}
          now={NOW}
          onEventChange={(event, { start, end }) =>
            setEvents((previous) =>
              previous.map((item) => (item.id === event.id ? { ...item, start, end } : item)),
            )
          }
        >
          {(event) => <Scheduler.Event onClick={() => setDone(event.title)} />}
          <Scheduler.EventMenu>
            {(event) => (
              <>
                <Menu.Item onSelect={() => setDone(`${event.title} 열기`)}>
                  <ArrowTopRightOnSquareIcon />
                  열기
                </Menu.Item>
                <Menu.Item onSelect={() => setDone(`${event.title} 복제`)}>
                  <DocumentDuplicateIcon />
                  복제
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item
                  onSelect={() => {
                    setEvents((previous) => previous.filter((item) => item.id !== event.id));
                    setDone(`${event.title} 삭제`);
                  }}
                >
                  <TrashIcon />
                  삭제
                </Menu.Item>
              </>
            )}
          </Scheduler.EventMenu>
          <Scheduler.SlotMenu>
            {({ start, end }) => (
              <Menu.Item
                onSelect={() => {
                  setEvents((previous) => [
                    ...previous,
                    { id: `new-${start.toString()}`, title: '새 일정', start, end },
                  ]);
                  setDone(`새 일정 ${start.toString()} – ${end.toString()}`);
                }}
              >
                <PlusIcon />
                여기에 일정 만들기
              </Menu.Item>
            )}
          </Scheduler.SlotMenu>
        </Scheduler>
        <p className="text-body-b3-regular" data-testid="done">
          {done}
        </p>
      </div>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const done = canvas.getByTestId('done');

    const algo = canvas.getByRole('button', { name: '알고리즘 스터디' });
    const { left: algoLeft, top: algoTop } = algo.getBoundingClientRect();
    await userEvent.pointer({
      keys: '[MouseRight]',
      target: algo,
      coords: { clientX: algoLeft + 8, clientY: algoTop + 8 },
    });
    const eventMenu = await canvas.findByRole('menu', { name: '알고리즘 스터디' });
    await expect(eventMenu).toBeVisible();
    await userEvent.click(canvas.getByRole('menuitem', { name: '삭제' }));
    await waitFor(() => expect(done).toHaveTextContent('알고리즘 스터디 삭제'));
    await expect(canvas.queryByRole('button', { name: '알고리즘 스터디' })).toBeNull();

    const sunday = canvasElement.querySelector<HTMLElement>(
      '[data-scheduler-column="2026-11-15"]',
    )!;
    const { left, top, height } = sunday.getBoundingClientRect();
    await userEvent.pointer({
      keys: '[MouseRight]',
      target: sunday,
      coords: { clientX: left + 8, clientY: top + (height / 24) * 9.2 },
    });
    await expect(
      await canvas.findByRole('menu', { name: '11월 15일 일요일 오전 9:00' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('menuitem', { name: '여기에 일정 만들기' }));
    await waitFor(() =>
      expect(done).toHaveTextContent('새 일정 2026-11-15T09:00:00 – 2026-11-15T09:30:00'),
    );
  },
};

export const CreateAnEventBySelectingTime: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`onSlotSelect` 를 주면 빈 시간 칸을 끌어 시간을 고릅니다. 15분 단위로 맞고, 끄는 동안 고른 시간이 칸 위에 보이며, 놓을 때 한 번 `{ start, end, allDay: false }` 를 넘깁니다. 그냥 누르면 고르지 않고, Escape 는 취소합니다. 터치는 250ms 를 누르고 있어야 시작합니다. 앱은 넘어온 시간으로 일정을 만들거나 만들기 창을 엽니다.',
      },
    },
  },
  render: function Render() {
    const [events, setEvents] = useState(EVENTS);
    const [selected, setSelected] = useState('');

    return (
      <div className="flex w-full flex-col gap-3">
        <Scheduler
          aria-label="일정표"
          events={events}
          defaultDate={TODAY}
          now={NOW}
          onSlotSelect={({ start, end, allDay }) => {
            setEvents((previous) => [
              ...previous,
              { id: `new-${start.toString()}`, title: '새 일정', start, end, allDay },
            ]);
            setSelected(`${start.toString()} – ${end.toString()}`);
          }}
        />
        <p className="text-body-b3-regular" data-testid="selected">
          {selected}
        </p>
      </div>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const wednesday = canvasElement.querySelector<HTMLElement>(
      '[data-scheduler-column="2026-11-18"]',
    )!;
    const viewport = wednesday.closest<HTMLElement>('[data-scroll-area-viewport]')!;
    const board = viewport.getBoundingClientRect();
    const column = wednesday.getBoundingClientRect();
    const hour = column.height / 24;
    viewport.scrollBy({
      left: column.left + column.width / 2 - (board.left + board.width / 2),
      top: column.top + hour * 14.75 - (board.top + board.height / 2),
      behavior: 'instant',
    });
    const { left, top } = wednesday.getBoundingClientRect();
    const at = (hours: number) => ({ clientX: left + 8, clientY: top + hour * hours });

    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: wednesday, coords: at(14.1) },
      { target: wednesday, coords: at(15) },
      { target: wednesday, coords: at(15.4) },
    ]);
    await expect(canvasElement.querySelector('[data-scheduler-selection]')).toHaveTextContent(
      '오후 2:00 – 오후 3:30',
    );
    await userEvent.pointer({ keys: '[/MouseLeft]', target: wednesday, coords: at(15.4) });

    await waitFor(() =>
      expect(canvas.getByTestId('selected')).toHaveTextContent(
        '2026-11-18T14:00:00 – 2026-11-18T15:30:00',
      ),
    );
    await expect(canvasElement.querySelector('[data-scheduler-selection]')).toBeNull();
    await expect(canvas.getByText('새 일정')).toBeVisible();
  },
};

export const MoveEventsInTheMonthView: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '월 보기에서도 `onEventChange` 를 주면 일정을 끌어 다른 날로 옮깁니다. 시각은 그대로 두고 날짜만 하루 단위로 바뀌며, 여러 주에 걸친 막대도 잡은 날을 기준으로 움직입니다. 키보드로는 Space 로 집고 좌우 방향키로 하루, 위아래 방향키로 한 주씩 옮긴 뒤 Enter 로 놓습니다. `onSlotSelect` 를 주면 빈 날 칸을 끌어 여러 날을 고르고, 놓을 때 `{ start, end, allDay: true }` 를 넘깁니다.',
      },
    },
  },
  render: function Render() {
    const [events, setEvents] = useState(EVENTS);
    const [done, setDone] = useState('');

    return (
      <div className="flex w-full flex-col gap-3">
        <Scheduler
          aria-label="일정표"
          events={events}
          defaultView="month"
          defaultDate={TODAY}
          now={NOW}
          onEventChange={(event, { start, end }) => {
            setEvents((previous) =>
              previous.map((item) => (item.id === event.id ? { ...item, start, end } : item)),
            );
            setDone(`${event.title} ${start.toString()} – ${end.toString()}`);
          }}
          onSlotSelect={({ start, end, allDay }) => {
            setEvents((previous) => [
              ...previous,
              { id: `new-${start.toString()}`, title: '새 일정', start, end, allDay },
            ]);
            setDone(`새 일정 ${start.toString()} – ${end.toString()}`);
          }}
        />
        <p className="text-body-b3-regular" data-testid="done">
          {done}
        </p>
      </div>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const done = canvas.getByTestId('done');

    canvasElement.querySelector<HTMLElement>('[data-scheduler-event="festival"]')!.focus();
    await userEvent.keyboard('[Space]{ArrowRight}{ArrowDown}');
    await expect(canvas.getByText('2026년 11월 27일 금요일 시작')).toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(done).toHaveTextContent('지스트 축제 2026-11-27 – 2026-11-29'));

    const cell = (day: string) =>
      canvasElement.querySelector<HTMLElement>(`[data-scheduler-month-day="${day}"]`)!;
    const middleOf = (element: HTMLElement) => {
      const { left, bottom, width } = element.getBoundingClientRect();
      return { clientX: left + width / 2, clientY: bottom - 6 };
    };
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: cell('2026-11-09'), coords: middleOf(cell('2026-11-09')) },
      { target: cell('2026-11-10'), coords: middleOf(cell('2026-11-10')) },
      { target: cell('2026-11-11'), coords: middleOf(cell('2026-11-11')) },
    ]);
    await expect(
      canvasElement.querySelectorAll('[data-scheduler-month-day][data-selected]'),
    ).toHaveLength(3);
    await userEvent.pointer({
      keys: '[/MouseLeft]',
      target: cell('2026-11-11'),
      coords: middleOf(cell('2026-11-11')),
    });
    await waitFor(() =>
      expect(done).toHaveTextContent('새 일정 2026-11-09T00:00:00 – 2026-11-12T00:00:00'),
    );
    await expect(canvas.getByText('새 일정')).toBeVisible();
  },
};

export const DrawYourOwnEventContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`events` 에 앱의 필드를 더해도 자식 함수가 그 타입 그대로 받습니다. `Scheduler.Event` 에 children 을 주면 기본 제목과 시각 대신 그 내용을 그립니다.',
      },
    },
  },
  render: () => (
    <Scheduler aria-label="일정표" events={ROOMS} defaultDate={TODAY} now={NOW}>
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

export const ControlTheDateAndView: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`view` 와 `onViewChange`, `date` 와 `onDateChange` 로 보기와 날짜를 앱의 state 에 둡니다. 툴바로 옮기거나 보기를 바꾸면 두 콜백이 새 값을 알립니다.',
      },
    },
  },
  render: function Render() {
    const [view, setView] = useState<Scheduler.View>('day');
    const [date, setDate] = useState(on(18));

    return (
      <div className="flex w-full flex-col gap-3">
        <Scheduler
          aria-label="일정표"
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
    await userEvent.click(canvas.getByRole('button', { name: '1일 후' }));
    await expect(canvas.getByTestId('state')).toHaveTextContent('day · 2026-11-19');
    await userEvent.click(canvas.getByRole('radio', { name: '주' }));
    await expect(canvas.getByTestId('state')).toHaveTextContent('week · 2026-11-19');
  },
};

export const ShowDatesInAnotherLocale: Story = {
  decorators: [
    (Story) => (
      <IdsProvider.Scope locale={en}>
        <Story />
      </IdsProvider.Scope>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          '요일, 날짜, 시각은 가장 가까운 IdsProvider 의 locale 을 따릅니다. 첫 요일은 locale 을 따르고 `weekStartsOn` 으로 바꿉니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(range(canvasElement)).toHaveTextContent(weekRange(on(15), on(21), 'en-US'));
    await expect(
      canvas.getByRole('region', { name: /Tuesday, November 17, 2026/ }),
    ).toHaveAttribute('data-scheduler-column', '2026-11-17');
  },
};

export const Keyboard: Story = {
  tags: ['verification'],
  parameters: {
    docs: {
      description: {
        story:
          'Tab은 이전, 오늘, 다음, 기간, 보기 순서로 멈춥니다. 보기는 라디오 그룹이라 화살표가 포커스와 보기를 함께 바꿉니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    const stops = ['지난주', '오늘', '다음 주'];
    for (const name of stops) {
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name })).toHaveFocus();
    }
    await userEvent.tab();
    await expect(document.activeElement).toHaveAttribute('data-scheduler-range');
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: '주' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: '3일' })).toHaveFocus();
    await expect(args.onViewChange).toHaveBeenLastCalledWith('days');
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: '일' })).toHaveFocus();
    await expect(args.onViewChange).toHaveBeenLastCalledWith('day');
    await expect(canvas.getByRole('button', { name: '1일 전' })).toBeVisible();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('radio', { name: '월' })).toHaveFocus();
    await expect(args.onViewChange).toHaveBeenLastCalledWith('month');
  },
};

export const Overlap: Story = {
  tags: ['verification'],
  parameters: {
    docs: {
      description: {
        story:
          '시간이 겹치는 일정은 칸을 세로로 나눠 나란히 섭니다. 옆 칸이 그 시간에 비어 있으면 그만큼 넓게 그려서, 서로 덮는 일정이 없습니다. 여러 날 종일 일정은 막대 하나로 잇고, 자정을 넘는 일정은 두 날에 나눠 그립니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const algo = eventBox(canvasElement, 'algo');
    const room = eventBox(canvasElement, 'room');
    const lunch = eventBox(canvasElement, 'lunch');
    await expect(Math.abs(algo.width - room.width)).toBeLessThan(1);
    await expect(room.left).toBeGreaterThanOrEqual(algo.right - 1);
    await expect(lunch.width).toBeGreaterThan(algo.width * 1.5);

    const pairing = eventBox(canvasElement, 'pairing');
    const oneOnOne = eventBox(canvasElement, 'one-on-one');
    await expect(Math.abs(pairing.width - oneOnOne.width)).toBeLessThan(1);
    await expect(oneOnOne.left).toBeGreaterThanOrEqual(pairing.right - 1);

    const festival = canvasElement.querySelectorAll('[data-scheduler-event="festival"]');
    await expect(festival).toHaveLength(1);
    await expect(festival[0].getBoundingClientRect().width).toBeGreaterThan(algo.width * 1.5);
    await expect(canvasElement.querySelectorAll('[data-scheduler-event="deadline"]')).toHaveLength(
      2,
    );
  },
};
