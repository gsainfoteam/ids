import { BuildingOffice2Icon, UserIcon } from '@heroicons/react/24/outline';
import { expect } from 'storybook/test';

import { Avatar, initialsOf } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const PHOTO = 'https://picsum.photos/seed/ids-avatar/160';
const BROKEN = '/ids-avatar-does-not-exist.png';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { src: PHOTO, name: 'Alice Kim', variant: 'circle', size: 'standard' },
  argTypes: {
    variant: { control: 'radio', options: ['circle', 'square'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Alice Kim' })).toBeInTheDocument();
  },
};

export const VariantsAndSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar src={PHOTO} name="Alice Kim" />
      <Avatar src={PHOTO} name="Alice Kim" size="tiny" />
      <Avatar src={PHOTO} name="Acme" variant="square" />
      <Avatar src={PHOTO} name="Acme" variant="square" size="tiny" />
    </div>
  ),
};

export const InitialsFallback: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Alice Kim" />
      <Avatar name="류현승" />
      <Avatar name="Bob" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Alice Kim' })).toHaveTextContent('AK');
    await expect(canvas.getByRole('img', { name: '류현승' })).toHaveTextContent('류');
    await expect(canvas.getByRole('img', { name: 'Bob' })).toHaveTextContent('B');
  },
};

export const BrokenImageFallsBack: Story = {
  render: () => <Avatar src={BROKEN} name="Alice Kim" />,
  play: async ({ canvas, canvasElement }) => {
    const image = canvasElement.querySelector('img');
    image?.dispatchEvent(new Event('error'));
    await expect(canvas.getByRole('img', { name: 'Alice Kim' })).toHaveTextContent('AK');
  },
};

export const CustomFallback: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Acme" variant="square">
        <Avatar.Fallback>
          <BuildingOffice2Icon />
        </Avatar.Fallback>
      </Avatar>
      <Avatar alt="알 수 없는 사용자">
        <Avatar.Fallback>
          <UserIcon />
        </Avatar.Fallback>
      </Avatar>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: '알 수 없는 사용자' })).toBeInTheDocument();
  },
};

export const Initials: Story = {
  render: () => (
    <ul className="text-body-b3-regular font-mono">
      {['Alice Kim', '류현승', 'Bob', 'ada lovelace tester', '  '].map((name, index) => (
        <li key={index}>
          {JSON.stringify(name)} → {JSON.stringify(initialsOf(name))}
        </li>
      ))}
    </ul>
  ),
  play: async () => {
    await expect(initialsOf('Alice Kim')).toBe('AK');
    await expect(initialsOf('ada lovelace tester')).toBe('AL');
    await expect(initialsOf('류현승')).toBe('류');
    await expect(initialsOf('  ')).toBe('');
  },
};
