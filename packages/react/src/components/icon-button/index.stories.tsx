import { HStack } from '../hstack';

import { IconButton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

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
  args: { icon: <BookmarkIcon />, variant: 'ghost', label: '북마크' },
};

export const AllVariants: Story = {
  render: () => (
    <HStack gap={8} crossAxis="center">
      <IconButton icon={<BookmarkIcon />} variant="solid" label="solid" />
      <IconButton icon={<BookmarkIcon />} variant="soft" label="soft" />
      <IconButton icon={<BookmarkIcon />} variant="outline" label="outline" />
      <IconButton icon={<BookmarkIcon />} variant="ghost" label="ghost" />
    </HStack>
  ),
};

export const Actions: Story = {
  render: () => (
    <HStack gap={4} crossAxis="center">
      <IconButton icon={<BookmarkIcon />} variant="ghost" label="북마크" />
      <IconButton icon={<ShareIcon />} variant="ghost" label="공유" />
    </HStack>
  ),
};
