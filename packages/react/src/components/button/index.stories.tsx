import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '.';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['solid', 'outline', 'ghost'] },
    size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Solid: Story = {
  args: { children: '확인', variant: 'solid', size: 'md' },
};

export const Outline: Story = {
  args: { children: '취소', variant: 'outline', size: 'md' },
};

export const Ghost: Story = {
  args: { children: '더보기', variant: 'ghost', size: 'md' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button variant="solid">확인</Button>
      <Button variant="outline">취소</Button>
      <Button variant="ghost">더보기</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
      <Button size="lg">lg</Button>
      <Button size="xl">xl</Button>
    </div>
  ),
};
