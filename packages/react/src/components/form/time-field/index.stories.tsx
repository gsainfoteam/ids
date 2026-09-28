import { useState } from 'react';

import { Time } from '@internationalized/date';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Field } from '../field';

import { TimeField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const at = (hour: number, minute = 0) => new Time(hour, minute);
const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/TimeField',
  component: TimeField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    precision: { control: 'radio', options: ['hour', 'minute', 'second'] },
    hourCycle: { control: 'radio', options: [undefined, '12h', '24h'] },
    pickerVariant: { control: 'radio', options: ['grid', 'wheel'] },
    step: { control: { type: 'number', min: 1, max: 60 } },
    format: { control: 'object' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    'aria-label': '시간',
    variant: 'outline',
    size: 'standard',
    className: cn('w-60'),
    onValueChange: fn(),
  },
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

const column = (unit: string) =>
  document.querySelector<HTMLElement>(`[role=dialog] [data-time-column="${unit}"]`)!;
const option = (unit: string, n: number) =>
  column(unit).querySelector<HTMLElement>(`[data-time-option="${n}"]`)!;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <TimeField
              size={size}
              variant={variant}
              defaultValue={at(14, 30)}
              className="w-44"
              aria-label={`${variant} ${size}`}
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Format">
        <Showcase.Row label="locale · ko-KR">
          <TimeField defaultValue={at(14, 30)} className="w-44" aria-label="한국어" />
        </Showcase.Row>
        <Showcase.Row label="hourCycle 24h">
          <TimeField
            hourCycle="24h"
            defaultValue={at(14, 30)}
            className="w-44"
            aria-label="24시간"
          />
        </Showcase.Row>
        <Showcase.Row label="Intl options · en-US">
          <TimeField
            locale="en-US"
            format={{ hour: '2-digit', minute: '2-digit' }}
            defaultValue={at(14, 30)}
            className="w-44"
            aria-label="English"
          />
        </Showcase.Row>
        <Showcase.Row label="second">
          <TimeField
            precision="second"
            hourCycle="24h"
            defaultValue={at(14, 30)}
            className="w-44"
            aria-label="초 단위"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <TimeField className="w-44" aria-label="비어 있음" />
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <TimeField invalid defaultValue={at(9)} className="w-44" aria-label="잘못됨" />
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <TimeField readOnly defaultValue={at(9)} className="w-44" aria-label="읽기 전용" />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <TimeField disabled defaultValue={at(9)} className="w-44" aria-label="비활성" />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const SelectAndClear: Story = {
  args: { defaultValue: at(9, 30), hourCycle: '24h', step: 15 },
  parameters: {
    docs: {
      description: {
        story:
          '↓로 열면 첫 컬럼에 포커스가 갑니다. 방향키로 둘러보고 Enter로 고르며, 고르는 동안 팝업이 열려 있습니다. Esc로 닫으면 포커스는 Trigger로 돌아옵니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: '시간' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(column('hour')).toHaveFocus());
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}{ArrowRight}{End}{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(at(1, 45));
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveTextContent('01:45');
    await expect(trigger).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: '시간 지우기' }));
    await expect(trigger).toHaveTextContent('시간 선택');
  },
};

export const Limits: Story = {
  args: {
    hourCycle: '24h',
    step: 30,
    min: at(9),
    max: at(18),
    'aria-label': '상담 시간',
  },
  parameters: {
    docs: {
      description: {
        story:
          'min/max 밖의 시각은 고를 수 없습니다. 비어 있으면 허용 시각 중 가장 이른 시각에서 둘러보기를 시작합니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: '상담 시간' }));
    await expect(option('hour', 8)).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(option('hour', 17));
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.click(option('minute', 30));
    await expect(canvas.getByRole('combobox', { name: '상담 시간' })).toHaveTextContent('17:30');
  },
};

function NativeFormExample() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <form
      className="flex w-64 flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <Field className="w-full">
        <Field.Label>알람</Field.Label>
        <TimeField name="alarm" required hourCycle="24h" defaultValue={at(7)} />
      </Field>
      <div className="flex gap-2">
        <Button type="submit">저장</Button>
        <Button type="reset" variant="outline">
          초기화
        </Button>
      </div>
      <output aria-label="저장 결과" className="text-body-b3-regular font-mono">
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
          'name을 주면 "07:00"처럼 정밀도만큼의 시각이 FormData에 들어갑니다. required인데 비어 있으면 브라우저가 제출을 막습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByLabelText('저장 결과')).toHaveTextContent('{"alarm":"07:00"}');
    await userEvent.click(canvas.getByRole('button', { name: '시간 지우기' }));
    const form = canvas.getByRole('button', { name: '저장' }).closest('form')!;
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(form.checkValidity()).toBe(true));
  },
};

export const Wheel: Story = {
  args: { pickerVariant: 'wheel', defaultValue: at(21, 15), 'aria-label': '출발 시각' },
  parameters: {
    docs: {
      description: {
        story: '팝업의 시계를 스크롤해서 고르는 휠로 바꿉니다. 멈춘 자리의 값이 선택됩니다.',
      },
    },
  },
};
