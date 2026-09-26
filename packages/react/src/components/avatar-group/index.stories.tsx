import { expect } from 'storybook/test';

import { Avatar } from '../avatar';

import { AvatarGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const MEMBERS = ['Alice Kim', 'Bob Lee', 'Carol Park', '류현승', 'Eve Choi'];

const meta: Meta<typeof AvatarGroup> = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  args: { variant: 'stack', size: 'standard', max: 3, 'aria-label': '회의 참석자' },
  argTypes: {
    variant: { control: 'radio', options: ['stack', 'inline'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    max: { control: { type: 'number', min: 1 } },
  },
  render: (args) => (
    <AvatarGroup {...args}>
      {MEMBERS.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </AvatarGroup>
  ),
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

export const Playground: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: '회의 참석자' });
    await expect(group).toBeInTheDocument();
    await expect(canvas.getAllByRole('img')).toHaveLength(3);
    await expect(group).toHaveTextContent('+2');
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <AvatarGroup aria-label="stack">
        {MEMBERS.slice(0, 3).map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
      <AvatarGroup variant="inline" aria-label="inline">
        {MEMBERS.slice(0, 3).map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <AvatarGroup size="standard" max={3} aria-label="standard">
        {MEMBERS.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
      <AvatarGroup size="tiny" max={3} aria-label="tiny">
        {MEMBERS.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
    </div>
  ),
};

export const SizePropagatesToChildren: Story = {
  render: () => (
    <AvatarGroup size="tiny" aria-label="크기 전파">
      <Avatar name="Alice Kim" />
      <Avatar name="Bob Lee" size="standard" />
    </AvatarGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Alice Kim' })).toHaveClass('size-6');
    await expect(canvas.getByRole('img', { name: 'Bob Lee' })).toHaveClass('size-10');
  },
};

export const WithoutMax: Story = {
  render: () => (
    <AvatarGroup aria-label="전원">
      {MEMBERS.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </AvatarGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('img')).toHaveLength(MEMBERS.length);
    await expect(canvas.getByRole('group')).not.toHaveTextContent('+');
  },
};

export const Square: Story = {
  render: () => (
    <AvatarGroup max={2} aria-label="브랜드">
      <Avatar name="Acme" variant="square" />
      <Avatar name="Globex" variant="square" />
      <Avatar name="Initech" variant="square" />
    </AvatarGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('+1')).toHaveClass('rounded-lg');
  },
};
