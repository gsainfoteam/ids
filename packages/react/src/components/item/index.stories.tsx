import { useState } from 'react';

import {
  BellIcon,
  Cog6ToothIcon,
  DocumentIcon,
  EllipsisVerticalIcon,
  MoonIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { expect, userEvent } from 'storybook/test';

import { Avatar } from '../avatar';
import { AvatarGroup } from '../avatar-group';
import { Badge } from '../badge';
import { IconButton } from '../icon-button';
import { Kbd } from '../kbd';

import { Item } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Item> = {
  title: 'Components/Item',
  component: Item,
  tags: ['autodocs'],
  args: { size: 'standard' },
  argTypes: {
    size: { control: 'radio', options: ['standard', 'tiny'] },
    interactive: { control: 'boolean' },
    selected: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Item>;

export const Playground: Story = {
  render: (args) => (
    <Item {...args}>
      <Item.Media>
        <Avatar name="김철수" size="tiny" />
      </Item.Media>
      <Item.Content>
        <Item.Title>김철수</Item.Title>
        <Item.Description>kim@example.com</Item.Description>
      </Item.Content>
      <Item.Actions>
        <IconButton aria-label="더보기" size="tiny" icon={<EllipsisVerticalIcon />} />
      </Item.Actions>
    </Item>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('김철수')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /kim@example/ })).not.toBeInTheDocument();
  },
};

export const IconAnchor: Story = {
  render: () => (
    <Item>
      <Item.Media>
        <BellIcon />
      </Item.Media>
      <Item.Content>
        <Item.Title>새 메시지가 도착했습니다</Item.Title>
        <Item.Description>2분 전</Item.Description>
      </Item.Content>
    </Item>
  ),
};

export const AvatarGroupAnchor: Story = {
  render: () => (
    <Item>
      <Item.Media>
        <AvatarGroup size="tiny" max={3} aria-label="채팅 멤버">
          {['Alice Kim', 'Bob Lee', 'Carol Park', '류현승'].map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
      </Item.Media>
      <Item.Content>
        <Item.Title>디자인 시스템</Item.Title>
        <Item.Description>토큰 정리 끝났습니다</Item.Description>
      </Item.Content>
      <Item.Actions>
        <Badge colorScheme="danger" variant="solid" size="tiny">
          3
        </Badge>
      </Item.Actions>
    </Item>
  ),
};

export const MenuList: Story = {
  render: () => (
    <ul className="flex flex-col">
      <li>
        <Item interactive>
          <Item.Media>
            <UserIcon />
          </Item.Media>
          <Item.Content>프로필</Item.Content>
        </Item>
      </li>
      <li>
        <Item interactive>
          <Item.Media>
            <Cog6ToothIcon />
          </Item.Media>
          <Item.Content>설정</Item.Content>
          <Item.Actions>
            <Kbd size="tiny">⌘,</Kbd>
          </Item.Actions>
        </Item>
      </li>
      <li>
        <Item interactive>
          <Item.Media>
            <MoonIcon />
          </Item.Media>
          <Item.Content>다크 모드</Item.Content>
        </Item>
      </li>
    </ul>
  ),
};

export const Interactive: Story = {
  render: function Interactive() {
    const [clicks, setClicks] = useState(0);

    return (
      <div className="flex flex-col gap-2">
        <Item onClick={() => setClicks((prev) => prev + 1)}>
          <Item.Media>
            <BellIcon />
          </Item.Media>
          <Item.Content>
            <Item.Title>클릭 가능한 항목</Item.Title>
          </Item.Content>
        </Item>
        <output data-testid="clicks">{clicks}</output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const item = canvas.getByRole('button', { name: /클릭 가능한 항목/ });
    await expect(item).toHaveAttribute('tabindex', '0');

    await userEvent.click(item);
    await expect(canvas.getByTestId('clicks')).toHaveTextContent('1');

    item.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('clicks')).toHaveTextContent('2');
  },
};

export const Selectable: Story = {
  render: function Selectable() {
    const files = ['보고서.pdf', '예산안.xlsx', '회의록.md'];
    const [selected, setSelected] = useState<string | null>(files[0]);

    return (
      <ul className="flex flex-col">
        {files.map((file) => (
          <li key={file}>
            <Item interactive selected={selected === file} onClick={() => setSelected(file)}>
              <Item.Media>
                <DocumentIcon />
              </Item.Media>
              <Item.Content>{file}</Item.Content>
            </Item>
          </li>
        ))}
      </ul>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /보고서/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await userEvent.click(canvas.getByRole('button', { name: /예산안/ }));
    await expect(canvas.getByRole('button', { name: /예산안/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('button', { name: /보고서/ })).not.toHaveAttribute(
      'aria-selected',
    );
  },
};

export const AsChildLink: Story = {
  render: () => (
    <Item interactive asChild>
      <a href="#item">
        <Item.Media>
          <DocumentIcon />
        </Item.Media>
        <Item.Content>
          <Item.Title>링크가 된 항목</Item.Title>
          <Item.Description>행 전체가 앵커다.</Item.Description>
        </Item.Content>
      </a>
    </Item>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /링크가 된 항목/ });
    await expect(link).not.toHaveAttribute('role', 'button');
    await expect(link).not.toHaveAttribute('tabindex');
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(['standard', 'tiny'] as const).map((size) => (
        <Item key={size} size={size}>
          <Item.Media>
            <BellIcon />
          </Item.Media>
          <Item.Content>
            <Item.Title>{size}</Item.Title>
          </Item.Content>
        </Item>
      ))}
    </div>
  ),
};
