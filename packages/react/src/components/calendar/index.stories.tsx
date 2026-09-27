import { useState } from 'react';

import { expect } from 'storybook/test';

import { Calendar, type DateRange } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;
function RangeExample() {
  const [value, setValue] = useState<DateRange | null>(null);
  return (
    <div className="max-w-2xl">
      <Calendar
        selectionMode="range"
        value={value}
        onChange={setValue}
        defaultMonth={new Date(2026, 8, 1)}
        today={new Date(2026, 8, 15)}
        monthsToShow={2}
        locale="en-US"
      />
      <output aria-label="범위 결과">
        {value?.start?.getDate() ?? '–'} / {value?.end?.getDate() ?? '–'}
      </output>
    </div>
  );
}
export const RangeAndKeyboard: Story = {
  render: () => <RangeExample />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Thursday, September 10, 2026' }),
    );
    await expect(canvas.getByLabelText('범위 결과')).toHaveTextContent('10 / –');
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(canvas.getByLabelText('범위 결과')).toHaveTextContent('10 / 11');
    await userEvent.keyboard('{PageDown}');
    await expect(
      canvas.getByRole('button', { name: 'Sunday, October 11, 2026' }),
    ).toHaveFocus();
  },
};
export const Playground: Story = {
  args: { locale: 'ko-KR', today: new Date(2026, 8, 15), defaultMonth: new Date(2026, 8, 1) },
};
