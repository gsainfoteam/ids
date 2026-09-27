import { useState } from 'react';

import { CheckIcon, TrashIcon } from '@heroicons/react/16/solid';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Chip } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['solid', 'soft', 'outline'] as const;
const colorSchemes = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const;

const meta = {
  title: 'Data/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    colorScheme: { control: 'select', options: colorSchemes },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    disabled: { control: 'boolean' },
  },
  args: { variant: 'soft', colorScheme: 'neutral', size: 'standard', children: 'Beta' },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Color scheme">
        <Showcase.Matrix
          rows={colorSchemes}
          columns={variants}
          render={(colorScheme, variant) => (
            <div className="flex items-center gap-2">
              <Chip variant={variant} colorScheme={colorScheme}>
                {colorScheme}
              </Chip>
              <Chip variant={variant} colorScheme={colorScheme} size="tiny">
                tiny
              </Chip>
              <Chip variant={variant} colorScheme={colorScheme} onRemove={() => {}}>
                삭제 가능
              </Chip>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="selectable">
          <Chip defaultSelected={false}>꺼짐</Chip>
          <Chip defaultSelected>켜짐</Chip>
          <Chip colorScheme="primary" defaultSelected>
            <Chip.Icon>
              <CheckIcon />
            </Chip.Icon>
            primary
          </Chip>
        </Showcase.Row>
        <Showcase.Row label="clickable">
          <Chip onClick={() => {}}>필터</Chip>
          <Chip variant="outline" onClick={() => {}}>
            필터
          </Chip>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <Chip disabled>정적</Chip>
          <Chip disabled defaultSelected>
            선택됨
          </Chip>
          <Chip disabled onRemove={() => {}}>
            삭제 가능
          </Chip>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Composition">
        <Showcase.Row label="icon + label">
          <Chip colorScheme="success">
            <Chip.Icon>
              <CheckIcon />
            </Chip.Icon>
            <Chip.Label>완료</Chip.Label>
          </Chip>
        </Showcase.Row>
        <Showcase.Row label="custom close">
          <Chip colorScheme="danger" variant="outline" onRemove={() => {}}>
            첨부 파일
            <Chip.Close aria-label="첨부 파일 지우기">
              <TrashIcon />
            </Chip.Close>
          </Chip>
        </Showcase.Row>
        <Showcase.Row label="truncate">
          <Chip className="max-w-32" onRemove={() => {}}>
            아주 긴 태그 이름은 말줄임표로 줄어듭니다
          </Chip>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Selectable: Story = {
  args: { colorScheme: 'primary', onSelectedChange: fn(), children: '팔로우' },
  parameters: {
    docs: {
      description: {
        story:
          '`selected` / `defaultSelected` / `onSelectedChange` 를 주면 토글 버튼이 됩니다. 실제 `<button>` 이고 `aria-pressed` 로 눌림 상태를 알립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const chip = canvas.getByRole('button', { name: '팔로우' });
    await expect(chip.tagName).toBe('BUTTON');
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(chip).toHaveAttribute('data-selected');
    await expect(args.onSelectedChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard(' ');
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
  },
};

function TagList() {
  const [tags, setTags] = useState(['frontend', 'react', 'design']);
  return (
    <div className="flex flex-col items-start gap-3">
      <ul className="flex flex-wrap gap-2" aria-label="태그">
        {tags.map((tag) => (
          <li key={tag}>
            <Chip onRemove={() => setTags((prev) => prev.filter((item) => item !== tag))}>
              {tag}
            </Chip>
          </li>
        ))}
      </ul>
      <output aria-label="남은 태그">{tags.join(',')}</output>
    </div>
  );
}

export const Removable: Story = {
  render: () => <TagList />,
  parameters: {
    docs: {
      description: {
        story:
          '`onRemove` 만 주면 끝에 삭제 버튼이 붙습니다. 버튼 이름은 "frontend 삭제" 처럼 칩의 글과 이어지고, 포커스된 삭제 버튼에서 Backspace나 Delete를 눌러도 지워집니다. 지우면 포커스가 옆 칩으로 옮겨 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const react = canvas.getByRole('button', { name: 'react 삭제' });
    react.focus();
    await userEvent.keyboard('{Backspace}');
    await expect(canvas.getByLabelText('남은 태그')).toHaveTextContent('frontend,design');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'design 삭제' })).toHaveFocus());
    await userEvent.keyboard('{Delete}');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'frontend 삭제' })).toHaveFocus(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'frontend 삭제' }));
    await expect(canvas.getByLabelText('남은 태그')).toHaveTextContent('');
  },
};

function FilterList() {
  const [filters, setFilters] = useState([
    { id: 'open', label: '열림', on: true },
    { id: 'mine', label: '내 것', on: false },
  ]);
  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <Chip
          key={filter.id}
          colorScheme="primary"
          selected={filter.on}
          onSelectedChange={(on) =>
            setFilters((prev) =>
              prev.map((item) => (item.id === filter.id ? { ...item, on } : item)),
            )
          }
          onRemove={() => setFilters((prev) => prev.filter((item) => item.id !== filter.id))}
        >
          {filter.label}
        </Chip>
      ))}
    </div>
  );
}

export const SelectableAndRemovable: Story = {
  render: () => <FilterList />,
  parameters: {
    docs: {
      description: {
        story:
          '토글이면서 지울 수 있는 칩은 칩 자체가 버튼이라 안에 버튼을 둘 수 없습니다. 이때 X는 마우스로만 누르고, 키보드는 칩에 포커스를 두고 Backspace나 Delete로 지웁니다. X를 눌러도 토글되지 않습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const open = canvas.getByRole('button', { name: '열림' });
    await expect(open).toHaveAttribute('aria-pressed', 'true');
    await expect(open.querySelector('button')).toBeNull();
    await userEvent.click(canvasElement.querySelector<HTMLElement>('[data-chip-close]')!);
    await expect(canvas.queryByRole('button', { name: '열림' })).toBeNull();
    const mine = canvas.getByRole('button', { name: '내 것' });
    await expect(mine).toHaveAttribute('aria-pressed', 'false');
    mine.focus();
    await userEvent.keyboard('{Delete}');
    await expect(canvas.queryByRole('button', { name: '내 것' })).toBeNull();
  },
};

export const Clickable: Story = {
  args: { onClick: fn(), children: '필터 열기' },
  parameters: {
    docs: {
      description: {
        story: '`onClick` 만 주면 토글이 아닌 보통 버튼입니다. `aria-pressed` 는 붙지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const chip = canvas.getByRole('button', { name: '필터 열기' });
    await expect(chip).not.toHaveAttribute('aria-pressed');
    await userEvent.click(chip);
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  args: { disabled: true, onRemove: fn(), children: 'readonly' },
  play: async ({ canvas, userEvent, args }) => {
    const close = canvas.getByRole('button', { name: 'readonly 삭제' });
    await expect(close).toBeDisabled();
    await userEvent.click(close);
    await expect(args.onRemove).not.toHaveBeenCalled();
  },
};
