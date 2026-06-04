import { Text } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['display', 'heading', 'title', 'body', 'label', 'caption'] },
    color: { control: 'radio', options: ['on-surface', 'muted', 'primary'] },
    align: { control: 'radio', options: ['left', 'center', 'right'] },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Text variant="display">Display</Text>
      <Text variant="heading">Heading</Text>
      <Text variant="title">Title</Text>
      <Text variant="body">Body</Text>
      <Text variant="label">Label</Text>
      <Text variant="caption">Caption</Text>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text color="on-surface">Default (on-surface)</Text>
      <Text color="muted">Muted</Text>
      <Text color="primary">Primary</Text>
    </div>
  ),
};
