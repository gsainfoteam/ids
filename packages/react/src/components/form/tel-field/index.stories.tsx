import { useState } from 'react';

import { PhoneIcon } from '@heroicons/react/24/outline';
import { expect } from 'storybook/test';

import { Field } from '../field';

import { TelField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Form/TelField',
  component: TelField,
  tags: ['autodocs'],
} satisfies Meta<typeof TelField>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example() {
  const [value, setValue] = useState('');
  return (
    <div className="grid w-80 gap-3">
      <Field>
        <Field.Label>전화번호</Field.Label>
        <TelField value={value} onChange={setValue} defaultCountry="KR" name="tel">
          <TelField.CountrySelect />
          <TelField.Input />
        </TelField>
        <Field.Hint>국가 코드와 전화번호를 입력하세요.</Field.Hint>
      </Field>
      <output aria-label="전화번호 값">{value}</output>
    </div>
  );
}
export const CountryAndFormatting: Story = {
  render: () => <Example />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '전화번호' });
    await userEvent.type(input, '01012345678');
    await expect(input).toHaveValue('010-1234-5678');
    await expect(canvas.getByLabelText('전화번호 값')).toHaveTextContent('+821012345678');
    await userEvent.click(canvas.getByRole('combobox', { name: '국가 코드' }));
    const search = canvas.getByRole('combobox', { name: '옵션 검색' });
    await userEvent.type(search, 'US');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByLabelText('전화번호 값')).toHaveTextContent('+11012345678');
    await expect(canvas.getByRole('combobox', { name: '국가 코드' })).toHaveTextContent('US +1');
  },
};
export const Adornments: Story = {
  render: () => (
    <div className="grid w-80 gap-3">
      {/* No Input: the children become leading and TelField appends one. */}
      <TelField aria-label="국가 코드 포함 전화번호" defaultCountry="KR">
        <TelField.CountrySelect />
      </TelField>
      {/* Values on the Input win over the root; handlers on both run. */}
      <TelField aria-label="휴대전화" placeholder="root" defaultCountry="KR">
        <PhoneIcon />
        <TelField.Input placeholder="010-0000-0000" />
        <span>필수</span>
      </TelField>
    </div>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: '휴대전화' });
    await expect(input).toHaveAttribute('placeholder', '010-0000-0000');
    await expect(canvas.getByRole('combobox', { name: '국가 코드' })).toBeInTheDocument();
  },
};
export const Playground: Story = {
  args: { 'aria-label': '전화번호', name: 'tel', defaultCountry: 'KR' },
};
