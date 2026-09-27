import { useState } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as RhfField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { NumberField } from '../number-field';
import { PasswordField } from '../password-field';
import { TextArea } from '../text-area';
import { TextField } from '../text-field';

import { Field } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const orientations = ['vertical', 'horizontal'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/Field',
  component: Field,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: orientations },
    size: { control: 'radio', options: sizes },
    invalid: { control: 'boolean' },
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
  render: ({ children: _children, ...args }) => (
    <Field {...args} className="w-80">
      <Field.Label>이메일</Field.Label>
      <Field.Description>로그인에 사용합니다.</Field.Description>
      <TextField type="email" placeholder="name@example.com" />
      <Field.Hint>회사 이메일을 권장합니다.</Field.Hint>
      <Field.Error>이메일 형식을 확인하세요.</Field.Error>
    </Field>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Orientation × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={orientations}
          render={(size, orientation) => (
            <Field size={size} orientation={orientation} className="w-80">
              <Field.Label>이름</Field.Label>
              <Field.Description>실명으로 적어 주세요.</Field.Description>
              <TextField placeholder="홍길동" />
              <Field.Hint>한글 또는 영문</Field.Hint>
            </Field>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="default">
          <Field className="w-80">
            <Field.Label>닉네임</Field.Label>
            <TextField placeholder="닉네임" />
            <Field.Hint>2자 이상</Field.Hint>
          </Field>
        </Showcase.Row>
        <Showcase.Row label="required">
          <Field required className="w-80">
            <Field.Label>닉네임</Field.Label>
            <TextField placeholder="닉네임" />
          </Field>
        </Showcase.Row>
        <Showcase.Row label="filled">
          <Field className="w-80">
            <Field.Label>닉네임</Field.Label>
            <TextField defaultValue="인포팀" />
          </Field>
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <Field invalid className="w-80">
            <Field.Label>닉네임</Field.Label>
            <TextField defaultValue="a" />
            <Field.Hint>2자 이상</Field.Hint>
            <Field.Error>2자 이상 입력하세요.</Field.Error>
          </Field>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <Field disabled className="w-80">
            <Field.Label>닉네임</Field.Label>
            <TextField defaultValue="인포팀" />
            <Field.Hint>변경할 수 없습니다.</Field.Hint>
          </Field>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Controls"
        description="Field는 안에 둔 컨트롤 하나에 라벨, 설명, 오류를 연결합니다."
      >
        <Showcase.Row label="TextArea">
          <Field className="w-80">
            <Field.Label>자기소개</Field.Label>
            <TextArea rows={2} placeholder="자신을 소개해 주세요" />
          </Field>
        </Showcase.Row>
        <Showcase.Row label="NumberField">
          <Field className="w-80">
            <Field.Label>수량</Field.Label>
            <NumberField defaultValue={1} min={1} />
          </Field>
        </Showcase.Row>
        <Showcase.Row label="PasswordField">
          <Field className="w-80">
            <Field.Label>비밀번호</Field.Label>
            <PasswordField name="password" />
          </Field>
        </Showcase.Row>
        <Showcase.Row label="native select">
          <Field orientation="horizontal" className="w-80">
            <Field.Label>정렬</Field.Label>
            <select className="rounded-standard h-9 px-2 inset-ring-1 inset-ring-(--ids-color-border)">
              <option>최신순</option>
              <option>인기순</option>
            </select>
          </Field>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

function NativeValidationExample() {
  const [submitted, setSubmitted] = useState('');
  return (
    <form
      className="flex w-80 flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get('email')));
      }}
    >
      <Field>
        <Field.Label>이메일</Field.Label>
        {/* A password manager's inline menu takes focus from email inputs mid-typing. */}
        <TextField
          type="email"
          name="email"
          required
          placeholder="name@example.com"
          data-1p-ignore=""
          data-lpignore="true"
        />
        <Field.Hint>브라우저의 기본 검증을 그대로 씁니다.</Field.Hint>
        <Field.Error />
      </Field>
      <Button type="submit">가입</Button>
      <output aria-label="제출 결과">{submitted}</output>
    </form>
  );
}

export const NativeValidation: Story = {
  render: () => <NativeValidationExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Field.Error에 내용이 없으면 컨트롤의 validationMessage를 보여 줍니다. 제출하려 할 때나, 값을 바꾼 뒤 포커스를 옮길 때 나타나고 값이 올바르게 되면 바로 사라집니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '이메일' });
    await userEvent.click(canvas.getByRole('button', { name: '가입' }));
    const error = await waitFor(() => {
      const node = canvasElement.querySelector('[data-field-part=error]');
      if (!node) throw new Error('no error yet');
      return node;
    });
    await expect(error).toHaveTextContent((input as HTMLInputElement).validationMessage);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription((input as HTMLInputElement).validationMessage);
    await userEvent.type(input, 'user@example.com');
    await expect(canvasElement.querySelector('[data-field-part=error]')).toBeNull();
    await expect(input).toHaveAccessibleDescription('브라우저의 기본 검증을 그대로 씁니다.');
    await userEvent.click(canvas.getByRole('button', { name: '가입' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent('user@example.com');
  },
};

function MatchExample() {
  return (
    <form className="flex w-80 flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
      <Field>
        <Field.Label>이메일</Field.Label>
        <TextField type="email" required />
        <Field.Error match="valueMissing">이메일을 입력하세요.</Field.Error>
        <Field.Error match="typeMismatch">이메일 형식이 아닙니다.</Field.Error>
      </Field>
      <Button type="submit">확인</Button>
    </form>
  );
}

export const MatchValidity: Story = {
  render: () => <MatchExample />,
  parameters: {
    docs: {
      description: {
        story:
          'match로 ValidityState의 항목마다 다른 문구를 보여 줍니다. 브라우저 언어와 관계없이 서비스의 문구를 씁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '이메일' });
    await userEvent.click(canvas.getByRole('button', { name: '확인' }));
    await expect(await canvas.findByText('이메일을 입력하세요.')).toBeVisible();
    await userEvent.type(input, 'infoteam');
    await expect(await canvas.findByText('이메일 형식이 아닙니다.')).toBeVisible();
    await expect(canvas.queryByText('이메일을 입력하세요.')).toBeNull();
    await expect(input).toHaveAccessibleDescription('이메일 형식이 아닙니다.');
  },
};

export const FieldState: Story = {
  render: () => (
    <Field
      className="rounded-standard w-80 p-3 transition-colors data-focused:bg-(--ids-color-muted)/60"
      required
    >
      <Field.Label>닉네임</Field.Label>
      <TextField placeholder="닉네임" />
      <Field.Description>
        {(state) =>
          [
            state.focused && 'focused',
            state.filled && 'filled',
            state.dirty && 'dirty',
            state.touched && 'touched',
          ]
            .filter(Boolean)
            .join(' · ') || '아직 아무 상태도 없습니다'
        }
      </Field.Description>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '루트와 모든 파트에 data-focused, data-filled, data-dirty, data-touched가 붙고, className, style, children은 상태를 받는 함수도 됩니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const root = canvasElement.querySelector('[data-field]')!;
    const input = canvas.getByRole('textbox', { name: '닉네임' });
    await userEvent.click(input);
    await expect(root).toHaveAttribute('data-focused');
    await userEvent.type(input, '인포');
    await expect(root).toHaveAttribute('data-filled');
    await expect(root).toHaveAttribute('data-dirty');
    await userEvent.tab();
    await expect(root).not.toHaveAttribute('data-focused');
    await expect(root).toHaveAttribute('data-touched');
    await expect(canvas.getByText('filled · dirty · touched')).toBeVisible();
  },
};

export const Horizontal: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <Field orientation="horizontal">
        <Field.Label>이름</Field.Label>
        <TextField placeholder="홍길동" />
      </Field>
      <Field orientation="horizontal" invalid>
        <Field.Label>학번</Field.Label>
        <Field.Description>입학 연도로 시작하는 8자리</Field.Description>
        <TextField defaultValue="2024" />
        <Field.Error>8자리를 입력하세요.</Field.Error>
      </Field>
    </div>
  ),
};

export const CustomLabel: Story = {
  render: () => (
    <Field required className="w-80">
      <Field.Label asChild>
        <label className="font-bold">사용자 이름</label>
      </Field.Label>
      <TextField />
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: '사용자 이름' })).toBeRequired();
  },
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
          <TextField type="email" data-1p-ignore="" data-lpignore="true" />
          <RhfField.Hint>회사 이메일을 권장합니다.</RhfField.Hint>
          <RhfField.Error />
        </RhfField>
        <Button type="submit">저장</Button>
        <Button
          type="button"
          variant="outline"
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
  parameters: {
    docs: {
      description: {
        story:
          '/react-hook-form 경로의 Field는 FormProvider 아래에서 name으로 register()를 연결합니다. 오류, dirty, touched도 RHF 상태를 따릅니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(await canvas.findByText('이메일을 입력하세요.')).toBeVisible();
    const input = canvas.getByRole('textbox', { name: '이메일' });
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'user@example.com');
    await expect(canvasElement.querySelector('[data-field]')).toHaveAttribute('data-dirty');
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByLabelText('저장 결과')).toHaveTextContent('user@example.com');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await expect(input).toHaveValue('');
    await expect(canvasElement.querySelector('[data-field]')).not.toHaveAttribute('data-dirty');
  },
};
