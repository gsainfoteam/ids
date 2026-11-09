import { SparklesIcon } from '@heroicons/react/24/outline';
import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Avatar } from '../avatar';
import { Badge } from '../badge';
import { Chip } from '../chip';

import { Bubble } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['soft', 'solid', 'outline'] as const;
const aligns = ['start', 'end'] as const;

const LONG =
  '내일 오전 수업이 끝나면 학생회관 앞에서 만나서 같이 점심 먹고 도서관으로 가자. 자리는 내가 먼저 잡아 둘게.';

const meta = {
  title: 'Data/Bubble',
  component: Bubble,
  tags: ['autodocs'],
  argTypes: {
    align: { control: 'radio', options: aligns },
    variant: { control: 'radio', options: variants },
    asChild: { control: false },
  },
  args: { align: 'start', variant: 'soft', children: '오늘 학식 뭐야?' },
  render: (args) => (
    <div className="flex w-96 break-keep">
      <Bubble {...args} />
    </div>
  ),
} satisfies Meta<typeof Bubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase className="break-keep">
      <Showcase.Section title="Variant × Align" description="align 은 꼬리 쪽 모서리만 정합니다.">
        <Showcase.Matrix
          rows={aligns}
          columns={variants}
          render={(align, variant) => (
            <div className="flex w-56">
              <Bubble align={align} variant={variant}>
                {variant}
              </Bubble>
            </div>
          )}
        />
      </Showcase.Section>
      <Showcase.Section
        title="Fit"
        description="여러 줄이면 가장 긴 줄에 맞춰 상자를 줄입니다. 최대폭은 줄의 80% 입니다."
      >
        {variants.map((variant) => (
          <Showcase.Row key={variant} label={variant}>
            <div className="flex w-80">
              <Bubble variant={variant}>{LONG}</Bubble>
            </div>
            <div className="flex w-80 justify-end">
              <Bubble variant={variant} align="end">
                {LONG}
              </Bubble>
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>
      <Showcase.Section title="Reactions">
        <Showcase.Row label="last child">
          <div className="flex w-80">
            <Bubble>
              학식 메뉴 알려 줘
              <Bubble.Reactions>
                <Chip size="tiny" variant="outline">
                  👍 2
                </Chip>
              </Bubble.Reactions>
            </Bubble>
          </div>
          <div className="flex w-80 justify-end">
            <Bubble align="end" variant="solid">
              고마워!
              <Bubble.Reactions>
                <Badge content="❤️ 1" variant="outline" />
              </Bubble.Reactions>
            </Bubble>
          </div>
        </Showcase.Row>
        <Showcase.Row label="in flow">
          <div className="flex w-80">
            <Bubble variant="outline">
              <Bubble.Reactions>
                <Chip size="tiny">👍 2</Chip>
              </Bubble.Reactions>
              <p className="mt-2">반응을 마지막이 아닌 곳에 두면 상자 안에 그립니다.</p>
            </Bubble>
          </div>
        </Showcase.Row>
      </Showcase.Section>
      <Showcase.Section title="Max width">
        <Showcase.Row label="--bubble-max-width">
          <div className="flex w-80 [--bubble-max-width:60%]">
            <Bubble>{LONG}</Bubble>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const FitsTheLongestLine: Story = {
  render: () => (
    <div data-testid="column" className="flex w-80 break-keep">
      <Bubble>{LONG}</Bubble>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '글이 여러 줄로 접히면 CSS 만으로는 상자가 줄의 80% 에 머물러 줄 끝에 빈 공간이 남습니다. Bubble 은 `Range.getClientRects()` 로 줄마다 글자의 끝을 재고, 가장 긴 줄에 맞춰 상자를 줄입니다. 서버 HTML 에는 폭이 없고, 브라우저가 그린 뒤에 잽니다.',
      },
    },
  },
  play: ({ canvas, canvasElement }) => {
    const column = canvas.getByTestId('column');
    const bubble = canvasElement.querySelector<HTMLElement>('[data-bubble]')!;
    expect(bubble.style.getPropertyValue('--bubble-fit-width')).not.toBe('');
    const range = document.createRange();
    range.selectNodeContents(bubble.firstChild!);
    const lines = [...range.getClientRects()];
    const box = bubble.getBoundingClientRect();
    const padding = parseFloat(getComputedStyle(bubble).paddingRight);
    expect(lines.length).toBeGreaterThan(1);
    expect(box.width).toBeLessThan(column.clientWidth * 0.8);
    expect(Math.max(...lines.map((line) => line.right))).toBeGreaterThan(box.right - padding - 1);
  },
};

export const Reactions: Story = {
  render: () => (
    <div className="flex w-80">
      <Bubble>
        학식 메뉴 알려 줘
        <Bubble.Reactions>
          <Chip size="tiny" variant="outline" defaultSelected>
            👍 2
          </Chip>
          <Chip size="tiny" variant="outline">
            😮 1
          </Chip>
        </Bubble.Reactions>
      </Bubble>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`Bubble.Reactions` 를 마지막 자식으로 두면 상자 아래 모서리에 겹쳐 그리고, 그만큼 아래 여백을 둡니다. 꼬리의 반대쪽 끝에 붙습니다. 반응은 이름이 "반응" 인 `role="group"` 입니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const reactions = canvas.getByRole('group', { name: '반응' });
    const bubble = canvasElement.querySelector<HTMLElement>('[data-bubble]')!;
    await expect(reactions).toHaveAttribute('data-overlap', '');
    const box = bubble.getBoundingClientRect();
    const chips = reactions.getBoundingClientRect();
    expect(chips.top).toBeLessThan(box.bottom);
    expect(chips.bottom).toBeGreaterThan(box.bottom);
    expect(chips.right).toBeLessThan(box.right);
  },
};

export const Conversation: Story = {
  render: () => (
    <ol aria-label="대화" className="flex w-96 flex-col gap-3 break-keep">
      <li className="flex justify-end">
        <Bubble align="end" variant="solid">
          오늘 셔틀 몇 시에 와?
        </Bubble>
      </li>
      <li className="flex items-start gap-2">
        <Avatar name="GIST 도우미" size="tiny" aria-hidden>
          <Avatar.Fallback>
            <SparklesIcon />
          </Avatar.Fallback>
        </Avatar>
        <Bubble>
          학생회관 정류장에는 12시 20분에 광주송정역행, 12시 30분에 교내 순환 셔틀이 와요.
        </Bubble>
      </li>
      <li className="flex justify-end">
        <Bubble align="end" variant="solid">
          고마워!
        </Bubble>
      </li>
    </ol>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`align` 은 꼬리 모서리만 바꾸고 말풍선을 옮기지 않습니다. 보낸 말을 끝으로 붙이는 일은 줄이 맡습니다. 여기서는 `li` 에 `flex justify-end` 를 줬습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const sent = canvas.getByText('고마워!');
    const row = sent.closest('li')!;
    expect(sent.getBoundingClientRect().right).toBeCloseTo(row.getBoundingClientRect().right, 0);
    await expect(sent).toHaveAttribute('data-align', 'end');
  },
};
