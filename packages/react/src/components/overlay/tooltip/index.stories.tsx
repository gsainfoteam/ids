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
    openDelay: { control: 'number' },
    closeDelay: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: {
    disabled: false,
    onOpenChange: fn(),
  },
  render: (args) => (
    <Tooltip {...args}>
      <Tooltip.Trigger asChild>
        <Button variant="outline">저장</Button>
      </Tooltip.Trigger>
      <Tooltip.Content>변경 사항 저장</Tooltip.Content>
    </Tooltip>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const sides = ['top', 'right', 'bottom', 'left'] as const;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button variant="outline">복사</Button>
      </Tooltip.Trigger>
      <Tooltip.Content>클립보드에 복사</Tooltip.Content>
    </Tooltip>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Side"
        description="Tooltip.Content 의 side 로 붙는 쪽을 고릅니다. 기본은 top 이고, 들어갈 자리가 없으면 반대쪽으로 넘어갑니다."
      >
        <Showcase.Row className="gap-x-36 gap-y-16 px-20 py-10">
          {sides.map((side) => (
            <Tooltip key={side} open>
              <Tooltip.Trigger asChild>
                <Button variant="outline">{side}</Button>
              </Tooltip.Trigger>
              <Tooltip.Content side={side}>
                {side}
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip>
          ))}
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Arrow"
        description="화살표는 Tooltip.Content 안에 Tooltip.Arrow 를 넣을 때만 그립니다."
      >
        <Showcase.Row label="없음" className="py-10">
          <Tooltip open>
            <Tooltip.Trigger asChild>
              <Button variant="outline">복사</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>복사</Tooltip.Content>
          </Tooltip>
        </Showcase.Row>
        <Showcase.Row label="Tooltip.Arrow" className="py-10">
          <Tooltip open>
            <Tooltip.Trigger asChild>
              <Button variant="outline">붙여넣기</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              붙여넣기
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Long text"
        description="폭은 max-w-xs 에서 줄바꿈합니다. 긴 설명은 Popover 로 옮깁니다."
      >
        <Showcase.Row className="py-16">
          <Tooltip open>
            <Tooltip.Trigger asChild>
              <Button variant="outline">보관</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              보관한 항목은 목록에서 숨겨지고 30일 뒤에 지워집니다. 그 전에는 보관함에서 되살릴 수
              있습니다.
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Shortcut"
        description="말풍선 안의 Kbd 는 tiny 로 그려져 한 줄 높이에 맞고, 말풍선의 글자색으로 칠해집니다."
      >
        <Showcase.Row label="mac" className="gap-24 py-12">
          <Tooltip open>
            <Tooltip.Trigger asChild>
              <Button variant="outline">저장</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              저장
              <Kbd keys="Mod+S" platform="mac" />
            </Tooltip.Content>
          </Tooltip>
          <Tooltip open>
            <Tooltip.Trigger asChild>
              <Button variant="outline">다시 실행</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              다시 실행
              <Kbd keys="Mod+Shift+Z" platform="mac" />
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip>
        </Showcase.Row>
        <Showcase.Row label="windows" className="gap-24 py-12">
          <Tooltip open>
            <Tooltip.Trigger asChild>
              <Button variant="outline">저장</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              저장
              <Kbd keys="Mod+S" platform="windows" />
            </Tooltip.Content>
          </Tooltip>
          <Tooltip open>
            <Tooltip.Trigger asChild>
              <Button variant="outline">지우기</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              지우기<Kbd platform="mac">⌫</Kbd>
            </Tooltip.Content>
          </Tooltip>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="hover, focus">
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button variant="outline">올려 보기</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>마우스를 올리거나 Tab 으로 오면 열립니다</Tooltip.Content>
          </Tooltip>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <Tooltip disabled>
            <Tooltip.Trigger asChild>
              <Button variant="outline">disabled</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>열리지 않습니다</Tooltip.Content>
          </Tooltip>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const ExplainAnActionInTwoLines: Story = {
  render: () => (
    <Tooltip openDelay={0}>
      <Tooltip.Trigger asChild>
        <Button variant="outline">공유</Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <span className="flex flex-col gap-0.5">
          <span>링크 복사</span>
          <span className="opacity-70">누구나 볼 수 있습니다</span>
        </span>
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`Tooltip.Content` 에는 글자 말고도 요소를 넣을 수 있고, 그 글이 trigger 의 설명(`aria-describedby`)이 됩니다. 줄은 안에 둔 앱의 요소로 나누고, `Tooltip.Arrow` 로 화살표를 답니다.',
      },
    },
  },
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

export const ShowToolbarHintsWithoutWaiting: Story = {
  render: () => (
    <TooltipDelayGroup>
      <div className="flex gap-1">
        <Tooltip>
          <Tooltip.Trigger asChild>
            <IconButton aria-label="굵게" variant="outline" icon={<BoldIcon />} />
          </Tooltip.Trigger>
          <Tooltip.Content>굵게</Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <IconButton aria-label="기울임" variant="outline" icon={<ItalicIcon />} />
          </Tooltip.Trigger>
          <Tooltip.Content>기울임</Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <IconButton aria-label="밑줄" variant="outline" icon={<UnderlineIcon />} />
          </Tooltip.Trigger>
          <Tooltip.Content>밑줄</Tooltip.Content>
        </Tooltip>
      </div>
    </TooltipDelayGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`TooltipDelayGroup` 으로 묶은 툴팁은 하나가 열린 뒤 옆으로 옮겨 가면 기다리지 않고 바로 열립니다. 툴바의 아이콘 버튼처럼 나란히 놓인 trigger 에 씁니다.',
      },
    },
  },
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

export const ExplainWhyAButtonIsDisabled: Story = {
  render: () => (
    <Tooltip openDelay={0}>
      <Tooltip.Trigger asChild>
        <Button colorScheme="danger" disabled focusableWhenDisabled>
          삭제
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>권한이 없어 삭제할 수 없습니다</Tooltip.Content>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`disabled` 인 버튼은 hover 와 focus 를 받지 않아 툴팁이 열리지 않습니다. IDS 버튼에 `focusableWhenDisabled` 를 주면 누를 수는 없어도 포커스와 hover 를 받아, 왜 누를 수 없는지 알려 줄 수 있습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('button', { name: '삭제' }));
    await waitFor(() =>
      expect(canvas.getByRole('tooltip')).toHaveTextContent('권한이 없어 삭제할 수 없습니다'),
    );
  },
};
