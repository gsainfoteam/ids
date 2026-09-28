import { useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Field } from '../field';

import { DateTimeField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const today = new Date(2026, 8, 15);
const at = (day: number, hour: number, minute = 0) => new Date(2026, 8, day, hour, minute);
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
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    'aria-label': '일시',
    today,
    variant: 'outline',
    size: 'standard',
    className: cn('w-80'),
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

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <DateTimeField
              size={size}
              variant={variant}
              defaultValue={at(15, 14, 30)}
              className="w-64"
              aria-label={`${variant} ${size}`}
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Format">
        <Showcase.Row label="locale · ko-KR">
          <DateTimeField defaultValue={at(15, 14, 30)} className="w-72" aria-label="한국어" />
        </Showcase.Row>
        <Showcase.Row label="Intl options">
          <DateTimeField
            format={{ dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23' }}
            defaultValue={at(15, 14, 30)}
            className="w-72"
            aria-label="Intl 옵션"
          />
        </Showcase.Row>
        <Showcase.Row label="en-US · 12h">
          <DateTimeField
            locale="en-US"
            format={{
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }}
            hourCycle="12h"
            defaultValue={at(15, 14, 30)}
            className="w-72"
            aria-label="English"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <DateTimeField className="w-72" aria-label="비어 있음" />
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <DateTimeField invalid defaultValue={at(15, 9)} className="w-72" aria-label="잘못됨" />
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <DateTimeField
            readOnly
            defaultValue={at(15, 9)}
            className="w-72"
            aria-label="읽기 전용"
          />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <DateTimeField disabled defaultValue={at(15, 9)} className="w-72" aria-label="비활성" />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const PreserveDateAndTime: Story = {
  args: { defaultValue: at(15, 9, 30), hourCycle: '24h', step: 15 },
  parameters: {
    docs: {
      description: {
        story:
          '달력에서 날을 바꾸면 시각이 그대로이고, 시계에서 시각을 바꾸면 날짜가 그대로입니다. 고르는 동안 팝업은 열려 있습니다.',
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

export const Limits: Story = {
  args: {
    min: at(15, 9, 30),
    max: at(18, 18),
    hourCycle: '24h',
    step: 30,
    disabled: { dayOfWeek: [0, 6] },
    'aria-label': '면담 일시',
  },
  parameters: {
    docs: {
      description: {
        story:
          'min/max는 날짜와 시각을 합친 경계입니다. 시각 제한은 첫날과 마지막 날에만 걸리고, 고를 시각이 하나도 없는 날은 막힙니다. 날을 옮기면 그날 허용되는 가장 가까운 시각으로 맞춥니다.',
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

function NativeFormExample() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <form
      className="flex w-80 flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <Field className="w-full">
        <Field.Label>회의 일시</Field.Label>
        <DateTimeField name="meeting" required hourCycle="24h" today={today} />
      </Field>
      <Button type="submit">예약</Button>
      <output aria-label="예약 결과" className="text-body-b3-regular font-mono">
        {submitted}
      </output>
    </form>
  );
}

export const NativeForm: Story = {
  render: () => <NativeFormExample />,
  parameters: {
    docs: {
      description: {
        story:
          'name을 주면 오프셋 없는 로컬 문자열 "2026-09-15T14:00"이 FormData에 들어갑니다. required인데 비어 있으면 브라우저가 제출을 막습니다.',
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
