import { expect } from 'storybook/test';

import { Kbd } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  args: { size: 'standard', children: 'Enter' },
  argTypes: { size: { control: 'radio', options: ['standard', 'tiny'] } },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Playground: Story = {};

export const Shortcut: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <button type="button">이전 동작</button>
      <span className="inline-flex items-center gap-1">
        <Kbd data-testid="command">
          <abbr title="Command">⌘</abbr>
        </Kbd>
        <span>+</span>
        <Kbd>K</Kbd>
      </span>
      <button type="button">다음 동작</button>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByTestId('command').tagName).toBe('KBD');
    await expect(canvas.getByTestId('command')).not.toHaveAttribute('tabindex');
    await userEvent.click(canvas.getByRole('button', { name: '이전 동작' }));
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: '다음 동작' })).toHaveFocus();
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Kbd data-testid="standard">Enter</Kbd>
      <Kbd size="tiny" data-testid="tiny">
        Enter
      </Kbd>
    </div>
  ),
  play: async ({ canvas }) => {
    const standard = canvas.getByTestId('standard').getBoundingClientRect();
    const tiny = canvas.getByTestId('tiny').getBoundingClientRect();
    await expect(standard.height).toBeGreaterThan(tiny.height);
    await expect(tiny.height).toBeGreaterThan(0);
  },
};

export const Themes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(['light', 'dark'] as const).map((mode) => (
        <div
          key={mode}
          data-mode={mode}
          className="flex items-center gap-2 rounded-xl bg-(--ids-color-surface) p-4 text-(--ids-color-on-surface)"
        >
          <span>{mode}</span>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>S</Kbd>
        </div>
      ))}
    </div>
  ),
};
