import { Button } from '../button';

import { VStack } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof VStack> = {
  title: 'Components/VStack',
  component: VStack,
  tags: ['autodocs'],
  argTypes: {
    gap: { control: { type: 'number', min: 0, step: 1 } },
    mainAxis: {
      control: 'radio',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    crossAxis: {
      control: 'radio',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    fit: { control: 'radio', options: ['fill', 'content'] },
  },
};

export default meta;
type Story = StoryObj<typeof VStack>;

export const Playground: Story = {
  args: {
    gap: 8,
    mainAxis: 'start',
    crossAxis: 'stretch',
    fit: 'fill',
  },
  render: (args) => (
    <div className="h-72 w-80 rounded-lg border border-[var(--ids-color-outline)] p-4">
      <VStack {...args}>
        <Button>첫 번째</Button>
        <Button variant="outline">두 번째</Button>
        <Button variant="ghost">세 번째</Button>
      </VStack>
    </div>
  ),
};

export const ContentFit: Story = {
  render: () => (
    <VStack gap={12} fit="content" crossAxis="start">
      <Button>저장</Button>
      <Button variant="outline">취소</Button>
      <Button variant="ghost">초기화</Button>
    </VStack>
  ),
};
