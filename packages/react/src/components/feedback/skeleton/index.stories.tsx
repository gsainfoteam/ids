import { useState } from 'react';

import { expect, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Avatar } from '../../data/avatar';
import { Card } from '../../data/card';
import { Chip } from '../../data/chip';
import { Item } from '../../data/item';
import { ItemGroup } from '../../data/item-group';

import { Skeleton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const animations = ['pulse', 'wave', 'none'] as const;
const wrappings = ['div', 'asChild'] as const;
const members = [
  { name: '김지스트', team: '인포팀 프론트엔드' },
  { name: '이인포', team: '인포팀 디자인' },
  { name: '박팀장', team: '인포팀 팀장' },
];

const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    animation: { control: 'radio', options: animations },
    loading: { control: 'boolean' },
    asChild: { control: false },
    children: { control: false },
  },
  args: {
    loading: true,
    animation: 'pulse',
    className: cn('max-w-sm'),
    children: (
      <Card>
        <Card.Header>
          <Card.Title>2026 가을 학기 공지</Card.Title>
          <Card.Description>수강 신청 일정과 유의 사항을 확인하세요.</Card.Description>
        </Card.Header>
      </Card>
    ),
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

const heightOf = (element: Element) => element.getBoundingClientRect().height;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <div className="max-w-sm">
      <Skeleton loading>
        <Card>
          <Card.Header>
            <Card.Title>2026 가을 학기 공지</Card.Title>
            <Card.Description>수강 신청 일정과 유의 사항을 확인하세요.</Card.Description>
          </Card.Header>
        </Card>
      </Skeleton>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Wrapping × Animation"
        description="div 는 감싼 자식의 크기 그대로 standard 모서리로 칠하고, asChild 는 자식 요소를 직접 칠해 그 모서리를 지킵니다."
      >
        <Showcase.Matrix
          rows={wrappings}
          columns={animations}
          render={(wrapping, animation) => (
            <div className="w-48">
              <Skeleton loading animation={animation} asChild={wrapping === 'asChild'}>
                <Card>
                  <Card.Title>학기 공지</Card.Title>
                  <Card.Description>9월 1일 오전 10시</Card.Description>
                </Card>
              </Skeleton>
            </div>
          )}
        />
        <Showcase.Row label="wave, rtl">
          <div dir="rtl" className="w-48">
            <Skeleton loading animation="wave">
              <p className="text-body-b3-regular">수강 신청은 9월 1일에 열립니다.</p>
            </Skeleton>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Loading"
        description="끝나면 속성과 클래스만 빠지고 같은 구조에서 자식이 보입니다."
      >
        <Showcase.Row label="loading" className="items-start">
          <div className="w-48">
            <Skeleton loading>
              <p className="text-body-b3-regular">수강 신청은 9월 1일 오전 10시에 열립니다.</p>
            </Skeleton>
          </div>
        </Showcase.Row>
        <Showcase.Row label="loading={false}" className="items-start">
          <div className="w-48">
            <Skeleton loading={false}>
              <p className="text-body-b3-regular">수강 신청은 9월 1일 오전 10시에 열립니다.</p>
            </Skeleton>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Components"
        description="인라인 컴포넌트는 asChild 로 칠해서 그 크기와 모서리를 그대로 씁니다."
      >
        <Showcase.Row label="Avatar">
          <Skeleton loading asChild>
            <Avatar name="김지스트" />
          </Skeleton>
          <Skeleton loading asChild>
            <Avatar name="김지스트" size="tiny" />
          </Skeleton>
        </Showcase.Row>
        <Showcase.Row label="Chip">
          <Skeleton loading asChild>
            <Chip>새 글</Chip>
          </Skeleton>
        </Showcase.Row>
        <Showcase.Row label="Button">
          <Skeleton loading asChild>
            <Button>자세히 보기</Button>
          </Skeleton>
        </Showcase.Row>
        <Showcase.Row label="Text" className="items-start">
          <div className="w-fit">
            <Skeleton loading>
              <p className="text-body-b2-semibold">학기 공지</p>
            </Skeleton>
          </div>
          <div className="w-fit">
            <Skeleton loading>
              <p className="text-caption-c1-regular">인포팀 · 3분 전</p>
            </Skeleton>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const ShowACardWhileItLoads: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(true);

    return (
      <div className="flex max-w-sm flex-col items-start gap-4">
        <Button variant="outline" onClick={() => setLoading((value) => !value)}>
          {loading ? '불러오기 끝내기' : '다시 불러오기'}
        </Button>
        <Skeleton loading={loading}>
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
          '`loading` 이면 감싼 div 에 aria-busy 가 붙고, 자식은 보이지 않고 inert 라 Tab 과 스크린 리더가 들어가지 않습니다. 끝나면 속성과 클래스만 빠지고 구조는 그대로라 화면이 밀리지 않고 자식이 다시 마운트되지 않습니다.',
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

export const KeepTheShapeOfAnAvatarOrCard: Story = {
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
          <div className="w-64">
            <Skeleton loading={loading} asChild>
              <Card>
                <Card.Title>김지스트</Card.Title>
                <Card.Description>인포팀 프론트엔드</Card.Description>
              </Card>
            </Skeleton>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`asChild` 면 감싸는 div 없이 자식 요소를 직접 칠합니다. Avatar 는 원, Card 는 concentric 모서리를 그대로 지킵니다. 칠하는 동안 그 요소가 inert 라 사진 이름이나 카드 제목을 읽지 않습니다.',
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

export const HoldTheHeightOfText: Story = {
  render: () => (
    <div className="flex items-start gap-4">
      <div className="w-40">
        <Skeleton loading data-testid="loading">
          <p className="text-body-b3-regular">수강 신청은 9월 1일 오전 10시에 열립니다.</p>
        </Skeleton>
      </div>
      <div className="w-40">
        <Skeleton loading={false} data-testid="loaded">
          <p className="text-body-b3-regular">수강 신청은 9월 1일 오전 10시에 열립니다.</p>
        </Skeleton>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '글 자리는 실제 글자 스타일의 `<p>` 를 placeholder 글과 함께 감쌉니다. 칠한 상자는 그 글의 높이 그대로라 내용이 들어와도 아래가 밀리지 않습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const loading = heightOf(canvas.getByTestId('loading'));
    const loaded = heightOf(canvas.getByTestId('loaded'));
    await expect(Math.abs(loading - loaded)).toBeLessThan(0.5);
  },
};

export const LoadAList: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(true);

    return (
      <div className="flex max-w-sm flex-col items-start gap-4">
        <Button variant="outline" onClick={() => setLoading((value) => !value)}>
          {loading ? '불러오기 끝내기' : '다시 불러오기'}
        </Button>
        <ItemGroup aria-label="멤버" aria-busy={loading}>
          {members.map((member) => (
            <Item key={member.name}>
              <Item.Media>
                <Skeleton loading={loading} asChild>
                  <Avatar name={member.name} />
                </Skeleton>
              </Item.Media>
              <Item.Content>
                <div className="w-fit">
                  <Skeleton loading={loading} asChild>
                    <Item.Title>{member.name}</Item.Title>
                  </Skeleton>
                </div>
                <div className="w-fit">
                  <Skeleton loading={loading} asChild>
                    <Item.Description>{member.team}</Item.Description>
                  </Skeleton>
                </div>
              </Item.Content>
            </Item>
          ))}
        </ItemGroup>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '목록은 placeholder 데이터로 실제 Item 을 그리고 그 부분을 `asChild` 로 칠합니다. 칠한 요소는 inert 라 스크린 리더가 읽지 않고, 목록의 `aria-busy` 는 앱이 둡니다. "불러오는 중" 알림은 Spinner 나 앱의 상태 문구가 한 번 맡습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const list = canvas.getByRole('list', { name: '멤버' });
    await expect(list).toHaveAttribute('aria-busy', 'true');
    const painted = list.querySelectorAll('[data-skeleton]');
    await expect(painted).toHaveLength(members.length * 3);
    for (const element of painted) await expect(element).toHaveAttribute('inert');

    await userEvent.click(canvas.getByRole('button', { name: '불러오기 끝내기' }));
    const loaded = canvas.getByRole('list', { name: '멤버' });
    await expect(loaded).toHaveAttribute('aria-busy', 'false');
    await expect(loaded.querySelector('[data-loading]')).toBeNull();
    await expect(within(loaded).getAllByRole('img')).toHaveLength(members.length);
  },
};
