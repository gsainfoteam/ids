import { useState, type ComponentProps } from 'react';

import {
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { isDevelopment } from '../../../utils/dev';
import { Spinner } from '../../feedback/spinner';

import { IconButton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['solid', 'soft', 'outline', 'ghost'] as const;
const colorSchemes = ['primary', 'neutral', 'danger', 'success', 'warning', 'info'] as const;
const sizes = ['standard', 'tiny'] as const;
const functionNamesSurviveBuild = isDevelopment;

function BellIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 1.5a4 4 0 0 0-4 4v2.3L2.6 10.6a.75.75 0 0 0 .67 1.08h9.46a.75.75 0 0 0 .67-1.08L12 7.8V5.5a4 4 0 0 0-4-4ZM6.25 13a1.75 1.75 0 0 0 3.5 0h-3.5Z" />
    </svg>
  );
}
BellIcon.displayName = 'BellIcon';

const meta = {
  title: 'Action/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    colorScheme: { control: 'select', options: colorSchemes },
    size: { control: 'radio', options: sizes },
    disabled: { control: 'boolean' },
    icon: { control: false },
    asChild: { table: { disable: true } },
  },
  args: {
    icon: <MagnifyingGlassIcon />,
    'aria-label': '검색',
    variant: 'ghost',
    colorScheme: 'primary',
    size: 'standard',
    onClick: fn(),
  },
} satisfies Meta<typeof IconButton>;

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
            <IconButton size={size} variant={variant} icon={<PlusIcon />} aria-label="추가" />
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Variant × Color scheme"
        description="Button과 같은 색 규칙입니다. ghost가 기본이라 툴바와 카드 모서리에서 조용합니다."
      >
        <Showcase.Matrix
          rows={colorSchemes}
          columns={variants}
          render={(colorScheme, variant) => (
            <IconButton
              colorScheme={colorScheme}
              variant={variant}
              icon={colorScheme === 'danger' ? <TrashIcon /> : <CheckIcon />}
              aria-label={colorScheme}
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="disabled">
          {variants.map((variant) => (
            <IconButton
              key={variant}
              variant={variant}
              disabled
              icon={<XMarkIcon />}
              aria-label="닫기"
            />
          ))}
        </Showcase.Row>
        <Showcase.Row label="loading">
          {sizes.map((size) =>
            variants.map((variant) => (
              <IconButton
                key={`${size}-${variant}`}
                size={size}
                variant={variant}
                disabled
                aria-busy
                icon={<Spinner decorative />}
                aria-label="저장 중"
              />
            )),
          )}
        </Showcase.Row>
        <Showcase.Row label="asChild">
          <IconButton asChild variant="outline" aria-label="새 창에서 열기">
            <a href="#gallery">
              <ArrowTopRightOnSquareIcon />
            </a>
          </IconButton>
        </Showcase.Row>
        <Showcase.Row label="state icon">
          <IconButton
            aria-label="좋아요"
            icon={(state) => (state.hovered ? <HeartIcon /> : <HeartOutlineIcon />)}
          />
          <IconButton aria-label="더보기" icon={<EllipsisHorizontalIcon />} />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const AutomaticLabel: Story = {
  render: () => (
    <div className="flex gap-2">
      <IconButton icon={<BellIcon />} />
      <IconButton icon={<PlusIcon />} />
      <IconButton icon={<TrashIcon title="휴지통으로" />} />
      <IconButton icon={<XMarkIcon />} aria-label="닫기" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'aria-label을 생략하면 아이콘에서 이름을 찾습니다. 아이콘의 aria-label이나 title이 먼저이고, 없으면 컴포넌트 이름을 씁니다(BellIcon → "Bell"). 직접 준 aria-label이 항상 이깁니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Bell' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '휴지통으로' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '닫기' })).toBeVisible();
    if (functionNamesSurviveBuild)
      await expect(canvas.getByRole('button', { name: 'Plus' })).toBeVisible();
  },
};

function SaveIconButton({ onSave }: { onSave: () => void }) {
  const [saving, setSaving] = useState(false);
  return (
    <IconButton
      variant="outline"
      disabled={saving}
      focusableWhenDisabled
      aria-busy={saving}
      aria-label={saving ? '저장 중' : '저장'}
      icon={saving ? <Spinner decorative /> : <CheckIcon />}
      onClick={() => {
        onSave();
        setSaving(true);
        setTimeout(() => setSaving(false), 800);
      }}
    />
  );
}

export const Loading: Story = {
  render: (args) => <SaveIconButton onSave={() => args.onClick?.(undefined as never)} />,
  parameters: {
    docs: {
      description: {
        story:
          '로딩은 icon을 Spinner로 바꾸고 disabled를 켜는 합성입니다. 스피너가 아이콘 크기로 들어가서 버튼 크기가 그대로입니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: '저장' });
    const before = button.getBoundingClientRect();
    await userEvent.click(button);
    await expect(button).toHaveAccessibleName('저장 중');
    await expect(button).toHaveFocus();
    const spinner = button.firstElementChild as HTMLElement;
    await expect(spinner.getBoundingClientRect().width).toBe(16);
    await expect(button.getBoundingClientRect().width).toBe(before.width);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(button).toHaveAccessibleName('저장'));
  },
};

export const Square: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton data-testid="standard" variant="outline" icon={<PlusIcon />} aria-label="추가" />
      <IconButton
        data-testid="tiny"
        size="tiny"
        variant="outline"
        icon={<PlusIcon />}
        aria-label="추가"
      />
      <IconButton
        data-testid="custom"
        variant="outline"
        icon={<svg viewBox="0 0 16 16" />}
        aria-label="빈 아이콘"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '아이콘이 무엇이든 정사각형이 정확히 컨트롤 높이입니다. standard 36px, tiny 32px이고 아이콘은 16px, 14px입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    for (const [id, side] of [
      ['standard', 36],
      ['tiny', 32],
      ['custom', 36],
    ] as const) {
      const rect = canvas.getByTestId(id).getBoundingClientRect();
      await expect([rect.width, rect.height]).toEqual([side, side]);
    }
  },
};

export const AsLink: Story = {
  render: () => (
    <IconButton asChild variant="outline" icon={<ArrowTopRightOnSquareIcon />}>
      <a href="#docs" aria-label="문서 열기" />
    </IconButton>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'asChild로 링크를 정사각형 아이콘 버튼으로 그립니다. 아이콘은 icon prop으로 줘도 되고 링크 안에 넣어도 됩니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: '문서 열기' });
    await expect(link).toHaveAttribute('href', '#docs');
    await expect(link.querySelector('svg')).not.toBeNull();
    await expect(link.getBoundingClientRect().width).toBe(36);
  },
};

export const StateIcon: Story = {
  render: () => (
    <IconButton
      aria-label="좋아요"
      icon={(state) =>
        state.hovered ? (
          <HeartIcon data-testid="filled" />
        ) : (
          <HeartOutlineIcon data-testid="outline" />
        )
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'icon과 aria-label도 상태를 받는 함수가 됩니다. 올려 두면 채운 하트로 바뀝니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: '좋아요' });
    await expect(canvas.getByTestId('outline')).toBeVisible();
    await userEvent.hover(button);
    await expect(canvas.getByTestId('filled')).toBeVisible();
  },
};
