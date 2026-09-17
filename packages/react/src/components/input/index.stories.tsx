import { expect } from 'storybook/test';

import { Field } from '../field';

import { Input } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = { title: 'Components/Input', component: Input, tags: ['autodocs'] } satisfies Meta<
  typeof Input
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Types: Story = {
  render: () => (
    <div className="grid w-80 gap-4">
      {(['text', 'email', 'url', 'search', 'password'] as const).map((type) => (
        <Field key={type}>
          <Field.Label>{type}</Field.Label>
          <Input type={type} name={type} />
        </Field>
      ))}
      <Field>
        <Field.Label>number</Field.Label>
        <Input type="number" defaultValue={2} min={0} />
      </Field>
      <Field>
        <Field.Label>tel</Field.Label>
        <Input type="tel" defaultCountry="KR" />
      </Field>
    </div>
  ),
};
export const SearchClear: Story = {
  render: () => (
    <Field>
      <Field.Label>검색</Field.Label>
      <Input type="search" name="query" defaultValue="IDS" />
    </Field>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('searchbox', { name: '검색' });
    await userEvent.click(canvas.getByRole('button', { name: '검색어 지우기' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'Heroicons');
    await expect(input).toHaveValue('Heroicons');
  },
};
