import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import palette from '../../../../core/tokens/palette.json';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Palette',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Scale = { [step: string]: { $value: string } };

const scales = Object.entries(palette as { [name: string]: Scale });
const steps = [...new Set(scales.flatMap(([, scale]) => Object.keys(scale)))].sort(
  (a, b) => Number(a) - Number(b),
);
const tokenCount = scales.reduce((sum, [, scale]) => sum + Object.keys(scale).length, 0);

const columns = { gridTemplateColumns: `4.5rem repeat(${steps.length}, minmax(0, 1fr))` };

const rgb = (hex: string) =>
  `rgb(${[1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(', ')})`;

function Step({ token, hex }: { token: string; hex: string }) {
  return (
    <div data-palette={token} data-hex={hex} title={token} className="flex min-w-0 flex-col gap-1">
      <span
        data-chip=""
        className="rounded-indicator h-8 w-full inset-ring-1 inset-ring-(--ids-color-border)"
        style={{ background: hex }}
      />
      <code className="text-caption-c2-regular truncate font-mono text-(--ids-color-on-muted)">
        {hex}
      </code>
    </div>
  );
}

export const Scales: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="원시 팔레트"
        description="palette.json 의 모든 단계입니다. 컴포넌트는 이 값을 직접 쓰지 않고 Color 의 시맨틱 토큰을 거칩니다. neutral 과 17색이고, orange 와 green 을 뺀 색은 Tailwind CSS v4 기본값입니다."
      >
        <div className="grid items-center gap-x-1.5 gap-y-2" style={columns}>
          <span />
          {steps.map((step) => (
            <span key={step} className="text-caption-c1-medium text-(--ids-color-on-muted)">
              {step}
            </span>
          ))}
          {scales.flatMap(([name, scale]) => [
            <span key={name} className="text-body-b3-regular">
              {name}
            </span>,
            ...steps.map((step) => {
              const hex = scale[step]?.$value;
              return hex === undefined ? (
                <span key={`${name}.${step}`} />
              ) : (
                <Step key={`${name}.${step}`} token={`${name}.${step}`} hex={hex} />
              );
            }),
          ])}
        </div>
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const swatches = [...canvasElement.querySelectorAll<HTMLElement>('[data-palette]')];

    await expect(swatches).toHaveLength(tokenCount);
    for (const swatch of swatches) {
      const chip = swatch.querySelector<HTMLElement>('[data-chip]')!;
      await expect(getComputedStyle(chip).backgroundColor).toBe(rgb(swatch.dataset.hex!));
    }
  },
};
