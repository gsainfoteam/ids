import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

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
    'aria-invalid': { control: 'boolean' },
  },
  args: { type: 'text', 'aria-label': '입력' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const Usage: Story = {
  render: () => (
    <div className="w-72">
      <Field>
        <Field.Label>이메일</Field.Label>
        <Input type="email" name="email" placeholder="name@example.com" />
      </Field>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Types"
        description="type 하나로 그 입력에 맞는 IDS 필드를 고릅니다. 값과 콜백은 고른 필드의 것을 그대로 씁니다."
      >
        {types.map((type) => (
          <Showcase.Row key={type} label={type}>
            <div className="w-72">
              <Input type={type} name={type} placeholder={placeholders[type]} aria-label={type} />
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>
      <Showcase.Section title="Size">
        <Showcase.Matrix
          rows={sizes}
          columns={['search', 'password', 'number'] as const}
          render={(size, type) => (
            <div className="w-56">
              <Input type={type} size={size} aria-label={`${type} ${size}`} />
            </div>
          )}
        />
      </Showcase.Section>
    </Showcase>
  ),
};

export const PickTheFieldByType: Story = {
  render: () => (
    <div className="grid w-72 gap-4">
      <Field>
        <Field.Label>text</Field.Label>
        <Input type="text" name="text" />
      </Field>
      <Field>
        <Field.Label>email</Field.Label>
        <Input type="email" name="email" />
      </Field>
      <Field>
        <Field.Label>url</Field.Label>
        <Input type="url" name="url" />
      </Field>
      <Field>
        <Field.Label>search</Field.Label>
        <Input type="search" name="search" />
      </Field>
      <Field>
        <Field.Label>password</Field.Label>
        <Input type="password" name="password" />
      </Field>
      <Field>
        <Field.Label>number</Field.Label>
        <Input type="number" name="number" />
      </Field>
      <Field>
        <Field.Label>tel</Field.Label>
        <Input type="tel" name="tel" />
      </Field>
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

export const ClearASearch: Story = {
  render: () => (
    <div className="w-72">
      <Field>
        <Field.Label>검색</Field.Label>
        <Input type="search" name="query" defaultValue="IDS" />
      </Field>
    </div>
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
    await userEvent.click(canvas.getByRole('button', { name: '지우기' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(canvas.queryByRole('button', { name: '지우기' })).toBeNull();
    await userEvent.type(input, 'Heroicons');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
  },
};
