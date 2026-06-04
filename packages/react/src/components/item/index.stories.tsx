import { UserCircle02Icon, Logout03Icon, Settings02Icon, MessageEdit01Icon } from 'hugeicons-react';

import { Divider } from '../divider';
import { VStack } from '../vstack';

import { Item } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Item> = {
  title: 'Components/Item',
  component: Item,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Item>;

export const Basic: Story = {
  args: {
    leading: <UserCircle02Icon size={20} />,
    title: '계정',
    description: '회원 정보 수정 · 아이디 및 비밀번호 변경',
  },
};

export const ProfileMenu: Story = {
  render: () => (
    <VStack gap={0} className="max-w-sm">
      <Item
        leading={<UserCircle02Icon size={20} />}
        title="계정"
        description="회원 정보 수정 · 아이디 및 비밀번호 변경"
        onClick={() => {}}
      />
      <Divider />
      <Item leading={<Logout03Icon size={20} />} title="로그아웃" onClick={() => {}} />
      <Divider />
      <Item
        leading={<Settings02Icon size={20} />}
        title="설정"
        description="알림 · 언어 · 정보"
        onClick={() => {}}
      />
      <Divider />
      <Item leading={<MessageEdit01Icon size={20} />} title="피드백 · 버그 제보하기" onClick={() => {}} />
    </VStack>
  ),
};
