import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import palette from '../../../../core/tokens/palette.json';
import { createIdsPalette, paletteAtHue } from '../../components/utility/ids-provider/palette-seed';
import { PALETTE_STEPS, type IdsPalette } from '../../components/utility/ids-provider/theme';

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
        className="rounded-indicator inset-ring-neutral h-8 w-full inset-ring-1"
        style={{ background: hex }}
      />
      <code className="text-caption-c2-regular text-neutral truncate font-mono">{hex}</code>
    </div>
  );
}

export const Scales: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="원시 팔레트"
        description="palette.json 의 모든 단계입니다. IDS 가 직접 내보내는 팔레트는 neutral 과 상태 색의 기준 넷(red, yellow, green, sky)뿐입니다. 브랜드 팔레트는 앱이 주거나 Model 의 방법으로 시드 하나에서 만듭니다."
      >
        <div className="grid items-center gap-x-1.5 gap-y-2" style={columns}>
          <span />
          {steps.map((step) => (
            <span key={step} className="text-caption-c1-medium text-neutral">
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

const FULL_CHROMA = 1;

const SWEEP_HUES = Array.from({ length: 24 }, (_, index) => index * 15);

const OFF_CENTER_SEEDS = ['#0d9488', '#fde68a', '#1e3a8a', '#7c3aed', '#ca2356', '#808080'];

const stepsOf = (built: IdsPalette) => PALETTE_STEPS.map((step) => built[step]);

const stepColumns = { gridTemplateColumns: `7rem repeat(${PALETTE_STEPS.length}, minmax(0, 1fr))` };

function StepHeader() {
  return (
    <>
      <span />
      {PALETTE_STEPS.map((step) => (
        <span key={step} className="text-caption-c1-medium text-neutral">
          {step}
        </span>
      ))}
    </>
  );
}

function SwatchRow({ label, hexes, pinned }: { label: string; hexes: string[]; pinned?: string }) {
  return (
    <>
      <span className="text-body-b3-regular truncate">{label}</span>
      {hexes.map((hex, index) => (
        <div
          key={index}
          data-swatch={label}
          data-hex={hex}
          title={hex}
          className="flex min-w-0 flex-col gap-1"
        >
          <span
            className="rounded-indicator inset-ring-neutral h-8 w-full inset-ring-1"
            style={{ background: hex }}
          />
          <code className="text-caption-c2-regular text-neutral truncate font-mono">{hex}</code>
          {hex === pinned && (
            <span data-pinned="" className="text-caption-c2-regular">
              seed
            </span>
          )}
        </div>
      ))}
    </>
  );
}

export const Model: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="hue 한 바퀴"
        description="0° 부터 15° 간격으로 모델이 낸 팔레트입니다(채도 비율 1). 모델은 단계마다 hue 의 주기 함수라서, 어느 hue 에서도 단계가 고르게 이어져야 합니다."
      >
        <div className="grid items-start gap-x-1.5 gap-y-2" style={stepColumns}>
          <StepHeader />
          {SWEEP_HUES.map((hue) => (
            <SwatchRow
              key={hue}
              label={`${hue}°`}
              hexes={stepsOf(paletteAtHue(hue, FULL_CHROMA))}
            />
          ))}
        </div>
      </Showcase.Section>
      <Showcase.Section
        title="500 이 아닌 단계에 놓이는 시드"
        description="시드는 밝기가 가장 가까운 단계에 그대로 들어갑니다. seed 표시가 그 단계입니다. 이웃 단계와의 간격과 hue 가 튀지 않는지 봅니다."
      >
        <div className="grid items-start gap-x-1.5 gap-y-2" style={stepColumns}>
          <StepHeader />
          {OFF_CENTER_SEEDS.map((seed) => (
            <SwatchRow
              key={seed}
              label={seed}
              hexes={stepsOf(createIdsPalette(seed)!)}
              pinned={seed}
            />
          ))}
        </div>
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const pinned = canvasElement.querySelectorAll('[data-pinned]');

    await expect(pinned).toHaveLength(OFF_CENTER_SEEDS.length);
  },
};
