import { useState } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Label } from '../../typography/label';
import { Checkbox } from '../checkbox';
import { Field } from '../field';

import { CheckboxGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

type Skill = 'js' | 'ts' | 'py' | 'rs';

const skills: Array<{ value: Skill; label: string }> = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python' },
  { value: 'rs', label: 'Rust' },
];

const orientations = ['vertical', 'horizontal'] as const;
const sizes = ['standard', 'tiny'] as const;
const row = cn('inline-flex items-center gap-2 text-body-b3-medium');

const meta = {
  title: 'Form/CheckboxGroup',
  component: CheckboxGroup,
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
    'aria-label': '관심 기술',
    defaultValue: ['ts'],
    orientation: 'vertical',
    onValueChange: fn(),
    children: ({ Item }) =>
      skills.map((skill) => (
        <Label key={skill.value} className={row}>
          <Item value={skill.value} />
          {skill.label}
        </Label>
      )),
  },
} satisfies Meta<typeof CheckboxGroup<Skill>>;

export default meta;
type Story = StoryObj<typeof meta>;

function Skills(props: Partial<CheckboxGroup.Props<Skill>>) {
  return (
    <CheckboxGroup<Skill> aria-label="관심 기술" {...props}>
      {({ Item }) =>
        skills.map((skill) => (
          <Label key={skill.value} className={row}>
            <Item value={skill.value} />
            {skill.label}
          </Label>
        ))
      }
    </CheckboxGroup>
  );
}

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Orientation × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={orientations}
          render={(size, orientation) => (
            <Skills size={size} orientation={orientation} defaultValue={['js', 'rs']} />
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
            <Skills {...props} orientation="horizontal" defaultValue={['ts']} />
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section title="Composition">
        <Showcase.Row label="select all">
          <SelectAllSkills />
        </Showcase.Row>
        <Showcase.Row label="grid">
          <Skills className="grid w-80 grid-cols-2" defaultValue={['py']} />
        </Showcase.Row>
        <Showcase.Row label="Field">
          <Field>
            <Field.Label>관심 기술</Field.Label>
            <Field.Description>여러 개 고를 수 있습니다.</Field.Description>
            <Skills defaultValue={['js']} />
          </Field>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

function SelectAllSkills({ onValueChange }: { onValueChange?: (value: Skill[]) => void }) {
  return (
    <CheckboxGroup<Skill>
      aria-label="관심 기술"
      defaultValue={['js']}
      onValueChange={onValueChange}
    >
      {({ All, Item }) => (
        <>
          <Label className={row}>
            <All />
            전체 선택
          </Label>
          <div className="flex flex-col gap-3 ps-6">
            {skills.map((skill) => (
              <Label key={skill.value} className={row}>
                <Item value={skill.value} disabled={skill.value === 'rs'} />
                {skill.label}
                {skill.value === 'rs' && ' (준비 중)'}
              </Label>
            ))}
          </div>
        </>
      )}
    </CheckboxGroup>
  );
}

export const SelectAll: Story = {
  args: { onValueChange: fn() },
  render: (args) => <SelectAllSkills onValueChange={args.onValueChange} />,
  parameters: {
    docs: {
      description: {
        story:
          '`All` 은 그룹에 등록된 항목을 보고 체크, 일부 선택, 해제를 스스로 정합니다. 비활성 항목은 세지도 바꾸지도 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const all = canvas.getByRole('checkbox', { name: '전체 선택' });
    await expect(all).toBePartiallyChecked();
    await userEvent.click(all);
    await expect(all).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['js', 'ts', 'py']);
    await expect(canvas.getByRole('checkbox', { name: 'Rust (준비 중)' })).not.toBeChecked();
    await userEvent.click(all);
    await expect(all).not.toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith([]);
    await expect(all.getAttribute('aria-controls')?.split(' ')).toHaveLength(3);
  },
};

export const Keyboard: Story = {
  parameters: {
    docs: {
      description: {
        story: '체크박스마다 Tab이 멈추고 Space로 켜고 끕니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('checkbox', { name: 'JavaScript' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['ts', 'js']);
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['ts', 'js', 'py']);
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  parameters: {
    docs: {
      description: { story: '읽기 전용이면 값이 바뀌지 않습니다. 값은 제출됩니다.' },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Rust' }));
    await expect(canvas.getByRole('checkbox', { name: 'Rust' })).not.toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'TypeScript' })).toBeChecked();
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
        <Field.Label>관심 기술</Field.Label>
        <Skills name="skills" />
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
}

export const NativeForm: Story = {
  render: () => <RequiredExample />,
  parameters: {
    docs: {
      description: {
        story:
          '`required` 는 하나 이상입니다. 비워 두면 브라우저가 제출을 막고 "하나 이상 선택하세요." 를 그룹에 띄웁니다. 고른 값은 같은 `name` 으로 하나씩 제출됩니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const validator = canvasElement.querySelector<HTMLInputElement>('[data-form-value-validator]')!;
    await expect(validator.validationMessage).toBe('하나 이상 선택하세요.');
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Python' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Rust' }));
    await expect(validator.validity.valid).toBe(true);
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent(
      '[["skills","py"],["skills","rs"]]',
    );
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(canvas.getByRole('checkbox', { name: 'Rust' })).not.toBeChecked());
  },
};

function ReactHookFormExample() {
  const methods = useForm<{ skills: Skill[] }>({ defaultValues: { skills: [] } });
  const [result, setResult] = useState('');
  return (
    <FormProvider {...methods}>
      <form
        noValidate
        className="flex flex-col items-start gap-4"
        onSubmit={methods.handleSubmit((values) => setResult(values.skills.join(', ')))}
      >
        <FormField
          name="skills"
          controlMode="value"
          registerOptions={{
            validate: (value: Skill[]) => value.length > 0 || '하나 이상 고르세요.',
          }}
        >
          <FormField.Label>관심 기술</FormField.Label>
          <Skills />
          <FormField.Error />
        </FormField>
        <Button type="submit">저장</Button>
        <output aria-label="저장 결과">{result}</output>
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
          '`controlMode="value"` 로 배열 값이 연결됩니다. 오류가 나면 그룹이 첫 체크박스로 포커스를 넘깁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(await canvas.findByText('하나 이상 고르세요.')).toBeVisible();
    await expect(canvas.getByRole('checkbox', { name: 'JavaScript' })).toHaveFocus();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Rust' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'TypeScript' }));
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByLabelText('저장 결과')).toHaveTextContent('rs, ts');
  },
};

export const PlainChildren: Story = {
  render: () => (
    <CheckboxGroup aria-label="알림" defaultValue={['mail']}>
      <Label className={row}>
        <CheckboxGroup.All />
        모두
      </Label>
      <Label className={row}>
        <Checkbox value="mail" />
        메일
      </Label>
      <Label className={row}>
        <Checkbox value="push" />
        푸시
      </Label>
    </CheckboxGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '렌더 함수 대신 `value` 를 준 `Checkbox` 와 `CheckboxGroup.All` 을 바로 넣어도 됩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('checkbox', { name: '푸시' }));
    await expect(canvas.getByRole('checkbox', { name: '모두' })).toBeChecked();
  },
};
