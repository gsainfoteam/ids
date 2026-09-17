import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { expect } from 'storybook/test';
import { z } from 'zod';

import { Field as FormField } from '../../react-hook-form';
import { Button } from '../button';
import { Field } from '../field';

import { PasswordField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/PasswordField',
  component: PasswordField,
  tags: ['autodocs'],
  args: { name: 'password', 'aria-label': '비밀번호', variant: 'outline', size: 'standard' },
} satisfies Meta<typeof PasswordField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
function VisibilityExample() {
  const [value, setValue] = useState('demo-password');
  return (
    <div className="grid w-80 gap-3">
      <Field>
        <Field.Label>로그인 비밀번호</Field.Label>
        <PasswordField
          name="password"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        >
          <span aria-hidden="true">⌑</span>
          <PasswordField.Input />
          <PasswordField.VisibilityToggle />
        </PasswordField>
        <Field.Hint>표시를 전환해도 입력은 유지됩니다.</Field.Hint>
      </Field>
      <output aria-label="입력 길이">{value.length}자</output>
    </div>
  );
}
export const Visibility: Story = {
  render: () => <VisibilityExample />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText('로그인 비밀번호', { selector: 'input' });
    await expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(input);
    // Use an explicit selection because user-event's range keyboard simulation varies by browser.
    (input as HTMLInputElement).setSelectionRange(1, 5, 'backward');
    const node = input as HTMLInputElement;
    const selection = [node.selectionStart, node.selectionEnd, node.selectionDirection];
    await expect(selection).toEqual([1, 5, 'backward']);
    await userEvent.click(canvas.getByRole('button', { name: '비밀번호 표시' }));
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute('type', 'text');
    await expect(input).toHaveValue('demo-password');
    await expect([node.selectionStart, node.selectionEnd, node.selectionDirection]).toEqual(
      selection,
    );
    const toggle = canvas.getByRole('button', { name: '비밀번호 숨기기' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(input).toHaveAttribute('type', 'password');
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(canvas.getByLabelText('입력 길이')).toHaveTextContent('13자');
  },
};
const schema = z
  .object({ password: z.string().min(8, '8자 이상 입력하세요.'), confirmation: z.string() })
  .refine((values) => values.password === values.confirmation, {
    path: ['confirmation'],
    message: '비밀번호가 일치하지 않습니다.',
  });
function FormExample() {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmation: '' },
  });
  const [result, setResult] = useState('');
  return (
    <FormProvider {...methods}>
      <form
        className="grid w-80 gap-3"
        noValidate
        onSubmit={methods.handleSubmit(() => setResult('검증 완료'))}
      >
        <FormField name="password" required>
          <FormField.Label>새 비밀번호</FormField.Label>
          <PasswordField autoComplete="new-password" />
          <FormField.Hint>8자 이상 입력하세요.</FormField.Hint>
          <FormField.Error />
        </FormField>
        <FormField name="confirmation" required>
          <FormField.Label>비밀번호 확인</FormField.Label>
          <PasswordField autoComplete="new-password" />
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
    const password = canvas.getByLabelText('새 비밀번호', { selector: 'input', exact: false });
    const confirmation = canvas.getByLabelText('비밀번호 확인', {
      selector: 'input',
      exact: false,
    });
    await userEvent.click(canvas.getByRole('button', { name: '검증' }));
    await expect(password).toHaveFocus();
    await expect(password).toHaveAccessibleDescription('8자 이상 입력하세요.');
    await userEvent.type(password, 'demo-password');
    await userEvent.type(confirmation, 'different');
    await userEvent.click(canvas.getByRole('button', { name: '검증' }));
    await expect(await canvas.findByText('비밀번호가 일치하지 않습니다.')).toBeVisible();
    await expect(confirmation).toHaveFocus();
    await userEvent.clear(confirmation);
    await userEvent.type(confirmation, 'demo-password');
    await userEvent.click(canvas.getByRole('button', { name: '검증' }));
    await expect(canvas.getByLabelText('검증 결과')).toHaveTextContent('검증 완료');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await expect(password).toHaveValue('');
    await expect(confirmation).toHaveValue('');
    await expect(canvas.getByLabelText('검증 결과')).toBeEmptyDOMElement();
  },
};
