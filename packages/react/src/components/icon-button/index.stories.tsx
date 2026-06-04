import { Bookmark01Icon, Share01Icon } from 'hugeicons-react';

import { HStack } from '../hstack';

import { IconButton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Ghost: Story = {
  args: { icon: <Bookmark01Icon size={20} />, variant: 'ghost', label: '북마크' },
};

export const AllVariants: Story = {
  render: () => (
    <HStack gap={8} crossAxis="center">
      <IconButton icon={<Bookmark01Icon size={20} />} variant="solid" label="solid" />
      <IconButton icon={<Bookmark01Icon size={20} />} variant="soft" label="soft" />
      <IconButton icon={<Bookmark01Icon size={20} />} variant="outline" label="outline" />
      <IconButton icon={<Bookmark01Icon size={20} />} variant="ghost" label="ghost" />
    </HStack>
  ),
};

export const Actions: Story = {
  render: () => (
    <HStack gap={4} crossAxis="center">
      <IconButton icon={<Bookmark01Icon size={20} />} variant="ghost" label="북마크" />
      <IconButton icon={<Share01Icon size={20} />} variant="ghost" label="공유" />
    </HStack>
  ),
};
