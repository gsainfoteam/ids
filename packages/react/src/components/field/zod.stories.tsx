import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { expect } from 'storybook/test';
import { z } from 'zod';

import { Field } from '../../react-hook-form';
import { Button } from '../button';
import { TextField } from '../text-field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const schema = z
  .object({
    account: z.object({
      email: z
        .string()
        .trim()
        .min(1, '가입 이메일을 입력하세요.')
        .email('올바른 이메일 주소를 입력하세요.')
        .transform((value) => value.toLowerCase()),
    }),
    confirmation: z.string().trim().toLowerCase().min(1, '이메일 확인을 입력하세요.'),
    agreed: z.boolean().refine((value) => value, '약관에 동의해 주세요.'),
  })
  .refine((values) => values.account.email === values.confirmation, {
    path: ['confirmation'],
    message: '두 이메일 주소가 일치하지 않습니다.',
  });

function ZodExample() {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { account: { email: '' }, confirmation: '', agreed: false },
  });
  const [submitted, setSubmitted] = useState('');
  return (
    <FormProvider {...methods}>
      <form
        noValidate
        className="flex w-80 flex-col gap-3"
        onSubmit={methods.handleSubmit((values) => setSubmitted(values.account.email))}
      >
        <Field name="account.email" required>
          <Field.Label>가입 이메일</Field.Label>
          <TextField inputMode="email" />
          <Field.Hint>공백 제거와 소문자 변환은 제출 값에 적용됩니다.</Field.Hint>
          <Field.Error />
        </Field>
        <Field name="confirmation" controlMode="value" required>
          <Field.Label>이메일 확인</Field.Label>
          <TextField inputMode="email" />
          <Field.Hint>위 주소와 같아야 합니다.</Field.Hint>
          <Field.Error />
        </Field>
        <Field name="agreed" required variant="horizontal">
          <Field.Label>이용 약관 동의</Field.Label>
          <input type="checkbox" />
          <Field.Error />
        </Field>
        <Button type="submit">검증 후 제출</Button>
        <Button
          type="button"
          onClick={() => {
            methods.reset();
            setSubmitted('');
          }}
        >
          초기화
        </Button>
        <output aria-label="정규화된 제출 값">{submitted}</output>
      </form>
    </FormProvider>
  );
}

const meta = {
  title: 'Components/Field/Zod',
  component: ZodExample,
  tags: ['autodocs'],
} satisfies Meta<typeof ZodExample>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SchemaValidation: Story = {
  play: async ({ canvas, userEvent }) => {
    const email = canvas.getByRole('textbox', { name: '가입 이메일' });
    const confirmation = canvas.getByRole('textbox', { name: '이메일 확인' });
    const submit = canvas.getByRole('button', { name: '검증 후 제출' });
    await userEvent.click(submit);
    await expect(await canvas.findByText('가입 이메일을 입력하세요.')).toBeVisible();
    await expect(canvas.getByText('이메일 확인을 입력하세요.')).toBeVisible();
    await expect(canvas.getByText('약관에 동의해 주세요.')).toBeVisible();
    await expect(email).toHaveFocus();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription('가입 이메일을 입력하세요.');
    await userEvent.type(email, 'invalid');
    await userEvent.click(submit);
    await expect(await canvas.findByText('올바른 이메일 주소를 입력하세요.')).toBeVisible();
    await userEvent.clear(email);
    await userEvent.type(email, '  USER@EXAMPLE.COM  ');
    await userEvent.type(confirmation, 'other@example.com');
    await userEvent.click(canvas.getByRole('checkbox', { name: '이용 약관 동의' }));
    await userEvent.click(submit);
    await expect(await canvas.findByText('두 이메일 주소가 일치하지 않습니다.')).toBeVisible();
    await expect(confirmation).toHaveFocus();
    await expect(confirmation).toHaveAccessibleDescription('두 이메일 주소가 일치하지 않습니다.');
    await userEvent.clear(confirmation);
    await userEvent.type(confirmation, 'user@example.com');
    await userEvent.click(submit);
    await expect(canvas.getByLabelText('정규화된 제출 값')).toHaveTextContent('user@example.com');
    await expect(email).toHaveValue('  USER@EXAMPLE.COM  ');
    await expect(email).toHaveAccessibleDescription(
      '공백 제거와 소문자 변환은 제출 값에 적용됩니다.',
    );
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await expect(email).toHaveValue('');
    await expect(confirmation).toHaveValue('');
    await expect(canvas.getByRole('checkbox', { name: '이용 약관 동의' })).not.toBeChecked();
    await expect(canvas.getByLabelText('정규화된 제출 값')).toBeEmptyDOMElement();
  },
};
