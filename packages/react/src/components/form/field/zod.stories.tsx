import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { noop } from 'es-toolkit';
import { FormProvider, useForm } from 'react-hook-form';
import { expect } from 'storybook/test';
import { z } from 'zod';

import { Showcase } from '~story-kit';

import { Field } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { TextField } from '../text-field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Form/Field/Zod',
  component: Field,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    orientation: 'vertical',
    size: 'standard',
    required: true,
    disabled: false,
    children: null,
  },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render({ children: _children, ...args }) {
    const schema = z.object({
      email: z
        .string()
        .trim()
        .min(1, '이메일을 입력하세요.')
        .email('올바른 이메일 주소를 입력하세요.'),
    });
    const methods = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

    return (
      <FormProvider {...methods}>
        <form noValidate className="grid w-80 gap-3" onSubmit={methods.handleSubmit(noop)}>
          <Field {...args} name="email">
            <Field.Label>이메일</Field.Label>
            <TextField inputMode="email" />
            <Field.Error />
          </Field>
          <Button type="submit">제출</Button>
        </form>
      </FormProvider>
    );
  },
};

export const Usage: Story = {
  render: function Render() {
    const schema = z.object({
      email: z
        .string()
        .trim()
        .min(1, '이메일을 입력하세요.')
        .email('올바른 이메일 주소를 입력하세요.'),
    });
    const methods = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });
    const [submitted, setSubmitted] = useState('');

    return (
      <FormProvider {...methods}>
        <form
          noValidate
          className="grid w-80 gap-3"
          onSubmit={methods.handleSubmit((values) => setSubmitted(values.email))}
        >
          <Field name="email" required>
            <Field.Label>이메일</Field.Label>
            <TextField inputMode="email" />
            <Field.Error />
          </Field>
          <Button type="submit">제출</Button>
          <output aria-label="제출 값">{submitted}</output>
        </form>
      </FormProvider>
    );
  },
};

export const Gallery: Story = {
  render: function Render() {
    const schema = z.object({
      empty: z.string().min(1, '이메일을 입력하세요.'),
      format: z.string().email('올바른 이메일 주소를 입력하세요.'),
      valid: z.string().email('올바른 이메일 주소를 입력하세요.'),
      agreed: z.boolean().refine((value) => value, '약관에 동의해 주세요.'),
    });
    const methods = useForm({
      resolver: zodResolver(schema),
      defaultValues: { empty: '', format: 'infoteam', valid: 'user@example.com', agreed: false },
    });
    const { trigger } = methods;

    useEffect(() => {
      void trigger();
    }, [trigger]);

    return (
      <FormProvider {...methods}>
        <Showcase>
          <Showcase.Section
            title="Schema errors"
            description="스키마의 메시지가 Field.Error에 나타나고, 컨트롤에 aria-invalid가 붙습니다."
          >
            <Showcase.Row label="min(1)">
              <div className="w-80">
                <Field name="empty" required>
                  <Field.Label>가입 이메일</Field.Label>
                  <TextField inputMode="email" />
                  <Field.Error />
                </Field>
              </div>
            </Showcase.Row>
            <Showcase.Row label="email()">
              <div className="w-80">
                <Field name="format" required>
                  <Field.Label>연락 이메일</Field.Label>
                  <TextField inputMode="email" />
                  <Field.Error />
                </Field>
              </div>
            </Showcase.Row>
            <Showcase.Row label="refine()">
              <div className="w-80">
                <Field name="agreed" required orientation="horizontal">
                  <Field.Label>이용 약관 동의</Field.Label>
                  <input type="checkbox" />
                  <Field.Error />
                </Field>
              </div>
            </Showcase.Row>
            <Showcase.Row label="valid">
              <div className="w-80">
                <Field name="valid" required>
                  <Field.Label>확인한 이메일</Field.Label>
                  <TextField inputMode="email" />
                  <Field.Hint>스키마를 통과한 값입니다.</Field.Hint>
                  <Field.Error />
                </Field>
              </div>
            </Showcase.Row>
          </Showcase.Section>
        </Showcase>
      </FormProvider>
    );
  },
};

export const ValidateASignUpFormWithZod: Story = {
  render: function Render() {
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
    const methods = useForm({
      resolver: zodResolver(schema),
      defaultValues: { account: { email: '' }, confirmation: '', agreed: false },
    });
    const [submitted, setSubmitted] = useState('');

    return (
      <FormProvider {...methods}>
        <form
          noValidate
          className="grid w-80 gap-3"
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
          <Field name="agreed" required orientation="horizontal">
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
  },
  parameters: {
    docs: {
      description: {
        story:
          'useForm에 zodResolver(schema)를 넘기면 Field는 name으로 연결된 경로의 스키마 오류를 Field.Error에 보여 주고, 제출할 때 첫 오류의 컨트롤로 포커스를 옮깁니다. account.email 같은 중첩 경로, 두 값을 비교하는 refine의 path, 제출 값에만 적용되는 trim과 toLowerCase도 그대로 따릅니다.',
      },
    },
  },
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
