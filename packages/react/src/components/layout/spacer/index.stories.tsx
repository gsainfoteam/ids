import { ChevronRightIcon } from '@heroicons/react/16/solid';
import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Kbd } from '../../typography/kbd';

import { Spacer } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Layout/Spacer',
  component: Spacer,
  tags: ['autodocs'],
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

const frame = cn('rounded-standard inset-ring-1 inset-ring-neutral');

export const Playground: Story = {
  render: (args) => (
    <div className={cn('flex w-80 items-center gap-2 p-3', frame)}>
      <span>제목</span>
      <Spacer {...args} />
      <Button size="tiny" variant="outline">
        더보기
      </Button>
    </div>
  ),
};

export const Usage: Story = {
  render: () => (
    <div className="flex w-80 items-center gap-2">
      <span>제목</span>
      <Spacer />
      <Button size="tiny" variant="outline">
        더보기
      </Button>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Direction"
        description="부모 flex의 방향을 따릅니다. 앞뒤 요소를 양 끝으로 밉니다."
      >
        <Showcase.Row label="row">
          <div className={cn('flex h-12 w-80 items-center p-2', frame)}>
            <span>로고</span>
            <Spacer />
            <span>로그인</span>
          </div>
        </Showcase.Row>
        <Showcase.Row label="column">
          <div className={cn('flex h-40 w-40 flex-col p-2', frame)}>
            <span>머리글</span>
            <Spacer />
            <span>바닥글</span>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Share" description="여러 개를 두면 남는 공간을 똑같이 나눕니다.">
        <Showcase.Row label="1 : 1">
          <div className={cn('flex h-12 w-80 items-center p-2', frame)}>
            <span>A</span>
            <Spacer />
            <span>B</span>
            <Spacer />
            <span>C</span>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="In a control" description="span이라 Button 안에도 둘 수 있습니다.">
        <Showcase.Row label="button">
          <div className="flex w-72 flex-col gap-2">
            <Button variant="outline">
              검색
              <Spacer />
              <Kbd>⌘K</Kbd>
            </Button>
            <Button variant="soft">
              설정
              <Spacer />
              <ChevronRightIcon />
            </Button>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const PushAShortcutToTheButtonEnd: Story = {
  render: () => (
    <div className="flex w-72 flex-col">
      <Button variant="outline">
        검색
        <Spacer />
        <Kbd>⌘K</Kbd>
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '버튼 글자와 `Kbd` 사이에 Spacer 를 두면 둘이 양 끝으로 갈라섭니다. Spacer 는 `span` 이라 버튼 안에 둘 수 있고, `aria-hidden` 이라 버튼 이름은 그대로입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button');
    const box = button.getBoundingClientRect();
    const kbd = button.querySelector('kbd')!.getBoundingClientRect();
    await expect(box.right - kbd.right).toBeLessThan(20);
    const spacer = button.querySelector('[data-spacer]')!;
    await expect(spacer.tagName).toBe('SPAN');
    await expect(spacer).toHaveAttribute('aria-hidden', 'true');
  },
};
