import { HStack } from '../hstack';

import { Avatar } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  args: { src: 'https://i.pravatar.cc/80', name: '홍길동', size: 'md' },
};

export const WithInitials: Story = {
  args: { name: '홍길동', size: 'md' },
};

export const AllSizes: Story = {
  render: () => (
    <HStack gap={12} crossAxis="center">
      <Avatar name="홍길동" size="sm" />
      <Avatar name="홍길동" size="md" />
      <Avatar name="홍길동" size="lg" />
      <Avatar name="홍길동" size="xl" />
    </HStack>
  ),
};
