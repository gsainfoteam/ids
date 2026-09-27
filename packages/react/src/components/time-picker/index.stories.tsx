import { useState } from 'react';

import { expect } from 'storybook/test';

import { TimePicker } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
} satisfies Meta<typeof TimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example() {
  const [value, setValue] = useState<Date | null>(new Date(2026, 8, 15, 9, 15));
  return (
    <div className="w-80">
      <TimePicker value={value} onChange={setValue} format="24h" step={15} />
      <output aria-label="선택 시각">
        {value?.getHours()}:{value?.getMinutes()}
      </output>
    </div>
  );
}
export const Keyboard: Story = {
  render: () => <Example />,
  play: async ({ canvas, userEvent }) => {
    const hour = canvas.getByRole('listbox', { name: 'Hour' });
    await userEvent.click(hour);
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}');
    await expect(canvas.getByLabelText('선택 시각')).toHaveTextContent('1:15');
    await userEvent.keyboard('{ArrowRight}{End}{Enter}');
    await expect(canvas.getByLabelText('선택 시각')).toHaveTextContent('1:45');
  },
};
export const Wheel: Story = {
  args: {
    variant: 'wheel',
    format: '12h',
    precision: 'second',
    step: 15,
    defaultValue: new Date(2026, 8, 15, 14, 30),
    className: 'w-80',
  },
};
