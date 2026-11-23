import { useState } from 'react';

import { CalendarDate } from '@internationalized/date';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { IdsProvider } from '../../utility/ids-provider';

import { Calendar, type DateRange } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const today = new CalendarDate(2026, 9, 15);
const sizes = ['standard', 'tiny'] as const;
const modes = ['single', 'range', 'multiple'] as const;

const meta = {
  title: 'Data/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
    selectionMode: { control: 'radio', options: modes },
    size: { control: 'radio', options: sizes },
    monthsToShow: { control: { type: 'number', min: 1, max: 3 } },
    readOnly: { control: 'boolean' },
  },
  args: {
    today,
    size: 'standard',
    monthsToShow: 1,
    onValueChange: fn(),
    onMonthChange: fn(),
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

const day = (canvasElement: HTMLElement, key: string) =>
  canvasElement.querySelector<HTMLButtonElement>(`[data-calendar-day="${key}"]`)!;
const focusedDay = () => (document.activeElement as HTMLElement).dataset.calendarDay;
const grid = (canvasElement: HTMLElement) => canvasElement.querySelector('[role=grid]');

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <Calendar defaultValue={new CalendarDate(2026, 9, 18)} today={new CalendarDate(2026, 9, 15)} />
  ),
};

const valueFor = {
  single: { defaultValue: new CalendarDate(2026, 9, 18) },
  range: {
    defaultValue: { start: new CalendarDate(2026, 9, 10), end: new CalendarDate(2026, 9, 17) },
  },
  multiple: {
    defaultValue: [
      new CalendarDate(2026, 9, 3),
      new CalendarDate(2026, 9, 4),
      new CalendarDate(2026, 9, 24),
    ],
  },
} as const;

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Selection mode × Size"
        description="고른 날은 primary 로 채우고, 기간 안의 날은 primary soft, 오늘은 primary 글자와 테두리입니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={modes}
          render={(size, mode) => (
            <Calendar
              {...({ selectionMode: mode, ...valueFor[mode] } as Calendar.Props)}
              size={size}
              today={today}
              aria-label={`${mode} ${size}`}
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Parts"
        description='Calendar.Caption layout="dropdown" 은 연도와 월을 바로 고르는 native select 입니다. Calendar.WeekNumber 는 주차 열을, Calendar.Footer 는 달력 아래 알림 영역을 붙입니다.'
      >
        <Showcase.Row label="Caption dropdown">
          <Calendar today={today} aria-label="드롭다운">
            <Calendar.Caption layout="dropdown" />
          </Calendar>
        </Showcase.Row>
        <Showcase.Row label="WeekNumber · Footer">
          <Calendar today={today} defaultValue={new CalendarDate(2026, 9, 18)} aria-label="주차">
            <Calendar.WeekNumber />
            <Calendar.Footer>9월 18일을 골랐습니다.</Calendar.Footer>
          </Calendar>
        </Showcase.Row>
        <Showcase.Row label="two months">
          <Calendar
            selectionMode="range"
            defaultValue={{
              start: new CalendarDate(2026, 9, 24),
              end: new CalendarDate(2026, 10, 6),
            }}
            monthsToShow={2}
            today={today}
            aria-label="두 달"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="limits">
          <Calendar
            today={today}
            min={new CalendarDate(2026, 9, 7)}
            max={new CalendarDate(2026, 9, 25)}
            disabled={{ dayOfWeek: [0, 6] }}
            aria-label="제한"
          />
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <Calendar
            readOnly
            defaultValue={new CalendarDate(2026, 9, 18)}
            today={today}
            aria-label="읽기 전용"
          />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <Calendar
            disabled
            defaultValue={new CalendarDate(2026, 9, 18)}
            today={today}
            aria-label="비활성"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Locale">
        <Showcase.Row label="en-US">
          <IdsProvider.Scope locale="en-US">
            <Calendar today={today} aria-label="English" />
          </IdsProvider.Scope>
        </Showcase.Row>
        <Showcase.Row label="de-DE">
          <IdsProvider.Scope locale="de-DE">
            <Calendar today={today} aria-label="Deutsch" />
          </IdsProvider.Scope>
        </Showcase.Row>
        <Showcase.Row label="ar-EG-u-nu-arab · rtl">
          <IdsProvider.Scope locale="ar-EG-u-nu-arab" dir="rtl">
            <Calendar today={today} aria-label="العربية" />
          </IdsProvider.Scope>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const PickARange: Story = {
  render: function Render() {
    const [range, setRange] = useState<DateRange | null>(null);

    return (
      <div className="flex flex-col gap-3">
        <Calendar
          selectionMode="range"
          value={range}
          onValueChange={setRange}
          monthsToShow={2}
          today={today}
        />
        <output aria-label="기간" className="text-body-b3-regular">
          {range?.start?.day ?? '–'} ~ {range?.end?.day ?? '–'}
        </output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'selectionMode="range" 는 첫 클릭이 시작, 두 번째 클릭이 끝입니다. 끝을 고르기 전에는 포인터나 키보드 포커스가 있는 날까지 기간을 미리 보여 줍니다. 더 이른 날을 고르면 시작과 끝이 바뀌고, 세 번째 클릭은 새 기간을 시작합니다. 값은 { start, end } 이고, monthsToShow 로 두 달을 나란히 보입니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(day(canvasElement, '2026-09-24'));
    await expect(canvas.getByLabelText('기간')).toHaveTextContent('24 ~ –');
    await userEvent.hover(day(canvasElement, '2026-10-02'));
    await waitFor(() =>
      expect(day(canvasElement, '2026-09-30')).toHaveAttribute('data-range-preview'),
    );
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(day(canvasElement, '2026-09-23')).toHaveAttribute('data-range-preview'),
    );
    await expect(day(canvasElement, '2026-09-30')).not.toHaveAttribute('data-range-preview');
    await userEvent.click(day(canvasElement, '2026-10-02'));
    await expect(canvas.getByLabelText('기간')).toHaveTextContent('24 ~ 2');
    await expect(day(canvasElement, '2026-09-30')).toHaveAttribute('data-range-middle');
    await userEvent.click(day(canvasElement, '2026-09-20'));
    await userEvent.click(day(canvasElement, '2026-09-12'));
    await expect(canvas.getByLabelText('기간')).toHaveTextContent('12 ~ 20');
  },
};

export const PickSeveralDays: Story = {
  args: { selectionMode: 'multiple', defaultValue: [new CalendarDate(2026, 9, 3)] },
  parameters: {
    docs: {
      description: {
        story:
          'selectionMode="multiple" 은 누를 때마다 그날을 넣고 빼며, 값은 CalendarDate 배열입니다. 격자는 aria-multiselectable 로 여러 날을 고를 수 있다고 알립니다.',
      },
    },
  },
  play: async ({ canvasElement, args, userEvent }) => {
    await userEvent.click(day(canvasElement, '2026-09-10'));
    await userEvent.click(day(canvasElement, '2026-09-03'));
    await expect(args.onValueChange).toHaveBeenLastCalledWith([new CalendarDate(2026, 9, 10)]);
    await expect(grid(canvasElement)).toHaveAttribute('aria-multiselectable', 'true');
  },
};

export const JumpToAFarYearWithDropdowns: Story = {
  args: {
    min: new CalendarDate(1990, 1, 1),
    max: new CalendarDate(2026, 12, 31),
    defaultMonth: new CalendarDate(2026, 9, 1),
    children: <Calendar.Caption layout="dropdown" />,
  },
  parameters: {
    docs: {
      description: {
        story:
          '생년월일처럼 먼 날짜는 <Calendar.Caption layout="dropdown" /> 을 넣어 연도와 월 목록으로 바로 옮깁니다. 목록은 min/max 안의 연도만 보이고, 범위를 벗어난 달은 고를 수 없습니다. 한국어는 연도를 먼저 놓습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: '연도' }), '1995');
    await expect(args.onMonthChange).toHaveBeenLastCalledWith(new CalendarDate(1995, 9, 1));
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: '월' }), '0');
    await expect(grid(canvasElement)).toHaveAccessibleName('1995년 1월');
    await userEvent.click(canvas.getByRole('button', { name: '이전 달' }));
    await expect(grid(canvasElement)).toHaveAccessibleName('1994년 12월');
  },
};

export const BlockDaysOutsideLimits: Story = {
  args: {
    min: new CalendarDate(2026, 9, 10),
    max: new CalendarDate(2026, 10, 20),
    disabled: { dayOfWeek: [0] },
  },
  parameters: {
    docs: {
      description: {
        story:
          'min/max 밖의 날짜와 disabled 가 막은 날짜는 고를 수 없고 키보드도 건너뜁니다. disabled 는 react-day-picker 의 matcher 라서 함수, 날짜, 기간, 요일을 받습니다. 범위 끝에서 달 버튼은 눌리지 않습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    await expect(day(canvasElement, '2026-09-09')).toBeDisabled();
    await expect(day(canvasElement, '2026-09-20')).toBeDisabled();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.click(day(canvasElement, '2026-09-19'));
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(focusedDay()).toBe('2026-09-21'));
    const previous = canvas.getByRole('button', { name: '이전 달' });
    await expect(previous).toHaveAttribute('aria-disabled', 'true');
    const next = canvas.getByRole('button', { name: '다음 달' });
    await userEvent.click(next);
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await expect(next).toHaveFocus();
    const noHoverFillUnderPointer = { backgroundColor: 'rgba(0, 0, 0, 0)' };
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: '다음 달' })).toHaveStyle(noHoverFillUnderPointer),
    );
  },
};

export const MarkDaysWithEvents: Story = {
  render: function Render() {
    const [date, setDate] = useState<CalendarDate | null>(null);

    const events = [
      new CalendarDate(2026, 9, 4),
      new CalendarDate(2026, 9, 15),
      new CalendarDate(2026, 9, 22),
      new CalendarDate(2026, 10, 2),
    ];
    const busy = !!date && events.some((event) => event.compare(date) === 0);

    return (
      <Calendar value={date} onValueChange={setDate} today={new CalendarDate(2026, 9, 15)}>
        <Calendar.Day modifiers={{ event: events }}>
          {(day, state) => (
            <>
              {day.day}
              {state.modifiers.event && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 mx-auto size-1 rounded-full bg-current"
                />
              )}
            </>
          )}
        </Calendar.Day>
        <Calendar.Footer>
          {date ? (busy ? '일정이 있는 날입니다.' : '일정이 없습니다.') : '날짜를 고르세요.'}
        </Calendar.Footer>
      </Calendar>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Calendar.Day 의 modifiers 는 날짜에 이름을 붙이고, children 함수는 그 날의 상태(state.modifiers.event)를 받아 날짜 버튼의 내용을 그립니다. 여기서는 일정이 있는 날 숫자 아래에 점을 그립니다. 버튼 모양과 포커스, 이름은 IDS 가 그대로 그립니다. Calendar.Footer 는 화면 읽기 프로그램이 읽는 알림 영역입니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByText('날짜를 고르세요.')).toHaveAttribute('role', 'status');
    expect(day(canvasElement, '2026-09-22').querySelector('[aria-hidden]')).not.toBeNull();
    expect(day(canvasElement, '2026-09-21').querySelector('[aria-hidden]')).toBeNull();
    await userEvent.click(day(canvasElement, '2026-09-22'));
    await expect(canvas.getByText('일정이 있는 날입니다.')).toBeInTheDocument();
    await expect(day(canvasElement, '2026-09-22')).toHaveTextContent('22');
  },
};

export const LabelTheFirstDayOfAMonth: Story = {
  render: () => (
    <Calendar today={new CalendarDate(2026, 9, 15)}>
      <Calendar.Day>{(date) => (date.day === 1 ? `${date.month}/1` : date.day)}</Calendar.Day>
    </Calendar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Calendar.Day 의 children 은 (date, state) 를 받아 날짜 칸의 내용만 바꿉니다. 버튼 모양, 포커스, 상태 속성, 화면 읽기 프로그램이 읽는 이름은 IDS 가 그대로 그립니다. state 는 선택, 오늘, 기간, 바깥 날짜와 modifiers 를 담습니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(day(canvasElement, '2026-09-01')).toHaveTextContent('9/1');
    await expect(day(canvasElement, '2026-10-01')).toHaveTextContent('10/1');
    await expect(day(canvasElement, '2026-09-22')).toHaveTextContent('22');
    await expect(day(canvasElement, '2026-09-01')).toHaveAttribute(
      'aria-label',
      '2026년 9월 1일 화요일',
    );
  },
};

export const GoBackToToday: Story = {
  render: function Render() {
    const [date, setDate] = useState<CalendarDate | null>(null);
    const [month, setMonth] = useState(new CalendarDate(2026, 9, 1));

    return (
      <div className="flex flex-col items-start gap-3">
        <Button
          size="tiny"
          variant="outline"
          onClick={() => {
            setMonth(new CalendarDate(2026, 9, 1));
            setDate(new CalendarDate(2026, 9, 15));
          }}
        >
          오늘
        </Button>
        <Calendar
          value={date}
          onValueChange={setDate}
          month={month}
          onMonthChange={setMonth}
          today={new CalendarDate(2026, 9, 15)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'month 와 onMonthChange 로 보이는 달을 앱이 쥐면, 달력 밖의 버튼이 오늘이 있는 달로 돌아가고 오늘을 고를 수 있습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '다음 달' }));
    await expect(grid(canvasElement)).toHaveAccessibleName('2026년 10월');
    await userEvent.click(canvas.getByRole('button', { name: '오늘' }));
    await expect(grid(canvasElement)).toHaveAccessibleName('2026년 9월');
    await expect(day(canvasElement, '2026-09-15')).toHaveAttribute('data-selected');
  },
};

export const ShowWeekNumbers: Story = {
  render: () => (
    <Calendar today={new CalendarDate(2026, 9, 15)}>
      <Calendar.WeekNumber />
    </Calendar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Calendar.WeekNumber 를 넣으면 줄마다 주차 열이 붙습니다. 주차는 locale 의 첫 요일을 따릅니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[role=rowheader]')).toHaveLength(6);
    await expect(canvasElement.querySelector('th[scope=col]')).toHaveAttribute(
      'aria-label',
      '주차',
    );
  },
};

export const FollowTheLocale: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      <IdsProvider.Scope locale="en-US">
        <Calendar today={new CalendarDate(2026, 9, 15)} aria-label="English" />
      </IdsProvider.Scope>
      <IdsProvider.Scope locale="en-US-u-fw-mon">
        <Calendar today={new CalendarDate(2026, 9, 15)} aria-label="Monday first" />
      </IdsProvider.Scope>
      <IdsProvider.Scope locale="ja-JP">
        <Calendar today={new CalendarDate(2026, 9, 15)} aria-label="日本語" />
      </IdsProvider.Scope>
      <IdsProvider.Scope locale="de-DE">
        <Calendar today={new CalendarDate(2026, 9, 15)} aria-label="Deutsch" />
      </IdsProvider.Scope>
      <IdsProvider.Scope locale="ar-EG-u-nu-arab" dir="rtl">
        <Calendar today={new CalendarDate(2026, 9, 15)} aria-label="العربية" />
      </IdsProvider.Scope>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Calendar 는 가장 가까운 IdsProvider 의 locale 을 따릅니다. locale 은 BCP 47 태그이고, 달 이름, 요일, 날짜 이름은 브라우저의 Intl 로 그리므로 import 할 locale 데이터가 없습니다. 주 시작은 locale 을 따르고 -u-fw- 확장(en-US-u-fw-mon)으로 바꿉니다. 숫자 체계는 -u-nu- 확장(ar-EG-u-nu-arab)으로 바꿉니다. 버튼 이름은 IDS 메시지를 씁니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const english = canvas.getByRole('group', { name: 'English' });
    await expect(english.querySelector('th')).toHaveTextContent('S');
    await expect(english.querySelector('th')).toHaveAttribute('aria-label', 'Sunday');
    const monday = canvas.getByRole('group', { name: 'Monday first' });
    await expect(monday.querySelector('th')).toHaveAttribute('aria-label', 'Monday');
    const japanese = canvas.getByRole('group', { name: '日本語' });
    await expect(japanese.querySelector('[role=grid]')).toHaveAccessibleName('2026年9月');
    const german = canvas.getByRole('group', { name: 'Deutsch' });
    await expect(german.querySelector('th')).toHaveAttribute('aria-label', 'Montag');
    const arabic = canvas.getByRole('group', { name: 'العربية' });
    await expect(arabic).toHaveAttribute('dir', 'rtl');
    await expect(arabic.querySelector('[data-calendar-day="2026-09-15"]')).toHaveTextContent('١٥');
  },
};

export const Keyboard: Story = {
  tags: ['verification'],
  args: {
    autoFocus: true,
    defaultValue: new CalendarDate(2026, 1, 31),
    today: new CalendarDate(2026, 1, 31),
  },
  parameters: {
    docs: {
      description: {
        story:
          '방향키는 하루와 한 주, Home/End는 주의 처음과 끝, PageUp/PageDown은 한 달, Shift와 함께면 한 해를 옮깁니다. Shift+좌우 방향키는 한 달, Shift+상하 방향키는 한 해입니다. 1월 31일에서 한 달 뒤는 2월 28일입니다.',
      },
    },
  },
  play: async ({ canvasElement, args, userEvent }) => {
    await waitFor(() => expect(focusedDay()).toBe('2026-01-31'));
    await userEvent.keyboard('{PageDown}');
    await waitFor(() => expect(focusedDay()).toBe('2026-02-28'));
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    await waitFor(() => expect(focusedDay()).toBe('2027-02-28'));
    await userEvent.keyboard('{Home}');
    await expect(focusedDay()).toBe('2027-02-28');
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(focusedDay()).toBe('2027-03-06'));
    await userEvent.keyboard('{ArrowLeft}{ArrowUp}');
    await waitFor(() => expect(focusedDay()).toBe('2027-02-26'));
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(new CalendarDate(2027, 2, 26));
    await expect(day(canvasElement, '2027-02-26')).toHaveAttribute('data-selected');
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await waitFor(() => expect(focusedDay()).toBe('2027-03-26'));
  },
};

export const RightToLeft: Story = {
  tags: ['verification'],
  render: () => (
    <div dir="rtl">
      <Calendar today={new CalendarDate(2026, 9, 15)} aria-label="오른쪽에서 왼쪽" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '오른쪽에서 왼쪽으로 쓰는 문서에서는 Calendar 가 물려받은 방향을 따르고, 좌우 방향키가 뒤집힙니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await waitFor(() =>
      expect(canvas.getByRole('group', { name: '오른쪽에서 왼쪽' })).toHaveAttribute('dir', 'rtl'),
    );
    day(canvasElement, '2026-09-15').focus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(focusedDay()).toBe('2026-09-16'));
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await waitFor(() => expect(focusedDay()).toBe('2026-09-14'));
  },
};
