import { useState } from 'react';

import { expect } from 'storybook/test';

import { Field } from '../field';

import { DateField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Components/DateField',
  component: DateField,
  tags: ['autodocs'],
} satisfies Meta<typeof DateField>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <div className="w-80">
      <Field>
        <Field.Label>예약 날짜</Field.Label>
        <DateField
          value={value}
          onChange={setValue}
          format="yyyy-MM-dd"
          today={new Date(2026, 8, 15)}
          locale="en-US"
          min={new Date(2026, 8, 1)}
          max={new Date(2026, 8, 30)}
          mobileVariant="drawer"
        />
        <Field.Hint>방향키로 날짜를 이동하고 Enter로 선택하세요.</Field.Hint>
      </Field>
      <output aria-label="날짜 결과">{value?.getDate() ?? 'none'}</output>
    </div>
  );
}
export const SelectAndClear: Story = {
  render: () => <Example />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: '예약 날짜' });
    await userEvent.click(trigger);
    await expect(canvas.getByRole('button', { name: 'Tuesday, September 15, 2026' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(trigger).toHaveTextContent('2026-09-16');
    await expect(trigger).toHaveFocus();
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '날짜 지우기' }));
    await expect(canvas.getByLabelText('날짜 결과')).toHaveTextContent('none');
  },
};
export const Range: Story = {
  args: {
    'aria-label': '여행 기간',
    selectionMode: 'range',
    monthsToShow: 2,
    format: 'yyyy-MM-dd',
    locale: 'ko-KR',
    today: new Date(2026, 8, 15),
    mobileVariant: 'drawer',
  },
};
export const Multiple: Story = {
  args: {
    'aria-label': '참석 가능 날짜',
    selectionMode: 'multiple',
    format: 'yyyy-MM-dd',
    locale: 'ko-KR',
    today: new Date(2026, 8, 15),
  },
};
