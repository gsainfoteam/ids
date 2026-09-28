import { useState } from 'react';

import { KeyIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';
import { z } from 'zod';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Field } from '../field';

import { PasswordField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const noPasswordManager = { 'data-1p-ignore': '', 'data-lpignore': 'true' } as const;

const NO_FILL = 'rgba(0, 0, 0, 0)';

const meta = {
  title: 'Form/PasswordField',
  component: PasswordField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    hideVisibilityToggle: { control: 'boolean' },
    hideCapsLock: { control: 'boolean' },
  },
  args: {
    name: 'password',
    'aria-label': '비밀번호',
    variant: 'outline',
    size: 'standard',
    className: cn('w-72'),
    onValueChange: fn(),
    onVisibleChange: fn(),
  },
} satisfies Meta<typeof PasswordField>;

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
            <PasswordField
              name="password"
              size={size}
              variant={variant}
              defaultValue="infoteam"
              aria-label={`${variant} ${size}`}
              className="w-56"
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <PasswordField
            name="password"
            placeholder="비밀번호"
            aria-label="비어 있음"
            className="w-56"
          />
        </Showcase.Row>
        <Showcase.Row label="visible">
          <PasswordField
            name="password"
            defaultValue="infoteam"
            defaultVisible
            aria-label="보이는 비밀번호"
            className="w-56"
          />
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <PasswordField
            name="password"
            defaultValue="1234"
            invalid
            aria-label="잘못됨"
            className="w-56"
          />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <PasswordField
            name="password"
            defaultValue="infoteam"
            disabled
            aria-label="비활성"
            className="w-56"
          />
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <PasswordField
            name="password"
            defaultValue="infoteam"
            readOnly
            aria-label="읽기 전용"
            className="w-56"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Composition"
        description="자식을 두지 않으면 Caps Lock 표시와 보기 버튼이 뒤에 붙습니다. 직접 두면 그 자리에 놓입니다."
      >
        <Showcase.Row label="leading icon">
          <PasswordField name="password" aria-label="아이콘" className="w-72">
            <LockClosedIcon />
          </PasswordField>
        </Showcase.Row>
        <Showcase.Row label="Clear">
          <PasswordField
            name="password"
            defaultValue="infoteam"
            aria-label="지우기"
            className="w-72"
          >
            <KeyIcon />
            <PasswordField.Input />
            <PasswordField.Clear />
            <PasswordField.VisibilityToggle />
          </PasswordField>
        </Showcase.Row>
        <Showcase.Row label="custom toggle">
          <PasswordField
            name="password"
            defaultValue="infoteam"
            aria-label="텍스트 토글"
            className="w-72"
          >
            <PasswordField.Input />
            <PasswordField.VisibilityToggle asChild>
              <Button variant="ghost">보기</Button>
            </PasswordField.VisibilityToggle>
          </PasswordField>
        </Showcase.Row>
        <Showcase.Row label="no toggle">
          <PasswordField
            name="password"
            defaultValue="infoteam"
            hideVisibilityToggle
            aria-label="토글 없음"
            className="w-72"
          />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

function VisibilityExample() {
  const [value, setValue] = useState('demo-password');
  return (
    <div className="grid w-72 gap-3">
      <Field>
        <Field.Label>로그인 비밀번호</Field.Label>
        <PasswordField
          name="password"
          value={value}
          onValueChange={setValue}
          {...noPasswordManager}
        >
          <LockClosedIcon />
          <PasswordField.Input />
          <PasswordField.VisibilityToggle />
        </PasswordField>
        <Field.Hint>보기를 바꿔도 입력과 선택 범위는 그대로입니다.</Field.Hint>
      </Field>
      <output aria-label="입력 길이">{value.length}자</output>
    </div>
  );
}

export const Visibility: Story = {
  render: () => <VisibilityExample />,
  parameters: {
    docs: {
      description: {
        story:
          '보기 버튼은 같은 input의 type만 바꿉니다. 값, 선택 범위, 자동 완성이 유지되고 onChange는 불리지 않습니다. 이름은 그대로이고 aria-pressed가 상태를 알립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText('로그인 비밀번호', {
      selector: 'input',
    }) as HTMLInputElement;
    await expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(input);
    input.setSelectionRange(1, 5, 'backward');
    const toggle = canvas.getByRole('button', { name: '비밀번호 표시' });
    await userEvent.click(toggle);
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute('type', 'text');
    await expect(input).toHaveValue('demo-password');
    await expect([input.selectionStart, input.selectionEnd, input.selectionDirection]).toEqual([
      1,
      5,
      'backward',
    ]);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(getComputedStyle(toggle).backgroundColor).toBe(NO_FILL));
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(input).toHaveAttribute('type', 'password');
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(canvas.getByLabelText('입력 길이')).toHaveTextContent('13자');
  },
};

export const CapsLock: Story = {
  render: (args) => (
    <PasswordField {...args} {...noPasswordManager} placeholder="Caps Lock을 켜 보세요" />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '입력에 포커스가 있는 동안 Caps Lock이 켜지면 ⇪ 표시가 나타나고, 스크린 리더에는 "Caps Lock이 켜져 있습니다."라고 알립니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByLabelText('비밀번호', { selector: 'input' });
    await userEvent.click(input);
    await userEvent.keyboard('{CapsLock}a');
    await expect(canvasElement.querySelector('[data-password-field-caps-lock]')).toBeVisible();
    await expect(canvas.getByRole('status')).toHaveTextContent('Caps Lock이 켜져 있습니다.');
    await userEvent.keyboard('{CapsLock}b');
    await expect(canvasElement.querySelector('[data-password-field-caps-lock]')).toBeNull();
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement();
  },
};

function ShowPasswordExample() {
  const [visible, setVisible] = useState(false);
  return (
    <form
      className="grid w-72 gap-3"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Field>
        <Field.Label>비밀번호</Field.Label>
        <PasswordField
          name="password"
          defaultValue="infoteam"
          visible={visible}
          onVisibleChange={setVisible}
          hideVisibilityToggle
          {...noPasswordManager}
        />
      </Field>
      <label className="text-body-b3-regular flex items-center gap-2">
        <input
          type="checkbox"
          checked={visible}
          onChange={(event) => setVisible(event.target.checked)}
        />
        비밀번호 보기
      </label>
      <Button type="submit">로그인</Button>
    </form>
  );
}

export const ControlledVisibility: Story = {
  render: () => <ShowPasswordExample />,
  parameters: {
    docs: {
      description: {
        story:
          'visible과 onVisibleChange로 바깥에서 보기 상태를 정합니다. 폼을 제출하면 비밀번호 관리자가 알아보도록 다시 가립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText('비밀번호', { selector: 'input' });
    await userEvent.click(canvas.getByRole('checkbox', { name: '비밀번호 보기' }));
    await expect(input).toHaveAttribute('type', 'text');
    await userEvent.click(canvas.getByRole('button', { name: '로그인' }));
    await expect(input).toHaveAttribute('type', 'password');
    await expect(canvas.getByRole('checkbox', { name: '비밀번호 보기' })).not.toBeChecked();
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
        className="grid w-72 gap-3"
        noValidate
        onSubmit={methods.handleSubmit(() => setResult('검증 완료'))}
      >
        <FormField name="password" required>
          <FormField.Label>새 비밀번호</FormField.Label>
          <PasswordField autoComplete="new-password" {...noPasswordManager} />
          <FormField.Hint>8자 이상 입력하세요.</FormField.Hint>
          <FormField.Error />
        </FormField>
        <FormField name="confirmation" required>
          <FormField.Label>비밀번호 확인</FormField.Label>
          <PasswordField autoComplete="new-password" {...noPasswordManager} />
          <FormField.Error />
        </FormField>
        <Button type="submit">검증</Button>
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
