import { Badge } from '../badge';
import { HStack } from '../hstack';
import { Text } from '../text';

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
      <Card.Content>
        <Text>기본 카드</Text>
      </Card.Content>
    </Card>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Card className="max-w-sm">
      <Card.Header>
        <Card.Title>공지 제목</Card.Title>
        <Card.Description>2024년 3월 30일</Card.Description>
      </Card.Header>
      <Card.Content>
        <Text variant="body">카드 본문 내용이 들어갑니다.</Text>
      </Card.Content>
      <Card.Footer>
        <HStack gap={6}>
          <Badge variant="soft">#모집</Badge>
          <Badge variant="soft">#인포팀</Badge>
        </HStack>
      </Card.Footer>
    </Card>
  ),
};

export const PotgRoute: Story = {
  render: () => (
    <Card className="max-w-sm">
      <Card.Header>
        <Card.Description>지스트 → 송정역</Card.Description>
        <Card.Title>13:10~14:00</Card.Title>
      </Card.Header>
      <Card.Footer>
        <HStack mainAxis="end" fit="fill">
          <Badge variant="outline">정원 1/4</Badge>
        </HStack>
      </Card.Footer>
    </Card>
  ),
};
