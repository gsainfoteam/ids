import { useState } from 'react';

import { BoldIcon, EyeIcon, EyeSlashIcon, StarIcon } from '@heroicons/react/16/solid';
import { expect, fn, spyOn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { isDevelopment } from '../../../utils/dev';

import { Toggle } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['ghost', 'outline', 'soft', 'solid'] as const;
const colorSchemes = ['primary', 'neutral', 'danger', 'success', 'warning', 'info'] as const;
const sizes = ['standard', 'tiny'] as const;
const pressedStates = ['off', 'on'] as const;

const meta = {
  title: 'Action/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    colorScheme: { control: 'select', options: colorSchemes },
    size: { control: 'radio', options: sizes },
    disabled: { control: 'boolean' },
    asChild: { table: { disable: true } },
  },
  args: {
    children: '굵게',
    variant: 'ghost',
    size: 'standard',
    defaultPressed: false,
    onPressedChange: fn(),
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant × Pressed"
        description="꺼져 있을 때는 조용하고, variant는 켜진 모습을 정합니다. ghost와 outline은 무채색으로 채우고 soft와 solid는 테마 색을 씁니다."
      >
        <Showcase.Matrix
          rows={pressedStates}
          columns={variants}
          render={(state, variant) => (
            <Toggle variant={variant} defaultPressed={state === 'on'}>
              <BoldIcon />
              굵게
            </Toggle>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <Toggle size={size} variant={variant} defaultPressed>
              {variant}
            </Toggle>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Color scheme (pressed)">
        <Showcase.Matrix
          rows={colorSchemes}
          columns={variants}
          render={(colorScheme, variant) => (
            <Toggle colorScheme={colorScheme} variant={variant} defaultPressed>
              <StarIcon />
              {colorScheme}
            </Toggle>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="disabled">
          <Toggle disabled>꺼짐</Toggle>
          <Toggle disabled defaultPressed>
            켜짐
          </Toggle>
          <Toggle variant="outline" disabled defaultPressed>
            켜짐
          </Toggle>
        </Showcase.Row>
        <Showcase.Row label="icon only">
          <Toggle aria-label="굵게">
            <BoldIcon />
          </Toggle>
          <Toggle aria-label="굵게" defaultPressed>
            <BoldIcon />
          </Toggle>
          <Toggle aria-label="굵게" size="tiny" variant="outline" defaultPressed>
            <BoldIcon />
          </Toggle>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  args: { children: '굵게' },
  parameters: {
    docs: {
      description: {
        story:
          '누를 때마다 aria-pressed와 data-pressed가 바뀝니다. 실제 button이라 Space와 Enter로도 켜고 끕니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const toggle = canvas.getByRole('button', { name: '굵게' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('data-pressed');
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onPressedChange).toHaveBeenCalledTimes(3);
  },
};

function ControlledExample() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <Toggle
        variant="outline"
        pressed={visible}
        onPressedChange={setVisible}
        aria-label="비밀번호 보기"
      >
        {visible ? <EyeSlashIcon /> : <EyeIcon />}
      </Toggle>
      <span className="text-body-b3-regular font-mono">{visible ? 'hunter2' : '•••••••'}</span>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: {
    docs: {
      description: {
        story: 'pressed와 onPressedChange로 제어합니다. 누른 상태에 따라 아이콘도 바꿉니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: '비밀번호 보기' });
    await userEvent.click(toggle);
    await expect(canvas.getByText('hunter2')).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  },
};

function ConfirmExample() {
  const [muted, setMuted] = useState(true);
  const [asked, setAsked] = useState(0);
  return (
    <div className="flex items-center gap-3">
      <Toggle
        variant="soft"
        pressed={muted}
        onPressedChange={setMuted}
        onClick={(event) => {
          if (!muted) return;
          event.preventDefault();
          setAsked((count) => count + 1);
        }}
      >
        알림 끄기
      </Toggle>
      <output aria-label="확인 요청">{asked}</output>
    </div>
  );
}

export const CancelFromOnClick: Story = {
  render: () => <ConfirmExample />,
  parameters: {
    docs: {
      description: {
        story:
          'onClick이 먼저 돌고, 여기서 preventDefault 하면 상태가 바뀌지 않습니다. 끄기 전에 확인을 받을 때 씁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: '알림 끄기' });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByLabelText('확인 요청')).toHaveTextContent('1');
  },
};

export const StateChildren: Story = {
  render: () => <Toggle variant="outline">{(state) => (state.pressed ? '켜짐' : '꺼짐')}</Toggle>,
  parameters: {
    docs: {
      description: {
        story: 'children과 className은 상태를 받는 함수도 됩니다. state.pressed가 켜짐 여부입니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button');
    await expect(toggle).toHaveTextContent('꺼짐');
    await userEvent.click(toggle);
    await expect(toggle).toHaveTextContent('켜짐');
  },
};

function Misuse() {
  const [shown, setShown] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <Toggle variant="outline" onPressedChange={() => setShown(true)}>
        잘못 쓴 예 보기
      </Toggle>
      {shown && <Toggle pressed>고정된 토글</Toggle>}
    </div>
  );
}

export const DevelopmentWarnings: Story = {
  render: () => <Misuse />,
  parameters: {
    docs: {
      description: {
        story:
          '개발 모드에서는 onPressedChange 없는 pressed처럼 움직이지 않는 토글을 콘솔에 알립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    await userEvent.click(canvas.getByRole('button', { name: '잘못 쓴 예 보기' }));
    await expect(canvas.getByRole('button', { name: '고정된 토글' })).toBeVisible();
    if (isDevelopment)
      await waitFor(() =>
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('never changes')),
      );
    warn.mockRestore();
  },
};
