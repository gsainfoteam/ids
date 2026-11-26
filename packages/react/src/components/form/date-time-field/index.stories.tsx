import { useState } from 'react';

import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { en } from '../../../locales/en';
import { Button } from '../../action/button';
import { IdsProvider } from '../../utility/ids-provider';
import { Field } from '../field';

import { DateTimeField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const at = (day: number, hour: number, minute = 0) =>
  new CalendarDateTime(2026, 9, day, hour, minute);
const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/DateTimeField',
  component: DateTimeField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    precision: { control: 'radio', options: ['hour', 'minute', 'second'] },
    hourCycle: { control: 'radio', options: [undefined, '12h', '24h'] },
    step: { control: { type: 'number', min: 1, max: 60 } },
    format: { control: 'object' },
    'aria-invalid': { control: 'boolean' },
    required: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    'aria-label': '일시',
    variant: 'outline',
    size: 'standard',
    onValueChange: fn(),
  },
} satisfies Meta<typeof DateTimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

const day = (key: string) =>
  document.querySelector<HTMLButtonElement>(`[data-calendar-day="${key}"]`)!;
const option = (unit: string, n: number) =>
  document.querySelector<HTMLElement>(
    `[role=dialog] [data-time-column="${unit}"] [data-time-option="${n}"]`,
  )!;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const Usage: Story = {
  render: () => (
    <div className="w-80">
      <Field>
        <Field.Label>회의 일시</Field.Label>
        <DateTimeField defaultValue={new CalendarDateTime(2026, 9, 15, 14, 30)} />
      </Field>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="w-64">
              <DateTimeField
                size={size}
                variant={variant}
                defaultValue={at(15, 14, 30)}
                aria-label={`${variant} ${size}`}
              />
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Format">
        <Showcase.Row label="locale · ko-KR">
          <div className="w-72">
            <DateTimeField defaultValue={at(15, 14, 30)} aria-label="한국어" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="Intl options">
          <div className="w-72">
            <DateTimeField
              format={{ dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23' }}
              defaultValue={at(15, 14, 30)}
              aria-label="Intl 옵션"
            />
          </div>
        </Showcase.Row>
        <Showcase.Row label="en-US · 12h">
          <IdsProvider.Scope locale={en}>
            <div className="w-72">
              <DateTimeField
                format={{
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                }}
                hourCycle="12h"
                defaultValue={at(15, 14, 30)}
                aria-label="English"
              />
            </div>
          </IdsProvider.Scope>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <div className="w-72">
            <DateTimeField aria-label="비어 있음" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <div className="w-72">
            <DateTimeField aria-invalid defaultValue={at(15, 9)} aria-label="잘못됨" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <div className="w-72">
            <DateTimeField readOnly defaultValue={at(15, 9)} aria-label="읽기 전용" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <div className="w-72">
            <DateTimeField disabled defaultValue={at(15, 9)} aria-label="비활성" />
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const ChangeTheDayAndKeepTheTime: Story = {
  render: (args) => (
    <div className="w-80">
      <DateTimeField
        aria-label="일시"
        defaultValue={new CalendarDateTime(2026, 9, 15, 9, 30)}
        hourCycle="24h"
        step={15}
        onValueChange={args.onValueChange}
      >
        <DateTimeField.Calendar today={new CalendarDate(2026, 9, 15)} />
      </DateTimeField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '달력에서 날을 바꾸면 시각이 그대로이고, 시계에서 시각을 바꾸면 날짜가 그대로입니다. 고르는 동안 팝업은 열려 있습니다. 시계의 간격은 루트의 step과 hourCycle이 정합니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: '일시' });
    await userEvent.click(trigger);
    await waitFor(() => expect(day('2026-09-15')).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(at(16, 9, 30));
    await userEvent.click(option('hour', 14));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(at(16, 14, 30));
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveTextContent('2026. 09. 16. 14:30');
    await expect(trigger).toHaveFocus();
  },
};

export const LimitTheBookableTimes: Story = {
  render: (args) => (
    <div className="w-80">
      <DateTimeField
        aria-label="면담 일시"
        min={new CalendarDateTime(2026, 9, 15, 9, 30)}
        max={new CalendarDateTime(2026, 9, 18, 18, 0)}
        disabled={{ dayOfWeek: [0, 6] }}
        hourCycle="24h"
        step={30}
        onValueChange={args.onValueChange}
      >
        <DateTimeField.Calendar today={new CalendarDate(2026, 9, 15)} />
      </DateTimeField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'min/max는 날짜와 시각을 합친 경계입니다. 시각 제한은 첫날과 마지막 날에만 걸리고, 고를 시각이 하나도 없는 날은 막힙니다. 날을 옮기면 그날 허용되는 가장 가까운 시각으로 맞춥니다. disabled는 고를 수 없는 날입니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: '면담 일시' }));
    await expect(day('2026-09-19')).toBeDisabled();
    await userEvent.click(day('2026-09-15'));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(at(15, 9, 30));
    await expect(option('hour', 8)).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(option('hour', 20));
    await userEvent.click(day('2026-09-18'));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(at(18, 18));
  },
};

export const PickTheTimeOnAWheel: Story = {
  render: (args) => (
    <div className="w-80">
      <DateTimeField
        aria-label="출발 일시"
        defaultValue={new CalendarDateTime(2026, 9, 15, 21, 15)}
        onValueChange={args.onValueChange}
      >
        <DateTimeField.Calendar today={new CalendarDate(2026, 9, 15)} />
        <DateTimeField.TimePicker variant="wheel" />
      </DateTimeField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '팝업의 시계를 스크롤해서 고르는 휠로 바꾸려면 DateTimeField.TimePicker에 variant="wheel"을 줍니다. 달력 옵션은 DateTimeField.Calendar에 줍니다. 두 부분은 DateTimeField 바로 아래에 둡니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: '출발 일시' }));
    const dialog = await canvas.findByRole('dialog');
    await expect(dialog.querySelector('[data-time-picker]')).toHaveAttribute(
      'data-variant',
      'wheel',
    );
  },
};

export const OpenAsADrawerOnPhones: Story = {
  render: () => (
    <div className="w-80">
      <Field>
        <Field.Label>회의 일시</Field.Label>
        <DateTimeField defaultValue={new CalendarDateTime(2026, 9, 15, 14, 30)}>
          <DateTimeField.Content narrow="drawer" />
        </DateTimeField>
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '좁은 화면에서 팝업을 아래에서 올라오는 드로어로 띄우려면 DateTimeField.Content에 narrow="drawer"를 줍니다. 넓은 화면에서는 그대로 팝오버입니다.',
      },
    },
  },
};

export const SubmitWithANativeForm: Story = {
  render: function Render() {
    const [submitted, setSubmitted] = useState<string | null>(null);

    return (
      <form
        className="grid w-80 gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
      >
        <Field>
          <Field.Label>회의 일시</Field.Label>
          <DateTimeField name="meeting" required hourCycle="24h">
            <DateTimeField.Calendar today={new CalendarDate(2026, 9, 15)} />
          </DateTimeField>
        </Field>
        <div>
          <Button type="submit">예약</Button>
        </div>
        <output aria-label="예약 결과" className="text-body-b3-regular font-mono">
          {submitted}
        </output>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'name을 주면 오프셋 없는 로컬 문자열 "2026-09-15T14:00"이 FormData에 들어갑니다. required인데 비어 있으면 브라우저가 제출을 막습니다. 비어 있을 때 시각만 고르면 DateTimeField.Calendar의 today 날짜에 붙습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByRole('button', { name: '예약' }).closest('form')!;
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByRole('combobox', { name: '회의 일시' }));
    await userEvent.click(option('hour', 14));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: '예약' }));
    await expect(canvas.getByLabelText('예약 결과')).toHaveTextContent(
      '{"meeting":"2026-09-15T14:00"}',
    );
  },
};
