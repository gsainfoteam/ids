import { useState } from 'react';

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
    locale: { control: 'text' },
    readOnly: { control: 'boolean' },
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
        description="dropdown은 월과 연도를 바로 고르는 native select입니다. 여러 달을 보이면 버튼은 양 끝에만 놓입니다."
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
            disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
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
      </Showcase.Section>

      <Showcase.Section title="Locale">
        <Showcase.Row label="en-US">
          <Calendar locale="en-US" today={today} aria-label="English" />
        </Showcase.Row>
        <Showcase.Row label="de-DE">
          <Calendar locale="de-DE" today={today} aria-label="Deutsch" />
        </Showcase.Row>
        <Showcase.Row label="ar-EG · rtl">
          <div dir="rtl">
            <Calendar locale="ar-EG" today={today} aria-label="العربية" />
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
          '방향키는 하루와 한 주, Home/End는 주의 처음과 끝, PageUp/PageDown은 한 달, Shift와 함께면 한 해를 옮깁니다. 1월 31일에서 한 달 뒤는 2월 28일입니다.',
      },
    },
  },
  play: async ({ canvasElement, args, userEvent }) => {
    await waitFor(() => expect(focusedDay()).toBe('2026-01-31'));
    await userEvent.keyboard('{PageDown}');
    await expect(focusedDay()).toBe('2026-02-28');
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    await expect(focusedDay()).toBe('2027-02-28');
    await userEvent.keyboard('{Home}');
    await expect(focusedDay()).toBe('2027-02-28');
    await userEvent.keyboard('{End}');
    await expect(focusedDay()).toBe('2027-03-06');
    await userEvent.keyboard('{ArrowLeft}{ArrowUp}');
    await expect(focusedDay()).toBe('2027-02-26');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(new Date(2027, 1, 26));
    await expect(day(canvasElement, '2027-02-26')).toHaveAttribute('data-selected');
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
          '첫 클릭이 시작, 두 번째 클릭이 끝입니다. 끝을 고르기 전에는 포인터나 키보드 포커스가 있는 날까지 기간을 미리 보여 줍니다. 더 이른 날을 고르면 시작과 끝이 바뀝니다.',
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
    await expect(day(canvasElement, '2026-09-23')).toHaveAttribute('data-range-preview');
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
    await expect(canvasElement.querySelector('[role=grid]')).toHaveAttribute(
      'aria-multiselectable',
      'true',
    );
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
          '생년월일처럼 먼 날짜는 연도와 월 목록으로 바로 옮깁니다. 목록은 min/max 안의 연도만 보이고, 범위를 벗어난 달은 고를 수 없습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: '연도' }), '1995');
    await expect(args.onMonthChange).toHaveBeenLastCalledWith(new Date(1995, 8, 1));
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: '월' }), '0');
    await expect(canvasElement.querySelector('[role=grid]')).toHaveAccessibleName('1995년 1월');
    await userEvent.click(canvas.getByRole('button', { name: '이전 달' }));
    await expect(canvasElement.querySelector('[role=grid]')).toHaveAccessibleName('1994년 12월');
  },
};

export const Limits: Story = {
  args: {
    min: new Date(2026, 8, 10),
    max: new Date(2026, 9, 20),
    disabled: (date: Date) => date.getDay() === 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          'min/max 밖의 날짜와 disabled 함수가 막은 날짜는 고를 수 없습니다. 키보드로는 지나갈 수 있고, 범위 끝에서 달 버튼은 눌리지 않지만 포커스는 남습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    await userEvent.click(day(canvasElement, '2026-09-09'));
    await userEvent.click(day(canvasElement, '2026-09-20'));
    await expect(args.onValueChange).not.toHaveBeenCalled();
    const previous = canvas.getByRole('button', { name: '이전 달' });
    await expect(previous).toHaveAttribute('aria-disabled', 'true');
    const next = canvas.getByRole('button', { name: '다음 달' });
    await userEvent.click(next);
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await expect(next).toHaveFocus();
  },
};

export const Locale: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      <Calendar locale="en-US" today={today} aria-label="English" />
      <Calendar locale="ko-KR" weekStartsOn={1} today={today} aria-label="월요일 시작" />
      <div dir="rtl">
        <Calendar locale="ar-EG" today={today} aria-label="العربية" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '월, 요일, 숫자는 locale의 Intl 이름을 씁니다. 주 시작은 locale 데이터를 따르고 weekStartsOn으로 바꿀 수 있습니다. 오른쪽에서 왼쪽으로 쓰는 문서에서는 방향키 좌우가 뒤집힙니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const english = canvas.getByRole('group', { name: 'English' });
    await expect(english.querySelector('[role=columnheader]')).toHaveTextContent('Sun');
    const monday = canvas.getByRole('group', { name: '월요일 시작' });
    await expect(monday.querySelector('[role=columnheader]')).toHaveAccessibleName('월요일');
    const arabic = canvas.getByRole('group', { name: 'العربية' });
    arabic.querySelector<HTMLButtonElement>('[data-calendar-day="2026-09-15"]')!.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(focusedDay()).toBe('2026-09-16');
  },
};

const events = new Set(['2026-09-04', '2026-09-15', '2026-09-22', '2026-09-23']);
const keyOf = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function CompositionExample() {
  const [date, setDate] = useState<Date | null>(null);
  const [month, setMonth] = useState(new Date(2026, 8, 1));
  return (
    <Calendar
      value={date}
      onValueChange={setDate}
      month={month}
      onMonthChange={setMonth}
      today={today}
    >
      <Calendar.Header className="flex items-center gap-2">
        <Calendar.Title className="flex-none" />
        <span className="flex-1" />
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
        <Calendar.Previous />
        <Calendar.Next />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.Grid.HeaderRow />
        <Calendar.Grid.Body>
          {(date) => (
            <Calendar.Grid.Cell date={date}>
              {(state) => (
                <span className="flex flex-col items-center leading-none">
                  {date.getDate()}
                  <span
                    aria-hidden="true"
                    className={
                      events.has(keyOf(date))
                        ? state.selected
                          ? 'mt-0.5 size-1 rounded-full bg-current'
                          : 'mt-0.5 size-1 rounded-full bg-(--ids-color-primary)'
                        : 'mt-0.5 size-1'
                    }
                  />
                </span>
              )}
            </Calendar.Grid.Cell>
          )}
        </Calendar.Grid.Body>
      </Calendar.Grid>
    </Calendar>
  );
}

export const Composition: Story = {
  render: () => <CompositionExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Header 안에 Title, Previous, Next를 원하는 순서로 놓고 버튼을 더할 수 있습니다. Cell의 children은 날짜 상태를 받는 함수도 됩니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '다음 달' }));
    await expect(canvasElement.querySelector('[role=grid]')).toHaveAccessibleName('2026년 10월');
    await userEvent.click(canvas.getByRole('button', { name: '오늘' }));
    await expect(day(canvasElement, '2026-09-15')).toHaveAttribute('data-selected');
  },
};
