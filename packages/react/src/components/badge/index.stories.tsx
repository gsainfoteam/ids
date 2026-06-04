import { HStack } from '../hstack';

import { Badge } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    size: { control: 'radio', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Solid: Story = {
  args: { children: '12일 남음', variant: 'solid' },
};

export const Soft: Story = {
  args: { children: '#모집', variant: 'soft' },
};

export const Outline: Story = {
  args: { children: '#인포팀', variant: 'outline' },
};

export const Ghost: Story = {
  args: { children: '#디자인', variant: 'ghost' },
};

export const TagChips: Story = {
  render: () => (
    <HStack gap={6}>
      <Badge variant="soft">#모집</Badge>
      <Badge variant="soft">#인포팀</Badge>
      <Badge variant="soft">#개발</Badge>
      <Badge variant="soft">#지글</Badge>
      <Badge variant="soft">#비대위</Badge>
    </HStack>
  ),
};
