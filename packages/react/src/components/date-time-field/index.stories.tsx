import { expect } from 'storybook/test';

import { Field } from '../field';

import { DateTimeField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Components/DateTimeField',
  component: DateTimeField,
  tags: ['autodocs'],
} satisfies Meta<typeof DateTimeField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PreserveDateAndTime: Story = {
  render: () => (
    <div className="w-80">
      <Field>
        <Field.Label>회의 일시</Field.Label>
        <DateTimeField
          defaultValue={new Date(2026, 8, 15, 9, 30)}
          today={new Date(2026, 8, 15)}
          locale="en-US"
          format="yyyy-MM-dd HH:mm"
          hourCycle="24h"
          step={15}
          mobileVariant="drawer"
        />
      </Field>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: '회의 일시' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(trigger).toHaveTextContent('2026-09-16 09:30');
    await userEvent.click(canvas.getByRole('listbox', { name: 'Hour' }));
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}{Escape}');
    await expect(trigger).toHaveTextContent('2026-09-16 01:30');
    await expect(trigger).toHaveFocus();
  },
};
