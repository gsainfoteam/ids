import { useState } from 'react';

import { CheckIcon, MoonIcon, SunIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { Label } from '../../typography/label';
import { Field } from '../field';

import { Switch } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sizes = ['standard', 'tiny'] as const;
const values = ['off', 'on'] as const;

const meta = {
  title: 'Form/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: sizes },
    checked: { control: 'radio', options: [undefined, false, true] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    'aria-label': '알림 받기',
    size: 'standard',
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

const thumbOf = (control: HTMLElement) =>
  control.closest('[data-switch]')!.querySelector<HTMLElement>('[aria-hidden=true]')!;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Size × Value">
        <Showcase.Matrix
          rows={sizes}
          columns={values}
          render={(size, value) => (
            <Switch size={size} defaultChecked={value === 'on'} aria-label={`${size} ${value}`} />
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
            <Switch {...props} aria-label={`${label} off`} />
            <Switch {...props} defaultChecked aria-label={`${label} on`} />
          </Showcase.Row>
        ))}
        <Showcase.Row label="rtl">
          <div dir="rtl" className="flex gap-3">
            <Switch aria-label="rtl off" />
            <Switch defaultChecked aria-label="rtl on" />
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Composition">
        <Showcase.Row label="Label">
          <Label className="text-body-b3-medium inline-flex items-center gap-2">
            <Switch defaultChecked />
            자동 저장
          </Label>
        </Showcase.Row>
        <Showcase.Row label="Field">
          <Field variant="horizontal">
            <Field.Label>다크 모드</Field.Label>
            <Switch />
          </Field>
        </Showcase.Row>
        <Showcase.Row label="Thumb">
          <Switch defaultChecked aria-label="아이콘 thumb">
            <Switch.Thumb>
              {(state) => (state.checked ? <CheckIcon /> : <XMarkIcon />)}
            </Switch.Thumb>
          </Switch>
          <Switch aria-label="테마" className="data-[state=checked]:bg-(--ids-color-on-surface)">
            <Switch.Thumb>{(state) => (state.checked ? <MoonIcon /> : <SunIcon />)}</Switch.Thumb>
          </Switch>
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
          '실제 체크박스에 `role="switch"` 를 얹었습니다. Space로 바뀌고, Enter는 폼 제출에 남겨 두어 바꾸지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const control = canvas.getByRole('switch', { name: '알림 받기' });
    await userEvent.tab();
    await expect(control).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(control).not.toBeChecked();
    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    await expect(thumbOf(control)).toHaveAttribute('data-state', 'checked');
  },
};

export const Settings: Story = {
  render: function Render() {
    const [settings, setSettings] = useState({ email: true, push: false, sms: false });

    const rows = [
      ['email', '이메일 알림'],
      ['push', '푸시 알림'],
      ['sms', 'SMS 알림'],
    ] as const;

    return (
      <div className="flex w-80 flex-col gap-4">
        {rows.map(([key, label]) => (
          <Field key={key} variant="horizontal" className="grid-cols-[minmax(0,1fr)_auto]">
            <Field.Label>{label}</Field.Label>
            <Switch
              checked={settings[key]}
              onCheckedChange={(next) => setSettings((prev) => ({ ...prev, [key]: next }))}
            />
          </Field>
        ))}
        <output aria-label="설정" className="text-body-b3-regular font-mono">
          {JSON.stringify(settings)}
        </output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '즉시 반영되는 설정에 씁니다. `Field` 로 감싸면 라벨을 눌러도 바뀌고, 라벨이 스위치의 이름이 됩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('푸시 알림'));
    await expect(canvas.getByRole('switch', { name: '푸시 알림' })).toBeChecked();
    await expect(canvas.getByLabelText('설정')).toHaveTextContent('"push":true');
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultChecked: true, 'aria-label': '관리자가 켠 설정' },
  parameters: {
    docs: {
      description: {
        story: '읽기 전용은 포커스를 받고 폼으로 제출되지만 바뀌지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const control = canvas.getByRole('switch');
    await userEvent.click(control);
    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
    await expect(control).toHaveAttribute('aria-readonly', 'true');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" className="flex gap-3">
      <Switch aria-label="오른쪽에서 왼쪽" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '`dir="rtl"` 안에서는 thumb이 오른쪽에서 출발해 왼쪽으로 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const control = canvas.getByRole('switch');
    const track = control.closest<HTMLElement>('[data-switch]')!;
    const thumb = thumbOf(control);
    const gap = () => ({
      start: track.getBoundingClientRect().right - thumb.getBoundingClientRect().right,
      end: thumb.getBoundingClientRect().left - track.getBoundingClientRect().left,
    });
    await expect(gap().start).toBeLessThan(4);
    await userEvent.click(control);
    await waitFor(() => expect(gap().end).toBeLessThan(4));
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
          setSubmitted(JSON.stringify([...new FormData(event.currentTarget)]));
        }}
      >
        <Label className="text-body-b3-medium inline-flex items-center gap-2">
          <Switch name="autosave" value="yes" defaultChecked />
          자동 저장
        </Label>
        <div className="flex gap-2">
          <Button type="submit">저장</Button>
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
          '켜져 있으면 `name=value` 가 제출되고 꺼져 있으면 항목이 없습니다. 초기화는 `defaultChecked` 로 되돌립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const control = canvas.getByRole('switch', { name: '자동 저장' });
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent('[["autosave","yes"]]');
    await userEvent.click(control);
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent('[]');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(control).toBeChecked());
  },
};

export const ReactHookForm: Story = {
  render: function Render() {
    const methods = useForm({ defaultValues: { autoSave: true } });
    const [result, setResult] = useState('');

    return (
      <FormProvider {...methods}>
        <form
          className="flex flex-col items-start gap-4"
          onSubmit={methods.handleSubmit((values) => setResult(JSON.stringify(values)))}
        >
          <FormField name="autoSave" variant="horizontal">
            <FormField.Label>자동 저장</FormField.Label>
            <Switch />
          </FormField>
          <div className="flex gap-2">
            <Button type="submit">저장</Button>
            <Button variant="outline" onClick={() => methods.reset({ autoSave: false })}>
              끄고 초기화
            </Button>
          </div>
          <output aria-label="저장 결과" className="text-body-b3-regular font-mono">
            {result}
          </output>
        </form>
      </FormProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`register()` 로 연결됩니다. `reset()` 과 `setValue()` 가 input을 직접 바꿔도 thumb이 따라갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const control = canvas.getByRole('switch', { name: '자동 저장' });
    await expect(control).toBeChecked();
    await expect(thumbOf(control)).toHaveAttribute('data-state', 'checked');
    await userEvent.click(control);
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await waitFor(() =>
      expect(canvas.getByLabelText('저장 결과')).toHaveTextContent('{"autoSave":false}'),
    );
    await userEvent.click(control);
    await userEvent.click(canvas.getByRole('button', { name: '끄고 초기화' }));
    await waitFor(() => expect(thumbOf(control)).toHaveAttribute('data-state', 'unchecked'));
    await expect(control).not.toBeChecked();
  },
};
