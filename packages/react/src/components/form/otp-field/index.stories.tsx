import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';
import { z } from 'zod';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { Field } from '../field';

import { OTPField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/OTPField',
  component: OTPField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    pattern: { control: 'radio', options: ['numeric', 'alphanumeric'] },
    length: { control: { type: 'number', min: 1, max: 12 } },
    mask: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    length: 6,
    variant: 'outline',
    size: 'standard',
    pattern: 'numeric',
    onValueChange: fn(),
    onComplete: fn(),
  },
} satisfies Meta<typeof OTPField>;

export default meta;
type Story = StoryObj<typeof meta>;

const input = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLInputElement>('[data-otp-field] input')!;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <OTPField
              length={6}
              size={size}
              variant={variant}
              defaultValue="123"
              aria-label={`${variant} ${size}`}
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <OTPField length={6} aria-label="비어 있음" />
        </Showcase.Row>
        <Showcase.Row label="partial">
          <OTPField length={6} defaultValue="1234" aria-label="일부 입력" />
        </Showcase.Row>
        <Showcase.Row label="complete">
          <OTPField length={6} defaultValue="123456" aria-label="완성" />
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <OTPField length={6} defaultValue="123456" invalid aria-label="잘못됨" />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <OTPField length={6} defaultValue="12" disabled aria-label="비활성" />
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <OTPField length={6} defaultValue="123456" readOnly aria-label="읽기 전용" />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Layout"
        description="Group 하나의 슬롯은 테두리를 공유합니다. Group 없이 두면 슬롯마다 떨어집니다."
      >
        <Showcase.Row label="default">
          <OTPField length={6} aria-label="기본" />
        </Showcase.Row>
        <Showcase.Row label="3 · 3">
          <OTPField length={6} aria-label="3 3">
            <OTPField.Group>
              <OTPField.Slot index={0} />
              <OTPField.Slot index={1} />
              <OTPField.Slot index={2} />
            </OTPField.Group>
            <OTPField.Separator />
            <OTPField.Group>
              <OTPField.Slot index={3} />
              <OTPField.Slot index={4} />
              <OTPField.Slot index={5} />
            </OTPField.Group>
          </OTPField>
        </Showcase.Row>
        <Showcase.Row label="separate">
          <OTPField length={4} aria-label="분리">
            <OTPField.Slot index={0} />
            <OTPField.Slot index={1} />
            <OTPField.Slot index={2} />
            <OTPField.Slot index={3} />
          </OTPField>
        </Showcase.Row>
        <Showcase.Row label="length 4 · 8">
          <OTPField length={4} aria-label="4자리" />
          <OTPField length={8} pattern="alphanumeric" aria-label="8자리" />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Content">
        <Showcase.Row label="mask">
          <OTPField length={4} mask defaultValue="1234" aria-label="PIN" />
          <OTPField length={4} mask="✱" defaultValue="12" aria-label="PIN 별표" />
        </Showcase.Row>
        <Showcase.Row label="placeholder">
          <OTPField length={6} placeholder="○○○○○○" aria-label="자리 표시" />
        </Showcase.Row>
        <Showcase.Row label="alphanumeric">
          <OTPField length={6} pattern="alphanumeric" defaultValue="A7K" aria-label="영숫자" />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  args: { 'aria-label': '인증 코드' },
  parameters: {
    docs: {
      description: {
        story:
          '실제 input 하나라서 전체 선택, 단어 삭제, Shift+화살표 범위, 실행 취소가 브라우저 그대로 동작합니다. 캐럿이 글자 위에 있으면 그 글자를 덮어씁니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const field = input(canvasElement);
    await userEvent.click(field);
    await userEvent.keyboard('12a34');
    await expect(field).toHaveValue('1234');
    await userEvent.keyboard('56');
    await expect(args.onComplete).toHaveBeenCalledWith('123456');
    await userEvent.keyboard('{Backspace}');
    await expect(field).toHaveValue('12345');
  },
};

export const Paste: Story = {
  args: { 'aria-label': '인증 코드' },
  parameters: {
    docs: {
      description: {
        story:
          '전체 코드를 붙여넣으면 어느 칸에서든 전체가 바뀝니다. 일부만 붙여넣으면 선택한 칸부터 덮어씁니다. 하이픈과 공백 같은 허용되지 않는 문자는 빠집니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    const field = input(canvasElement);
    await userEvent.click(field);
    await userEvent.paste('123-456');
    await expect(field).toHaveValue('123456');
    field.setSelectionRange(2, 3);
    await userEvent.paste('99');
    await expect(field).toHaveValue('129956');
  },
};

export const NativeForm: Story = {
  render: function Render() {
    const [submitted, setSubmitted] = useState<string | null>(null);

    return (
      <form
        className="flex flex-col items-start gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
      >
        <Field>
          <Field.Label>인증 코드</Field.Label>
          <OTPField length={6} name="code" required />
          <Field.Hint>문자로 받은 6자리 숫자</Field.Hint>
        </Field>
        <div className="flex gap-2">
          <Button type="submit">제출</Button>
          <Button type="reset" variant="outline">
            초기화
          </Button>
        </div>
        <output aria-label="제출 결과" className="text-body-b3-regular font-mono">
          {submitted}
        </output>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'name 하나, FormData 항목 하나입니다. 일부만 입력하면 네이티브 검증이 제출을 막습니다. 라벨을 누르면 다음 입력 칸으로 포커스가 갑니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const field = input(canvasElement);
    await userEvent.click(canvas.getByText('인증 코드'));
    await expect(field).toHaveFocus();
    await userEvent.keyboard('123');
    await expect(field.validity.patternMismatch).toBe(true);
    await userEvent.keyboard('456');
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent('{"code":"123456"}');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(field).toHaveValue(''));
  },
};

const schema = z.object({ code: z.string().length(6, '6자리 코드를 입력하세요.') });

export const ReactHookForm: Story = {
  render: function Render() {
    const methods = useForm({ resolver: zodResolver(schema), defaultValues: { code: '' } });
    const [result, setResult] = useState('');

    return (
      <FormProvider {...methods}>
        <form
          className="flex flex-col items-start gap-4"
          noValidate
          onSubmit={methods.handleSubmit((data) => setResult(`검증 완료: ${data.code}`))}
        >
          <FormField name="code" required>
            <FormField.Label>이메일 코드</FormField.Label>
            <OTPField length={6} />
            <FormField.Hint>이메일로 받은 6자리 코드</FormField.Hint>
            <FormField.Error />
          </FormField>
          <Button type="submit">검증</Button>
          <output aria-label="검증 결과">{result}</output>
        </form>
      </FormProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'register() 그대로 연결됩니다. onChange가 받는 event.target.value는 이미 정리된 코드입니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const field = input(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '검증' }));
    await expect(await canvas.findByText('6자리 코드를 입력하세요.')).toBeVisible();
    await userEvent.click(field);
    await userEvent.paste('654321');
    await userEvent.click(canvas.getByRole('button', { name: '검증' }));
    await expect(canvas.getByLabelText('검증 결과')).toHaveTextContent('검증 완료: 654321');
  },
};

export const CustomSlot: Story = {
  render: () => (
    <OTPField length={4} aria-label="커스텀 슬롯">
      <OTPField.Group className="gap-3">
        {[0, 1, 2, 3].map((index) => (
          <OTPField.Slot
            key={index}
            index={index}
            className={(state) =>
              state.isFilled
                ? 'rounded-full! bg-(--ids-color-primary) text-(--ids-color-on-primary)'
                : 'rounded-full!'
            }
          >
            {(state) => (state.isFilled ? '✓' : state.hasFakeCaret ? <OTPField.Caret /> : null)}
          </OTPField.Slot>
        ))}
      </OTPField.Group>
    </OTPField>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Slot의 className과 children은 슬롯 상태를 받는 함수도 됩니다. 입력은 여전히 input 하나가 받습니다.',
      },
    },
  },
};
