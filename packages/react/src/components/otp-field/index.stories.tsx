import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { expect } from 'storybook/test';
import { z } from 'zod';

import { Field as FormField } from '../../react-hook-form';
import { Button } from '../button';
import { Field } from '../field';

import { OTPField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/OTPField',
  component: OTPField,
  tags: ['autodocs'],
  args: {
    length: 6,
    name: 'code',
    'aria-label': '인증 코드',
    variant: 'outline',
    size: 'standard',
  },
} satisfies Meta<typeof OTPField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
function KeyboardExample() {
  const [value, setValue] = useState('');
  const [completed, setCompleted] = useState(0);
  return (
    <div className="grid gap-3">
      <Field>
        <Field.Label>인증 코드</Field.Label>
        <OTPField
          length={6}
          name="code"
          value={value}
          onChange={setValue}
          onComplete={() => setCompleted((count) => count + 1)}
        >
          <OTPField.Slot index={0} />
          <OTPField.Slot index={1} />
          <OTPField.Slot index={2} />
          <OTPField.Separator />
          <OTPField.Slot index={3} />
          <OTPField.Slot index={4} />
          <OTPField.Slot index={5} />
        </OTPField>
        <Field.Hint>6자리 숫자 · 전체 코드 붙여넣기 가능</Field.Hint>
      </Field>
      <output aria-label="전체 코드">{value}</output>
      <output aria-label="완성 횟수">{completed}</output>
      <Button type="button">다음 동작</Button>
    </div>
  );
}
export const KeyboardAndPaste: Story = {
  render: () => <KeyboardExample />,
  play: async ({ canvas, userEvent }) => {
    const inputs = canvas.getAllByRole('textbox');
    await userEvent.click(canvas.getByText('인증 코드', { exact: true }));
    await expect(inputs[0]).toHaveFocus();
    await userEvent.keyboard('123456');
    await expect(canvas.getByLabelText('전체 코드')).toHaveTextContent('123456');
    await expect(inputs[5]).toHaveFocus();
    await expect(canvas.getByLabelText('완성 횟수')).toHaveTextContent('1');
    await userEvent.click(inputs[2]);
    await userEvent.paste('６５４-３２１');
    await expect(canvas.getByLabelText('전체 코드')).toHaveTextContent('654321');
    await expect(inputs[0]).toHaveValue('6');
    await expect(inputs[5]).toHaveValue('1');
    await expect(canvas.getByLabelText('완성 횟수')).toHaveTextContent('2');
    await userEvent.keyboard('{Backspace}');
    await expect(canvas.getByLabelText('전체 코드')).toHaveTextContent('65432');
    await expect(inputs[4]).toHaveFocus();
    await userEvent.keyboard('{Home}{ArrowRight}{Delete}');
    await expect(canvas.getByLabelText('전체 코드')).toHaveTextContent('6432');
    await expect(inputs[1]).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: '다음 동작' })).toHaveFocus();
  },
};
function MaskExample() {
  return (
    <form className="grid gap-3">
      <Field>
        <Field.Label>PIN</Field.Label>
        <OTPField length={4} name="pin" mask defaultValue="1234" variant="underline" />
      </Field>
      <Button type="reset">PIN 초기화</Button>
    </form>
  );
}
export const MaskAndReset: Story = {
  render: () => <MaskExample />,
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByLabelText('PIN 1 / 4', { selector: 'input', exact: true });
    await expect(first).toHaveAttribute('type', 'password');
    await userEvent.click(first);
    await userEvent.paste('9876');
    await expect(first).toHaveValue('9');
    await userEvent.click(canvas.getByRole('button', { name: 'PIN 초기화' }));
    await expect(first).toHaveValue('1');
  },
};
const schema = z.object({ code: z.string().length(6, '6자리 코드를 입력하세요.') });
function FormExample() {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: { code: '' } });
  const [result, setResult] = useState('');
  return (
    <FormProvider {...methods}>
      <form
        className="grid gap-3"
        noValidate
        onSubmit={methods.handleSubmit(() => setResult('검증 완료'))}
      >
        <FormField name="code" controlMode="value" required>
          <FormField.Label>이메일 코드</FormField.Label>
          <OTPField length={6} />
          <FormField.Hint>이메일로 받은 6자리 코드</FormField.Hint>
          <FormField.Error />
        </FormField>
        <Button type="submit">검증</Button>
        <Button
          type="button"
          onClick={() => {
            methods.reset();
            setResult('');
          }}
        >
          초기화
        </Button>
        <output aria-label="검증 결과">{result}</output>
      </form>
    </FormProvider>
  );
}
export const ZodForm: Story = {
  render: () => <FormExample />,
  play: async ({ canvas, userEvent }) => {
    const inputs = canvas.getAllByRole('textbox');
    await userEvent.click(canvas.getByRole('button', { name: '검증' }));
    await expect(inputs[0]).toHaveFocus();
    await expect(inputs[5]).toHaveAccessibleDescription('6자리 코드를 입력하세요.');
    await userEvent.keyboard('12');
    await userEvent.click(canvas.getByRole('button', { name: '검증' }));
    await expect(canvas.getByLabelText('검증 결과')).toBeEmptyDOMElement();
    await userEvent.click(inputs[2]);
    await userEvent.paste('123456');
    await userEvent.click(canvas.getByRole('button', { name: '검증' }));
    await expect(canvas.getByLabelText('검증 결과')).toHaveTextContent('검증 완료');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    for (const input of inputs) await expect(input).toHaveValue('');
    await expect(canvas.getByLabelText('검증 결과')).toBeEmptyDOMElement();
  },
};
