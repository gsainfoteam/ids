import {
  ArrowRightIcon,
  CircleNotchIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@phosphor-icons/react';

import { Button } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Solid: Story = {
  args: { children: '바로가기', variant: 'solid', size: 'standard' },
};

export const Soft: Story = {
  args: { children: '바로가기', variant: 'soft', size: 'standard' },
};

export const Outline: Story = {
  args: { children: '바로가기', variant: 'outline', size: 'standard' },
};

export const Ghost: Story = {
  args: { children: '바로가기', variant: 'ghost', size: 'standard' },
};

export const Tiny: Story = {
  args: { children: '바로가기', variant: 'solid', size: 'tiny' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="solid">확인</Button>
      <Button variant="soft">보조</Button>
      <Button variant="outline">취소</Button>
      <Button variant="ghost">더보기</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="standard">standard</Button>
      <Button size="tiny">tiny</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { children: '비활성', disabled: true },
};

export const Loading: Story = {
  name: 'Loading',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>
        <CircleNotchIcon className="size-5 animate-spin" weight="bold" />
        로딩 중
      </Button>
      <Button variant="soft" disabled>
        <CircleNotchIcon className="size-5 animate-spin" weight="bold" />
        저장 중
      </Button>
      <Button variant="outline" size="tiny" disabled>
        <CircleNotchIcon className="size-4 animate-spin" weight="bold" />
        처리 중
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <PlusIcon className="size-5" weight="bold" />
        추가
      </Button>
      <Button variant="soft">
        다음
        <ArrowRightIcon className="size-5" weight="bold" />
      </Button>
      <Button variant="outline">
        <MagnifyingGlassIcon className="size-5" weight="bold" />
        검색
        <ArrowRightIcon className="size-5" weight="bold" />
      </Button>
      <Button variant="ghost" size="tiny">
        <PlusIcon className="size-4" weight="bold" />새 항목
      </Button>
    </div>
  ),
};

export const SlotChildren: Story = {
  name: 'Slot Children',
  render: () => (
    <div className="flex flex-col gap-4">
      <Button>
        <span className="flex items-center gap-2">
          <PlusIcon className="size-5" weight="bold" />
          <span>앞 아이콘</span>
        </span>
      </Button>
      <Button variant="soft">
        <span>레이블</span>
        <ArrowRightIcon className="size-5" weight="bold" />
      </Button>
      <Button variant="outline" disabled>
        <CircleNotchIcon className="size-5 animate-spin" weight="bold" />
        <span>슬롯 + 로딩</span>
      </Button>
      <Button variant="ghost" className="min-w-40 justify-between">
        <MagnifyingGlassIcon className="size-5" weight="bold" />
        <span>양쪽 슬롯</span>
        <ArrowRightIcon className="size-5" weight="bold" />
      </Button>
    </div>
  ),
};

export const InteractiveState: Story = {
  name: 'Interactive State',
  render: () => (
    <div className="flex flex-col gap-3">
      <Button
        variant="outline"
        className={(state) => (state.hovered ? 'ring-2 ring-(--ids-color-primary)' : undefined)}
        style={(state) => (state.active ? { letterSpacing: '0.05em' } : undefined)}
      >
        {(state) => (
          <span className="font-mono text-xs">
            {[
              state.hovered && 'hovered',
              state.active && 'active',
              state.focused && 'focused',
              state.focusVisible && 'focus-visible',
              state.disabled && 'disabled',
            ]
              .filter(Boolean)
              .join(' · ') || 'idle'}
          </span>
        )}
      </Button>
      <p className="text-sm text-(--ids-color-on-muted)">
        children / className / style 모두 InteractiveState render prop을 지원합니다.
      </p>
    </div>
  ),
};
