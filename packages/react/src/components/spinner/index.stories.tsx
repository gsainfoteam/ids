import { expect } from 'storybook/test';

import { Button } from '../button';
import { IconButton } from '../icon-button';

import { Spinner } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sizes = ['standard', 'tiny'] as const;
const variants = ['solid', 'soft', 'outline', 'ghost'] as const;

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: [...sizes] },
    label: { control: 'text' },
    decorative: { control: 'boolean' },
  },
  args: {
    size: 'standard',
    label: '불러오는 중',
    decorative: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          '부모의 글자색을 상속하는 로딩 표시입니다. 단독 사용 시 label을 알리고, 이미 로딩 텍스트가 있는 버튼에서는 decorative를 사용합니다. 모션 감소 설정에서는 회전을 멈춥니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {
  play: async ({ canvas, args }) => {
    if (args.decorative) {
      await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    } else {
      await expect(canvas.getByRole('status')).toHaveTextContent(args.label ?? 'Loading');
    }
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Spinner size={size} label={`${size} 불러오는 중`} />
          <span>{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const InButtons: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    for (const button of canvas.getAllByRole('button', { name: '저장 중' })) {
      await expect(button).toBeDisabled();
      await expect(button).toHaveAttribute('aria-busy', 'true');
    }
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          {variants.map((variant) => (
            <Button key={variant} size={size} variant={variant} disabled aria-busy="true">
              <Spinner size={size} decorative />
              저장 중
            </Button>
          ))}
          <IconButton
            size={size}
            disabled
            aria-busy="true"
            aria-label="저장 중"
            icon={<Spinner size={size} decorative />}
          />
        </div>
      ))}
    </div>
  ),
};

export const Themes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(['light', 'dark'] as const).map((mode) =>
        (['blue', 'orange', 'green'] as const).map((color) => (
          <div
            key={`${color}-${mode}`}
            data-color={color}
            data-mode={mode}
            className="flex items-center gap-3 rounded-xl bg-(--ids-color-surface) p-4 text-(--ids-color-primary)"
          >
            <Spinner label={`${color} ${mode} 불러오는 중`} />
            <span>{`${color} / ${mode}`}</span>
          </div>
        )),
      )}
    </div>
  ),
};
