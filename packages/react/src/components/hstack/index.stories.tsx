import { Button } from '../button';

import { HStack } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof HStack> = {
  title: 'Components/HStack',
  component: HStack,
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
type Story = StoryObj<typeof HStack>;

export const Playground: Story = {
  args: {
    gap: 8,
    mainAxis: 'start',
    crossAxis: 'center',
    fit: 'fill',
  },
  render: (args) => (
    <div className="h-40 w-full rounded-lg border border-(--ids-color-outline) p-4">
      <HStack {...args}>
        <Button>첫 번째</Button>
        <Button variant="outline">두 번째</Button>
        <Button variant="ghost">세 번째</Button>
      </HStack>
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <HStack gap={12} crossAxis="center">
      <div className="h-16 w-20 rounded-md bg-(--ids-color-primary)" />
      <div className="h-10 w-20 rounded-md bg-(--ids-color-secondary)" />
      <div className="h-24 w-20 rounded-md bg-(--ids-color-muted)" />
    </HStack>
  ),
};
