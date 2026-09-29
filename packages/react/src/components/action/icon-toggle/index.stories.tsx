import { useState, type ComponentProps } from 'react';

import {
  BoldIcon,
  HeartIcon,
  ItalicIcon,
  ListBulletIcon,
  Squares2X2Icon,
  StarIcon,
} from '@heroicons/react/16/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { expect, fn } from 'storybook/test';

import { Showcase } from '~story-kit';

import { isDevelopment } from '../../../utils/dev';

import { IconToggle } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['ghost', 'outline', 'soft', 'solid', 'glossy'] as const;
const colorSchemes = ['primary', 'neutral', 'danger', 'success', 'warning', 'info'] as const;
const sizes = ['standard', 'tiny'] as const;
const pressedStates = ['off', 'on'] as const;
const functionNamesSurviveBuild = isDevelopment;

function PinIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M10.5 1.5 14.5 5.5l-1.4 1.4-.9-.4-2.3 2.3.3 2.6-1 1-2.6-2.6-3.4 3.4-.7-.7 3.4-3.4L3.3 6.5l1-1 2.6.3 2.3-2.3-.4-.9 1.7-1.1Z" />
    </svg>
  );
}
PinIcon.displayName = 'PinIcon';

const meta = {
  title: 'Action/IconToggle',
  component: IconToggle,
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
    icon: <StarIcon />,
    'aria-label': '즐겨찾기',
    variant: 'ghost',
    size: 'standard',
    defaultPressed: false,
    onPressedChange: fn(),
  },
} satisfies Meta<typeof IconToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant × Pressed"
        description="Toggle과 같은 규칙입니다. 꺼지면 조용하고, variant는 켜진 모습을 정합니다."
      >
        <Showcase.Matrix
          rows={pressedStates}
          columns={variants}
          render={(state, variant) => (
            <IconToggle
              variant={variant}
              defaultPressed={state === 'on'}
              icon={<BoldIcon />}
              aria-label="굵게"
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Variant × Size (pressed)">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <IconToggle
              size={size}
              variant={variant}
              defaultPressed
              icon={<ItalicIcon />}
              aria-label="기울임"
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Color scheme (pressed)">
        <Showcase.Matrix
          rows={colorSchemes}
          columns={variants}
          render={(colorScheme, variant) => (
            <IconToggle
              colorScheme={colorScheme}
              variant={variant}
              defaultPressed
              icon={<StarIcon />}
              aria-label={colorScheme}
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="disabled">
          <IconToggle disabled icon={<StarIcon />} aria-label="즐겨찾기" />
          <IconToggle disabled defaultPressed icon={<StarIcon />} aria-label="즐겨찾기" />
          <IconToggle
            disabled
            defaultPressed
            variant="outline"
            icon={<StarIcon />}
            aria-label="즐겨찾기"
          />
        </Showcase.Row>
        <Showcase.Row label="state icon">
          <IconToggle
            aria-label="좋아요"
            defaultPressed
            icon={(state) => (state.pressed ? <HeartIcon /> : <HeartOutlineIcon />)}
          />
          <IconToggle
            aria-label="좋아요"
            icon={(state) => (state.pressed ? <HeartIcon /> : <HeartOutlineIcon />)}
          />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const AutomaticLabel: Story = {
  render: () => (
    <div className="flex gap-2">
      <IconToggle icon={<PinIcon />} />
      <IconToggle icon={<BoldIcon />} />
      <IconToggle icon={<ListBulletIcon />} aria-label="목록 보기" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'IconButton과 같은 방식으로 aria-label을 생략하면 아이콘에서 이름을 찾습니다. PinIcon은 "Pin", 직접 준 이름은 그대로입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Pin' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(canvas.getByRole('button', { name: '목록 보기' })).toBeVisible();
    if (functionNamesSurviveBuild)
      await expect(canvas.getByRole('button', { name: 'Bold' })).toBeVisible();
  },
};

export const StateIcon: Story = {
  render: () => (
    <IconToggle
      aria-label="좋아요"
      variant="soft"
      colorScheme="danger"
      icon={(state) =>
        state.pressed ? (
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
        story:
          '켜진 모양은 icon 함수로 바꾸되 이름은 그대로 둡니다. 켜짐 여부는 aria-pressed가 알립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: '좋아요' });
    await expect(canvas.getByTestId('outline')).toBeVisible();
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAccessibleName('좋아요');
    await expect(canvas.getByTestId('filled')).toBeVisible();
  },
};

export const Controlled: Story = {
  render: function Render() {
    const [grid, setGrid] = useState(false);

    return (
      <div className="flex items-center gap-3">
        <IconToggle
          variant="outline"
          pressed={grid}
          onPressedChange={setGrid}
          icon={grid ? <Squares2X2Icon /> : <ListBulletIcon />}
          aria-label="격자로 보기"
        />
        <span className="text-body-b3-regular">{grid ? '격자' : '목록'}</span>
      </div>
    );
  },
  parameters: {
    docs: { description: { story: 'pressed와 onPressedChange로 제어합니다.' } },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '격자로 보기' }));
    await expect(canvas.getByText('격자')).toBeVisible();
  },
};

export const Square: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconToggle data-testid="off" variant="outline" icon={<StarIcon />} aria-label="별" />
      <IconToggle
        data-testid="on"
        variant="outline"
        defaultPressed
        icon={<StarIcon />}
        aria-label="별"
      />
      <IconToggle data-testid="tiny" size="tiny" icon={<StarIcon />} aria-label="별" />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: '켜져도 꺼져도 정사각형입니다. standard 36px, tiny 32px.' },
    },
  },
  play: async ({ canvas }) => {
    for (const [id, side] of [
      ['off', 36],
      ['on', 36],
      ['tiny', 32],
    ] as const) {
      const rect = canvas.getByTestId(id).getBoundingClientRect();
      await expect([rect.width, rect.height]).toEqual([side, side]);
    }
  },
};
