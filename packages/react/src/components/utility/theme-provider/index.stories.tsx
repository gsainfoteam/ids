import { useState, type ReactNode } from 'react';

import { expect, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';

import { ThemeProvider, useTheme } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const colors = ['blue', 'orange', 'green'] as const;
const modes = ['light', 'dark'] as const;

const meta = {
  title: 'Utility/ThemeProvider',
  component: ThemeProvider,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'radio', options: colors },
    mode: { control: 'radio', options: [...modes, 'system'] },
    asChild: { control: false },
  },
  args: { color: 'orange', mode: 'dark' },
} satisfies Meta<typeof ThemeProvider>;

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

function Sample({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button>저장</Button>
        <Button variant="soft">임시 저장</Button>
        <Button variant="outline">취소</Button>
      </div>
      <Readout />
      {children !== undefined && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}

const region = cn('concentric-p-4 inset-ring-1 inset-ring-(--ids-color-border)');

export const Playground: Story = {
  render: (args) => (
    <ThemeProvider {...args} className={region}>
      <Sample />
    </ThemeProvider>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Color × Mode"
        description="같은 컴포넌트가 data-color와 data-mode만 바꿔 다시 칠해집니다."
      >
        <Showcase.Matrix
          rows={modes}
          columns={colors}
          render={(mode, color) => (
            <ThemeProvider color={color} mode={mode} className={region}>
              <Sample />
            </ThemeProvider>
          )}
        />
      </Showcase.Section>
      <Showcase.Section
        title="중첩"
        description="안쪽 Provider는 지정하지 않은 축을 바깥에서 물려받습니다. 모드가 바뀌는 영역은 스스로 배경을 칠합니다."
      >
        <Showcase.Row label="mode만">
          <ThemeProvider mode="dark" className={region}>
            <Sample />
          </ThemeProvider>
        </Showcase.Row>
        <Showcase.Row label="color만">
          <ThemeProvider color="green" className={region}>
            <Sample />
          </ThemeProvider>
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

function ControlledExample() {
  const [mode, setMode] = useState<ThemeProvider.Mode>('light');
  return (
    <div className="flex flex-col gap-3">
      <ThemeProvider
        defaultColor="blue"
        mode={mode}
        onModeChange={setMode}
        className={region}
        data-testid="provider"
      >
        <Sample>
          <ModeSwitcher />
        </Sample>
      </ThemeProvider>
      <output aria-label="부모 상태" className="text-caption-c1-regular font-mono">
        {mode}
      </output>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
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
    <ThemeProvider
      defaultColor="blue"
      defaultMode="system"
      className={region}
      data-testid="provider"
    >
      <Sample>
        <ModeSwitcher />
      </Sample>
    </ThemeProvider>
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

function NestedExample() {
  return (
    <ThemeProvider defaultColor="blue" defaultMode="light" className={region} data-testid="outer">
      <div className="flex flex-col gap-4">
        <Readout />
        <ThemeProvider mode="dark" className={region} data-testid="dark">
          <Sample>
            <SetColor />
          </Sample>
        </ThemeProvider>
        <ThemeProvider color="orange" className={region} data-testid="orange">
          <Sample />
        </ThemeProvider>
      </div>
    </ThemeProvider>
  );
}

function SetColor() {
  const { setColor } = useTheme();
  return (
    <Button size="tiny" variant="outline" onClick={() => setColor('green')}>
      바깥 color를 green으로
    </Button>
  );
}

export const Nested: Story = {
  render: () => <NestedExample />,
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
    <ThemeProvider asChild color="green" mode="dark">
      <section aria-label="녹색 영역" className={region}>
        <Sample />
      </section>
    </ThemeProvider>
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
