import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import tokens from '../../../../core/tokens/spacing.json';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Spacing',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TAILWIND_STEP_PX = 4;

const spacing = Object.entries(tokens.spacing).map(([name, { $value }]) => ({
  name,
  value: $value,
  step: parseFloat($value) / TAILWIND_STEP_PX,
}));

export const Scale: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="간격 눈금"
        description="spacing.json 의 이름 붙은 간격입니다. Tailwind 의 4px 눈금 위에 있으므로 코드에서는 p-4, gap-2 같은 단계로 씁니다. 막대는 calc(var(--spacing) * 단계)로 그려 같은 값인지 보여 줍니다."
      >
        <div className="flex flex-col gap-3">
          {spacing.map(({ name, value, step }) => (
            <div
              key={name}
              data-spacing={name}
              data-value={value}
              className="grid grid-cols-[3rem_4rem_6rem_1fr] items-center gap-4"
            >
              <span className="text-body-b3-medium">{name}</span>
              <code className="text-caption-c1-regular font-mono text-(--ids-color-on-muted)">
                {value}
              </code>
              <code className="text-caption-c1-regular font-mono text-(--ids-color-on-muted)">
                p-{step} · gap-{step}
              </code>
              <span
                data-bar=""
                className="h-4 rounded-full bg-(--ids-color-primary)"
                style={{ width: `calc(var(--spacing) * ${step})` }}
              />
            </div>
          ))}
        </div>
      </Showcase.Section>
      <Showcase.Section
        title="쓰임"
        description="컨트롤 사이는 sm, 카드 안 여백은 md, 영역 사이는 lg 이상입니다."
      >
        <div className="concentric-p-4 flex flex-col gap-2 inset-ring-1 inset-ring-(--ids-color-border)">
          <span className="text-subtitle-s2-semibold">md 여백의 카드</span>
          <span className="text-body-b3-regular text-(--ids-color-on-muted)">
            제목과 설명 사이는 sm(8px)입니다.
          </span>
        </div>
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll<HTMLElement>('[data-spacing]')];

    await expect(rows).toHaveLength(Object.keys(tokens.spacing).length);
    for (const row of rows) {
      const bar = row.querySelector<HTMLElement>('[data-bar]')!;
      await expect(getComputedStyle(bar).width).toBe(row.dataset.value);
    }
  },
};
