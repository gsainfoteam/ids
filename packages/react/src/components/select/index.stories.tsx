import { useState } from 'react';

import { expect } from 'storybook/test';

import { Field } from '../field';

import { Select } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = { title: 'Components/Select', component: Select, tags: ['autodocs'] } satisfies Meta<
  typeof Select
>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className="grid w-80 gap-3">
      <Field>
        <Field.Label>관심 분야</Field.Label>
        <Select selectionMode="multiple" value={value} onChange={setValue} mobileVariant="drawer">
          <Select.SearchField placeholder="분야 검색" />
          <Select.Group heading="개발">
            <Select.Item value="react">React</Select.Item>
            <Select.Item value="flutter">Flutter</Select.Item>
            <Select.Item value="rust" disabled>
              Rust
            </Select.Item>
          </Select.Group>
          <Select.Item value="design">Design</Select.Item>
          <Select.Empty>결과 없음</Select.Empty>
        </Select>
        <Field.Hint>여러 개를 선택할 수 있습니다.</Field.Hint>
      </Field>
      <output aria-label="선택 값">{value.join(',')}</output>
      <button type="button">다음</button>
    </div>
  );
}
export const SearchAndMultiple: Story = {
  render: () => <Example />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: '관심 분야' });
    await userEvent.click(trigger);
    const search = canvas.getByRole('combobox', { name: '옵션 검색' });
    await expect(search).toHaveFocus();
    await userEvent.type(search, 'React');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByLabelText('선택 값')).toHaveTextContent('react');
    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    await expect(canvas.getByText('결과 없음')).toBeVisible();
    await userEvent.clear(search);
    await userEvent.type(search, 'Flutter');
    await userEvent.keyboard('{Enter}{Escape}');
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveTextContent('React, Flutter');
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: '다음' })).toHaveFocus();
  },
};
export const Playground: Story = {
  args: {
    placeholder: '과일 선택',
    children: (
      <>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="cherry">Cherry</Select.Item>
      </>
    ),
  },
};
