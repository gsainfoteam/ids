import { useState } from 'react';

import { HeartIcon, MinusIcon, StarIcon } from '@heroicons/react/16/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';
import { z } from 'zod';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { Label } from '../../typography/label';
import { Field } from '../field';

import { Checkbox } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    checked: { control: 'radio', options: [undefined, false, true, 'indeterminate'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    'aria-label': '약관 동의',
    variant: 'outline',
    size: 'standard',
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = 'inline-flex items-center gap-2 text-body-b3-medium';

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant × Size"
        description="칸마다 미체크, 체크, 일부 선택 순서입니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="flex items-center gap-3">
              {([false, true, 'indeterminate'] as const).map((checked) => (
                <Checkbox
                  key={String(checked)}
                  size={size}
                  variant={variant}
                  defaultChecked={checked}
                  aria-label={`${variant} ${size} ${String(checked)}`}
                />
              ))}
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
            {([false, true, 'indeterminate'] as const).map((checked) => (
              <Checkbox
                key={String(checked)}
                {...props}
                defaultChecked={checked}
                aria-label={`${label} ${String(checked)}`}
              />
            ))}
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section title="Label" description="라벨은 감싸거나 htmlFor로 잇습니다.">
        <Showcase.Row label="wrap">
          <Label className={row}>
            <Checkbox defaultChecked />
            약관에 동의합니다
          </Label>
        </Showcase.Row>
        <Showcase.Row label="htmlFor">
          <div className="flex items-center gap-2">
            <Checkbox id="gallery-marketing" />
            <Label htmlFor="gallery-marketing" className="text-body-b3-medium">
              마케팅 수신
            </Label>
          </div>
        </Showcase.Row>
        <Showcase.Row label="Field">
          <Field variant="horizontal">
            <Field.Label>자동 로그인</Field.Label>
            <Checkbox defaultChecked />
          </Field>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Indicator">
        <Showcase.Row label="asChild">
          <Checkbox defaultChecked aria-label="좋아요">
            <Checkbox.Indicator asChild>
              <HeartIcon />
            </Checkbox.Indicator>
          </Checkbox>
        </Showcase.Row>
        <Showcase.Row label="className">
          <Checkbox
            defaultChecked
            aria-label="둥근 체크박스"
            className="rounded-full data-[state=checked]:[--checkbox-accent:var(--ids-color-success)]"
          />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '실제 체크박스 하나라서 Tab으로 들어가고 Space로 바뀝니다. 키보드로 들어오면 포커스 링이 보입니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const box = canvas.getByRole('checkbox', { name: '약관 동의' });
    await userEvent.tab();
    await expect(box).toHaveFocus();
    await expect(box.closest('[data-checkbox]')).toHaveAttribute('data-focus-visible');
    await userEvent.keyboard(' ');
    await expect(box).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
    await expect(box.closest('[data-checkbox]')).toHaveAttribute('data-state', 'checked');
  },
};

const languages = ['JavaScript', 'TypeScript', 'Rust'];

function SelectAllExample() {
  const [checked, setChecked] = useState([true, false, false]);
  const all = checked.every(Boolean);
  const some = checked.some(Boolean);
  return (
    <div className="flex flex-col gap-2">
      <Label className={row}>
        <Checkbox
          checked={all ? true : some ? 'indeterminate' : false}
          onCheckedChange={(next) => setChecked(checked.map(() => next))}
        />
        전체 선택
      </Label>
      <div className="flex flex-col gap-2 ps-6">
        {languages.map((name, index) => (
          <Label key={name} className={row}>
            <Checkbox
              checked={checked[index]}
              onCheckedChange={(next) =>
                setChecked(checked.map((value, i) => (i === index ? next : value)))
              }
            />
            {name}
          </Label>
        ))}
      </div>
    </div>
  );
}

export const Indeterminate: Story = {
  render: () => <SelectAllExample />,
  parameters: {
    docs: {
      description: {
        story:
          "`checked` 에 `'indeterminate'` 를 주면 일부 선택으로 그립니다. 일부 선택을 누르면 체크가 됩니다.",
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const parent = canvas.getByRole('checkbox', { name: '전체 선택' });
    await expect(parent).toBePartiallyChecked();
    await userEvent.click(parent);
    await expect(parent).toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Rust' })).toBeChecked();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Rust' }));
    await expect(parent).toBePartiallyChecked();
  },
};

export const ControlledIndeterminate: Story = {
  args: { checked: 'indeterminate', 'aria-label': '부모가 고정한 일부 선택' },
  parameters: {
    docs: {
      description: {
        story:
          '제어 모드에서 부모가 값을 바꾸지 않으면 눌러도 일부 선택으로 남습니다. 브라우저가 누를 때 지우는 indeterminate 를 되돌립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const box = canvas.getByRole('checkbox');
    await userEvent.click(box);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    await expect(box).toBePartiallyChecked();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultChecked: true, 'aria-label': '읽기 전용' },
  parameters: {
    docs: {
      description: {
        story:
          '읽기 전용은 포커스를 받고 폼으로 제출되지만 클릭과 Space로 바뀌지 않습니다. `aria-readonly` 가 붙습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const box = canvas.getByRole('checkbox');
    await userEvent.click(box);
    await userEvent.keyboard(' ');
    await expect(box).toBeChecked();
    await expect(box).toHaveAttribute('aria-readonly', 'true');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

function NativeFormExample() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <form
      className="flex flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify([...new FormData(event.currentTarget)]));
      }}
    >
      <Label className={row}>
        <Checkbox name="terms" value="agreed" required />
        약관에 동의합니다 (필수)
      </Label>
      <Label className={row}>
        <Checkbox name="news" defaultChecked />
        소식 받기
      </Label>
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
}

export const NativeForm: Story = {
  render: () => <NativeFormExample />,
  parameters: {
    docs: {
      description: {
        story:
          '`name`, `value`, `required` 는 native 체크박스 그대로입니다. 필수 항목을 비우면 브라우저가 제출을 막고, 초기화는 `defaultChecked` 로 되돌립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const terms = canvas.getByRole('checkbox', { name: '약관에 동의합니다 (필수)' });
    const news = canvas.getByRole('checkbox', { name: '소식 받기' });
    await expect(terms).toBeInvalid();
    await userEvent.click(terms);
    await userEvent.click(news);
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent('[["terms","agreed"]]');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(news).toBeChecked());
    await expect(terms).not.toBeChecked();
    await expect(news.closest('[data-checkbox]')).toHaveAttribute('data-state', 'checked');
  },
};

const schema = z.object({
  terms: z.boolean().refine((agreed) => agreed, { error: '약관에 동의해야 합니다.' }),
});

function ReactHookFormExample() {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: { terms: false } });
  const [result, setResult] = useState('');
  return (
    <FormProvider {...methods}>
      <form
        noValidate
        className="flex flex-col items-start gap-4"
        onSubmit={methods.handleSubmit(() => setResult('가입 완료'))}
      >
        <FormField name="terms" variant="horizontal">
          <FormField.Label>약관 동의</FormField.Label>
          <Checkbox />
          <FormField.Error />
        </FormField>
        <div className="flex gap-2">
          <Button type="submit">가입</Button>
          <Button variant="outline" onClick={() => methods.setValue('terms', true)}>
            모두 동의
          </Button>
        </div>
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
          '`register()` 가 그대로 연결됩니다. `setValue()` 와 `reset()` 이 input 의 checked 를 직접 바꿔도 상자가 따라 바뀝니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole('checkbox', { name: '약관 동의' });
    await userEvent.click(canvas.getByRole('button', { name: '가입' }));
    await expect(await canvas.findByText('약관에 동의해야 합니다.')).toBeVisible();
    await expect(box).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(canvas.getByRole('button', { name: '모두 동의' }));
    await waitFor(() =>
      expect(box.closest('[data-checkbox]')).toHaveAttribute('data-state', 'checked'),
    );
    await userEvent.click(canvas.getByRole('button', { name: '가입' }));
    await expect(canvas.getByLabelText('가입 결과')).toHaveTextContent('가입 완료');
  },
};

export const CustomIndicator: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Label className={row}>
        <Checkbox defaultChecked>
          <Checkbox.Indicator asChild>
            <HeartIcon />
          </Checkbox.Indicator>
        </Checkbox>
        좋아요
      </Label>
      <Label className={row}>
        <Checkbox
          defaultChecked="indeterminate"
          className={(state) =>
            state.checked ? '[--checkbox-accent:var(--ids-color-success)]' : undefined
          }
        >
          <Checkbox.Indicator>
            {(state) => (state.indeterminate ? <MinusIcon /> : <StarIcon />)}
          </Checkbox.Indicator>
        </Checkbox>
        즐겨찾기
      </Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`Checkbox.Indicator` 로 표시만 바꿉니다. `asChild` 면 자식이 표시 요소가 되고, `className` 과 `children` 은 상태를 받는 함수도 됩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const like = canvas.getByRole('checkbox', { name: '좋아요' });
    const heart = like.parentElement!.querySelector('svg')!;
    await expect(heart).toHaveAttribute('data-state', 'checked');
    await userEvent.click(like);
    await expect(heart).toHaveAttribute('data-state', 'unchecked');
    const favorite = canvas.getByRole('checkbox', { name: '즐겨찾기' });
    await userEvent.click(favorite);
    await expect(favorite).toBeChecked();
    await expect(favorite.closest('[data-checkbox]')!.className).toContain('--ids-color-success');
  },
};
