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
  render: () => (
    <Item>
      <Item.Leading><UserCircle02Icon size={20} /></Item.Leading>
      <Item.Content>
        <Item.Title>계정</Item.Title>
        <Item.Description>회원 정보 수정 · 아이디 및 비밀번호 변경</Item.Description>
      </Item.Content>
    </Item>
  ),
};

export const ProfileMenu: Story = {
  render: () => (
    <VStack gap={0} className="max-w-sm">
      <Item onClick={() => {}}>
        <Item.Leading><UserCircle02Icon size={20} /></Item.Leading>
        <Item.Content>
          <Item.Title>계정</Item.Title>
          <Item.Description>회원 정보 수정 · 아이디 및 비밀번호 변경</Item.Description>
        </Item.Content>
      </Item>
      <Divider />
      <Item onClick={() => {}}>
        <Item.Leading><Logout03Icon size={20} /></Item.Leading>
        <Item.Content>
          <Item.Title>로그아웃</Item.Title>
        </Item.Content>
      </Item>
      <Divider />
      <Item onClick={() => {}}>
        <Item.Leading><Settings02Icon size={20} /></Item.Leading>
        <Item.Content>
          <Item.Title>설정</Item.Title>
          <Item.Description>알림 · 언어 · 정보</Item.Description>
        </Item.Content>
      </Item>
      <Divider />
      <Item onClick={() => {}}>
        <Item.Leading><MessageEdit01Icon size={20} /></Item.Leading>
        <Item.Content>
          <Item.Title>피드백 · 버그 제보하기</Item.Title>
        </Item.Content>
      </Item>
    </VStack>
  ),
};
