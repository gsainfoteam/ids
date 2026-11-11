import { useState } from 'react';

import { expect, userEvent, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Card } from '../../data/card';
import { Item } from '../../data/item';
import { TextField } from '../../form/text-field';

import { Highlight } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['soft', 'solid'] as const;

const meta = {
  title: 'Typography/Highlight',
  component: Highlight,
  tags: ['autodocs'],
  argTypes: {
    query: { control: 'object' },
    variant: { control: 'radio', options: variants },
    children: { control: 'text' },
  },
  args: {
    query: '셔틀',
    variant: 'soft',
    children: '개천절 셔틀은 주말 시간표로 다녀요. 셔틀 막차는 밤 11시예요.',
  },
} satisfies Meta<typeof Highlight>;

export default meta;
type Story = StoryObj<typeof meta>;

const marksIn = (element: HTMLElement) =>
  Array.from(element.querySelectorAll('mark'), (mark) => mark.textContent);

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant">
        {variants.map((variant) => (
          <Showcase.Row key={variant} label={variant}>
            <p className="text-body-b3-regular">
              <Highlight query="셔틀" variant={variant}>
                2학기 셔틀 시간표가 나왔어요.
              </Highlight>
            </p>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Query"
        description="낱말 하나나 여럿을 받습니다. 겹치거나 맞닿은 구간은 한 mark 로 합칩니다."
      >
        <Showcase.Row label="one">
          <Highlight query="react">React and Flutter share one design system.</Highlight>
        </Showcase.Row>
        <Showcase.Row label="several">
          <Highlight query={['react', 'flutter']}>
            React and Flutter share one design system.
          </Highlight>
        </Showcase.Row>
        <Showcase.Row label="overlapping">
          <Highlight query={['광주송정', '송정역']}>광주송정역행 셔틀</Highlight>
        </Showcase.Row>
        <Showcase.Row label="none">
          <Highlight query="버스">광주송정역행 셔틀</Highlight>
        </Showcase.Row>
        <Showcase.Row label="empty">
          <Highlight query="">광주송정역행 셔틀</Highlight>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Matching"
        description="Select 검색과 같은 규칙으로 맞춥니다. 대소문자, 전각, 악센트를 가리지 않습니다."
      >
        <Showcase.Row label="case">
          <Highlight query="ids">IDS, Ids, ids</Highlight>
        </Showcase.Row>
        <Showcase.Row label="full width">
          <Highlight query="gist">ＧＩＳＴ 셔틀</Highlight>
        </Showcase.Row>
        <Showcase.Row label="accent">
          <Highlight query="cafe">Café de GIST</Highlight>
        </Showcase.Row>
        <Showcase.Row label="symbols">
          <Highlight query="(a+b)*">(a+b)* = a* + b*</Highlight>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Mark">
        <Showcase.Row label="custom">
          <Highlight query="셔틀">
            셔틀 막차는 밤 11시예요.
            <Highlight.Mark className="font-semibold" />
          </Highlight>
        </Showcase.Row>
        <Showcase.Row label="alone">
          <p className="text-body-b3-regular">
            신청은 <Highlight.Mark>금요일까지</Highlight.Mark> 받아요.
          </p>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

const POSTS = [
  {
    id: 'timetable',
    title: '2학기 셔틀 시간표',
    description: '평일과 주말, 광주송정역과 교내 순환',
  },
  { id: 'holiday', title: '개천절 셔틀은 주말 시간표로 다녀요', description: '광주송정역 노선' },
  { id: 'stop', title: '학생회관 정류장', description: '모든 셔틀이 서요' },
];

export const SearchResults: Story = {
  render: function Render() {
    const [query, setQuery] = useState('셔틀');

    return (
      <div className="flex max-w-md flex-col gap-4">
        <TextField
          type="search"
          aria-label="글 찾기"
          value={query}
          onValueChange={setQuery}
          data-1p-ignore
          data-lpignore="true"
        />
        <Card size="tiny">
          <Item.Group aria-label="검색 결과">
            {POSTS.map((post) => (
              <Item key={post.id}>
                <Item.Content>
                  <Item.Title>
                    <Highlight query={query}>{post.title}</Highlight>
                  </Item.Title>
                  <Item.Description>
                    <Highlight query={query}>{post.description}</Highlight>
                  </Item.Description>
                </Item.Content>
              </Item>
            ))}
          </Item.Group>
        </Card>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const results = () => canvas.getByRole('list', { name: '검색 결과' });

    await expect(marksIn(results())).toEqual(['셔틀', '셔틀', '셔틀']);

    await userEvent.clear(canvas.getByRole('searchbox', { name: '글 찾기' }));
    await userEvent.type(canvas.getByRole('searchbox', { name: '글 찾기' }), '광주송정');
    await expect(marksIn(results())).toEqual(['광주송정', '광주송정']);

    await userEvent.clear(canvas.getByRole('searchbox', { name: '글 찾기' }));
    await expect(marksIn(results())).toEqual([]);
  },
};

export const SeveralQueries: Story = {
  args: {
    query: ['react', 'flutter', 'act'],
    children: 'React and Flutter share one design system.',
  },
  play: async ({ canvasElement }) => {
    await expect(marksIn(canvasElement)).toEqual(['React', 'Flutter']);
  },
};

export const FoldedMatching: Story = {
  args: { query: 'cafe gist', children: 'Café ＧＩＳＴ, CAFE gist' },
  play: async ({ canvasElement }) => {
    await expect(marksIn(canvasElement)).toEqual(['Café ＧＩＳＴ', 'CAFE gist']);
  },
};

export const CustomMark: Story = {
  render: (args) => (
    <Highlight {...args}>
      {args.children}
      <Highlight.Mark variant="solid" className="font-semibold" />
    </Highlight>
  ),
  play: async ({ canvasElement }) => {
    const marks = canvasElement.querySelectorAll('mark');

    await expect(marks).toHaveLength(2);
    for (const mark of marks) {
      await expect(mark).toHaveAttribute('data-variant', 'solid');
      await expect(mark).toHaveClass('font-semibold');
    }
  },
};
