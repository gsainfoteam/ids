import { useState } from 'react';

import { EllipsisHorizontalIcon, HeartIcon } from '@heroicons/react/24/outline';
import { expect, fn } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Avatar } from '../avatar';
import { Chip } from '../chip';

import { Card } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc9ff"/><stop offset="1" stop-color="#e8f1ff"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><circle cx="500" cy="90" r="42" fill="#ffd66b"/><path d="M0 260 L150 150 L260 230 L380 120 L520 240 L640 170 L640 360 L0 360Z" fill="#5a8f6b"/><path d="M0 300 L200 220 L360 290 L520 230 L640 280 L640 360 L0 360Z" fill="#3f6f50"/></svg>',
)}`;

const meta = {
  title: 'Data/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    interactive: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { variant: 'outline', size: 'standard' },
  render: (args) => (
    <Card {...args} className="w-80">
      <Card.Header>
        <Card.Title>새 프로젝트 만들기</Card.Title>
        <Card.Description>프로젝트 정보를 입력해주세요.</Card.Description>
      </Card.Header>
      <Card.Content>이름과 설명을 채우면 바로 시작할 수 있습니다.</Card.Content>
      <Card.Footer className="justify-end">
        <Button variant="ghost">취소</Button>
        <Button>만들기</Button>
      </Card.Footer>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <Card variant={variant} size={size} className="w-56">
              <Card.Header>
                <Card.Title>{variant}</Card.Title>
                <Card.Description>size {size}</Card.Description>
                <Card.Action>
                  <IconButton
                    aria-label="더보기"
                    variant="ghost"
                    size="tiny"
                    icon={<EllipsisHorizontalIcon />}
                  />
                </Card.Action>
              </Card.Header>
              <Card.Content>본문</Card.Content>
              <Card.Footer>
                <Button size="tiny">확인</Button>
              </Card.Footer>
            </Card>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Media"
        description="Card.Media는 가장자리까지 채우고, 닿는 모서리는 카드의 둥근 모서리를 따릅니다. outline의 테두리는 가리지 않습니다."
      >
        <Showcase.Row label="first">
          <Card className="w-64">
            <Card.Media className="aspect-video">
              <img src={PHOTO} alt="" />
            </Card.Media>
            <Card.Header>
              <Card.Title>산책로 사진집</Card.Title>
              <Card.Description>₩24,000</Card.Description>
            </Card.Header>
            <Card.Footer>
              <Button className="w-full">장바구니</Button>
            </Card.Footer>
          </Card>
          <Card variant="soft" className="w-64">
            <Card.Media className="aspect-video">
              <img src={PHOTO} alt="" />
            </Card.Media>
            <Card.Header>
              <Card.Title>산책로 사진집</Card.Title>
              <Card.Description>₩24,000</Card.Description>
            </Card.Header>
            <Card.Footer>
              <Button className="w-full">장바구니</Button>
            </Card.Footer>
          </Card>
        </Showcase.Row>
        <Showcase.Row label="middle · last">
          <Card className="w-64">
            <Card.Header>
              <Card.Title>주말 산책</Card.Title>
              <Card.Description>사진 3장</Card.Description>
            </Card.Header>
            <Card.Media className="aspect-video">
              <img src={PHOTO} alt="" />
            </Card.Media>
            <Card.Footer>
              <Button variant="ghost" size="tiny">
                <HeartIcon />
                좋아요
              </Button>
            </Card.Footer>
          </Card>
          <Card className="w-64">
            <Card.Header>
              <Card.Title>마지막에 오는 사진</Card.Title>
            </Card.Header>
            <Card.Media className="aspect-video">
              <img src={PHOTO} alt="" />
            </Card.Media>
          </Card>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Sections"
        description="Header에 border-b, Footer에 border-t를 주면 카드 너비만큼 구분선이 그어지고 간격이 맞춰집니다."
      >
        <Showcase.Row label="dividers">
          <Card className="w-72">
            <Card.Header className="border-b">
              <Card.Title>알림 설정</Card.Title>
              <Card.Description>받을 알림을 고릅니다.</Card.Description>
            </Card.Header>
            <Card.Content>메일, 푸시, 문자</Card.Content>
            <Card.Footer className="justify-end border-t">
              <Button size="tiny">저장</Button>
            </Card.Footer>
          </Card>
        </Showcase.Row>
        <Showcase.Row label="stat">
          <Card className="w-64">
            <Card.Header>
              <Card.Description>이번 달 매출</Card.Description>
              <Card.Title className="text-headline-h4-bold">₩12,345,678</Card.Title>
              <Card.Action>
                <Chip size="tiny" colorScheme="success">
                  +12.5%
                </Chip>
              </Card.Action>
            </Card.Header>
          </Card>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Interactive">
        <Showcase.Row label="onClick">
          <Card onClick={() => {}} className="w-64">
            <Card.Media className="aspect-video">
              <img src={PHOTO} alt="" />
            </Card.Media>
            <Card.Header>
              <Card.Title>산책로 사진집</Card.Title>
              <Card.Description>₩24,000</Card.Description>
            </Card.Header>
            <Card.Footer>
              <Button className="w-full">장바구니</Button>
            </Card.Footer>
          </Card>
          <Card onClick={() => {}} disabled className="w-64">
            <Card.Media className="aspect-video">
              <img src={PHOTO} alt="" />
            </Card.Media>
            <Card.Header>
              <Card.Title>산책로 사진집</Card.Title>
              <Card.Description>₩24,000</Card.Description>
            </Card.Header>
            <Card.Footer>
              <Button className="w-full">장바구니</Button>
            </Card.Footer>
          </Card>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Anatomy: Story = {
  render: () => (
    <Card className="w-80">
      <Card.Header>
        <Card.Title>팀 초대</Card.Title>
        <Card.Description>링크를 가진 사람은 누구나 들어올 수 있습니다.</Card.Description>
        <Card.Action>
          <Button variant="outline" size="tiny">
            링크 복사
          </Button>
        </Card.Action>
      </Card.Header>
      <Card.Content className="flex items-center gap-2">
        <Avatar name="Alice Kim" size="tiny" />
        <span>Alice Kim 외 3명</span>
      </Card.Content>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'shadcn/ui와 같은 구성입니다. Card.Action은 헤더의 끝 모서리에 붙고, 제목과 설명은 그 옆에서 줄바꿈됩니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const action = canvasElement.querySelector<HTMLElement>('[data-card-action]')!;
    const title = canvasElement.querySelector<HTMLElement>('[data-card-title]')!;
    await expect(getComputedStyle(action).gridColumnStart).toBe('2');
    await expect(action.getBoundingClientRect().top).toBeCloseTo(
      title.getBoundingClientRect().top,
      0,
    );
  },
};

export const MediaBleed: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card className="w-64">
        <Card.Media className="aspect-video">
          <img src={PHOTO} alt="" />
        </Card.Media>
        <Card.Header>
          <Card.Title>산책로 사진집</Card.Title>
          <Card.Description>₩24,000</Card.Description>
        </Card.Header>
        <Card.Footer>
          <Button className="w-full">장바구니</Button>
        </Card.Footer>
      </Card>
      <Card variant="soft" className="w-64">
        <Card.Media className="aspect-video">
          <img src={PHOTO} alt="" />
        </Card.Media>
        <Card.Header>
          <Card.Title>산책로 사진집</Card.Title>
          <Card.Description>₩24,000</Card.Description>
        </Card.Header>
        <Card.Footer>
          <Button className="w-full">장바구니</Button>
        </Card.Footer>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '카드의 패딩이 무엇이든 Card.Media는 가장자리까지 나갑니다. outline 카드에서는 1px 테두리 안쪽까지만 채웁니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const [outline, soft] = [...canvasElement.querySelectorAll<HTMLElement>('[data-card]')];
    const edge = (card: HTMLElement) => {
      const box = card.getBoundingClientRect();
      const media = card.querySelector('[data-card-media]')!.getBoundingClientRect();
      return [media.left - box.left, media.top - box.top, box.right - media.right];
    };
    await expect(edge(outline!)).toEqual([1, 1, 1]);
    await expect(edge(soft!)).toEqual([0, 0, 0]);
  },
};

export const Interactive: Story = {
  args: { onClick: fn() },
  render: function Render(args) {
    const [liked, setLiked] = useState(0);

    return (
      <div className="flex flex-col items-start gap-3">
        <Card className="w-72" onClick={args.onClick}>
          <Card.Header>
            <Card.Title>디자인 리뷰</Card.Title>
            <Card.Description>오늘 오후 3시, 회의실 B</Card.Description>
          </Card.Header>
          <Card.Footer>
            <Button variant="outline" size="tiny" onClick={() => setLiked((count) => count + 1)}>
              <HeartIcon />
              관심
            </Button>
          </Card.Footer>
        </Card>
        <output aria-label="관심 수">{liked}</output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`onClick` 만 주면 카드 어디를 눌러도 열리고, 키보드와 스크린 리더에는 Card.Title이 버튼이 됩니다. 설명은 Card.Description입니다. Enter는 누를 때, Space는 뗄 때 동작하고, 카드 안의 버튼을 눌러도 카드가 함께 열리지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const card = canvas.getByRole('button', { name: '디자인 리뷰' });
    await expect(card).toHaveAccessibleDescription('오늘 오후 3시, 회의실 B');
    await userEvent.click(canvas.getByRole('button', { name: '관심' }));
    await expect(canvas.getByLabelText('관심 수')).toHaveTextContent('1');
    await expect(args.onClick).not.toHaveBeenCalled();
    await userEvent.click(card);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    card.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const LinkCard: Story = {
  render: () => (
    <Card asChild className="w-72">
      <a href="#design-review">
        <Card.Header>
          <Card.Title>디자인 리뷰</Card.Title>
          <Card.Description>회의록 보기</Card.Description>
        </Card.Header>
      </a>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`asChild` 로 카드 전체를 링크로 만듭니다. 링크는 원래 키보드와 포커스를 갖고 있으므로 role을 덧씌우지 않고, 이름은 제목으로 좁힙니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: '디자인 리뷰' });
    await expect(link).not.toHaveAttribute('role');
    await expect(link).not.toHaveAttribute('tabindex');
    await expect(link).toHaveAttribute('data-interactive');
    await expect(link).toHaveAccessibleDescription('회의록 보기');
  },
};

export const Disabled: Story = {
  args: { onClick: fn(), disabled: true },
  play: async ({ canvas, userEvent, args }) => {
    const title = canvas.getByRole('button', { name: '새 프로젝트 만들기' });
    await expect(title).toBeDisabled();
    await expect(title.closest('[data-card]')).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(canvas.getByText('프로젝트 정보를 입력해주세요.'));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
