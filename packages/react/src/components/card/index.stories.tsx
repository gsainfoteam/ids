import { useState } from 'react';

import { expect, userEvent } from 'storybook/test';

import { Button } from '../button';

import { Card } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  args: { variant: 'outline' },
  argTypes: {
    variant: { control: 'radio', options: ['outline', 'elevated', 'filled', 'ghost'] },
    interactive: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  render: (args) => (
    <Card {...args}>
      <Card.Header>
        <Card.Title>새 프로젝트 만들기</Card.Title>
        <Card.Description>프로젝트 정보를 입력해주세요.</Card.Description>
      </Card.Header>
      <Card.Content>이름과 설명을 채우면 바로 시작할 수 있습니다.</Card.Content>
      <Card.Footer>
        <Button variant="ghost">취소</Button>
        <Button>만들기</Button>
      </Card.Footer>
    </Card>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('새 프로젝트 만들기')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /프로젝트 정보/ })).not.toBeInTheDocument();
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['outline', 'elevated', 'filled', 'ghost'] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          <Card.Header>
            <Card.Title>{variant}</Card.Title>
            <Card.Description>variant=&quot;{variant}&quot;</Card.Description>
          </Card.Header>
        </Card>
      ))}
    </div>
  ),
};

export const SectionsAreOptional: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Card>
        <Card.Header>
          <Card.Description>이번 달 매출</Card.Description>
          <Card.Title className="text-headline-h4-bold">₩12,345,678</Card.Title>
        </Card.Header>
        <Card.Footer>지난 달 대비 +12.5%</Card.Footer>
      </Card>
      <Card>
        <Card.Content>Content만 있는 카드.</Card.Content>
      </Card>
    </div>
  ),
};

export const ContentBeforeHeader: Story = {
  render: () => (
    <Card variant="elevated">
      <Card.Content className="p-0">
        <div className="aspect-video w-full rounded-t-xl bg-(--ids-color-muted)" />
      </Card.Content>
      <Card.Header>
        <Card.Title>기계식 키보드</Card.Title>
        <Card.Description>₩129,000</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button className="w-full">장바구니</Button>
      </Card.Footer>
    </Card>
  ),
};

export const Interactive: Story = {
  render: function Interactive() {
    const [clicks, setClicks] = useState(0);

    return (
      <div className="flex flex-col gap-2">
        <Card onClick={() => setClicks((prev) => prev + 1)}>
          <Card.Header>
            <Card.Title>클릭 가능한 카드</Card.Title>
            <Card.Description>onClick만 줘도 interactive가 켜진다.</Card.Description>
          </Card.Header>
        </Card>
        <output data-testid="clicks">{clicks}</output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const card = canvas.getByRole('button', { name: /클릭 가능한 카드/ });
    await expect(card).toHaveAttribute('tabindex', '0');

    await userEvent.click(card);
    await expect(canvas.getByTestId('clicks')).toHaveTextContent('1');

    card.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('clicks')).toHaveTextContent('2');
    await userEvent.keyboard(' ');
    await expect(canvas.getByTestId('clicks')).toHaveTextContent('3');
  },
};

export const AsChildLink: Story = {
  render: () => (
    <Card interactive asChild>
      <a href="#card">
        <Card.Header>
          <Card.Title>링크가 된 카드</Card.Title>
          <Card.Description>카드 전체가 앵커다.</Card.Description>
        </Card.Header>
      </a>
    </Card>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /링크가 된 카드/ });
    await expect(link).not.toHaveAttribute('role', 'button');
    await expect(link).not.toHaveAttribute('tabindex');
    await expect(link).toHaveClass('cursor-pointer');
  },
};
