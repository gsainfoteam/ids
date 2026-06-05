import { HStack } from '../hstack';

import { Spacer } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Spacer> = {
  title: 'Components/Spacer',
  component: Spacer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Spacer>;

export const InHStack: Story = {
  render: () => (
    <HStack gap={8} crossAxis="center" className="bg-muted p-4 rounded-lg">
      <span>왼쪽</span>
      <Spacer />
      <span>오른쪽</span>
    </HStack>
  ),
};
