import { useState } from 'react';

import { expect, userEvent } from 'storybook/test';

import { Label } from '../label';

import { Switch } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { size: 'standard' },
  argTypes: {
    size: { control: 'radio', options: ['standard', 'tiny'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {
  render: (args) => (
    <Label className="inline-flex items-center gap-2">
      <Switch {...args} />
      알림 받기
    </Label>
  ),
  play: async ({ canvas }) => {
    const control = canvas.getByRole('switch', { name: '알림 받기' });
    await expect(control).not.toBeChecked();

    await userEvent.click(control);
    await expect(control).toBeChecked();
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Label className="inline-flex items-center gap-2">
        <Switch defaultChecked />
        standard
      </Label>
      <Label className="inline-flex items-center gap-2">
        <Switch size="tiny" defaultChecked />
        tiny
      </Label>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Label className="inline-flex items-center gap-2">
        <Switch />
        off
      </Label>
      <Label className="inline-flex items-center gap-2">
        <Switch defaultChecked />
        on
      </Label>
      <Label className="inline-flex items-center gap-2">
        <Switch disabled />
        off 잠김
      </Label>
      <Label className="inline-flex items-center gap-2">
        <Switch disabled defaultChecked />
        on 잠김
      </Label>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('switch', { name: 'on 잠김' })).toBeDisabled();
  },
};

/** 설정 페이지에서는 라벨을 왼쪽에 두고 스위치를 오른쪽 끝으로 민다. */
export const SettingsRows: Story = {
  render: function SettingsRows() {
    const [settings, setSettings] = useState({ email: true, push: false, sms: false });

    return (
      <div className="flex w-80 flex-col gap-3">
        {(
          [
            ['email', '이메일 알림'],
            ['push', '푸시 알림'],
            ['sms', 'SMS 알림'],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={`setting-${key}`}>{label}</Label>
            <Switch
              id={`setting-${key}`}
              checked={settings[key]}
              onChange={(next) => setSettings((prev) => ({ ...prev, [key]: next }))}
            />
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvas }) => {
    const push = canvas.getByRole('switch', { name: '푸시 알림' });
    await userEvent.click(push);
    await expect(push).toBeChecked();
  },
};

export const Keyboard: Story = {
  render: () => (
    <Label className="inline-flex items-center gap-2">
      <Switch />
      Space로 토글
    </Label>
  ),
  play: async ({ canvas }) => {
    const control = canvas.getByRole('switch');
    control.focus();
    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
  },
};
