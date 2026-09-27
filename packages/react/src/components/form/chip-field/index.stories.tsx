import { useState } from 'react';

import { TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { expect } from 'storybook/test';

import { Field } from '../field';

import { ChipField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Form/ChipField',
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
        <ChipField
          value={value}
          onChange={setValue}
          creatable
          onCreate={setCreated}
          maxCount={3}
          placeholder="검색하거나 새 태그 입력"
        >
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
function WithAdornmentsExample() {
  const [value, setValue] = useState<string[]>(['react']);
  return (
    <Field className="max-w-md">
      <Field.Label>관심 분야</Field.Label>
      <ChipField value={value} onChange={setValue}>
        <TagIcon aria-hidden="true" />
        <ChipField.Input placeholder="분야 검색" spellCheck={false} />
        {value.length > 0 && (
          <button type="button" aria-label="모두 지우기" onClick={() => setValue([])}>
            <XMarkIcon aria-hidden="true" className="size-4" />
          </button>
        )}
        <ChipField.Item value="react">React</ChipField.Item>
        <ChipField.Item value="flutter">Flutter</ChipField.Item>
        <ChipField.Item value="design">Design</ChipField.Item>
      </ChipField>
    </Field>
  );
}
export const WithAdornments: Story = {
  render: () => <WithAdornmentsExample />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '모두 지우기' }));
    await expect(canvas.queryByRole('button', { name: 'React 삭제' })).toBeNull();
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
