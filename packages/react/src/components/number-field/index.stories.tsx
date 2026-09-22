import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { expect } from 'storybook/test';
import { z } from 'zod';

import { Field as FormField } from '../../react-hook-form';
import { Button } from '../button';
import { Field } from '../field';

import { NumberField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/NumberField',
  component: NumberField,
  tags: ['autodocs'],
  args: { 'aria-label': '값', defaultValue: 0, step: 1, variant: 'outline', size: 'standard' },
} satisfies Meta<typeof NumberField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};

function NumericExample() {
  const [value, setValue] = useState<number | null>(0.1);
  return (
    <div className="grid w-80 gap-3">
      <Field>
        <Field.Label>길이</Field.Label>
        <NumberField
          value={value}
          onChange={setValue}
          min={-1}
          max={1}
          step={0.1}
          largeStep={0.5}
          incrementLabel="길이 증가"
          decrementLabel="길이 감소"
          clearLabel="길이 지우기"
        >
          <NumberField.Input />
          <span aria-hidden="true">cm</span>
          <NumberField.Clear />
          <NumberField.Stepper />
        </NumberField>
        <Field.Hint>−1부터 1 · 0.1씩, Shift는 0.5씩</Field.Hint>
      </Field>
      <output aria-label="숫자 상태">{JSON.stringify(value)}</output>
    </div>
  );
}
export const DecimalSteps: Story = {
  render: () => <NumericExample />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '길이' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(input).toHaveValue('0.3');
    await expect(canvas.getByLabelText('숫자 상태')).toHaveTextContent('0.3');
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    await expect(input).toHaveValue('0.8');
    await userEvent.click(canvas.getByRole('button', { name: '길이 증가' }));
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue('0.9');
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveAttribute('aria-valuenow', '1');
    await expect(canvas.getByRole('button', { name: '길이 증가' })).toBeDisabled();
    await userEvent.clear(input);
    await userEvent.type(input, '-');
    await expect(input).toHaveValue('-');
    await userEvent.type(input, '0.5');
    await expect(canvas.getByLabelText('숫자 상태')).toHaveTextContent('-0.5');
    await userEvent.click(canvas.getByRole('button', { name: '길이 지우기' }));
    await expect(input).toHaveValue('');
    await expect(canvas.getByLabelText('숫자 상태')).toHaveTextContent('null');
    await expect(input).not.toHaveAttribute('aria-valuenow');
  },
};

function FormatsExample() {
  const [currency, setCurrency] = useState<number | null>(1234.567);
  return (
    <div className="grid w-80 gap-4">
      <Field>
        <Field.Label>금액</Field.Label>
        <NumberField
          value={currency}
          onChange={setCurrency}
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
          step={0.01}
          formatOptions={{ style: 'percent', minimumFractionDigits: 1 }}
        />
        <Field.Hint>입력 시 원래 숫자 0–1로 편집합니다.</Field.Hint>
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
    await expect(price).toHaveValue('1.234,57 €');
    await userEvent.click(price);
    await expect(price).toHaveValue('1234,567');
    await userEvent.clear(price);
    await userEvent.paste('2.345,67 €');
    await expect(price).toHaveValue('2345,67');
    await userEvent.click(ratio);
    await expect(price).toHaveValue('2.345,67 €');
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
        className="grid w-80 gap-3"
        noValidate
        onSubmit={methods.handleSubmit((values) => setResult(JSON.stringify(values)))}
      >
        <FormField name="quantity" controlMode="value" required>
          <FormField.Label>수량</FormField.Label>
          <NumberField min={1} max={20} incrementLabel="수량 증가" decrementLabel="수량 감소" />
          <FormField.Hint>숫자 타입으로 제출합니다.</FormField.Hint>
          <FormField.Error />
        </FormField>
        <Button type="submit">제출</Button>
        <Button
          type="button"
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
