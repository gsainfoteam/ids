import { Tabs } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Basic: Story = {
  render: () => (
    <Tabs defaultValue="notice" className="max-w-sm">
      <Tabs.List>
        <Tabs.Trigger value="intro">소개</Tabs.Trigger>
        <Tabs.Trigger value="notice">공지</Tabs.Trigger>
        <Tabs.Trigger value="members">멤버</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="intro" className="p-4">
        소개 콘텐츠
      </Tabs.Panel>
      <Tabs.Panel value="notice" className="p-4">
        공지 콘텐츠
      </Tabs.Panel>
      <Tabs.Panel value="members" className="p-4">
        멤버 콘텐츠
      </Tabs.Panel>
    </Tabs>
  ),
};
