import { useState } from 'react';

import { expect, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { Avatar } from '../../data/avatar';
import { Card } from '../../data/card';
import { Item } from '../../data/item';

import { Skeleton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const shapes = ['rect', 'circle', 'text'] as const;
const animations = ['pulse', 'wave', 'none'] as const;
const members = ['김지스트', '이인포', '박팀장'];

const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    shape: { control: 'radio', options: shapes },
    lines: { control: { type: 'number', min: 1, max: 6 } },
    animation: { control: 'radio', options: animations },
    loading: { control: false },
    asChild: { control: false },
  },
  args: { shape: 'text', lines: 3, animation: 'pulse' },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

const heightOf = (element: Element) => element.getBoundingClientRect().height;

export const Playground: Story = {
  render: (args) => <Skeleton {...args} className="text-body-b3-regular max-w-sm" />,
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Shape × Animation"
        description="rect 는 16px 높이에 너비를 채우고, circle 은 Avatar 와 같은 40px, text 는 글자 스타일의 줄 높이를 따릅니다."
      >
        <Showcase.Matrix
          rows={shapes}
          columns={animations}
          render={(shape, animation) =>
            shape === 'circle' ? (
              <Skeleton shape="circle" animation={animation} />
            ) : (
              <Skeleton
                shape={shape}
                animation={animation}
                lines={2}
                className="text-body-b3-regular w-40"
              />
            )
          }
        />
        <Showcase.Row label="wave, rtl">
          <div dir="rtl" className="w-40">
            <Skeleton animation="wave" />
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Text"
        description="줄마다 그 글자 스타일의 줄 높이 한 칸에 1em 막대를 그립니다. 여러 줄이면 마지막 줄은 60% 입니다."
      >
        <Showcase.Row label="subtitle-s2" className="items-start">
          <Skeleton shape="text" className="text-subtitle-s2-semibold w-48" />
          <p className="text-subtitle-s2-semibold w-48">학기 공지</p>
        </Showcase.Row>
        <Showcase.Row label="body-b3 × 3" className="items-start">
          <Skeleton shape="text" lines={3} className="text-body-b3-regular w-48" />
          <p className="text-body-b3-regular w-48">
            수강 신청은
            <br />
            9월 1일 오전 10시에
            <br />
            열립니다.
          </p>
        </Showcase.Row>
        <Showcase.Row label="caption-c1 × 2" className="items-start">
          <Skeleton shape="text" lines={2} className="text-caption-c1-regular w-48" />
          <p className="text-caption-c1-regular w-48">
            인포팀
            <br />
            3분 전
          </p>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Composition"
        description="카드와 행 모양은 모양을 합성해서 만듭니다. 불러오는 영역에는 앱이 aria-busy 를 둡니다."
      >
        <Showcase.Row label="Card" className="items-start">
          <Card className="w-80">
            <div className="flex items-center gap-3">
              <Skeleton shape="circle" />
              <Skeleton shape="text" lines={2} className="text-body-b3-regular flex-1" />
            </div>
            <Skeleton className="aspect-video" />
          </Card>
        </Showcase.Row>
        <Showcase.Row label="Item.Group" className="items-start">
          <Item.Group aria-label="멤버" aria-busy className="w-80">
            {[0, 1, 2].map((index) => (
              <Item key={index}>
                <Item.Media>
                  <Skeleton shape="circle" />
                </Item.Media>
                <Item.Content>
                  <Skeleton shape="text" className="text-body-b3-medium w-1/3" />
                  <Skeleton shape="text" className="text-body-b3-regular w-1/2" />
                </Item.Content>
              </Item>
            ))}
          </Item.Group>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Wrapping"
        description="loading 이면 자식의 크기 그대로 칠하고, 끝나면 같은 구조에서 자식이 보입니다. asChild 는 자식 요소를 직접 칠해 그 모서리를 지킵니다."
      >
        <Showcase.Row label="div" className="items-start">
          <Skeleton loading className="w-64">
            <Card>
              <Card.Title>2026 가을 학기 공지</Card.Title>
              <Card.Description>수강 신청 일정을 확인하세요.</Card.Description>
            </Card>
          </Skeleton>
          <Skeleton loading={false} className="w-64">
            <Card>
              <Card.Title>2026 가을 학기 공지</Card.Title>
              <Card.Description>수강 신청 일정을 확인하세요.</Card.Description>
            </Card>
          </Skeleton>
        </Showcase.Row>
        <Showcase.Row label="asChild" className="items-start">
          <Skeleton loading asChild>
            <Card className="w-64">
              <Card.Title>2026 가을 학기 공지</Card.Title>
              <Card.Description>수강 신청 일정을 확인하세요.</Card.Description>
            </Card>
          </Skeleton>
          <Skeleton loading={false} asChild>
            <Card className="w-64">
              <Card.Title>2026 가을 학기 공지</Card.Title>
              <Card.Description>수강 신청 일정을 확인하세요.</Card.Description>
            </Card>
          </Skeleton>
        </Showcase.Row>
        <Showcase.Row label="Avatar">
          <Skeleton loading asChild>
            <Avatar name="김지스트" />
          </Skeleton>
          <Skeleton loading={false} asChild>
            <Avatar name="김지스트" />
          </Skeleton>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Wrapping: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(true);

    return (
      <div className="flex max-w-sm flex-col items-start gap-4">
        <Button variant="outline" onClick={() => setLoading((value) => !value)}>
          {loading ? '불러오기 끝내기' : '다시 불러오기'}
        </Button>
        <Skeleton loading={loading} className="w-full">
          <Card>
            <Card.Header>
              <Card.Title>2026 가을 학기 공지</Card.Title>
              <Card.Description>수강 신청 일정과 유의 사항을 확인하세요.</Card.Description>
            </Card.Header>
            <Card.Footer>
              <Button size="tiny">자세히 보기</Button>
            </Card.Footer>
          </Card>
        </Skeleton>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'loading 이면 감싼 div 에 aria-busy 가 붙고, 자식은 보이지 않고 inert 라 Tab 과 스크린 리더가 들어가지 않습니다. 끝나면 속성과 클래스만 빠지고 구조는 그대로라 화면이 밀리지 않고 자식이 다시 마운트되지 않습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const wrapper = canvasElement.querySelector<HTMLElement>('[data-skeleton]')!;
    const details = within(wrapper).getByText('자세히 보기').closest('button')!;
    await expect(wrapper).toHaveAttribute('aria-busy', 'true');
    await expect(wrapper.querySelector('[data-skeleton-content]')).toHaveAttribute('inert');
    await expect(details).not.toBeVisible();
    details.focus();
    await expect(details).not.toHaveFocus();

    await userEvent.click(canvas.getByRole('button', { name: '불러오기 끝내기' }));
    const loaded = canvasElement.querySelector<HTMLElement>('[data-skeleton]')!;
    await expect(loaded).not.toHaveAttribute('aria-busy');
    await expect(loaded).not.toHaveAttribute('data-loading');
    const content = loaded.firstElementChild!;
    await expect(content).toHaveAttribute('data-skeleton-content');
    await expect(content).not.toHaveAttribute('inert');
    await expect(content.firstElementChild).toHaveAttribute('data-card');
    await expect(canvas.getByRole('button', { name: '자세히 보기' })).toBeVisible();
  },
};

export const AsChild: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(true);

    return (
      <div className="flex flex-col items-start gap-4">
        <Button variant="outline" onClick={() => setLoading((value) => !value)}>
          {loading ? '불러오기 끝내기' : '다시 불러오기'}
        </Button>
        <div className="flex items-center gap-3">
          <Skeleton loading={loading} asChild>
            <Avatar name="김지스트" />
          </Skeleton>
          <Skeleton loading={loading} asChild>
            <Card className="w-64">
              <Card.Title>김지스트</Card.Title>
              <Card.Description>인포팀 프론트엔드</Card.Description>
            </Card>
          </Skeleton>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'asChild 면 감싸는 div 없이 자식 요소를 직접 칠합니다. Avatar 는 원, Card 는 concentric 모서리를 그대로 지킵니다. 칠하는 동안 그 요소가 inert 라 사진 이름이나 카드 제목을 읽지 않습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const card = canvasElement.querySelector<HTMLElement>('[data-card]')!;
    const radius = getComputedStyle(card).borderRadius;
    for (const painted of [canvasElement.querySelector('[data-avatar]')!, card]) {
      await expect(painted).toHaveAttribute('data-skeleton');
      await expect(painted).toHaveAttribute('aria-busy', 'true');
      await expect(painted).toHaveAttribute('inert');
    }
    await expect(within(card).getByText('인포팀 프론트엔드')).not.toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: '불러오기 끝내기' }));
    const loadedCard = canvasElement.querySelector<HTMLElement>('[data-card]')!;
    await expect(loadedCard).not.toHaveAttribute('inert');
    await expect(getComputedStyle(loadedCard).borderRadius).toBe(radius);
    await expect(canvas.getByRole('img', { name: '김지스트' })).not.toHaveAttribute('inert');
    await expect(canvas.getByText('인포팀 프론트엔드')).toBeVisible();
  },
};

export const TextHeight: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <Skeleton
          data-testid="body-skeleton"
          shape="text"
          lines={3}
          className="text-body-b3-regular w-40"
        />
        <p data-testid="body-text" className="text-body-b3-regular">
          수강 신청은
          <br />
          9월 1일에
          <br />
          열립니다.
        </p>
      </div>
      <div className="flex items-start gap-4">
        <Skeleton
          data-testid="title-skeleton"
          shape="text"
          className="text-subtitle-s2-semibold w-40"
        />
        <p data-testid="title-text" className="text-subtitle-s2-semibold">
          학기 공지
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'text 모양은 줄마다 className 에 준 글자 스타일의 줄 높이(1lh)를 씁니다. 실제 글과 높이가 같아 내용이 들어와도 아래가 밀리지 않습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    for (const part of ['body', 'title']) {
      const skeleton = heightOf(canvas.getByTestId(`${part}-skeleton`));
      const text = heightOf(canvas.getByTestId(`${part}-text`));
      await expect(Math.abs(skeleton - text)).toBeLessThan(0.5);
    }
  },
};

export const BusyRegion: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(true);

    return (
      <div className="flex max-w-sm flex-col items-start gap-4">
        <Button variant="outline" onClick={() => setLoading((value) => !value)}>
          {loading ? '불러오기 끝내기' : '다시 불러오기'}
        </Button>
        <Item.Group aria-label="멤버" aria-busy={loading} className="w-full">
          {loading
            ? members.map((name) => (
                <Item key={name}>
                  <Item.Media>
                    <Skeleton shape="circle" />
                  </Item.Media>
                  <Item.Content>
                    <Skeleton shape="text" className="text-body-b3-medium w-1/3" />
                    <Skeleton shape="text" className="text-body-b3-regular w-1/2" />
                  </Item.Content>
                </Item>
              ))
            : members.map((name) => (
                <Item key={name}>
                  <Item.Media>
                    <Avatar name={name} />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{name}</Item.Title>
                    <Item.Description>인포팀</Item.Description>
                  </Item.Content>
                </Item>
              ))}
        </Item.Group>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '모양만 여러 개 쓰는 영역은 앱이 그 영역에 aria-busy 를 둡니다. 모양은 aria-hidden 이라 스크린 리더가 읽지 않습니다. "불러오는 중" 알림은 Spinner 나 앱의 상태 문구가 한 번 맡습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const list = canvas.getByRole('list', { name: '멤버' });
    await expect(list).toHaveAttribute('aria-busy', 'true');
    for (const shape of list.querySelectorAll('[data-skeleton]'))
      await expect(shape).toHaveAttribute('aria-hidden', 'true');

    await userEvent.click(canvas.getByRole('button', { name: '불러오기 끝내기' }));
    const loaded = canvas.getByRole('list', { name: '멤버' });
    await expect(loaded).toHaveAttribute('aria-busy', 'false');
    await expect(loaded.querySelector('[data-skeleton]')).toBeNull();
    await expect(within(loaded).getAllByRole('img')).toHaveLength(members.length);
  },
};
