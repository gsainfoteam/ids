import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';
import { z } from 'zod';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { Field } from '../field';

import { NumberField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/NumberField',
  component: NumberField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    allowWheelScrub: { control: 'boolean' },
    hideStepper: { control: 'boolean' },
  },
  args: {
    'aria-label': '수량',
    defaultValue: 1,
    variant: 'outline',
    size: 'standard',
    className: 'w-56',
    onValueChange: fn(),
  },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <NumberField
              size={size}
              variant={variant}
              defaultValue={12}
              aria-label={`${variant} ${size}`}
              className="w-48"
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <NumberField placeholder="0" aria-label="비어 있음" className="w-48" />
        </Showcase.Row>
        <Showcase.Row label="out of range">
          <NumberField defaultValue={12} max={10} aria-label="범위 밖" className="w-48" />
        </Showcase.Row>
        <Showcase.Row label="at max">
          <NumberField defaultValue={10} max={10} aria-label="최댓값" className="w-48" />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <NumberField defaultValue={3} disabled aria-label="비활성" className="w-48" />
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <NumberField defaultValue={3} readOnly aria-label="읽기 전용" className="w-48" />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Composition"
        description="자식을 두지 않으면 끝에 위아래 버튼이 붙습니다. Decrement와 Increment를 직접 두면 입력 양옆에 놓입니다."
      >
        <Showcase.Row label="inline">
          <NumberField defaultValue={2} min={0} aria-label="인원" className="w-40">
            <NumberField.Decrement />
            <NumberField.Input className="text-center" />
            <NumberField.Increment />
          </NumberField>
          <NumberField size="tiny" defaultValue={2} min={0} aria-label="인원 tiny" className="w-32">
            <NumberField.Decrement />
            <NumberField.Input className="text-center" />
            <NumberField.Increment />
          </NumberField>
        </Showcase.Row>
        <Showcase.Row label="unit · Clear">
          <NumberField defaultValue={72.5} step={0.1} aria-label="무게" className="w-56">
            <NumberField.Input />
            <span>kg</span>
            <NumberField.Clear />
            <NumberField.Stepper />
          </NumberField>
        </Showcase.Row>
        <Showcase.Row label="currency">
          <NumberField
            defaultValue={1234.5}
            locale="ko-KR"
            formatOptions={{ style: 'currency', currency: 'KRW' }}
            aria-label="금액"
            className="w-56"
          />
        </Showcase.Row>
        <Showcase.Row label="percent">
          <NumberField
            defaultValue={0.125}
            min={0}
            max={1}
            formatOptions={{ style: 'percent', minimumFractionDigits: 1 }}
            aria-label="비율"
            className="w-56"
          />
        </Showcase.Row>
        <Showcase.Row label="no stepper">
          <NumberField defaultValue={42} hideStepper aria-label="버튼 없음" className="w-48" />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  args: { defaultValue: 5, min: 0, max: 100 },
  parameters: {
    docs: {
      description: {
        story:
          '↑↓는 step, Shift는 largeStep, Alt(Option)는 smallStep, PageUp·PageDown은 largeStep, Home·End는 min·max로 갑니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '수량' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('6');
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    await expect(input).toHaveValue('16');
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await expect(input).toHaveValue('15.9');
    await userEvent.keyboard('{End}');
    await expect(input).toHaveAttribute('aria-valuenow', '100');
    await userEvent.keyboard('{Home}');
    await expect(input).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{PageUp}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(10);
  },
};

export const PressAndHold: Story = {
  args: { defaultValue: 0 },
  parameters: {
    docs: {
      description: {
        story:
          '버튼을 누르고 있으면 0.4초 뒤부터 계속 바뀌고 점점 빨라집니다. 마우스로 누르면 포커스는 입력에 남고, 터치로 누르면 화상 키보드를 띄우지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '수량' });
    const increment = canvas.getByRole('button', { name: '값 늘리기' });
    await userEvent.pointer({ keys: '[MouseLeft>]', target: increment });
    await waitFor(() => expect(Number(input.getAttribute('aria-valuenow'))).toBeGreaterThan(4), {
      timeout: 2000,
    });
    await userEvent.pointer({ keys: '[/MouseLeft]', target: increment });
    await expect(input).toHaveFocus();
    const released = input.getAttribute('aria-valuenow');
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(input).toHaveAttribute('aria-valuenow', released!);
  },
};

export const StepSnapping: Story = {
  args: { defaultValue: null, min: 0, step: 0.5, 'aria-label': '시간' },
  parameters: {
    docs: {
      description: {
        story:
          'step을 주면 입력을 마칠 때 min에서 시작하는 step 격자로 맞춥니다. 격자 밖의 값에서 ↑↓를 누르면 가까운 격자로 먼저 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '시간' });
    await userEvent.type(input, '1.3');
    await userEvent.tab();
    await expect(input).toHaveValue('1.5');
    await userEvent.clear(input);
    await userEvent.type(input, '2.2{ArrowUp}');
    await expect(input).toHaveValue('2.5');
  },
};

export const WheelScrub: Story = {
  args: { defaultValue: 10, allowWheelScrub: true },
  parameters: {
    docs: {
      description: {
        story:
          'allowWheelScrub을 켜면 포커스가 있는 동안 휠로 값을 바꿉니다. 포커스가 없으면 휠은 페이지를 스크롤합니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '수량' });
    const wheel = (deltaY: number) =>
      input.dispatchEvent(new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true }));
    wheel(-100);
    await expect(input).toHaveValue('10');
    await userEvent.click(input);
    wheel(-100);
    wheel(-100);
    await expect(input).toHaveValue('12');
    wheel(100);
    await expect(input).toHaveValue('11');
  },
};

function RangeExample() {
  return (
    <form className="flex w-64 flex-col gap-3" onSubmit={(event) => event.preventDefault()}>
      <Field>
        <Field.Label>좌석 수</Field.Label>
        <NumberField name="seats" min={1} max={8} defaultValue={12} />
        <Field.Hint>1에서 8까지</Field.Hint>
        <Field.Error />
      </Field>
      <Button type="submit">예약</Button>
    </form>
  );
}

export const RangeValidity: Story = {
  render: () => <RangeExample />,
  parameters: {
    docs: {
      description: {
        story:
          '범위를 벗어난 값은 native 검증으로도 알립니다. 폼이 제출을 막고 Field.Error가 이유를 보여 줍니다. 입력을 마치면 범위 안으로 맞춰집니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '좌석 수' });
    await userEvent.click(canvas.getByRole('button', { name: '예약' }));
    await expect(await canvas.findByText('값은 8 이하여야 합니다.')).toBeVisible();
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveValue('8');
    await expect(canvas.queryByText('값은 8 이하여야 합니다.')).toBeNull();
  },
};

function FormatsExample() {
  const [currency, setCurrency] = useState<number | null>(1234.567);
  return (
    <div className="grid w-72 gap-4">
      <Field>
        <Field.Label>금액</Field.Label>
        <NumberField
          value={currency}
          onValueChange={setCurrency}
          locale="de-DE"
          formatOptions={{ style: 'currency', currency: 'EUR' }}
        />
      </Field>
      <Field>
        <Field.Label>비율</Field.Label>
        <NumberField
          defaultValue={0.125}
          min={0}
          max={1}
          formatOptions={{ style: 'percent', minimumFractionDigits: 1 }}
        />
        <Field.Hint>입력하는 동안은 0–1 사이 원래 숫자로 편집합니다.</Field.Hint>
      </Field>
      <output aria-label="금액 숫자">{JSON.stringify(currency)}</output>
    </div>
  );
}

export const LocaleFormats: Story = {
  render: () => <FormatsExample />,
  play: async ({ canvas, userEvent }) => {
    const price = canvas.getByRole('spinbutton', { name: '금액' });
    const ratio = canvas.getByRole('spinbutton', { name: '비율' });
    await expect(price).toHaveValue('1.234,57 €');
    await userEvent.click(price);
    await expect(price).toHaveValue('1234,567');
    await userEvent.clear(price);
    await userEvent.paste('2.345,67 €');
    await expect(price).toHaveValue('2345,67');
    await userEvent.click(ratio);
    await expect(price).toHaveValue('2.345,67 €');
    await expect(canvas.getByLabelText('금액 숫자')).toHaveTextContent('2345.67');
    await expect(ratio).toHaveValue('0.125');
    await userEvent.clear(ratio);
    await userEvent.paste('25%');
    await expect(ratio).toHaveValue('0.25');
    await userEvent.click(price);
    await expect(ratio).toHaveValue('25.0%');
  },
};

const schema = z.object({
  quantity: z
    .number()
    .nullable()
    .refine(
      (value) => value != null && Number.isInteger(value) && value >= 1 && value <= 20,
      '1–20 사이 정수를 입력하세요.',
    ),
});

function FormExample() {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { quantity: null as number | null },
  });
  const [result, setResult] = useState('');
  return (
    <FormProvider {...methods}>
      <form
        className="grid w-72 gap-3"
        noValidate
        onSubmit={methods.handleSubmit((values) => setResult(JSON.stringify(values)))}
      >
        <FormField name="quantity" controlMode="value" required>
          <FormField.Label>수량</FormField.Label>
          <NumberField min={1} max={20} />
          <FormField.Hint>숫자 타입으로 제출합니다.</FormField.Hint>
          <FormField.Error />
        </FormField>
        <Button type="submit">제출</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            methods.reset();
            setResult('');
          }}
        >
          초기화
        </Button>
        <output aria-label="제출 값">{result}</output>
      </form>
    </FormProvider>
  );
}

export const ZodForm: Story = {
  render: () => <FormExample />,
  parameters: {
    docs: {
      description: {
        story:
          'controlMode="value"는 onValueChange로 숫자를 받습니다. 화면의 글자가 아니라 number | null이 RHF에 들어갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '수량' });
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(await canvas.findByText('1–20 사이 정수를 입력하세요.')).toBeVisible();
    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription('1–20 사이 정수를 입력하세요.');
    await userEvent.type(input, '1.5');
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 값')).toBeEmptyDOMElement();
    await userEvent.clear(input);
    await userEvent.type(input, '12');
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 값')).toHaveTextContent('{"quantity":12}');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await expect(input).toHaveValue('');
    await expect(canvas.getByLabelText('제출 값')).toBeEmptyDOMElement();
  },
};
