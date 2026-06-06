import { Sad01Icon } from 'hugeicons-react';

import { Button } from '../button';

import { Empty } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Empty> = {
  title: 'Components/Empty',
  component: Empty,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Empty>;

export const PotgEmpty: Story = {
  render: () => (
    <Empty>
      <Empty.Media>
        <Sad01Icon size={56} />
      </Empty.Media>
      <Empty.Title>해당 조건의 택시 팟이 존재하지 않습니다</Empty.Title>
      <Empty.Actions>
        <Button variant="outline">새 팟 만들기</Button>
      </Empty.Actions>
    </Empty>
  ),
};
