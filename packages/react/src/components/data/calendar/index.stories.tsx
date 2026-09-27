import { useState } from 'react';

import { de } from 'date-fns/locale/de';
import { arEG } from 'react-day-picker/locale/ar-EG';
import { ja } from 'react-day-picker/locale/ja';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';

import { Calendar, type DateRange } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const today = new Date(2026, 8, 15);
const sizes = ['standard', 'tiny'] as const;
const modes = ['single', 'range', 'multiple'] as const;

const meta = {
  title: 'Data/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
    selectionMode: { control: 'radio', options: ['single', 'range', 'multiple', 'none'] },
    size: { control: 'radio', options: sizes },
    captionLayout: { control: 'radio', options: ['label', 'dropdown'] },
    monthsToShow: { control: { type: 'number', min: 1, max: 3 } },
    weekStartsOn: { control: { type: 'number', min: 0, max: 6 } },
    locale: { control: 'radio', options: ['ko-KR', 'en-US'] },
    readOnly: { control: 'boolean' },
    showWeekNumber: { control: 'boolean' },
  },
  args: {
    today,
    size: 'standard',
    captionLayout: 'label',
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

const valueFor = {
  single: { defaultValue: new Date(2026, 8, 18) },
  range: { defaultValue: { start: new Date(2026, 8, 10), end: new Date(2026, 8, 17) } },
  multiple: { defaultValue: [new Date(2026, 8, 3), new Date(2026, 8, 4), new Date(2026, 8, 24)] },
} as const;

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Selection mode × Size">
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
        title="Caption"
        description="dropdown은 연도와 월을 바로 고르는 native select입니다. 여러 달을 보이면 이전, 다음 버튼은 양 끝 달에만 놓입니다."
      >
        <Showcase.Row label="dropdown">
          <Calendar captionLayout="dropdown" today={today} aria-label="드롭다운" />
        </Showcase.Row>
        <Showcase.Row label="two months">
          <Calendar
            selectionMode="range"
            defaultValue={{ start: new Date(2026, 8, 24), end: new Date(2026, 9, 6) }}
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
            min={new Date(2026, 8, 7)}
            max={new Date(2026, 8, 25)}
            disabled={{ dayOfWeek: [0, 6] }}
            aria-label="제한"
          />
        </Showcase.Row>
        <Showcase.Row label="readOnly · none">
          <Calendar
            readOnly
            defaultValue={new Date(2026, 8, 18)}
            today={today}
            aria-label="읽기 전용"
          />
          <Calendar
            selectionMode="none"
            value={new Date(2026, 8, 18)}
            today={today}
            aria-label="선택 없음"
          />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <Calendar
            disabled
            defaultValue={new Date(2026, 8, 18)}
            today={today}
            aria-label="비활성"
          />
        </Showcase.Row>
        <Showcase.Row label="week numbers">
          <Calendar showWeekNumber today={today} aria-label="주차" />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Locale">
        <Showcase.Row label="en-US">
          <Calendar locale="en-US" today={today} aria-label="English" />
        </Showcase.Row>
        <Showcase.Row label="de (date-fns)">
          <Calendar locale={de} today={today} aria-label="Deutsch" />
        </Showcase.Row>
        <Showcase.Row label="ar-EG · rtl">
          <div dir="rtl">
            <Calendar locale={arEG} numerals="arab" today={today} aria-label="العربية" />
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  args: { autoFocus: true, defaultValue: new Date(2026, 0, 31), today: new Date(2026, 0, 31) },
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
    await expect(args.onValueChange).toHaveBeenLastCalledWith(new Date(2027, 1, 26));
    await expect(day(canvasElement, '2027-02-26')).toHaveAttribute('data-selected');
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await waitFor(() => expect(focusedDay()).toBe('2027-03-26'));
  },
};

function RangeExample() {
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
        {range?.start?.getDate() ?? '–'} ~ {range?.end?.getDate() ?? '–'}
      </output>
    </div>
  );
}

export const Range: Story = {
  render: () => <RangeExample />,
  parameters: {
    docs: {
      description: {
        story:
          '첫 클릭이 시작, 두 번째 클릭이 끝입니다. 끝을 고르기 전에는 포인터나 키보드 포커스가 있는 날까지 기간을 미리 보여 줍니다. 더 이른 날을 고르면 시작과 끝이 바뀌고, 세 번째 클릭은 새 기간을 시작합니다.',
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

export const Multiple: Story = {
  args: { selectionMode: 'multiple', defaultValue: [new Date(2026, 8, 3)] },
  play: async ({ canvasElement, args, userEvent }) => {
    await userEvent.click(day(canvasElement, '2026-09-10'));
    await userEvent.click(day(canvasElement, '2026-09-03'));
    await expect(args.onValueChange).toHaveBeenLastCalledWith([new Date(2026, 8, 10)]);
    await expect(grid(canvasElement)).toHaveAttribute('aria-multiselectable', 'true');
  },
};

export const DropdownCaption: Story = {
  args: {
    captionLayout: 'dropdown',
    min: new Date(1990, 0, 1),
    max: new Date(2026, 11, 31),
    defaultMonth: new Date(2026, 8, 1),
  },
  parameters: {
    docs: {
      description: {
        story:
          '생년월일처럼 먼 날짜는 연도와 월 목록으로 바로 옮깁니다. 목록은 min/max 안의 연도만 보이고, 범위를 벗어난 달은 고를 수 없습니다. 한국어는 연도를 먼저 놓습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: '연도' }), '1995');
    await expect(args.onMonthChange).toHaveBeenLastCalledWith(new Date(1995, 8, 1));
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: '월' }), '0');
    await expect(grid(canvasElement)).toHaveAccessibleName('1995년 1월');
    await userEvent.click(canvas.getByRole('button', { name: '이전 달' }));
    await expect(grid(canvasElement)).toHaveAccessibleName('1994년 12월');
  },
};

export const Limits: Story = {
  args: {
    min: new Date(2026, 8, 10),
    max: new Date(2026, 9, 20),
    disabled: { dayOfWeek: [0] },
  },
  parameters: {
    docs: {
      description: {
        story:
          'min/max 밖의 날짜와 disabled가 막은 날짜는 고를 수 없고 키보드도 건너뜁니다. disabled는 react-day-picker의 matcher라서 함수, 날짜, 기간, 요일을 받습니다. 범위 끝에서 달 버튼은 눌리지 않습니다.',
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
    // The pointer is still on the button, and a month button out of reach shows no hover fill.
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: '다음 달' })).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0)',
      }),
    );
  },
};

export const Locale: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      <Calendar locale="en-US" today={today} aria-label="English" />
      <Calendar weekStartsOn={1} today={today} aria-label="월요일 시작" />
      <Calendar locale={ja} today={today} aria-label="日本語" />
      <div dir="rtl">
        <Calendar locale={arEG} numerals="arab" today={today} aria-label="العربية" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'locale은 ko-KR, en-US 태그나 date-fns Locale을 받습니다. react-day-picker/locale의 Locale은 버튼 이름까지 번역되어 있습니다. 주 시작은 locale을 따르고 weekStartsOn으로 바꿉니다. 오른쪽에서 왼쪽으로 쓰는 문서에서는 방향키 좌우가 뒤집힙니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const english = canvas.getByRole('group', { name: 'English' });
    await expect(english.querySelector('th')).toHaveTextContent('Su');
    const monday = canvas.getByRole('group', { name: '월요일 시작' });
    await expect(monday.querySelector('th')).toHaveAttribute('aria-label', '월요일');
    const japanese = canvas.getByRole('group', { name: '日本語' });
    await expect(japanese.querySelector('[role=grid]')).toHaveAccessibleName('2026年9月');
    const arabic = canvas.getByRole('group', { name: 'العربية' });
    await expect(arabic).toHaveAttribute('dir', 'rtl');
    arabic.querySelector<HTMLButtonElement>('[data-calendar-day="2026-09-15"]')!.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(focusedDay()).toBe('2026-09-16'));
  },
};

const events = [
  new Date(2026, 8, 4),
  new Date(2026, 8, 15),
  new Date(2026, 8, 22),
  new Date(2026, 9, 2),
];

// Declared once at module level: an inline component would be a new type on every render and
// remount every day.
function EventDayButton({ children, ...props }: Calendar.DayButtonProps) {
  const { event, selected } = props.modifiers;
  return (
    <Calendar.DayButton {...props}>
      <span className="flex flex-col items-center leading-none">
        {children}
        <span
          aria-hidden="true"
          className={
            event
              ? selected
                ? 'mt-0.5 size-1 rounded-full bg-current'
                : 'mt-0.5 size-1 rounded-full bg-(--ids-color-primary)'
              : 'mt-0.5 size-1'
          }
        />
      </span>
    </Calendar.DayButton>
  );
}

function PartsExample() {
  const [date, setDate] = useState<Date | null>(null);
  const [month, setMonth] = useState(new Date(2026, 8, 1));
  const busy = !!date && events.some((event) => event.toDateString() === date.toDateString());
  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        size="tiny"
        variant="outline"
        onClick={() => {
          setMonth(new Date(2026, 8, 1));
          setDate(today);
        }}
      >
        오늘
      </Button>
      <Calendar
        value={date}
        onValueChange={setDate}
        month={month}
        onMonthChange={setMonth}
        today={today}
        modifiers={{ event: events }}
        components={{ DayButton: EventDayButton }}
        footer={date ? (busy ? '일정이 있는 날입니다.' : '일정이 없습니다.') : '날짜를 고르세요.'}
      />
    </div>
  );
}

export const Parts: Story = {
  render: () => <PartsExample />,
  parameters: {
    docs: {
      description: {
        story:
          'components로 react-day-picker의 부분을 바꿉니다. Calendar.DayButton을 감싸면 IDS 날짜 모양과 포커스를 그대로 두고 내용만 더합니다. modifiers는 날짜에 이름을 붙이고, footer는 화면 읽기 프로그램이 읽는 알림 영역입니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByText('날짜를 고르세요.')).toHaveAttribute('role', 'status');
    await userEvent.click(day(canvasElement, '2026-09-22'));
    await expect(canvas.getByText('일정이 있는 날입니다.')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '다음 달' }));
    await expect(grid(canvasElement)).toHaveAccessibleName('2026년 10월');
    await userEvent.click(canvas.getByRole('button', { name: '오늘' }));
    await expect(grid(canvasElement)).toHaveAccessibleName('2026년 9월');
    await expect(day(canvasElement, '2026-09-15')).toHaveAttribute('data-selected');
  },
};
