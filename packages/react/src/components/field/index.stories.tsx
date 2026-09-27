import { useState } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { expect } from 'storybook/test';

import { Field as RhfField } from '../../react-hook-form';
import { Button } from '../button';
import { TextField } from '../text-field';

import { Field } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Field> = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  args: { size: 'standard', variant: 'vertical', required: true, disabled: false },
};
export default meta;
type Story = StoryObj<typeof Field>;

export const Playground: Story = {
  render: (args) => (
    <Field {...args} className="w-80">
      <Field.Label>이메일</Field.Label>
      <Field.Description>로그인에 사용합니다.</Field.Description>
      <TextField type="email" placeholder="name@example.com" />
      <Field.Hint>회사 이메일을 권장합니다.</Field.Hint>
      <Field.Error>이메일 형식을 확인하세요.</Field.Error>
    </Field>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '이메일' });
    await userEvent.click(canvas.getByText('이메일', { selector: 'label', exact: false }));
    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription(
      '로그인에 사용합니다. 회사 이메일을 권장합니다.',
    );
    await userEvent.type(input, 'user@example.com');
    await expect(input).toHaveValue('user@example.com');
  },
};
export const Invalid: Story = { ...Playground, args: { invalid: true }, play: undefined };
export const Horizontal: Story = {
  ...Playground,
  args: { variant: 'horizontal' },
  play: undefined,
};
export const TinyDisabled: Story = {
  ...Playground,
  args: { size: 'tiny', disabled: true },
  play: undefined,
};
export const CustomLabel: Story = {
  render: () => (
    <Field required>
      <Field.Label asChild>
        <label className="font-bold">사용자 이름</label>
      </Field.Label>
      <TextField />
    </Field>
  ),
};

function RhfExample() {
  const methods = useForm({ defaultValues: { email: '' } });
  const [submitted, setSubmitted] = useState('');
  return (
    <FormProvider {...methods}>
      <form
        noValidate
        className="flex w-80 flex-col gap-3"
        onSubmit={methods.handleSubmit((values) => setSubmitted(values.email))}
      >
        <RhfField name="email" required registerOptions={{ required: '이메일을 입력하세요.' }}>
          <RhfField.Label>이메일</RhfField.Label>
          <TextField type="email" />
          <RhfField.Hint>회사 이메일을 권장합니다.</RhfField.Hint>
          <RhfField.Error />
        </RhfField>
        <Button type="submit">저장</Button>
        <Button
          type="button"
          onClick={() => {
            methods.reset();
            setSubmitted('');
          }}
        >
          초기화
        </Button>
        <output aria-label="저장 결과">{submitted}</output>
      </form>
    </FormProvider>
  );
}
export const ReactHookForm: Story = {
  render: () => <RhfExample />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(await canvas.findByText('이메일을 입력하세요.')).toBeVisible();
    const input = canvas.getByRole('textbox', { name: '이메일' });
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'user@example.com');
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByLabelText('저장 결과')).toHaveTextContent('user@example.com');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await expect(input).toHaveValue('');
  },
};
