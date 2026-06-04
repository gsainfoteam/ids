import { VStack } from '../vstack';

import { Divider } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: () => (
    <VStack gap={12}>
      <span>위</span>
      <Divider />
      <span>아래</span>
    </VStack>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center gap-3 h-8">
      <span>왼쪽</span>
      <Divider orientation="vertical" />
      <span>오른쪽</span>
    </div>
  ),
};
