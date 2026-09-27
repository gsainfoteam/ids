import { expect } from 'storybook/test';

import { Field } from '../field';

import { TimeField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Components/TimeField',
  component: TimeField,
  tags: ['autodocs'],
} satisfies Meta<typeof TimeField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SelectAndClear: Story = {
  render: () => (
    <div className="w-80">
      <Field>
        <Field.Label>알람 시간</Field.Label>
        <TimeField
          defaultValue={new Date(2026, 8, 15, 9, 30)}
          format="HH:mm"
          hourCycle="24h"
          step={15}
          mobileVariant="drawer"
        />
      </Field>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: '알람 시간' });
    await userEvent.click(trigger);
    await expect(canvas.getByRole('listbox', { name: 'Hour' })).toHaveFocus();
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}{ArrowRight}{End}{Enter}{Escape}');
    await expect(trigger).toHaveTextContent('01:45');
    await expect(trigger).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: '시간 지우기' }));
    await expect(trigger).toHaveTextContent('시간 선택');
  },
};
