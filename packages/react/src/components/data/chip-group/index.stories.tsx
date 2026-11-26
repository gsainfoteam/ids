import { useState } from 'react';

import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Chip } from '../chip';

import { ChipGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Data/ChipGroup',
  component: ChipGroup,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: sizes },
  },
  args: { size: 'standard', 'aria-label': '태그' },
  render: (args) => (
    <div className="w-80">
      <ChipGroup {...args}>
        <Chip>frontend</Chip>
        <Chip>react</Chip>
        <Chip>design</Chip>
        <Chip>typescript</Chip>
      </ChipGroup>
    </div>
  ),
} satisfies Meta<typeof ChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <ChipGroup aria-label="태그">
      <Chip>frontend</Chip>
      <Chip>react</Chip>
      <Chip>design</Chip>
    </ChipGroup>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Size">
        {sizes.map((size) => (
          <Showcase.Row key={size} label={size}>
            <div className="w-72">
              <ChipGroup size={size} aria-label={size}>
                <Chip>frontend</Chip>
                <Chip variant="outline">react</Chip>
                <Chip colorScheme="primary">design</Chip>
                <Chip onRemove={() => {}}>typescript</Chip>
                <Chip defaultSelected>tailwind</Chip>
              </ChipGroup>
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>
      <Showcase.Section title="Wrap">
        <Showcase.Row label="narrow">
          <div className="w-40">
            <ChipGroup aria-label="좁은 폭">
              <Chip>frontend</Chip>
              <Chip>react</Chip>
              <Chip>design</Chip>
              <Chip>typescript</Chip>
            </ChipGroup>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const RemoveTagsWithTheKeyboard: Story = {
  render: function Render() {
    const [tags, setTags] = useState(['frontend', 'react', 'design']);

    return (
      <div className="flex flex-col items-start gap-3">
        <ChipGroup aria-label="태그">
          {tags.map((tag) => (
            <Chip key={tag} onRemove={() => setTags((prev) => prev.filter((item) => item !== tag))}>
              {tag}
            </Chip>
          ))}
        </ChipGroup>
        <output aria-label="남은 태그">{tags.join(',')}</output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '그룹 안의 칩을 Backspace나 Delete로 지우면 포커스가 같은 그룹의 다음 칩으로, 마지막 칩이었다면 앞 칩으로 갑니다. 칩은 그룹이 준 context 로 옆 칩을 찾습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole('button', { name: 'react 삭제' }).focus();
    await userEvent.keyboard('{Backspace}');
    await expect(canvas.getByLabelText('남은 태그')).toHaveTextContent('frontend,design');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'design 삭제' })).toHaveFocus());
    await userEvent.keyboard('{Delete}');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'frontend 삭제' })).toHaveFocus(),
    );
  },
};

export const ListTheChips: Story = {
  render: () => (
    <ChipGroup asChild size="tiny" aria-label="관심사">
      <ul>
        {['디자인', '사진', '등산'].map((interest) => (
          <li key={interest}>
            <Chip variant="outline">{interest}</Chip>
          </li>
        ))}
      </ul>
    </ChipGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`asChild` 로 `<ul>` 을 넘기면 그 목록에 간격을 입히고 `role="group"` 은 붙이지 않아, 스크린 리더가 목록으로 읽습니다. `size` 는 안의 칩으로 이어집니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list', { name: '관심사' });
    await expect(list.tagName).toBe('UL');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(canvas.getByText('사진').closest('[data-chip]')).toHaveAttribute(
      'data-size',
      'tiny',
    );
  },
};
