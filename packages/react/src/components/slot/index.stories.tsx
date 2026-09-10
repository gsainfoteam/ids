import { useState } from 'react';

import { expect, userEvent } from 'storybook/test';

import { Slot } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Slot> = {
  title: 'Components/Slot',
  component: Slot,
  tags: ['autodocs'],
  parameters: { controls: { disable: true } },
};

export default meta;
type Story = StoryObj<typeof Slot>;

export const Playground: Story = {
  render: () => (
    <Slot className="rounded-xl bg-(--ids-color-primary) px-4 py-2 text-(--ids-color-on-primary)">
      <a href="#slot">Slot이 감싼 링크</a>
    </Slot>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Slot이 감싼 링크' });
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveClass('rounded-xl');
  },
};

export const MergesClassName: Story = {
  render: () => (
    <Slot className="text-(--ids-color-primary)">
      <span className="underline">양쪽 className이 합쳐진다</span>
    </Slot>
  ),
  play: async ({ canvas }) => {
    const span = canvas.getByText('양쪽 className이 합쳐진다');
    await expect(span).toHaveClass('underline');
    await expect(span).toHaveClass('text-(--ids-color-primary)');
  },
};

export const CallsBothHandlers: Story = {
  render: function CallsBothHandlers() {
    const [log, setLog] = useState<string[]>([]);

    return (
      <div className="flex flex-col gap-2">
        <Slot onClick={() => setLog((prev) => [...prev, 'slot'])}>
          <button type="button" onClick={() => setLog((prev) => [...prev, 'child'])}>
            둘 다 실행
          </button>
        </Slot>
        <output data-testid="log">{log.join(' ')}</output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '둘 다 실행' }));
    await expect(canvas.getByTestId('log')).toHaveTextContent('child slot');
  },
};

export const ChildCanStopSlotHandler: Story = {
  render: function ChildCanStopSlotHandler() {
    const [slotCalls, setSlotCalls] = useState(0);

    return (
      <div className="flex flex-col gap-2">
        <Slot onClick={() => setSlotCalls((prev) => prev + 1)}>
          <button type="button" onClick={(event) => event.preventDefault()}>
            Slot 핸들러를 막는다
          </button>
        </Slot>
        <output data-testid="slot-calls">{slotCalls}</output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Slot 핸들러를 막는다' }));
    await expect(canvas.getByTestId('slot-calls')).toHaveTextContent('0');
  },
};

export const SlotPropsWin: Story = {
  render: () => (
    <Slot aria-label="Slot이 지정한 이름">
      <button type="button" aria-label="자식이 지정한 이름">
        prop 충돌
      </button>
    </Slot>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Slot이 지정한 이름' })).toBeInTheDocument();
  },
};
