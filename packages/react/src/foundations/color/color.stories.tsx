import { useMemo } from 'react';

import { Bar, BarChart, XAxis } from 'recharts';
import { expect } from 'storybook/test';

import { Showcase, paletteHues, palettes } from '~story-kit';

import { Button } from '../../components/action/button';
import { Badge } from '../../components/data/badge';
import { Chart } from '../../components/data/chart';
import { Chip } from '../../components/data/chip';
import { Alert } from '../../components/feedback/alert';
import { Progress } from '../../components/feedback/progress';
import { Checkbox } from '../../components/form/checkbox';
import { Switch } from '../../components/form/switch';
import { Tabs } from '../../components/navigation/tabs';
import { Link } from '../../components/typography/link';
import {
  IdsProvider,
  checkIdsTheme,
  defineIdsTheme,
  useTheme,
} from '../../components/utility/ids-provider';
import { PALETTE_STEPS, type IdsNeutral } from '../../components/utility/ids-provider/theme';
import { resolveColorsOnce } from '../../components/utility/ids-provider/theme-roles';
import {
  IDS_BASE_SLOTS,
  IDS_BRAND_FAMILIES,
  IDS_COLOR_FAMILIES,
  IDS_FAMILY_SLOTS,
  IDS_STATUS_FAMILIES,
} from '../../tokens/color-roles';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Color',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const colors = paletteHues;
const modes = ['light', 'dark'] as const;

const slotTemplates = IDS_FAMILY_SLOTS.map((template) => template.replace('{family}', '·'));

const slotOf = (template: string, family: string) => template.replace('{family}', family);

const familySlots = (family: string) =>
  IDS_FAMILY_SLOTS.map((template) => slotOf(template, family));

type Pairing = readonly [background: string, foreground: string, kind: 'text' | 'mark'];

const pairsOf = (family: string): Pairing[] => [
  [`bg-${family}`, `text-on-${family}`, 'text'],
  [`bg-${family}-hover`, `text-on-${family}`, 'text'],
  [`bg-${family}-soft`, `text-on-${family}-soft`, 'text'],
  [`bg-${family}-soft-active`, `text-on-${family}-soft`, 'text'],
  ['surface', `text-${family}`, 'text'],
  ['surface', `border-${family}`, 'mark'],
];

const brandPairs = pairsOf('primary');

const pairs: Pairing[] = [
  ['surface', 'on-surface', 'text'],
  ['surface', 'text-neutral', 'text'],
  ['bg-neutral-soft', 'text-on-neutral-soft', 'text'],
  ['bg-neutral', 'text-on-neutral', 'text'],
  ...[...IDS_BRAND_FAMILIES, ...IDS_STATUS_FAMILIES].flatMap(pairsOf),
];

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
  if (!chip || !output) return;

  const style = getComputedStyle(chip);
  const isDefined = style.getPropertyValue(`--ids-color-${element!.dataset.token}`).trim() !== '';
  output.textContent = isDefined ? hex(style.backgroundColor) : '';
}

function useRereadKey() {
  const { theme, resolvedMode } = useTheme();
  return `${JSON.stringify(theme)}:${resolvedMode}`;
}

function Swatch({ token }: { token: string }) {
  const rereadWhenThemeChanges = useRereadKey();
  return (
    <div
      key={rereadWhenThemeChanges}
      ref={readSwatch}
      data-token={token}
      className="flex items-center gap-2"
    >
      <span
        data-chip=""
        className="rounded-indicator inset-ring-neutral size-7 shrink-0 inset-ring-1"
        style={{ background: `var(--ids-color-${token})` }}
      />
      <code data-hex="" className="text-caption-c1-regular text-neutral font-mono" />
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

function Pair({
  background,
  foreground,
  kind,
}: {
  background: string;
  foreground: string;
  kind: Pairing[2];
}) {
  const rereadWhenThemeChanges = useRereadKey();
  return (
    <div
      key={rereadWhenThemeChanges}
      ref={readPair}
      data-pair={`${foreground} on ${background}`}
      data-kind={kind}
      className="flex items-center gap-2"
    >
      <span
        data-sample=""
        className="rounded-indicator text-caption-c1-semibold inset-ring-neutral flex h-7 w-12 shrink-0 items-center justify-center inset-ring-1"
        style={{
          background: `var(--ids-color-${background})`,
          color: `var(--ids-color-${foreground})`,
        }}
      >
        {kind === 'mark' ? '■' : 'Aa 가'}
      </span>
      <code data-ratio="" className="text-caption-c1-regular text-neutral font-mono" />
    </div>
  );
}

const panel = cn('w-max concentric-p-4 inset-ring-1 inset-ring-neutral');

const columnLabel = cn('text-caption-c1-medium text-neutral');

const familyRow = cn('grid items-center gap-x-4');
const familyColumns = { gridTemplateColumns: `9rem repeat(${IDS_COLOR_FAMILIES.length}, 6.5rem)` };

function FamilyTable() {
  return (
    <div className="flex flex-col gap-4">
      {modes.map((mode) => (
        <IdsProvider.Scope key={mode} mode={mode} className={panel}>
          <div className="flex flex-col gap-2">
            <div className={familyRow} style={familyColumns}>
              <span className={columnLabel}>{mode}</span>
              {IDS_COLOR_FAMILIES.map((family) => (
                <span key={family} className={columnLabel}>
                  {family}
                </span>
              ))}
            </div>
            {IDS_FAMILY_SLOTS.map((template, index) => (
              <div key={template} className={familyRow} style={familyColumns}>
                <span className="text-body-b3-regular font-mono">{slotTemplates[index]}</span>
                {IDS_COLOR_FAMILIES.map((family) => (
                  <Swatch key={family} token={slotOf(template, family)} />
                ))}
              </div>
            ))}
            {IDS_BASE_SLOTS.map((slot) => (
              <div key={slot} className={familyRow} style={familyColumns}>
                <span className="text-body-b3-regular font-mono">{slot}</span>
                <Swatch token={slot} />
              </div>
            ))}
          </div>
        </IdsProvider.Scope>
      ))}
    </div>
  );
}

const paletteRow = cn('grid items-center gap-x-4');
const primarySlots = familySlots('primary');
const paletteColumns = { gridTemplateColumns: `4.5rem repeat(${primarySlots.length}, 6.5rem)` };

function PaletteTable() {
  return (
    <div className="flex flex-col gap-4">
      {modes.map((mode) => (
        <IdsProvider.Scope key={mode} mode={mode} className={panel}>
          <div className="flex flex-col gap-2">
            <div className={paletteRow} style={paletteColumns}>
              <span className={columnLabel}>{mode}</span>
              {primarySlots.map((token) => (
                <span key={token} className={columnLabel}>
                  {token}
                </span>
              ))}
            </div>
            {colors.map((color) => (
              <IdsProvider.Scope key={color} asChild theme={{ primary: palettes[color] }}>
                <div className={paletteRow} style={paletteColumns}>
                  <span className="text-body-b3-regular">{color}</span>
                  {primarySlots.map((token) => (
                    <Swatch key={token} token={token} />
                  ))}
                </div>
              </IdsProvider.Scope>
            ))}
          </div>
        </IdsProvider.Scope>
      ))}
    </div>
  );
}

const brandContrastRow = cn('grid items-center gap-x-4');
const brandContrastColumns = { gridTemplateColumns: `4.5rem repeat(${brandPairs.length}, 10rem)` };

function BrandContrastTable() {
  return (
    <div data-brand-contrast="" className="flex flex-wrap gap-4">
      {modes.map((mode) => (
        <IdsProvider.Scope key={mode} mode={mode} className={panel}>
          <div className="flex flex-col gap-2">
            <div className={brandContrastRow} style={brandContrastColumns}>
              <span className={columnLabel}>{mode}</span>
              {brandPairs.map(([background, foreground]) => (
                <span key={`${foreground}:${background}`} className={columnLabel}>
                  {foreground} / {background}
                </span>
              ))}
            </div>
            {colors.map((color) => (
              <IdsProvider.Scope key={color} asChild theme={{ primary: palettes[color] }}>
                <div className={brandContrastRow} style={brandContrastColumns}>
                  <span className="text-body-b3-regular">{color}</span>
                  {brandPairs.map(([background, foreground, kind]) => (
                    <Pair
                      key={`${foreground}:${background}`}
                      background={background}
                      foreground={foreground}
                      kind={kind}
                    />
                  ))}
                </div>
              </IdsProvider.Scope>
            ))}
          </div>
        </IdsProvider.Scope>
      ))}
    </div>
  );
}

const passes = { text: /:1 AAA?$/, mark: /:1 (AAA|AA|AA Large)$/ };

export const Tokens: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Families × Roles"
        description="색은 계열 여덟 개가 같은 역할 열 개를 가집니다. 유틸리티 앞머리가 속성을 말합니다: bg-primary-soft 는 배경, text-on-primary-soft 는 그 위 글자, border-primary 는 선입니다. 툴바의 Palette, Secondary, Tertiary, Neutral, Status 를 따릅니다. Secondary 와 Tertiary 가 derived 면 primary 에서 만든 계열입니다. 색을 직접 고르려면 Lab 스토리를 씁니다."
      >
        <FamilyTable />
      </Showcase.Section>
      <Showcase.Section
        title="Primary × 17 palettes"
        description="앱이 준 팔레트에서 IdsProvider 가 대비로 고르고, data-mode 에 따라 바뀝니다. 여기는 레포 데모 팔레트 17개입니다."
      >
        <PaletteTable />
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const swatches = [...canvasElement.querySelectorAll('[data-token]')];
    await expect(swatches.length).toBe(
      (IDS_FAMILY_SLOTS.length * IDS_COLOR_FAMILIES.length +
        IDS_BASE_SLOTS.length +
        primarySlots.length * colors.length) *
        modes.length,
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
        description="같이 쓰는 짝의 WCAG 대비입니다. 글자는 4.5:1(AA), 선과 아이콘 같은 표시는 3:1 이상이어야 합니다. 툴바의 Palette 를 바꾸면 브랜드 짝이 다시 계산됩니다."
      >
        <div className="flex flex-wrap gap-4">
          {modes.map((mode) => (
            <IdsProvider.Scope key={mode} mode={mode} className={panel}>
              <div className="flex flex-col gap-2">
                <span className={columnLabel}>{mode}</span>
                {pairs.map(([background, foreground, kind]) => (
                  <div
                    key={`${foreground}:${background}`}
                    className="grid grid-cols-[17rem_auto] items-center gap-3"
                  >
                    <span className="text-body-b3-regular font-mono">
                      {foreground} / {background}
                    </span>
                    <Pair background={background} foreground={foreground} kind={kind} />
                  </div>
                ))}
              </div>
            </IdsProvider.Scope>
          ))}
        </div>
      </Showcase.Section>
      <Showcase.Section
        title="브랜드 17색"
        description="색마다 채움과 그 위 글자, soft 채움과 그 위 글자, 페이지 위 글자와 선의 대비입니다. 모든 색이 두 모드에서 글자는 4.5:1, 선은 3:1 을 넘습니다. 흰 글자로 AA 가 안 되는 밝은 색은 text-on-primary 가 검은 글자입니다."
      >
        <BrandContrastTable />
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const outputs = [...canvasElement.querySelectorAll('[data-ratio]')];
    const brandOutputs = [...canvasElement.querySelectorAll('[data-brand-contrast] [data-pair]')];

    await expect(outputs.length).toBe(
      (pairs.length + colors.length * brandPairs.length) * modes.length,
    );
    for (const output of outputs)
      await expect(output.textContent).toMatch(/^\d+\.\d{2}:1 (AAA|AA|AA Large|Fail)$/);

    await expect(brandOutputs.length).toBe(colors.length * brandPairs.length * modes.length);
    for (const pair of brandOutputs)
      await expect(pair.querySelector('[data-ratio]')?.textContent).toMatch(
        passes[(pair as HTMLElement).dataset.kind as Pairing[2]],
      );
  },
};

const labSchemes = ['primary', 'secondary', 'tertiary', 'neutral'] as const;

const labStatuses = ['success', 'warning', 'danger', 'info'] as const;

const labPairs = IDS_BRAND_FAMILIES.flatMap(pairsOf);

const labPaletteFamilies = [...IDS_BRAND_FAMILIES, ...IDS_STATUS_FAMILIES];

const presetColors = paletteHues.map((hue) => palettes[hue][600]);

const LAB_CHART_CONFIG = {
  web: { label: '웹' },
  app: { label: '앱' },
  kiosk: { label: '키오스크' },
} satisfies Chart.Config;

const LAB_CHART_ROWS = [
  { day: '월', web: 120, app: 80, kiosk: 30 },
  { day: '화', web: 150, app: 95, kiosk: 42 },
  { day: '수', web: 132, app: 110, kiosk: 38 },
];

type LabArgs = {
  primary: string;
  secondary: string;
  tertiary: string;
  neutral: IdsNeutral;
  status: 'harmonized' | 'fixed';
};

const labThemeOf = ({ primary, secondary, tertiary, neutral, status }: LabArgs) =>
  defineIdsTheme({
    primary,
    secondary: secondary === '' ? undefined : secondary,
    tertiary: tertiary === '' ? undefined : tertiary,
    neutral,
    status,
  });

const sourceOf = (family: string, given: readonly string[], status: LabArgs['status']) =>
  given.includes(family)
    ? '준 색'
    : IDS_BRAND_FAMILIES.includes(family as (typeof IDS_BRAND_FAMILIES)[number])
      ? 'primary 에서 만듦'
      : status;

const labPaletteRow = cn('grid items-center gap-x-2');
const labPaletteColumns = {
  gridTemplateColumns: `6rem 8rem repeat(${PALETTE_STEPS.length}, 4.5rem)`,
};

export const Lab: StoryObj<LabArgs> = {
  args: {
    primary: palettes.blue[600],
    secondary: '',
    tertiary: '',
    neutral: 'pure',
    status: 'harmonized',
  },
  argTypes: {
    primary: {
      description: '브랜드 색 하나. IdsProvider 가 11단계 팔레트로 만든다',
      control: { type: 'color', presetColors },
    },
    secondary: {
      description: '비우면 primary 와 같은 hue 에 채도 1/3',
      control: { type: 'color', presetColors },
    },
    tertiary: {
      description: '비우면 primary hue 를 +60° (상태 색과 겹치면 −60°) 돌리고 채도 1/3',
      control: { type: 'color', presetColors },
    },
    neutral: { control: 'inline-radio', options: ['pure', 'tinted'] },
    status: { control: 'inline-radio', options: ['harmonized', 'fixed'] },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        story:
          'Controls 에서 색을 고르면 팔레트, 역할, 대비, 컴포넌트가 바로 다시 그려집니다. secondary 와 tertiary 를 비우면 primary 에서 만든 계열을 봅니다.',
      },
    },
  },
  render: function Render(args) {
    const { primary, secondary, tertiary, neutral, status } = args;
    const theme = useMemo(
      () => labThemeOf({ primary, secondary, tertiary, neutral, status }),
      [primary, secondary, tertiary, neutral, status],
    );
    const issues = checkIdsTheme(theme);
    const { colors } = resolveColorsOnce(theme);

    return (
      <IdsProvider.Scope theme={theme}>
        <Showcase>
          <Showcase.Section
            title="checkIdsTheme"
            description="IdsProvider 가 개발 모드에서 알리는 목록과 같습니다."
          >
            {issues.length === 0 ? (
              <Alert colorScheme="success" className="max-w-xl">
                <Alert.Title>문제 없음</Alert.Title>
                <Alert.Description>checkIdsTheme 이 빈 목록을 돌려줍니다.</Alert.Description>
              </Alert>
            ) : (
              <Alert colorScheme="warning" className="max-w-xl">
                <Alert.Title>문제 {issues.length}개</Alert.Title>
                <Alert.Description asChild>
                  <ul className="list-disc pl-4">
                    {issues.map((issue) => (
                      <li key={`${issue.path}:${issue.message}`}>
                        <code className="font-mono">{issue.path}</code> {issue.message}
                      </li>
                    ))}
                  </ul>
                </Alert.Description>
              </Alert>
            )}
          </Showcase.Section>
          <Showcase.Section
            title="Palettes"
            description="IdsProvider 가 역할을 고르는 11단계입니다. 채움은 600, 나머지 역할은 대비를 넘는 첫 단계입니다."
          >
            <div data-lab-palettes="" className={cn('flex flex-col gap-2', panel)}>
              <div className={labPaletteRow} style={labPaletteColumns}>
                <span className={columnLabel}>계열</span>
                <span className={columnLabel}>출처</span>
                {PALETTE_STEPS.map((step) => (
                  <span key={step} className={columnLabel}>
                    {step}
                  </span>
                ))}
              </div>
              {colors &&
                labPaletteFamilies.map((family) => (
                  <div key={family} className={labPaletteRow} style={labPaletteColumns}>
                    <span className="text-body-b3-regular font-mono">{family}</span>
                    <span className="text-caption-c1-regular text-neutral">
                      {sourceOf(family, colors.given, status)}
                    </span>
                    {PALETTE_STEPS.map((step) => (
                      <div key={step} className="flex flex-col gap-1">
                        <span
                          className="rounded-indicator inset-ring-neutral h-7 w-full inset-ring-1"
                          style={{ background: colors.palettes[family][step] }}
                        />
                        <code className="text-caption-c1-regular text-neutral font-mono">
                          {colors.palettes[family][step]}
                        </code>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </Showcase.Section>
          <Showcase.Section title="Families × Roles">
            <FamilyTable />
          </Showcase.Section>
          <Showcase.Section
            title="Contrast"
            description="브랜드 세 계열의 짝입니다. 글자는 4.5:1, 선은 3:1 을 넘어야 합니다."
          >
            <div className="flex flex-wrap gap-4">
              {modes.map((mode) => (
                <IdsProvider.Scope key={mode} mode={mode} className={panel}>
                  <div className="flex flex-col gap-2">
                    <span className={columnLabel}>{mode}</span>
                    {labPairs.map(([background, foreground, kind]) => (
                      <div
                        key={`${foreground}:${background}`}
                        className="grid grid-cols-[17rem_auto] items-center gap-3"
                      >
                        <span className="text-body-b3-regular font-mono">
                          {foreground} / {background}
                        </span>
                        <Pair background={background} foreground={foreground} kind={kind} />
                      </div>
                    ))}
                  </div>
                </IdsProvider.Scope>
              ))}
            </div>
          </Showcase.Section>
          <Showcase.Section
            title="Components × Mode"
            description="같은 테마를 컴포넌트에 입혀 봅니다. Chart 의 세 계열은 color 없이 기본 순서를 씁니다."
          >
            <div className="flex flex-wrap gap-4">
              {modes.map((mode) => (
                <IdsProvider.Scope
                  key={mode}
                  mode={mode}
                  className={cn('flex w-[34rem] flex-col gap-4', panel)}
                >
                  <span className={columnLabel}>{mode}</span>
                  {labSchemes.map((colorScheme) => (
                    <div key={colorScheme} className="flex flex-wrap items-center gap-2">
                      <Button colorScheme={colorScheme}>{colorScheme}</Button>
                      <Button colorScheme={colorScheme} variant="soft">
                        soft
                      </Button>
                      <Button colorScheme={colorScheme} variant="outline">
                        outline
                      </Button>
                      <Badge content={5} colorScheme={colorScheme} />
                      <Chip colorScheme={colorScheme}>칩</Chip>
                      <Link colorScheme={colorScheme} href="#lab">
                        링크
                      </Link>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center gap-2">
                    {labStatuses.map((colorScheme) => (
                      <Badge key={colorScheme} content={colorScheme} colorScheme={colorScheme} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {labStatuses.map((colorScheme) => (
                      <Alert key={colorScheme} colorScheme={colorScheme}>
                        <Alert.Title>{colorScheme}</Alert.Title>
                      </Alert>
                    ))}
                  </div>
                  <Tabs defaultValue="overview" colorScheme="primary">
                    <Tabs.List aria-label={`탭 ${mode}`}>
                      <Tabs.Trigger value="overview">개요</Tabs.Trigger>
                      <Tabs.Trigger value="reviews">리뷰</Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="overview">
                      가볍고 오래 가는 무선 키보드입니다.
                    </Tabs.Content>
                    <Tabs.Content value="reviews">리뷰 128개, 평균 4.6점.</Tabs.Content>
                  </Tabs>
                  <div className="flex items-center gap-4">
                    <Checkbox defaultChecked aria-label={`체크 ${mode}`} />
                    <Switch defaultChecked aria-label={`스위치 ${mode}`} />
                  </div>
                  {(['primary', 'secondary', 'tertiary'] as const).map((colorScheme) => (
                    <Progress key={colorScheme} value={60} colorScheme={colorScheme}>
                      <Progress.Label>{colorScheme}</Progress.Label>
                    </Progress>
                  ))}
                  <Chart config={LAB_CHART_CONFIG} className="w-full" tooltip={false}>
                    <Chart.Title>방문</Chart.Title>
                    <BarChart data={LAB_CHART_ROWS}>
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <Bar dataKey="web" radius={4} />
                      <Bar dataKey="app" radius={4} />
                      <Bar dataKey="kiosk" radius={4} />
                    </BarChart>
                  </Chart>
                </IdsProvider.Scope>
              ))}
            </div>
          </Showcase.Section>
        </Showcase>
      </IdsProvider.Scope>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toContain('문제 없음');
    const rows = canvasElement.querySelectorAll('[data-lab-palettes] code');
    await expect(rows.length).toBe(PALETTE_STEPS.length * 7);
    for (const row of rows) await expect(row.textContent).toMatch(/^#[0-9a-f]{6}$/);
  },
};
