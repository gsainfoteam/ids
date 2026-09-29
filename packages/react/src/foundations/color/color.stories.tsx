import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { IdsProvider, useTheme } from '../../components/utility/ids-provider';
import { cn } from '../../utils';

import type { IdsColor } from '../../tokens/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Color',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const colors = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
] as const satisfies readonly IdsColor[];
const modes = ['light', 'dark'] as const;

const brand = ['primary', 'on-primary', 'secondary', 'on-secondary', 'outline'] as const;
const neutral = [
  'surface',
  'on-surface',
  'muted',
  'muted-hover',
  'muted-active',
  'on-muted',
  'border',
  'handle',
  'handle-hover',
  'handle-active',
] as const;
const status = [
  'success',
  'on-success',
  'success-strong',
  'warning',
  'on-warning',
  'warning-strong',
  'danger',
  'on-danger',
  'danger-strong',
  'info',
  'on-info',
  'info-strong',
] as const;

const brandPairs = [
  ['primary', 'on-primary'],
  ['secondary', 'on-secondary'],
] as const;

const pairs = [
  ...brandPairs,
  ['surface', 'on-surface'],
  ['surface', 'on-muted'],
  ['muted', 'on-muted'],
  ['success', 'on-success'],
  ['warning', 'on-warning'],
  ['danger', 'on-danger'],
  ['info', 'on-info'],
  ['surface', 'success-strong'],
  ['surface', 'warning-strong'],
  ['surface', 'danger-strong'],
  ['surface', 'info-strong'],
] as const;

function channels(value: string) {
  const [r = 0, g = 0, b = 0] = (value.match(/[\d.]+/g) ?? []).map(Number);
  return [r, g, b];
}

const hex = (value: string) =>
  `#${channels(value)
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`;

function relativeLuminance(value: string) {
  const [r, g, b] = channels(value).map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrastRatio(a: string, b: string) {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

const grade = (ratio: number) =>
  ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'Fail';

function readSwatch(element: HTMLElement | null) {
  const chip = element?.querySelector<HTMLElement>('[data-chip]');
  const output = element?.querySelector('[data-hex]');
  if (chip && output) output.textContent = hex(getComputedStyle(chip).backgroundColor);
}

function Swatch({ token }: { token: string }) {
  const { color, resolvedMode } = useTheme();
  const rereadWhenThemeChanges = `${color}:${resolvedMode}`;
  return (
    <div
      key={rereadWhenThemeChanges}
      ref={readSwatch}
      data-token={token}
      className="flex items-center gap-2"
    >
      <span
        data-chip=""
        className="rounded-indicator size-7 shrink-0 inset-ring-1 inset-ring-(--ids-color-border)"
        style={{ background: `var(--ids-color-${token})` }}
      />
      <code data-hex="" className="text-caption-c1-regular font-mono text-(--ids-color-on-muted)" />
    </div>
  );
}

function readPair(element: HTMLElement | null) {
  const sample = element?.querySelector<HTMLElement>('[data-sample]');
  const output = element?.querySelector('[data-ratio]');
  if (!sample || !output) return;
  const style = getComputedStyle(sample);
  const ratio = contrastRatio(style.color, style.backgroundColor);
  output.textContent = `${ratio.toFixed(2)}:1 ${grade(ratio)}`;
}

function Pair({ background, foreground }: { background: string; foreground: string }) {
  const { color, resolvedMode } = useTheme();
  const rereadWhenThemeChanges = `${color}:${resolvedMode}`;
  return (
    <div
      key={rereadWhenThemeChanges}
      ref={readPair}
      data-pair={`${foreground} on ${background}`}
      className="flex items-center gap-2"
    >
      <span
        data-sample=""
        className="rounded-indicator text-caption-c1-semibold flex h-7 w-12 shrink-0 items-center justify-center inset-ring-1 inset-ring-(--ids-color-border)"
        style={{
          background: `var(--ids-color-${background})`,
          color: `var(--ids-color-${foreground})`,
        }}
      >
        Aa 가
      </span>
      <code
        data-ratio=""
        className="text-caption-c1-regular font-mono text-(--ids-color-on-muted)"
      />
    </div>
  );
}

const panel = cn('concentric-p-4 inset-ring-1 inset-ring-(--ids-color-border)');

const columnLabel = cn('text-caption-c1-medium text-(--ids-color-on-muted)');

function TokenTable({ tokens }: { tokens: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {modes.map((mode) => (
        <IdsProvider key={mode} mode={mode} className={panel}>
          <div className="flex flex-col gap-2">
            <span className={columnLabel}>{mode}</span>
            {tokens.map((token) => (
              <div key={token} className="grid grid-cols-[8.5rem_auto] items-center gap-3">
                <span className="text-body-b3-regular">{token}</span>
                <Swatch token={token} />
              </div>
            ))}
          </div>
        </IdsProvider>
      ))}
    </div>
  );
}

const brandTokenRow = cn('grid grid-cols-[4.5rem_repeat(5,6.5rem)] items-center gap-x-4');

function BrandTokenTable() {
  return (
    <div className="flex flex-col gap-4">
      {modes.map((mode) => (
        <IdsProvider key={mode} mode={mode} className={panel}>
          <div className="flex flex-col gap-2">
            <div className={brandTokenRow}>
              <span className={columnLabel}>{mode}</span>
              {brand.map((token) => (
                <span key={token} className={columnLabel}>
                  {token}
                </span>
              ))}
            </div>
            {colors.map((color) => (
              <IdsProvider key={color} asChild color={color}>
                <div className={brandTokenRow}>
                  <span className="text-body-b3-regular">{color}</span>
                  {brand.map((token) => (
                    <Swatch key={token} token={token} />
                  ))}
                </div>
              </IdsProvider>
            ))}
          </div>
        </IdsProvider>
      ))}
    </div>
  );
}

const brandContrastRow = cn('grid grid-cols-[4.5rem_repeat(2,10rem)] items-center gap-x-4');

function BrandContrastTable() {
  return (
    <div data-brand-contrast="" className="flex flex-wrap gap-4">
      {modes.map((mode) => (
        <IdsProvider key={mode} mode={mode} className={panel}>
          <div className="flex flex-col gap-2">
            <div className={brandContrastRow}>
              <span className={columnLabel}>{mode}</span>
              {brandPairs.map(([background, foreground]) => (
                <span key={foreground} className={columnLabel}>
                  {foreground} / {background}
                </span>
              ))}
            </div>
            {colors.map((color) => (
              <IdsProvider key={color} asChild color={color}>
                <div className={brandContrastRow}>
                  <span className="text-body-b3-regular">{color}</span>
                  {brandPairs.map(([background, foreground]) => (
                    <Pair key={foreground} background={background} foreground={foreground} />
                  ))}
                </div>
              </IdsProvider>
            ))}
          </div>
        </IdsProvider>
      ))}
    </div>
  );
}

export const Tokens: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Brand"
        description="data-color 17색과 data-mode 둘 다에 따라 바뀝니다. 테마 색을 쓰는 요소는 primary와 secondary뿐이고, outline은 브랜드 색을 띠어야 하는 드문 선에 씁니다."
      >
        <BrandTokenTable />
      </Showcase.Section>
      <Showcase.Section
        title="Neutral"
        description="data-mode에만 따릅니다. 배경(surface, muted), 글자(on-surface, on-muted), 구조선(border), ScrollArea thumb와 Drawer 손잡이(handle)입니다. 상태는 한 단계씩 오릅니다. muted 다음은 muted-hover, muted-active이고, handle 다음은 handle-hover, handle-active입니다."
      >
        <TokenTable tokens={neutral} />
      </Showcase.Section>
      <Showcase.Section
        title="Status"
        description="의미 색입니다. 채움은 기본 톤, 그 위 글자는 on-*, 흰 배경 위 글자와 아이콘은 대비를 지키는 -strong 톤을 씁니다."
      >
        <TokenTable tokens={status} />
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const swatches = [...canvasElement.querySelectorAll('[data-token]')];
    await expect(swatches.length).toBe(
      (brand.length * colors.length + neutral.length + status.length) * modes.length,
    );
    for (const swatch of swatches)
      await expect(swatch.querySelector('[data-hex]')?.textContent).toMatch(/^#[0-9a-f]{6}$/);
  },
};

export const Contrast: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="글자와 배경 대비"
        description="같이 쓰는 짝의 WCAG 대비입니다. 본문 글자는 4.5:1(AA), 큰 글자와 아이콘은 3:1(AA Large) 이상이어야 합니다. 툴바의 color를 바꾸면 브랜드 짝이 다시 계산됩니다."
      >
        <div className="flex flex-wrap gap-4">
          {modes.map((mode) => (
            <IdsProvider key={mode} mode={mode} className={panel}>
              <div className="flex flex-col gap-2">
                <span className={columnLabel}>{mode}</span>
                {pairs.map(([background, foreground]) => (
                  <div
                    key={`${foreground}:${background}`}
                    className="grid grid-cols-[13rem_auto] items-center gap-3"
                  >
                    <span className="text-body-b3-regular">
                      {foreground} / {background}
                    </span>
                    <Pair background={background} foreground={foreground} />
                  </div>
                ))}
              </div>
            </IdsProvider>
          ))}
        </div>
      </Showcase.Section>
      <Showcase.Section
        title="브랜드 17색"
        description="색마다 채움과 그 위 글자의 대비입니다. 모든 색이 두 모드에서 4.5:1(AA)을 넘습니다. 흰 글자로 AA가 안 되는 밝은 색(orange, amber, yellow, lime, emerald, teal, cyan, sky)은 on-primary가 검은 글자입니다."
      >
        <BrandContrastTable />
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const outputs = [...canvasElement.querySelectorAll('[data-ratio]')];
    const brandOutputs = [...canvasElement.querySelectorAll('[data-brand-contrast] [data-ratio]')];

    await expect(outputs.length).toBe(
      (pairs.length + colors.length * brandPairs.length) * modes.length,
    );
    for (const output of outputs)
      await expect(output.textContent).toMatch(/^\d+\.\d{2}:1 (AAA|AA|AA Large|Fail)$/);

    await expect(brandOutputs.length).toBe(colors.length * brandPairs.length * modes.length);
    for (const output of brandOutputs) await expect(output.textContent).toMatch(/:1 AAA?$/);
  },
};
