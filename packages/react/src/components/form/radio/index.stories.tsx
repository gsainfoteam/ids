import { useState } from 'react';

import { StarIcon } from '@heroicons/react/16/solid';
import { useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Label } from '../../typography/label';

import { Radio } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/Radio',
  component: Radio,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    checked: { control: 'radio', options: [undefined, false, true] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    'aria-label': '선택',
    variant: 'outline',
    size: 'standard',
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = cn('inline-flex items-center gap-2 text-body-b3-medium');
const stateOf = (radio: HTMLElement) => radio.closest('[data-radio]')!.getAttribute('data-state');

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size" description="칸마다 선택 안 됨, 선택됨 순서입니다.">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="flex items-center gap-3">
              <Radio size={size} variant={variant} aria-label={`${variant} ${size} off`} />
              <Radio
                size={size}
                variant={variant}
                defaultChecked
                aria-label={`${variant} ${size}`}
              />
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        {(
          [
            ['invalid', { invalid: true }],
            ['disabled', { disabled: true }],
            ['readOnly', { readOnly: true }],
          ] as const
        ).map(([label, props]) => (
          <Showcase.Row key={label} label={label}>
            <Radio {...props} aria-label={`${label} off`} />
            <Radio {...props} defaultChecked aria-label={`${label} on`} />
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section title="Indicator">
        <Showcase.Row label="asChild">
          <Radio defaultChecked aria-label="별">
            <Radio.Indicator asChild className="size-3">
              <StarIcon />
            </Radio.Indicator>
          </Radio>
        </Showcase.Row>
        <Showcase.Row label="className">
          <Radio
            defaultChecked
            aria-label="채운 원"
            className="data-[state=checked]:bg-(--ids-color-primary) data-[state=checked]:inset-ring-(--ids-color-primary)"
          >
            <Radio.Indicator className="text-(--ids-color-on-primary)" />
          </Radio>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const NativeGroup: Story = {
  render: function Render() {
    const [submitted, setSubmitted] = useState<string | null>(null);

    return (
      <form
        className="flex flex-col items-start gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(JSON.stringify([...new FormData(event.currentTarget)]));
        }}
      >
        <fieldset className="flex flex-col gap-3">
          <legend className="text-body-b3-medium mb-3">배송</legend>
          <Label className={row}>
            <Radio name="shipping" value="standard" defaultChecked />
            일반 배송
          </Label>
          <Label className={row}>
            <Radio name="shipping" value="express" />
            빠른 배송
          </Label>
          <Label className={row}>
            <Radio name="shipping" value="pickup" />
            매장 수령
          </Label>
        </fieldset>
        <div className="flex gap-2">
          <Button type="submit">주문</Button>
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
          '같은 `name` 의 Radio는 브라우저가 한 그룹으로 묶습니다. 화살표 키로 옮기면 바로 선택되고, 다른 Radio를 고르면 이전 Radio의 `data-state` 도 따라 바뀝니다. 보통은 `RadioGroup` 을 씁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const standard = canvas.getByRole('radio', { name: '일반 배송' });
    const express = canvas.getByRole('radio', { name: '빠른 배송' });
    await userEvent.click(express);
    await expect(stateOf(standard)).toBe('unchecked');
    await expect(stateOf(express)).toBe('checked');
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: '매장 수령' })).toBeChecked();
    await waitFor(() => expect(stateOf(express)).toBe('unchecked'));
    await userEvent.click(canvas.getByRole('button', { name: '주문' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent('[["shipping","pickup"]]');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(stateOf(standard)).toBe('checked'));
    await expect(standard).toBeChecked();
  },
};

export const ReactHookForm: Story = {
  render: function Render() {
    const { register, setValue } = useForm({ defaultValues: { plan: 'free' } });

    return (
      <div className="flex flex-col items-start gap-4">
        <div role="radiogroup" aria-label="플랜" className="flex flex-col gap-3">
          <Label className={row}>
            <Radio {...register('plan')} value="free" />
            무료
          </Label>
          <Label className={row}>
            <Radio {...register('plan')} value="pro" />
            Pro
          </Label>
        </div>
        <Button variant="outline" onClick={() => setValue('plan', 'pro')}>
          Pro로 바꾸기
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '각 Radio에 `register()` 를 펼쳐도 됩니다. `setValue()` 가 input을 직접 바꿔도 원이 따라 바뀝니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const free = canvas.getByRole('radio', { name: '무료' });
    const pro = canvas.getByRole('radio', { name: 'Pro' });
    await waitFor(() => expect(stateOf(free)).toBe('checked'));
    await userEvent.click(canvas.getByRole('button', { name: 'Pro로 바꾸기' }));
    await waitFor(() => expect(stateOf(pro)).toBe('checked'));
    await expect(stateOf(free)).toBe('unchecked');
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, 'aria-label': '읽기 전용' },
  parameters: {
    docs: {
      description: { story: '읽기 전용은 포커스를 받고 제출되지만 클릭으로 선택되지 않습니다.' },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const radio = canvas.getByRole('radio');
    await userEvent.click(radio);
    await expect(radio).not.toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};
