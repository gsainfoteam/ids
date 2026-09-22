import { useState } from 'react';

import { expect } from 'storybook/test';

import { Field } from '../field';

import { ChipField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Components/ChipField',
  component: ChipField,
  tags: ['autodocs'],
} satisfies Meta<typeof ChipField>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example() {
  const [value, setValue] = useState<string[]>([]);
  const [created, setCreated] = useState('');
  return (
    <div className="grid max-w-md gap-4">
      <Field>
        <Field.Label>기술 태그</Field.Label>
        <ChipField value={value} onChange={setValue} creatable onCreate={setCreated} maxCount={3}>
          <ChipField.SearchField placeholder="검색하거나 새 태그 입력" />
          <ChipField.Group heading="개발">
            <ChipField.Item value="react">React</ChipField.Item>
            <ChipField.Item value="ts">TypeScript</ChipField.Item>
            <ChipField.Item value="disabled" disabled>
              준비 중
            </ChipField.Item>
          </ChipField.Group>
        </ChipField>
        <Field.Hint>최대 3개. 빈 입력에서 Backspace로 마지막 태그를 삭제합니다.</Field.Hint>
      </Field>
      <output aria-label="태그 결과">{JSON.stringify(value)}</output>
      <output aria-label="생성 결과">{created}</output>
    </div>
  );
}
export const SearchCreateAndRemove: Story = {
  render: () => <Example />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: '기술 태그' });
    await userEvent.type(input, 'Type');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByLabelText('태그 결과')).toHaveTextContent('["ts"]');
    await userEvent.type(input, 'New tag');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByLabelText('생성 결과')).toHaveTextContent('New tag');
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: 'TypeScript 삭제' }));
    await expect(canvas.getByLabelText('태그 결과')).toHaveTextContent('["New tag"]');
    await userEvent.keyboard('{Backspace}');
    await expect(canvas.getByLabelText('태그 결과')).toHaveTextContent('[]');
  },
};
export const Playground: Story = {
  args: {
    'aria-label': '태그',
    children: (
      <>
        <ChipField.Item value="one">One</ChipField.Item>
        <ChipField.Item value="two">Two</ChipField.Item>
      </>
    ),
  },
};
