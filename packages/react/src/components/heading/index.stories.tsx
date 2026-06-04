import { Heading } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const Levels: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Heading as="h1" variant="display">h1 Display</Heading>
      <Heading as="h2" variant="heading">h2 Heading</Heading>
      <Heading as="h3" variant="title">h3 Title</Heading>
    </div>
  ),
};
