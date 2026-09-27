import { useState } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { Label } from '../../typography/label';
import { Field } from '../field';
import { Radio } from '../radio';

import { RadioGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

type Plan = 'free' | 'pro' | 'team';

const plans: Array<{ value: Plan; label: string; description: string }> = [
  { value: 'free', label: '무료', description: '개인 프로젝트 하나' },
  { value: 'pro', label: 'Pro', description: '프로젝트 무제한, 우선 지원' },
  { value: 'team', label: 'Team', description: '멤버 관리와 감사 로그' },
];

const orientations = ['vertical', 'horizontal'] as const;
const sizes = ['standard', 'tiny'] as const;
const row = 'inline-flex items-center gap-2 text-body-b3-medium';

const meta = {
  title: 'Form/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: orientations },
    size: { control: 'radio', options: sizes },
    variant: { control: 'radio', options: ['outline', 'soft'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    'aria-label': '구독 플랜',
    defaultValue: 'free',
    orientation: 'vertical',
    onValueChange: fn(),
    children: ({ Item }) =>
      plans.map((plan) => (
        <Label key={plan.value} className={row}>
          <Item value={plan.value} />
          {plan.label}
        </Label>
      )),
  },
} satisfies Meta<typeof RadioGroup<Plan>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Orientation × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={orientations}
          render={(size, orientation) => (
            <RadioGroup<Plan>
              size={size}
              orientation={orientation}
              defaultValue="pro"
              aria-label={`${orientation} ${size}`}
            >
              {({ Item }) =>
                plans.map((plan) => (
                  <Label key={plan.value} className={row}>
                    <Item value={plan.value} />
                    {plan.label}
                  </Label>
                ))
              }
            </RadioGroup>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        {(
          [
            ['soft', { variant: 'soft' }],
            ['invalid', { invalid: true }],
            ['disabled', { disabled: true }],
            ['readOnly', { readOnly: true }],
          ] as const
        ).map(([label, props]) => (
          <Showcase.Row key={label} label={label}>
            <RadioGroup<Plan>
              {...props}
              orientation="horizontal"
              defaultValue="pro"
              aria-label={label}
            >
              {({ Item }) =>
                plans.map((plan) => (
                  <Label key={plan.value} className={row}>
                    <Item value={plan.value} />
                    {plan.label}
                  </Label>
                ))
              }
            </RadioGroup>
          </Showcase.Row>
        ))}
        <Showcase.Row label="disabled item">
          <RadioGroup<Plan> orientation="horizontal" defaultValue="free" aria-label="일부 비활성">
            {({ Item }) =>
              plans.map((plan) => (
                <Label key={plan.value} className={row}>
                  <Item value={plan.value} disabled={plan.value === 'team'} />
                  {plan.label}
                </Label>
              ))
            }
          </RadioGroup>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Composition">
        <Showcase.Row label="Field">
          <Field>
            <Field.Label>구독 플랜</Field.Label>
            <Field.Description>언제든 바꿀 수 있습니다.</Field.Description>
            <RadioGroup<Plan> defaultValue="free">
              {({ Item }) =>
                plans.map((plan) => (
                  <Label key={plan.value} className={row}>
                    <Item value={plan.value} />
                    {plan.label}
                  </Label>
                ))
              }
            </RadioGroup>
          </Field>
        </Showcase.Row>
        <Showcase.Row label="cards">
          <PlanCards />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

function PlanCards({ onValueChange }: { onValueChange?: (plan: Plan) => void }) {
  return (
    <RadioGroup<Plan>
      defaultValue="pro"
      onValueChange={onValueChange}
      aria-label="플랜 카드"
      className="grid w-full max-w-md gap-3"
    >
      {({ Item }) =>
        plans.map((plan) => (
          <Label
            key={plan.value}
            className={[
              'rounded-standard flex cursor-pointer items-start gap-3 p-4',
              'inset-ring-1 inset-ring-(--ids-color-border)',
              'has-data-[state=checked]:bg-(--ids-color-primary)/5 has-data-[state=checked]:inset-ring-(--ids-color-primary)',
            ].join(' ')}
          >
            <Item value={plan.value} className="mt-0.5" />
            <span className="flex flex-col gap-1">
              <span className="text-body-b3-medium">{plan.label}</span>
              <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                {plan.description}
              </span>
            </span>
          </Label>
        ))
      }
    </RadioGroup>
  );
}

export const Cards: Story = {
  args: { onValueChange: fn() },
  render: (args) => <PlanCards onValueChange={args.onValueChange} />,
  parameters: {
    docs: {
      description: {
        story:
          '카드형 선택지는 합성으로 만듭니다. `Label` 로 감싸면 카드 어디를 눌러도 선택되고, `has-data-[state=checked]:` 로 선택된 카드를 꾸밉니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByText('멤버 관리와 감사 로그'));
    await expect(canvas.getByRole('radio', { name: /Team/ })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledWith('team');
  },
};

export const Keyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '같은 `name` 을 쓰는 native 라디오라서 Tab은 선택된 항목에 멈추고, 화살표 키는 옮기면서 바로 고릅니다. 비활성 항목은 건너뜁니다.',
      },
    },
  },
  render: (args) => (
    <RadioGroup {...args}>
      {({ Item }) =>
        plans.map((plan) => (
          <Label key={plan.value} className={row}>
            <Item value={plan.value} disabled={plan.value === 'pro'} />
            {plan.label}
          </Label>
        ))
      }
    </RadioGroup>
  ),
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: '무료' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Team' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Team' })).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('team');
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  parameters: {
    docs: {
      description: {
        story:
          '읽기 전용이면 선택이 바뀌지 않습니다. 화살표 키로 포커스는 옮겨 다닐 수 있고 값은 제출됩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Pro' }));
    await expect(canvas.getByRole('radio', { name: '무료' })).toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Team' })).toHaveFocus();
    await expect(canvas.getByRole('radio', { name: '무료' })).toBeChecked();
    await expect(canvas.getByRole('radiogroup')).toHaveAttribute('aria-readonly', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

function RequiredExample() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <form
      className="flex flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify([...new FormData(event.currentTarget)]));
      }}
    >
      <Field required>
        <Field.Label>플랜</Field.Label>
        <RadioGroup<Plan> name="plan">
          {({ Item }) =>
            plans.map((plan) => (
              <Label key={plan.value} className={row}>
                <Item value={plan.value} />
                {plan.label}
              </Label>
            ))
          }
        </RadioGroup>
      </Field>
      <div className="flex gap-2">
        <Button type="submit">가입</Button>
        <Button type="reset" variant="outline">
          초기화
        </Button>
      </div>
      <output aria-label="제출 결과" className="text-body-b3-regular font-mono">
        {submitted}
      </output>
    </form>
  );
}

export const NativeForm: Story = {
  render: () => <RequiredExample />,
  parameters: {
    docs: {
      description: {
        story:
          '`required` 면 아무것도 고르지 않았을 때 브라우저가 제출을 막습니다. 고른 값은 `name` 으로 제출되고, 초기화는 `defaultValue` 로 되돌립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const free = canvas.getByRole('radio', { name: '무료' });
    await expect(free).toBeInvalid();
    await userEvent.click(canvas.getByRole('radio', { name: 'Team' }));
    await userEvent.click(canvas.getByRole('button', { name: '가입' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent('[["plan","team"]]');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(canvas.getByRole('radio', { name: 'Team' })).not.toBeChecked());
  },
};

function ReactHookFormExample() {
  const methods = useForm<{ plan: Plan | '' }>({ defaultValues: { plan: '' } });
  const [result, setResult] = useState('');
  return (
    <FormProvider {...methods}>
      <form
        noValidate
        className="flex flex-col items-start gap-4"
        onSubmit={methods.handleSubmit((values) => setResult(`선택: ${values.plan}`))}
      >
        <FormField
          name="plan"
          controlMode="value"
          registerOptions={{ required: '플랜을 고르세요.' }}
        >
          <FormField.Label>플랜</FormField.Label>
          <RadioGroup<Plan>>
            {({ Item }) =>
              plans.map((plan) => (
                <Label key={plan.value} className={row}>
                  <Item value={plan.value} />
                  {plan.label}
                </Label>
              ))
            }
          </RadioGroup>
          <FormField.Error />
        </FormField>
        <Button type="submit">가입</Button>
        <output aria-label="가입 결과">{result}</output>
      </form>
    </FormProvider>
  );
}

export const ReactHookForm: Story = {
  render: () => <ReactHookFormExample />,
  parameters: {
    docs: {
      description: {
        story:
          '`controlMode="value"` 로 연결합니다. 오류가 나면 react-hook-form이 그룹에 포커스를 주고, 그룹은 첫 라디오로 포커스를 넘깁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '가입' }));
    await expect(await canvas.findByText('플랜을 고르세요.')).toBeVisible();
    await expect(canvas.getByRole('radio', { name: '무료' })).toHaveFocus();
    await userEvent.click(canvas.getByRole('radio', { name: 'Pro' }));
    await userEvent.click(canvas.getByRole('button', { name: '가입' }));
    await expect(canvas.getByLabelText('가입 결과')).toHaveTextContent('선택: pro');
  },
};

export const PlainChildren: Story = {
  render: () => (
    <RadioGroup aria-label="사이즈" orientation="horizontal" defaultValue="m">
      {['s', 'm', 'l', 'xl'].map((size) => (
        <Label key={size} className={row}>
          <Radio value={size} />
          {size.toUpperCase()}
        </Label>
      ))}
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '렌더 함수 대신 `Radio` 를 바로 넣어도 됩니다. 값 타입을 좁히고 싶으면 렌더 함수의 `Item` 을 씁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'XL' }));
    await expect(canvas.getByRole('radio', { name: 'XL' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'M' })).not.toBeChecked();
  },
};
