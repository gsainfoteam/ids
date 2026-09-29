import { useState } from 'react';

import { expect, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';

import { IdsProvider, useTheme } from '.';

import type { IdsColor } from '../../../tokens/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const colors = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
] as const satisfies readonly IdsColor[];
const modes = ['light', 'dark'] as const;

const meta = {
  title: 'Utility/IdsProvider',
  component: IdsProvider,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: colors },
    mode: { control: 'radio', options: [...modes, 'system'] },
    asChild: { control: false },
  },
  args: { color: 'orange', mode: 'dark' },
} satisfies Meta<typeof IdsProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function Readout() {
  const { color, mode, resolvedMode } = useTheme();
  return (
    <dl className="text-caption-c1-regular grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-(--ids-color-on-muted)">
      <dt>color</dt>
      <dd data-testid="color">{color}</dd>
      <dt>mode</dt>
      <dd data-testid="mode">{mode}</dd>
      <dt>resolvedMode</dt>
      <dd data-testid="resolved">{resolvedMode}</dd>
    </dl>
  );
}

const region = cn('concentric-p-4 inset-ring-1 inset-ring-(--ids-color-border)');

export const Playground: Story = {
  render: (args) => (
    <IdsProvider {...args} className={region}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button>저장</Button>
          <Button variant="soft">임시 저장</Button>
          <Button variant="outline">취소</Button>
        </div>
        <Readout />
      </div>
    </IdsProvider>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Color × Mode"
        description="같은 컴포넌트가 data-color와 data-mode만 바꿔 다시 칠해집니다. 밝은 색은 채움 위 글자가 검은색입니다."
      >
        <Showcase.Matrix
          rows={colors}
          columns={modes}
          render={(color, mode) => (
            <IdsProvider color={color} mode={mode} className={region}>
              <div className="flex flex-wrap items-center gap-2">
                <Button>저장</Button>
                <Button variant="soft">임시 저장</Button>
                <Button variant="outline">취소</Button>
              </div>
            </IdsProvider>
          )}
        />
      </Showcase.Section>
      <Showcase.Section
        title="중첩"
        description="안쪽 Provider는 지정하지 않은 축을 바깥에서 물려받습니다. 모드가 바뀌는 영역은 스스로 배경을 칠합니다."
      >
        <Showcase.Row label="mode만">
          <IdsProvider mode="dark" className={region}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button>저장</Button>
                <Button variant="soft">임시 저장</Button>
                <Button variant="outline">취소</Button>
              </div>
              <Readout />
            </div>
          </IdsProvider>
        </Showcase.Row>
        <Showcase.Row label="color만">
          <IdsProvider color="green" className={region}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button>저장</Button>
                <Button variant="soft">임시 저장</Button>
                <Button variant="outline">취소</Button>
              </div>
              <Readout />
            </div>
          </IdsProvider>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

function ModeSwitcher() {
  const { mode, setMode, toggleMode } = useTheme();
  return (
    <div className="flex flex-wrap gap-2">
      {(['light', 'dark', 'system'] as const).map((option) => (
        <Button
          key={option}
          size="tiny"
          variant={mode === option ? 'solid' : 'outline'}
          aria-pressed={mode === option}
          onClick={() => setMode(option)}
        >
          {option}
        </Button>
      ))}
      <Button size="tiny" variant="ghost" onClick={toggleMode}>
        반전
      </Button>
    </div>
  );
}

export const Controlled: Story = {
  render: function Render() {
    const [mode, setMode] = useState<IdsProvider.Mode>('light');

    return (
      <div className="flex flex-col gap-3">
        <IdsProvider
          defaultColor="blue"
          mode={mode}
          onModeChange={setMode}
          className={region}
          data-testid="provider"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button>저장</Button>
              <Button variant="soft">임시 저장</Button>
              <Button variant="outline">취소</Button>
            </div>
            <Readout />
            <div className="flex flex-wrap items-center gap-2">
              <ModeSwitcher />
            </div>
          </div>
        </IdsProvider>
        <output aria-label="부모 상태" className="text-caption-c1-regular font-mono">
          {mode}
        </output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'mode를 넘기면 제어 모드입니다. useTheme().setMode는 onModeChange를 부르고, 화면은 부모가 값을 바꿀 때 바뀝니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const provider = canvas.getByTestId('provider');
    await userEvent.click(canvas.getByRole('button', { name: 'dark' }));
    await expect(provider).toHaveAttribute('data-mode', 'dark');
    await expect(canvas.getByLabelText('부모 상태')).toHaveTextContent('dark');
    await userEvent.click(canvas.getByRole('button', { name: '반전' }));
    await expect(provider).toHaveAttribute('data-mode', 'light');
    await expect(provider.style.colorScheme).toBe('light');
  },
};

export const SystemMode: Story = {
  render: () => (
    <IdsProvider defaultColor="blue" defaultMode="system" className={region} data-testid="provider">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button>저장</Button>
          <Button variant="soft">임시 저장</Button>
          <Button variant="outline">취소</Button>
        </div>
        <Readout />
        <div className="flex flex-wrap items-center gap-2">
          <ModeSwitcher />
        </div>
      </div>
    </IdsProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'mode="system"은 운영체제의 prefers-color-scheme을 따르고, 설정이 바뀌면 새로고침 없이 바로 바뀝니다. resolvedMode가 실제로 칠해진 모드입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const expected = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const provider = canvas.getByTestId('provider');
    await expect(provider).toHaveAttribute('data-mode', expected);
    await expect(canvas.getByTestId('mode')).toHaveTextContent('system');
    await expect(canvas.getByTestId('resolved')).toHaveTextContent(expected);
  },
};

function SetColor() {
  const { setColor } = useTheme();
  return (
    <Button size="tiny" variant="outline" onClick={() => setColor('green')}>
      바깥 color를 green으로
    </Button>
  );
}

export const Nested: Story = {
  render: () => (
    <IdsProvider defaultColor="blue" defaultMode="light" className={region} data-testid="outer">
      <div className="flex flex-col gap-4">
        <Readout />
        <IdsProvider mode="dark" className={region} data-testid="dark">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button>저장</Button>
              <Button variant="soft">임시 저장</Button>
              <Button variant="outline">취소</Button>
            </div>
            <Readout />
            <div className="flex flex-wrap items-center gap-2">
              <SetColor />
            </div>
          </div>
        </IdsProvider>
        <IdsProvider color="orange" className={region} data-testid="orange">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button>저장</Button>
              <Button variant="soft">임시 저장</Button>
              <Button variant="outline">취소</Button>
            </div>
            <Readout />
          </div>
        </IdsProvider>
      </div>
    </IdsProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '안쪽 Provider는 지정한 축만 바꾸고 나머지는 물려받습니다. 물려받은 축의 setter는 그 축을 가진 바깥 Provider를 바꿉니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const outer = canvas.getByTestId('outer');
    const dark = canvas.getByTestId('dark');
    const orange = canvas.getByTestId('orange');
    await expect(dark).toHaveAttribute('data-color', 'blue');
    await expect(dark).toHaveAttribute('data-mode', 'dark');
    await expect(orange).toHaveAttribute('data-color', 'orange');
    await expect(orange).toHaveAttribute('data-mode', 'light');
    await expect(dark.className).toContain('bg-(--ids-color-surface)');
    await expect(orange.className).not.toContain('bg-(--ids-color-surface)');
    await userEvent.click(within(dark).getByRole('button', { name: /바깥 color/ }));
    await expect(outer).toHaveAttribute('data-color', 'green');
    await expect(dark).toHaveAttribute('data-color', 'green');
    await expect(orange).toHaveAttribute('data-color', 'orange');
  },
};

export const AsChild: Story = {
  render: () => (
    <IdsProvider asChild color="green" mode="dark">
      <section aria-label="녹색 영역" className={region}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button>저장</Button>
            <Button variant="soft">임시 저장</Button>
            <Button variant="outline">취소</Button>
          </div>
          <Readout />
        </div>
      </section>
    </IdsProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'asChild면 감싸는 div 없이 자식 요소에 data-color와 data-mode를 바로 붙입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const section = canvas.getByRole('region', { name: '녹색 영역' });
    await expect(section).toHaveAttribute('data-color', 'green');
    await expect(section).toHaveAttribute('data-mode', 'dark');
    await expect(section.parentElement).not.toHaveAttribute('data-color', 'green');
  },
};
