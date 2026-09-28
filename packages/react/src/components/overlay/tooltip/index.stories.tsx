import { BoldIcon, ItalicIcon, UnderlineIcon } from '@heroicons/react/16/solid';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Kbd } from '../../typography/kbd';

import { Tooltip, TooltipDelayGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overlay/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    sideOffset: { control: 'number' },
    openDelay: { control: 'number' },
    closeDelay: { control: 'number' },
    arrow: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    content: '변경 사항 저장',
    side: 'top',
    align: 'center',
    sideOffset: 6,
    arrow: false,
    disabled: false,
    onOpenChange: fn(),
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const sides = ['top', 'right', 'bottom', 'left'] as const;

export const Playground: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="outline">저장</Button>
    </Tooltip>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Side"
        description="기본은 top 입니다. 들어갈 자리가 없으면 반대쪽으로 넘어갑니다."
      >
        <Showcase.Row className="gap-x-36 gap-y-16 px-20 py-10">
          {sides.map((side) => (
            <Tooltip key={side} open side={side} arrow content={side}>
              <Button variant="outline">{side}</Button>
            </Tooltip>
          ))}
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Arrow" description="arrow 를 주거나 Tooltip.Arrow 를 넣습니다.">
        <Showcase.Row label="없음" className="py-10">
          <Tooltip open content="복사">
            <Button variant="outline">복사</Button>
          </Tooltip>
        </Showcase.Row>
        <Showcase.Row label="arrow" className="py-10">
          <Tooltip open arrow content="붙여넣기">
            <Button variant="outline">붙여넣기</Button>
          </Tooltip>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Long text"
        description="폭은 max-w-xs 에서 줄바꿈합니다. 긴 설명은 Popover 로 옮깁니다."
      >
        <Showcase.Row className="py-16">
          <Tooltip
            open
            arrow
            content="보관한 항목은 목록에서 숨겨지고 30일 뒤에 지워집니다. 그 전에는 보관함에서 되살릴 수 있습니다."
          >
            <Button variant="outline">보관</Button>
          </Tooltip>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Shortcut"
        description="말풍선 안의 Kbd 는 tiny 로 그려져 한 줄 높이에 맞고, 말풍선의 글자색으로 칠해집니다."
      >
        <Showcase.Row label="apple" className="gap-24 py-12">
          <Tooltip
            open
            content={
              <>
                저장 <Kbd keys="mod+s" platform="apple" />
              </>
            }
          >
            <Button variant="outline">저장</Button>
          </Tooltip>
          <Tooltip
            open
            arrow
            content={
              <>
                다시 실행 <Kbd keys="shift+mod+z" platform="apple" />
              </>
            }
          >
            <Button variant="outline">다시 실행</Button>
          </Tooltip>
        </Showcase.Row>
        <Showcase.Row label="other" className="gap-24 py-12">
          <Tooltip
            open
            content={
              <>
                저장 <Kbd keys="mod+s" platform="other" />
              </>
            }
          >
            <Button variant="outline">저장</Button>
          </Tooltip>
          <Tooltip
            open
            content={
              <>
                지우기 <Kbd platform="apple">⌫</Kbd>
              </>
            }
          >
            <Button variant="outline">지우기</Button>
          </Tooltip>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="hover, focus">
          <Tooltip content="마우스를 올리거나 Tab 으로 오면 열립니다">
            <Button variant="outline">올려 보기</Button>
          </Tooltip>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <Tooltip disabled content="열리지 않습니다">
            <Button variant="outline">disabled</Button>
          </Tooltip>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Composition: Story = {
  render: () => (
    <Tooltip openDelay={0}>
      <Tooltip.Trigger asChild>
        <Button variant="outline">공유</Button>
      </Tooltip.Trigger>
      <Tooltip.Content className="flex flex-col gap-0.5">
        <span>링크 복사</span>
        <span className="opacity-70">누구나 볼 수 있습니다</span>
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('button', { name: '공유' }));
    const tooltip = await canvas.findByRole('tooltip');
    await expect(tooltip).toHaveTextContent(/링크 복사\s*누구나 볼 수 있습니다/);
    await expect(tooltip.querySelector('[data-tooltip-arrow]')).not.toBeNull();
    await expect(canvas.getByRole('button', { name: '공유' })).toHaveAccessibleDescription(
      /링크 복사\s*누구나 볼 수 있습니다/,
    );
  },
};

export const DelayGroup: Story = {
  render: () => (
    <TooltipDelayGroup>
      <div className="flex gap-1">
        <Tooltip content="굵게">
          <IconButton aria-label="굵게" variant="ghost" icon={<BoldIcon />} />
        </Tooltip>
        <Tooltip content="기울임">
          <IconButton aria-label="기울임" variant="ghost" icon={<ItalicIcon />} />
        </Tooltip>
        <Tooltip content="밑줄">
          <IconButton aria-label="밑줄" variant="ghost" icon={<UnderlineIcon />} />
        </Tooltip>
      </div>
    </TooltipDelayGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('button', { name: '굵게' }));
    await waitFor(() => expect(canvas.getByRole('tooltip')).toHaveTextContent('굵게'), {
      timeout: 2000,
    });
    await userEvent.unhover(canvas.getByRole('button', { name: '굵게' }));
    await userEvent.hover(canvas.getByRole('button', { name: '기울임' }));
    await waitFor(() => expect(canvas.getByRole('tooltip')).toHaveTextContent('기울임'));
  },
};

export const DisabledTrigger: Story = {
  render: () => (
    <Tooltip content="권한이 없어 삭제할 수 없습니다" openDelay={0}>
      <span tabIndex={0} className="rounded-standard focus-ring inline-flex">
        <Button colorScheme="danger" disabled className="pointer-events-none">
          삭제
        </Button>
      </span>
    </Tooltip>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('button', { name: '삭제' }).parentElement!);
    await waitFor(() =>
      expect(canvas.getByRole('tooltip')).toHaveTextContent('권한이 없어 삭제할 수 없습니다'),
    );
  },
};
