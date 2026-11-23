import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn } from 'storybook/test';
import { z } from 'zod';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { IdsProvider } from '../../utility/ids-provider';
import { Field } from '../field';

import { NumberField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/NumberField',
  component: NumberField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    'aria-label': '수량',
    defaultValue: 1,
    variant: 'outline',
    size: 'standard',
    onValueChange: fn(),
  },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
};

export const Usage: Story = {
  render: () => (
    <div className="w-56">
      <Field>
        <Field.Label>수량</Field.Label>
        <NumberField defaultValue={1} min={1} />
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
            <div className="w-48">
              <NumberField
                size={size}
                variant={variant}
                defaultValue={12}
                aria-label={`${variant} ${size}`}
              />
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <div className="w-48">
            <NumberField placeholder="0" aria-label="비어 있음" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="out of range">
          <div className="w-48">
            <NumberField defaultValue={12} max={10} aria-label="범위 밖" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="at max">
          <div className="w-48">
            <NumberField defaultValue={10} max={10} aria-label="최댓값" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <div className="w-48">
            <NumberField defaultValue={3} disabled aria-label="비활성" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <div className="w-48">
            <NumberField defaultValue={3} readOnly aria-label="읽기 전용" />
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Composition"
        description="부품을 하나도 쓰지 않으면 끝에 위아래 버튼이 붙습니다. Input, Stepper, Increment, Decrement, Clear 중 하나라도 쓰면 쓴 부품만, 쓴 자리에 그립니다."
      >
        <Showcase.Row label="inline">
          <div className="w-40">
            <NumberField defaultValue={2} min={0} aria-label="인원">
              <NumberField.Decrement />
              <NumberField.Input />
              <NumberField.Increment />
            </NumberField>
          </div>
          <div className="w-32">
            <NumberField size="tiny" defaultValue={2} min={0} aria-label="인원 tiny">
              <NumberField.Decrement />
              <NumberField.Input />
              <NumberField.Increment />
            </NumberField>
          </div>
        </Showcase.Row>
        <Showcase.Row label="unit · Clear">
          <div className="w-56">
            <NumberField defaultValue={72.5} step={0.1} aria-label="무게">
              <NumberField.Input />
              <span>kg</span>
              <NumberField.Clear />
              <NumberField.Stepper />
            </NumberField>
          </div>
        </Showcase.Row>
        <Showcase.Row label="currency">
          <div className="w-56">
            <NumberField
              defaultValue={1234.5}
              formatOptions={{ style: 'currency', currency: 'KRW' }}
              aria-label="금액"
            />
          </div>
        </Showcase.Row>
        <Showcase.Row label="percent">
          <div className="w-56">
            <NumberField
              defaultValue={0.125}
              min={0}
              max={1}
              formatOptions={{ style: 'percent', minimumFractionDigits: 1 }}
              aria-label="비율"
            />
          </div>
        </Showcase.Row>
        <Showcase.Row label="no stepper">
          <div className="w-48">
            <NumberField defaultValue={42} aria-label="버튼 없음">
              <NumberField.Input />
            </NumberField>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const LeaveOutTheButtons: Story = {
  render: () => (
    <div className="w-56">
      <Field>
        <Field.Label>키</Field.Label>
        <NumberField defaultValue={170} min={0}>
          <NumberField.Input />
          <span>cm</span>
        </NumberField>
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`<NumberField.Input />` 만 쓰면 위아래 버튼 없이 입력만 그립니다. 부품을 하나라도 쓰면 쓴 부품만 그리기 때문입니다. `<span>cm</span>` 같은 단위는 부품이 아니라서 버튼을 되살리지 않습니다. ↑↓ 키와 검증은 그대로 동작합니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '키' });
    await expect(canvas.queryByRole('button')).toBeNull();
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('171');
  },
};

export const PutMinusAndPlusOnTheSides: Story = {
  render: () => (
    <div className="w-40">
      <Field>
        <Field.Label>인원</Field.Label>
        <NumberField defaultValue={2} min={0}>
          <NumberField.Decrement />
          <NumberField.Input />
          <NumberField.Increment />
        </NumberField>
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`NumberField.Decrement` 와 `NumberField.Increment` 를 Input 양옆에 쓰면 쌓인 위아래 버튼 대신 −와 + 버튼이 그 자리에 놓입니다. 가운데 정렬은 Input 의 `className` 으로 줍니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '인원' });
    await userEvent.click(canvas.getByRole('button', { name: '값 늘리기' }));
    await expect(input).toHaveAttribute('aria-valuenow', '3');
    await userEvent.click(canvas.getByRole('button', { name: '값 줄이기' }));
    await userEvent.click(canvas.getByRole('button', { name: '값 줄이기' }));
    await userEvent.click(canvas.getByRole('button', { name: '값 줄이기' }));
    await expect(input).toHaveAttribute('aria-valuenow', '0');
    await expect(canvas.getByRole('button', { name: '값 줄이기' })).toBeDisabled();
  },
};

export const NameTheStepperButtons: Story = {
  render: () => (
    <div className="w-56">
      <Field>
        <Field.Label>참석 인원</Field.Label>
        <NumberField defaultValue={4} min={1} max={10}>
          <NumberField.Input />
          <NumberField.Stepper>
            <NumberField.Increment aria-label="참석 인원 늘리기" />
            <NumberField.Decrement aria-label="참석 인원 줄이기" />
          </NumberField.Stepper>
        </NumberField>
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '버튼의 이름은 기본으로 "값 늘리기"와 "값 줄이기"입니다. 한 화면에 숫자 필드가 여럿이면 `NumberField.Stepper` 안에 Increment 와 Decrement 를 쓰고 각각 `aria-label` 을 주어 무엇을 바꾸는 버튼인지 알립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '참석 인원' });
    await userEvent.click(canvas.getByRole('button', { name: '참석 인원 늘리기' }));
    await expect(input).toHaveAttribute('aria-valuenow', '5');
    await userEvent.click(canvas.getByRole('button', { name: '참석 인원 줄이기' }));
    await expect(input).toHaveAttribute('aria-valuenow', '4');
  },
};

const NO_BREAK_SPACE = ' ';

export const FormatForAnotherLocale: Story = {
  render: function Render() {
    const [currency, setCurrency] = useState<number | null>(1234.567);

    return (
      <div className="grid w-72 gap-4">
        <IdsProvider.Scope locale="de-DE">
          <Field>
            <Field.Label>금액</Field.Label>
            <NumberField
              value={currency}
              onValueChange={setCurrency}
              formatOptions={{ style: 'currency', currency: 'EUR' }}
            />
          </Field>
        </IdsProvider.Scope>
        <Field>
          <Field.Label>비율</Field.Label>
          <NumberField
            defaultValue={0.125}
            min={0}
            max={1}
            formatOptions={{ style: 'percent', minimumFractionDigits: 1 }}
          />
          <Field.Hint>퍼센트로 입력합니다. 25를 입력하면 25%입니다.</Field.Hint>
        </Field>
        <output aria-label="금액 숫자">{JSON.stringify(currency)}</output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '숫자는 가장 가까운 `IdsProvider` 의 `locale` 로 쓰고 읽습니다. 앱 전체는 바깥 `IdsProvider` 의 `locale` 로 정하고, 한 필드만 다른 형식으로 보이려면 그 필드를 `<IdsProvider.Scope locale="de-DE">` 로 감쌉니다. `formatOptions` 로 통화와 퍼센트를 고르고, 입력하는 동안에는 쓴 글자를 그대로 두었다가 입력을 마치면 그 형식으로 다시 씁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const price = canvas.getByRole('spinbutton', { name: '금액' });
    const ratio = canvas.getByRole('spinbutton', { name: '비율' });
    await expect(price).toHaveValue(`1.234,57${NO_BREAK_SPACE}€`);
    await userEvent.click(price);
    await expect(price).toHaveValue(`1.234,57${NO_BREAK_SPACE}€`);
    await userEvent.clear(price);
    await userEvent.paste('2.345,67 €');
    await expect(price).toHaveValue('2.345,67 €');
    await userEvent.type(price, 'x');
    await expect(price).toHaveValue('2.345,67 €');
    await userEvent.click(ratio);
    await expect(price).toHaveValue(`2.345,67${NO_BREAK_SPACE}€`);
    await expect(canvas.getByLabelText('금액 숫자')).toHaveTextContent('2345.67');
    await expect(ratio).toHaveValue('12.5%');
    await userEvent.clear(ratio);
    await userEvent.type(ratio, '25');
    await expect(ratio).toHaveValue('25');
    await userEvent.click(price);
    await expect(ratio).toHaveValue('25.0%');
  },
};

export const HoldAButtonToRepeat: Story = {
  args: { defaultValue: 0 },
  parameters: {
    docs: {
      description: {
        story:
          '버튼을 누르고 있으면 0.4초 뒤부터 계속 바뀌고 점점 빨라집니다. 마우스로 누르면 포커스는 입력에 남고, 터치로 누르면 화상 키보드를 띄우지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '수량' });
    const increment = canvas.getByRole('button', { name: '값 늘리기' });
    await userEvent.pointer({ keys: '[MouseLeft>]', target: increment });
    await userEvent.pointer({ keys: '[/MouseLeft]', target: increment });
    await expect(input).toHaveAttribute('aria-valuenow', '1');
    await expect(input).toHaveFocus();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(input).toHaveAttribute('aria-valuenow', '1');
  },
};

export const SnapToTheStep: Story = {
  args: { defaultValue: null, min: 0, step: 0.5, 'aria-label': '시간' },
  parameters: {
    docs: {
      description: {
        story:
          '`step` 을 주면 입력을 마칠 때 `min` 에서 시작하는 step 격자로 맞춥니다. 격자 밖의 값에서 ↑↓를 누르면 가까운 격자로 먼저 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '시간' });
    await userEvent.type(input, '1.3');
    await userEvent.tab();
    await expect(input).toHaveValue('1.5');
    await userEvent.clear(input);
    await userEvent.type(input, '2.2{ArrowUp}');
    await expect(input).toHaveValue('2.5');
  },
};

export const BlockValuesOutOfRange: Story = {
  render: () => (
    <form className="grid w-64 gap-3" onSubmit={(event) => event.preventDefault()}>
      <Field>
        <Field.Label>좌석 수</Field.Label>
        <NumberField name="seats" min={1} max={8} defaultValue={12} />
        <Field.Hint>1에서 8까지</Field.Hint>
        <Field.Error />
      </Field>
      <Button type="submit">예약</Button>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`min` 과 `max` 를 벗어난 값은 native 검증으로도 알립니다. 폼이 제출을 막고 `Field.Error` 가 이유를 보여 줍니다. 입력을 마치면 범위 안으로 맞춰집니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '좌석 수' });
    await userEvent.click(canvas.getByRole('button', { name: '예약' }));
    await expect(await canvas.findByText('값은 8 이하여야 합니다.')).toBeVisible();
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveValue('8');
    await expect(canvas.queryByText('값은 8 이하여야 합니다.')).toBeNull();
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

export const SubmitANumberWithReactHookForm: Story = {
  render: function Render() {
    const methods = useForm({
      resolver: zodResolver(schema),
      defaultValues: { quantity: null as number | null },
    });
    const [result, setResult] = useState('');

    return (
      <FormProvider {...methods}>
        <form
          className="grid w-72 gap-3"
          noValidate
          onSubmit={methods.handleSubmit((values) => setResult(JSON.stringify(values)))}
        >
          <FormField name="quantity" controlMode="value" required>
            <FormField.Label>수량</FormField.Label>
            <NumberField min={1} max={20} />
            <FormField.Hint>숫자 타입으로 제출합니다.</FormField.Hint>
            <FormField.Error />
          </FormField>
          <Button type="submit">제출</Button>
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
          <output aria-label="제출 값">{result}</output>
        </form>
      </FormProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'react-hook-form 의 `Field` 에 `controlMode="value"` 를 주면 onValueChange 로 숫자를 받습니다. 화면의 글자가 아니라 number | null 이 폼 값에 들어가므로 zod 의 `z.number()` 로 바로 검증합니다.',
      },
    },
  },
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

export const Keyboard: Story = {
  tags: ['verification'],
  args: { defaultValue: 5, min: 0, max: 100 },
  parameters: {
    docs: {
      description: {
        story:
          '↑↓는 step, Shift는 largeStep, Alt(Option)는 smallStep, PageUp·PageDown은 largeStep, Home·End는 min·max로 갑니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: '수량' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('6');
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    await expect(input).toHaveValue('16');
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await expect(input).toHaveValue('15.9');
    await userEvent.keyboard('{End}');
    await expect(input).toHaveAttribute('aria-valuenow', '100');
    await userEvent.keyboard('{Home}');
    await expect(input).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{PageUp}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(10);
  },
};
