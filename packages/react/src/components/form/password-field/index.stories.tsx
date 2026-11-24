import { useState } from 'react';

import { KeyIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';
import { z } from 'zod';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { Field } from '../field';

import { PasswordField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

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
  },
  args: {
    name: 'password',
    'aria-label': '비밀번호',
    variant: 'outline',
    size: 'standard',
    onValueChange: fn(),
    onVisibleChange: fn(),
  },
} satisfies Meta<typeof PasswordField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const Usage: Story = {
  render: () => (
    <div className="w-72">
      <Field>
        <Field.Label>비밀번호</Field.Label>
        <PasswordField name="password" autoComplete="current-password" />
      </Field>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="w-56">
              <PasswordField
                name="password"
                size={size}
                variant={variant}
                defaultValue="infoteam"
                aria-label={`${variant} ${size}`}
              />
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <div className="w-56">
            <PasswordField name="password" placeholder="비밀번호" aria-label="비어 있음" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="visible">
          <div className="w-56">
            <PasswordField
              name="password"
              defaultValue="infoteam"
              defaultVisible
              aria-label="보이는 비밀번호"
            />
          </div>
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <div className="w-56">
            <PasswordField name="password" defaultValue="1234" invalid aria-label="잘못됨" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <div className="w-56">
            <PasswordField name="password" defaultValue="infoteam" disabled aria-label="비활성" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <div className="w-56">
            <PasswordField
              name="password"
              defaultValue="infoteam"
              readOnly
              aria-label="읽기 전용"
            />
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Composition"
        description="부품을 하나도 쓰지 않으면 Caps Lock 표시와 보기 버튼이 뒤에 붙습니다. Input, CapsLock, VisibilityToggle, Clear 중 하나라도 쓰면 쓴 부품만, 쓴 자리에 그립니다. 아이콘은 부품이 아닙니다."
      >
        <Showcase.Row label="leading icon">
          <div className="w-72">
            <PasswordField name="password" aria-label="아이콘">
              <LockClosedIcon />
            </PasswordField>
          </div>
        </Showcase.Row>
        <Showcase.Row label="Clear">
          <div className="w-72">
            <PasswordField name="password" defaultValue="infoteam" aria-label="지우기">
              <KeyIcon />
              <PasswordField.Input />
              <PasswordField.Clear />
              <PasswordField.VisibilityToggle />
            </PasswordField>
          </div>
        </Showcase.Row>
        <Showcase.Row label="custom toggle">
          <div className="w-72">
            <PasswordField name="password" defaultValue="infoteam" aria-label="텍스트 토글">
              <PasswordField.Input />
              <PasswordField.VisibilityToggle asChild>
                <Button variant="ghost">보기</Button>
              </PasswordField.VisibilityToggle>
            </PasswordField>
          </div>
        </Showcase.Row>
        <Showcase.Row label="no toggle">
          <div className="w-72">
            <PasswordField name="password" defaultValue="infoteam" aria-label="토글 없음">
              <PasswordField.Input />
              <PasswordField.CapsLock />
            </PasswordField>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const ShowWhatWasTyped: Story = {
  render: function Render() {
    const [value, setValue] = useState('demo-password');

    return (
      <div className="grid w-72 gap-3">
        <Field>
          <Field.Label>로그인 비밀번호</Field.Label>
          <PasswordField
            name="password"
            value={value}
            onValueChange={setValue}
            data-1p-ignore=""
            data-lpignore="true"
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
  },
  parameters: {
    docs: {
      description: {
        story:
          '`PasswordField.VisibilityToggle` 은 같은 input 의 type 만 바꿉니다. 값, 선택 범위, 자동 완성이 유지되고 onChange 는 불리지 않습니다. 이름은 그대로이고 aria-pressed 가 상태를 알립니다. 앞에 둔 아이콘은 부품이 아니라서 입력 앞에 그대로 놓입니다.',
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

export const WarnWhenCapsLockIsOn: Story = {
  render: (args) => (
    <div className="w-72">
      <PasswordField
        {...args}
        placeholder="Caps Lock을 켜 보세요"
        data-1p-ignore=""
        data-lpignore="true"
      >
        <PasswordField.Input />
        <PasswordField.CapsLock label="Caps Lock이 켜져 있습니다." />
        <PasswordField.VisibilityToggle />
      </PasswordField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '입력에 포커스가 있는 동안 Caps Lock이 켜지면 ⇪ 표시가 나타납니다. PasswordField.CapsLock 의 label 은 표시의 title 이 되고 스크린 리더가 읽습니다. 부품을 쓰지 않은 PasswordField 는 문구 없이 표시만 그립니다.',
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

export const LeaveOutTheVisibilityToggle: Story = {
  render: () => (
    <div className="w-72">
      <Field>
        <Field.Label>결제 비밀번호</Field.Label>
        <PasswordField name="pin" inputMode="numeric" data-1p-ignore="" data-lpignore="true">
          <PasswordField.Input />
          <PasswordField.CapsLock />
        </PasswordField>
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '보기 버튼 없이 가려 두기만 하려면 `PasswordField.Input` 과 `PasswordField.CapsLock` 만 씁니다. 부품을 하나라도 쓰면 쓴 부품만 그리므로 VisibilityToggle 은 빠지고 Caps Lock 표시는 남습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByLabelText('결제 비밀번호', { selector: 'input' });
    await expect(canvas.queryByRole('button')).toBeNull();
    await userEvent.click(input);
    await userEvent.keyboard('{CapsLock}a');
    await expect(canvasElement.querySelector('[data-password-field-caps-lock]')).toBeVisible();
    await userEvent.keyboard('{CapsLock}b');
    await expect(canvasElement.querySelector('[data-password-field-caps-lock]')).toBeNull();
  },
};

export const LeaveOutTheCapsLockSign: Story = {
  render: () => (
    <div className="w-72">
      <Field>
        <Field.Label>비밀번호</Field.Label>
        <PasswordField name="password" data-1p-ignore="" data-lpignore="true">
          <PasswordField.Input />
          <PasswordField.VisibilityToggle />
        </PasswordField>
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Caps Lock 표시를 빼려면 `PasswordField.Input` 과 `PasswordField.VisibilityToggle` 만 씁니다. 화면의 ⇪ 표시와 스크린 리더 알림이 함께 빠집니다. 둘 다 빼려면 `<PasswordField.Input />` 하나만 씁니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByLabelText('비밀번호', { selector: 'input' });
    await userEvent.click(input);
    await userEvent.keyboard('{CapsLock}a');
    await expect(canvasElement.querySelector('[data-password-field-caps-lock]')).toBeNull();
    await expect(canvas.queryByRole('status')).toBeNull();
    await userEvent.keyboard('{CapsLock}b');
    await expect(canvas.getByRole('button', { name: '비밀번호 표시' })).toBeVisible();
  },
};

export const ControlVisibilityFromOutside: Story = {
  render: function Render() {
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
            data-1p-ignore=""
            data-lpignore="true"
          >
            <PasswordField.Input />
            <PasswordField.CapsLock />
          </PasswordField>
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
  },
  parameters: {
    docs: {
      description: {
        story:
          '`visible` 과 `onVisibleChange` 로 바깥에서 보기 상태를 정합니다. 여기서는 체크박스가 보기 버튼을 대신하므로 부품은 Input 과 CapsLock 만 씁니다. 폼을 제출하면 비밀번호 관리자가 알아보도록 다시 가립니다.',
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

export const ConfirmANewPassword: Story = {
  render: function Render() {
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
            <PasswordField autoComplete="new-password" data-1p-ignore="" data-lpignore="true" />
            <FormField.Hint>8자 이상 입력하세요.</FormField.Hint>
            <FormField.Error />
          </FormField>
          <FormField name="confirmation" required>
            <FormField.Label>비밀번호 확인</FormField.Label>
            <PasswordField autoComplete="new-password" data-1p-ignore="" data-lpignore="true" />
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
  },
  parameters: {
    docs: {
      description: {
        story:
          '새 비밀번호와 확인 칸을 react-hook-form 의 `Field` 로 묶고 zod 스키마로 검증합니다. `autoComplete="new-password"` 는 비밀번호 관리자에게 새 비밀번호를 만들 자리라고 알립니다. 제출이 막히면 오류가 난 첫 칸으로 포커스가 가고, 오류 문구가 입력의 설명에 들어갑니다.',
      },
    },
  },
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
