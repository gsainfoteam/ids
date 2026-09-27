import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { de } from 'date-fns/locale/de';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';
import { z } from 'zod';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Field } from '../field';

import { DateField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const today = new Date(2026, 8, 15);
const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/DateField',
  component: DateField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    captionLayout: { control: 'radio', options: ['label', 'dropdown'] },
    locale: { control: 'radio', options: ['ko-KR', 'en-US'] },
    mobileVariant: { control: 'radio', options: ['popover', 'drawer'] },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    'aria-label': '날짜',
    today,
    variant: 'outline',
    size: 'standard',
    className: cn('w-72'),
    onValueChange: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

const day = (key: string) =>
  document.querySelector<HTMLButtonElement>(`[data-calendar-day="${key}"]`)!;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <DateField
              size={size}
              variant={variant}
              defaultValue={new Date(2026, 8, 15)}
              className="w-56"
              aria-label={`${variant} ${size}`}
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Selection mode">
        <Showcase.Row label="single">
          <DateField className="w-72" aria-label="하루" />
          <DateField defaultValue={new Date(2026, 8, 15)} className="w-72" aria-label="하루 값" />
        </Showcase.Row>
        <Showcase.Row label="range">
          <DateField selectionMode="range" className="w-72" aria-label="기간" />
          <DateField
            selectionMode="range"
            defaultValue={{ start: new Date(2026, 8, 15), end: new Date(2026, 8, 19) }}
            className="w-72"
            aria-label="기간 값"
          />
        </Showcase.Row>
        <Showcase.Row label="multiple">
          <DateField
            selectionMode="multiple"
            defaultValue={[new Date(2026, 8, 3), new Date(2026, 8, 10), new Date(2026, 8, 17)]}
            className="w-72"
            aria-label="여러 날"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="invalid">
          <DateField
            invalid
            defaultValue={new Date(2026, 8, 15)}
            className="w-72"
            aria-label="잘못됨"
          />
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <DateField
            readOnly
            defaultValue={new Date(2026, 8, 15)}
            className="w-72"
            aria-label="읽기 전용"
          />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <DateField
            disabled
            defaultValue={new Date(2026, 8, 15)}
            className="w-72"
            aria-label="비활성"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Format">
        <Showcase.Row label="default · ko-KR">
          <DateField defaultValue={new Date(2026, 8, 15)} className="w-72" aria-label="기본" />
        </Showcase.Row>
        <Showcase.Row label="yyyy년 M월 d일">
          <DateField
            format="yyyy년 M월 d일 (EEE)"
            defaultValue={new Date(2026, 8, 15)}
            className="w-72"
            aria-label="한국어 형식"
          />
        </Showcase.Row>
        <Showcase.Row label="en-US · de">
          <DateField
            locale="en-US"
            defaultValue={new Date(2026, 8, 15)}
            className="w-72"
            aria-label="English"
          />
          <DateField
            locale={de}
            format="PPP"
            defaultValue={new Date(2026, 8, 15)}
            className="w-72"
            aria-label="Deutsch"
          />
        </Showcase.Row>
        <Showcase.Row label="function">
          <DateField
            format={(date) => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'full' }).format(date)}
            defaultValue={new Date(2026, 8, 15)}
            className="w-72"
            aria-label="Intl"
          />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const SelectAndClear: Story = {
  args: { format: 'yyyy-MM-dd', min: new Date(2026, 8, 1), max: new Date(2026, 8, 30) },
  parameters: {
    docs: {
      description: {
        story:
          'Trigger에서 ↓ 또는 Enter로 열면 고른 날(없으면 오늘)에 포커스가 갑니다. 날짜를 고르면 닫히고 포커스는 Trigger로 돌아옵니다. Clear는 값을 비웁니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: '날짜' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(day('2026-09-15')).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(new Date(2026, 8, 16));
    await expect(trigger).toHaveTextContent('2026-09-16');
    await expect(trigger).toHaveFocus();
    await expect(document.querySelector('[role=dialog]')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: '날짜 지우기' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(null);
    await expect(trigger).toHaveTextContent('날짜 선택');
  },
};

export const Range: Story = {
  args: { selectionMode: 'range', monthsToShow: 2, format: 'yyyy-MM-dd', className: cn('w-80') },
  parameters: {
    docs: {
      description: {
        story:
          '기간은 두 번 눌러 고르고, 고르는 동안 팝업이 열려 있습니다. 끝을 고르기 전에는 포인터나 키보드가 있는 날까지 미리 보여 줍니다. 닫기는 Esc, 바깥 클릭, Trigger입니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: '날짜' }));
    await userEvent.click(day('2026-09-24'));
    await userEvent.click(day('2026-10-02'));
    await expect(args.onValueChange).toHaveBeenLastCalledWith({
      start: new Date(2026, 8, 24),
      end: new Date(2026, 9, 2),
    });
    await expect(document.querySelector('[role=dialog]')).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('combobox', { name: '날짜' })).toHaveTextContent(
      '2026-09-24 – 2026-10-02',
    );
  },
};

export const Birthday: Story = {
  args: {
    captionLayout: 'dropdown',
    min: new Date(1920, 0, 1),
    max: today,
    defaultMonth: new Date(2000, 0, 1),
    format: 'yyyy년 M월 d일',
    'aria-label': '생년월일',
  },
  parameters: {
    docs: {
      description: {
        story:
          '먼 날짜는 captionLayout="dropdown"으로 연도와 월을 목록에서 바로 고릅니다. 연도 목록은 min부터 max까지입니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: '생년월일' }));
    const dialog = await canvas.findByRole('dialog');
    await userEvent.selectOptions(dialog.querySelector('select[aria-label="연도"]')!, '1995');
    await userEvent.selectOptions(dialog.querySelector('select[aria-label="월"]')!, '4');
    await userEvent.click(day('1995-05-20'));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(new Date(1995, 4, 20));
    await expect(canvas.getByRole('combobox', { name: '생년월일' })).toHaveTextContent(
      '1995년 5월 20일',
    );
  },
};

function NativeFormExample() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <form
      className="flex w-80 flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify([...new FormData(event.currentTarget)]));
      }}
    >
      <Field className="w-full">
        <Field.Label>체크인</Field.Label>
        <DateField name="checkin" required today={today} />
        <Field.Hint>비워 두면 제출되지 않습니다.</Field.Hint>
      </Field>
      <Field className="w-full">
        <Field.Label>숙박 기간</Field.Label>
        <DateField
          name="stay"
          selectionMode="range"
          defaultValue={{ start: new Date(2026, 8, 20), end: new Date(2026, 8, 22) }}
          today={today}
        />
      </Field>
      <div className="flex gap-2">
        <Button type="submit">제출</Button>
        <Button type="reset" variant="outline">
          초기화
        </Button>
      </div>
      <output aria-label="제출 결과" className="text-body-b3-regular font-mono">
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
          'name을 주면 로컬 날짜가 ISO 문자열로 FormData에 들어갑니다. 기간은 "시작/끝" 하나입니다. required인데 비어 있으면 브라우저가 제출을 막고 Trigger로 포커스를 옮깁니다. reset은 defaultValue로 돌아갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByRole('button', { name: '제출' }).closest('form')!;
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByRole('combobox', { name: '체크인' }));
    await userEvent.click(day('2026-09-20'));
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent(
      '[["checkin","2026-09-20"],["stay","2026-09-20/2026-09-22"]]',
    );
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() =>
      expect(canvas.getByRole('combobox', { name: '체크인' })).toHaveTextContent('날짜 선택'),
    );
  },
};

const schema = z.object({
  date: z.date({ error: '날짜를 고르세요.' }).nullable().refine(Boolean, '날짜를 고르세요.'),
});

function ReactHookFormExample() {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: { date: null } });
  const [result, setResult] = useState('');
  return (
    <FormProvider {...methods}>
      <form
        className="flex w-80 flex-col items-start gap-4"
        noValidate
        onSubmit={methods.handleSubmit((data) => setResult(data.date?.toDateString() ?? ''))}
      >
        <FormField name="date" controlMode="value" required className="w-full">
          <FormField.Label>예약 날짜</FormField.Label>
          <DateField today={today} format="yyyy-MM-dd" />
          <FormField.Error />
        </FormField>
        <Button type="submit">예약</Button>
        <output aria-label="예약 결과">{result}</output>
      </form>
    </FormProvider>
  );
}

export const ReactHookForm: Story = {
  render: () => <ReactHookFormExample />,
  parameters: {
    docs: {
      description: {
        story:
          'controlMode="value"로 Date 값을 그대로 연결합니다. 오류가 나면 Trigger로 포커스가 가고 테두리가 danger 색이 됩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '예약' }));
    await expect(await canvas.findByText('날짜를 고르세요.')).toBeVisible();
    const trigger = canvas.getByRole('combobox', { name: '예약 날짜' });
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(trigger);
    await userEvent.click(day('2026-09-18'));
    await userEvent.click(canvas.getByRole('button', { name: '예약' }));
    await expect(canvas.getByLabelText('예약 결과')).toHaveTextContent('Fri Sep 18 2026');
  },
};

export const Composition: Story = {
  render: () => (
    <DateField today={today} format="M월 d일 EEEE" aria-label="마감일" className="w-72">
      <DateField.Trigger>
        <DateField.Value className="font-medium" />
      </DateField.Trigger>
      <DateField.Clear aria-label="마감일 지우기" />
    </DateField>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Trigger 안을 직접 채우고 Clear의 이름을 바꿀 수 있습니다. 부분을 하나라도 주면 준 것만 그립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: '마감일' });
    await userEvent.click(trigger);
    await userEvent.click(day('2026-09-18'));
    await expect(trigger).toHaveTextContent('9월 18일 금요일');
    await expect(canvas.getByRole('button', { name: '마감일 지우기' })).toBeVisible();
  },
};

export const TypedEntry: Story = {
  render: (args) => (
    <Field className="w-72">
      <Field.Label>생년월일</Field.Label>
      <DateField
        today={today}
        max={today}
        captionLayout="dropdown"
        autoComplete="bday"
        onValueChange={args.onValueChange}
      >
        <DateField.Input />
        <DateField.Clear />
        <DateField.Trigger />
      </DateField>
      <Field.Hint>2000.01.31, 2000-01-31, 2000년 1월 31일, 20000131 모두 됩니다.</Field.Hint>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'DateField.Input을 넣으면 날짜를 글자로 칠 수 있습니다. Enter나 포커스를 떠날 때 읽고 표시 형식으로 다시 씁니다. 못 읽거나 고를 수 없는 날짜는 그대로 두고 오류로 표시하며, Esc로 되돌립니다. ↓는 달력을 엽니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: '생년월일' });
    await userEvent.click(input);
    await userEvent.keyboard('20000131{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(new Date(2000, 0, 31));
    await expect(input).toHaveValue('2000.01.31');
    await userEvent.clear(input);
    await userEvent.type(input, '2030-01-01');
    await userEvent.tab();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(input);
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('2000.01.31');
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(day('2000-01-31')).toHaveFocus());
  },
};
