import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';

import { Divider } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Layout/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    decorative: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { orientation: 'horizontal', align: 'center', decorative: false, children: '또는' },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="flex h-32 w-80 items-center justify-center">
      <Divider {...args} />
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Horizontal">
        <Showcase.Row label="plain">
          <div className="w-72">
            <Divider />
          </div>
        </Showcase.Row>
        {(['start', 'center', 'end'] as const).map((align) => (
          <Showcase.Row key={align} label={`label · ${align}`}>
            <div className="w-72">
              <Divider align={align}>{align === 'center' ? '또는' : '최근 항목'}</Divider>
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section title="Vertical" description="flex 행 안에서는 행 높이만큼 늘어납니다.">
        <Showcase.Row label="plain">
          <div className="text-body-b3-regular flex h-8 items-center gap-3">
            <span>계정</span>
            <Divider orientation="vertical" />
            <span>설정</span>
            <Divider orientation="vertical" />
            <span>로그아웃</span>
          </div>
        </Showcase.Row>
        <Showcase.Row label="label">
          <div className="flex h-32 items-stretch gap-6">
            <div className="rounded-standard text-body-b3-regular flex w-24 items-center justify-center bg-(--ids-color-muted)">
              이메일
            </div>
            <Divider orientation="vertical">또는</Divider>
            <div className="rounded-standard text-body-b3-regular flex w-24 items-center justify-center bg-(--ids-color-muted)">
              소셜 로그인
            </div>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="In context">
        <Showcase.Row label="login">
          <div className="flex w-72 flex-col gap-4">
            <Button>이메일로 계속</Button>
            <Divider>또는</Divider>
            <Button variant="outline">Google로 계속</Button>
          </div>
        </Showcase.Row>
        <Showcase.Row label="toolbar">
          <div className="flex h-9 items-center gap-1">
            <Button size="tiny" variant="ghost">
              잘라내기
            </Button>
            <Button size="tiny" variant="ghost">
              복사
            </Button>
            <Divider orientation="vertical" decorative className="h-4 self-center" />
            <Button size="tiny" variant="ghost">
              붙여넣기
            </Button>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Labelled: Story = {
  render: () => (
    <div className="w-72">
      <Divider>또는</Divider>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '가운데 글자는 separator의 이름이 됩니다. separator 안의 글자는 스크린 리더가 내용으로 읽지 않기 때문입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const separator = canvas.getByRole('separator', { name: '또는' });
    await expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(separator).toHaveAttribute('data-labelled');
  },
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-3" data-testid="row">
      <span>왼쪽</span>
      <Divider orientation="vertical" />
      <span>오른쪽</span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '세로 구분선은 flex 행의 높이까지 늘어납니다. 행 밖에서도 한 줄 높이는 지킵니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const separator = canvas.getByRole('separator');
    await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    const row = canvas.getByTestId('row').getBoundingClientRect();
    const line = separator.getBoundingClientRect();
    await expect(line.height).toBeCloseTo(row.height, 0);
    await expect(line.width).toBeCloseTo(1, 0);
  },
};

export const Decorative: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-3">
      <a href="#account">계정</a>
      <Divider orientation="vertical" decorative />
      <a href="#settings">설정</a>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '의미 없는 선은 decorative로 접근성 트리에서 뺍니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole('separator')).not.toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-divider]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" className="w-72">
      <Divider align="start">الأحدث</Divider>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'align은 논리 방향입니다. 오른쪽에서 왼쪽으로 쓰는 문서에서 start는 오른쪽입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const separator = canvas.getByRole('separator', { name: 'الأحدث' });
    const label = separator.querySelector('span')!.getBoundingClientRect();
    const box = separator.getBoundingClientRect();
    await expect(Math.abs(box.right - label.right)).toBeLessThan(1);
  },
};
