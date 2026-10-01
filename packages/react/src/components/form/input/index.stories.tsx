import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Field } from '../field';

import { Input } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const types = ['text', 'email', 'url', 'search', 'password', 'number', 'tel'] as const;
const sizes = ['standard', 'tiny'] as const;
const placeholders: Record<(typeof types)[number], string> = {
  text: '이름',
  email: 'name@example.com',
  url: 'https://gistory.me',
  search: '검색',
  password: '비밀번호',
  number: '0',
  tel: '010-0000-0000',
};

const meta = {
  title: 'Form/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'radio', options: types },
    size: { control: 'radio', options: sizes },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: { type: 'text', 'aria-label': '입력', className: cn('w-72') },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Types"
        description="type 하나로 그 입력에 맞는 IDS 필드를 고릅니다. 값과 콜백은 고른 필드의 것을 그대로 씁니다."
      >
        {types.map((type) => (
          <Showcase.Row key={type} label={type}>
            <Input
              type={type}
              name={type}
              placeholder={placeholders[type]}
              aria-label={type}
              className="w-72"
            />
          </Showcase.Row>
        ))}
      </Showcase.Section>
      <Showcase.Section title="Size">
        <Showcase.Matrix
          rows={sizes}
          columns={['search', 'password', 'number'] as const}
          render={(size, type) => (
            <Input type={type} size={size} aria-label={`${type} ${size}`} className="w-56" />
          )}
        />
      </Showcase.Section>
    </Showcase>
  ),
};

export const TypeRouting: Story = {
  render: () => (
    <div className="grid w-72 gap-4">
      {types.map((type) => (
        <Field key={type}>
          <Field.Label>{type}</Field.Label>
          <Input type={type} name={type} />
        </Field>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'number는 NumberField, password는 PasswordField, tel은 TelField, 나머지는 TextField로 그립니다. Field의 라벨 연결도 그대로 됩니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('spinbutton', { name: 'number' })).toBeInTheDocument();
    await expect(canvas.getByLabelText('password', { selector: 'input' })).toHaveAttribute(
      'type',
      'password',
    );
    await expect(canvas.getByRole('textbox', { name: 'tel' })).toHaveAttribute('type', 'tel');
    await expect(canvas.getByRole('searchbox', { name: 'search' })).toBeInTheDocument();
    await expect(canvas.getByRole('textbox', { name: 'email' })).toHaveAttribute(
      'autocapitalize',
      'none',
    );
  },
};

export const SearchClear: Story = {
  render: () => (
    <Field className="w-72">
      <Field.Label>검색</Field.Label>
      <Input type="search" name="query" defaultValue="IDS" />
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'search에는 돋보기 아이콘과 TextField.Clear가 붙습니다. 지우기는 값이 있을 때만 보이고, Escape도 입력을 비웁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('searchbox', { name: '검색' });
    await userEvent.click(canvas.getByRole('button', { name: '검색어 지우기' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(canvas.queryByRole('button', { name: '검색어 지우기' })).toBeNull();
    await userEvent.type(input, 'Heroicons');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
  },
};
