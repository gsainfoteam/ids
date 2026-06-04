import { Badge } from '../badge';
import { HStack } from '../hstack';
import { Text } from '../text';
import { VStack } from '../vstack';

import { Card } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  render: () => (
    <Card>
      <Text>기본 카드</Text>
    </Card>
  ),
};

export const PotgRoute: Story = {
  render: () => (
    <Card className="max-w-sm">
      <VStack gap={4}>
        <Text variant="label" color="muted">지스트 → 송정역</Text>
        <Text variant="title">13:10~14:00</Text>
      </VStack>
      <HStack mainAxis="end" className="mt-2">
        <Badge variant="outline">정원 1/4</Badge>
      </HStack>
    </Card>
  ),
};
