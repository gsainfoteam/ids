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
  argTypes: { flex: { control: { type: 'number', min: 0.5, step: 0.5 } } },
  args: { flex: 1 },
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

const frame = cn('rounded-standard inset-ring-1 inset-ring-(--ids-color-border)');
// Stretched so the space a Spacer takes shows even in a row that centers its items.
const fill = cn('self-stretch bg-(--ids-color-primary)/15');

export const Playground: Story = {
  render: (args) => (
    <div className={cn('flex w-80 items-center gap-2 p-3', frame)}>
      <span>제목</span>
      <Spacer {...args} className={fill} />
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
        description="부모 flex의 방향을 따릅니다. 칠한 부분이 Spacer가 차지한 공간입니다."
      >
        <Showcase.Row label="row">
          <div className={cn('flex h-12 w-80 items-center p-2', frame)}>
            <span>로고</span>
            <Spacer className={fill} />
            <span>로그인</span>
          </div>
        </Showcase.Row>
        <Showcase.Row label="column">
          <div className={cn('flex h-40 w-40 flex-col p-2', frame)}>
            <span>머리글</span>
            <Spacer className={fill} />
            <span>바닥글</span>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="flex" description="여러 개를 두면 flex 비율로 남는 공간을 나눕니다.">
        <Showcase.Row label="1 : 1">
          <div className={cn('flex h-12 w-80 items-center p-2', frame)}>
            <span>A</span>
            <Spacer className={fill} />
            <span>B</span>
            <Spacer className={fill} />
            <span>C</span>
          </div>
        </Showcase.Row>
        <Showcase.Row label="1 : 2">
          <div className={cn('flex h-12 w-80 items-center p-2', frame)}>
            <span>A</span>
            <Spacer className={fill} />
            <span>B</span>
            <Spacer flex={2} className={fill} />
            <span>C</span>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="In a control" description="span이라 Button 안에도 둘 수 있습니다.">
        <Showcase.Row label="button">
          <Button variant="outline" className="w-72">
            검색
            <Spacer />
            <Kbd>⌘K</Kbd>
          </Button>
          <Button variant="ghost" className="w-72">
            설정
            <Spacer />
            <ChevronRightIcon />
          </Button>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Distribution: Story = {
  render: () => (
    <div className="flex h-12 w-80" data-testid="row">
      <span className="shrink-0">시작</span>
      <Spacer data-testid="one" className={fill} />
      <span className="shrink-0">중간</span>
      <Spacer flex={2} data-testid="two" className={fill} />
      <span className="shrink-0">끝</span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '남는 공간을 flex 비율(1 : 2)로 나눕니다. Spacer는 보이지 않고 스크린 리더도 무시합니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const one = canvas.getByTestId('one');
    const two = canvas.getByTestId('two');
    await expect(one.tagName).toBe('SPAN');
    await expect(one).toHaveAttribute('aria-hidden', 'true');
    const a = one.getBoundingClientRect().width;
    const b = two.getBoundingClientRect().width;
    await expect(a).toBeGreaterThan(0);
    await expect(b / a).toBeCloseTo(2, 1);
  },
};

export const InsideButton: Story = {
  render: () => (
    <Button variant="outline" className="w-72">
      검색
      <Spacer />
      <Kbd>⌘K</Kbd>
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: '버튼 안에서 글자와 단축키를 양 끝으로 밉니다. 버튼 이름은 그대로입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button');
    const box = button.getBoundingClientRect();
    const kbd = button.querySelector('kbd')!.getBoundingClientRect();
    await expect(box.right - kbd.right).toBeLessThan(20);
    await expect(button.querySelector('[data-spacer]')!.tagName).toBe('SPAN');
  },
};
