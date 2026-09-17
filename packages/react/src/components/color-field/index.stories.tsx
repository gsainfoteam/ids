import { useState } from 'react';

import { expect } from 'storybook/test';

import { Field } from '../field';

import { ColorField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Components/ColorField',
  component: ColorField,
  tags: ['autodocs'],
} satisfies Meta<typeof ColorField>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example() {
  const [value, setValue] = useState('#3B82F6');
  return (
    <div className="grid w-80 gap-3">
      <Field>
        <Field.Label>브랜드 색상</Field.Label>
        <ColorField
          value={value}
          onChange={setValue}
          alpha
          swatches={['#FF0000', '#00FF00', '#0000FF']}
          mobileVariant="drawer"
        />
        <Field.Hint>방향키로 채도와 명도를 조절하세요.</Field.Hint>
      </Field>
      <output aria-label="색상 결과">{value}</output>
    </div>
  );
}
export const PickerAndClear: Story = {
  render: () => <Example />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: '브랜드 색상' });
    await userEvent.click(trigger);
    await expect(canvas.getByRole('dialog', { name: '색상 선택' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '#FF0000' }));
    await expect(canvas.getByLabelText('색상 결과')).toHaveTextContent('#FF0000FF');
    const area = canvas.getByRole('slider', { name: '채도와 명도' });
    await userEvent.click(area);
    await userEvent.keyboard('{Home}');
    await expect(area).toHaveAttribute('aria-valuenow', '0');
    const input = canvas.getByRole('textbox', { name: '색상 값' });
    await userEvent.clear(input);
    await userEvent.type(input, '#00FF00');
    await userEvent.tab();
    await expect(canvas.getByLabelText('색상 결과')).toHaveTextContent('#00FF00FF');
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: '색상 지우기' }));
    await expect(canvas.getByLabelText('색상 결과')).toBeEmptyDOMElement();
    await expect(trigger).toHaveTextContent('색상 선택');
  },
};
export const Playground: Story = {
  args: {
    'aria-label': '색상',
    defaultValue: '#3B82F6',
    swatches: ['#3B82F6', '#22C55E', '#F97316'],
  },
};
