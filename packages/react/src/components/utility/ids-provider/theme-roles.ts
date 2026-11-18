import { clampChroma, formatHex, interpolate, parse } from 'culori/fn';
import { maxBy } from 'es-toolkit';

import {
  ACCENT_TEXT_LC,
  DARK_TEXT,
  LIGHT_TEXT,
  MARK_LC,
  TEXT_LC,
  lightnessContrast,
  reaches,
} from './contrast';
import { derivedSecondary, derivedTertiary } from './derived-brands';
import { createIdsPalette, hueOf, shadeOf } from './palette-seed';
import { fixedStatusPalette, harmonizedStatusPalettes } from './status';
import {
  PALETTE_STEPS,
  type IdsColorFamily,
  type IdsColorRoles,
  type IdsNeutral,
  type IdsPalette,
  type IdsPaletteStep,
  type IdsStatusFamily,
  type IdsTheme,
  type IdsThemeColor,
  type IdsThemeOverrides,
  type IdsThemeRoles,
} from './theme';
import {
  IDS_BRAND_FAMILIES,
  IDS_COLOR_FAMILIES,
  IDS_FAMILY_SLOTS,
  IDS_NEUTRAL_ONLY_SLOTS,
  IDS_NEUTRAL_PALETTE,
  IDS_NEUTRAL_STEPS,
  IDS_STATE_OPACITY,
  IDS_STATUS_FAMILIES,
} from '../../../tokens/color-roles';

import type { IdsMode } from '../../../tokens/types';

export { ACCENT_TEXT_LC, DARK_TEXT, LIGHT_TEXT, MARK_LC, TEXT_LC };

export const MODES: readonly IdsMode[] = ['light', 'dark'];

export const STATE_OPACITIES = [IDS_STATE_OPACITY.hover, IDS_STATE_OPACITY.press] as const;

export const TINTED_NEUTRAL_CHROMA = 0.02;

const FILL_STEPS_OUTWARD_FROM_600: readonly (readonly IdsPaletteStep[])[] = [
  [600],
  [500, 700],
  [400, 800],
];

type ModeRule = {
  fill: readonly (readonly IdsPaletteStep[])[];
  subtler: IdsPaletteStep;
  subtlerTowardSurface: number;
  subtle: IdsPaletteStep;
  onSubtle: readonly IdsPaletteStep[];
  text: readonly IdsPaletteStep[];
};

export const ROLE_RULES: { [mode in IdsMode]: ModeRule } = {
  light: {
    fill: FILL_STEPS_OUTWARD_FROM_600,
    subtler: 50,
    subtlerTowardSurface: 0,
    subtle: 100,
    onSubtle: [700, 800, 900, 950],
    text: [600, 700, 800, 900, 950],
  },
  dark: {
    fill: FILL_STEPS_OUTWARD_FROM_600,
    subtler: 950,
    subtlerTowardSurface: 0.5,
    subtle: 950,
    onSubtle: [400, 300, 200, 100, 50],
    text: [500, 400, 300, 200, 100, 50],
  },
};

export type IdsThemeIssue = {
  path: string;
  message: string;
};

export type NeutralPalette = { [step: string]: string };

export type ResolvedColors = {
  palettes: { [family in Exclude<IdsColorFamily, 'neutral'>]: IdsPalette };
  neutral: NeutralPalette;
  given: readonly IdsColorFamily[];
  roles: IdsThemeRoles;
};

const isNeutralOnly = (slot: string) => (IDS_NEUTRAL_ONLY_SLOTS as readonly string[]).includes(slot);

export const slotsOf = (family: IdsColorFamily) =>
  IDS_FAMILY_SLOTS.filter((slot) => family === 'neutral' || !isNeutralOnly(slot)).map((slot) =>
    slot.replace('{family}', family),
  );

export function parsePalette(
  value: IdsThemeColor | undefined,
  path: string,
): { shades: IdsPalette | undefined; issues: IdsThemeIssue[] } {
  if (typeof value === 'string') {
    const generated = createIdsPalette(value);
    return generated === undefined
      ? { shades: undefined, issues: [{ path, message: `${path} is not a CSS color: ${value}.` }] }
      : { shades: generated, issues: [] };
  }

  if (value === undefined || value === null || typeof value !== 'object')
    return {
      shades: undefined,
      issues: [
        {
          path,
          message: `The theme needs ${path}: steps 50 to 950, or one CSS color to build them from.`,
        },
      ],
    };

  const issues: IdsThemeIssue[] = [];
  const shades = {} as IdsPalette;

  for (const step of PALETTE_STEPS) {
    const stepValue = (value as Partial<IdsPalette>)[step];
    const color = typeof stepValue === 'string' ? parse(stepValue) : undefined;

    if (color === undefined) {
      issues.push({
        path: `${path}.${step}`,
        message:
          stepValue === undefined
            ? `Step ${step} is missing.`
            : `Step ${step} is not a CSS color: ${String(stepValue)}.`,
      });
      continue;
    }

    shades[step] = formatHex(color);
  }

  return { shades: issues.length === 0 ? shades : undefined, issues };
}

const mixed = (from: string, to: string, amount: number) =>
  formatHex(interpolate([from, to], 'oklab')(amount));

export const withStateLayer = (base: string, layer: string, opacity: number) =>
  formatHex(interpolate([base, layer], 'rgb')(opacity));

export const underStateLayers = (base: string, content: string) => [
  base,
  ...STATE_OPACITIES.map((opacity) => withStateLayer(base, content, opacity)),
];

function firstReadableOn(
  shades: IdsPalette,
  candidates: readonly IdsPaletteStep[],
  bases: readonly string[],
  lc = TEXT_LC,
) {
  const step = candidates.find((candidate) =>
    reaches(
      shades[candidate],
      bases.flatMap((base) => underStateLayers(base, shades[candidate])),
      lc,
    ),
  );
  return step === undefined ? undefined : shades[step];
}

const lowestContrastUnderStateLayers = (text: string, fill: string) =>
  Math.min(...underStateLayers(fill, text).map((state) => lightnessContrast(text, state)));

function mostReadable(fills: string[]) {
  return maxBy(
    fills.flatMap((fill) =>
      [LIGHT_TEXT, DARK_TEXT].map((text) => ({
        fill,
        text,
        lc: lowestContrastUnderStateLayers(text, fill),
      })),
    ),
    (pair) => pair.lc,
  )!;
}

function readableFill(shades: IdsPalette, stepsOutward: ModeRule['fill']) {
  for (const steps of stepsOutward) {
    const best = mostReadable(steps.map((step) => shades[step]));
    if (best.lc >= TEXT_LC) return best;
  }
  return undefined;
}

const lastOf = (shades: IdsPalette, steps: readonly IdsPaletteStep[]) =>
  shades[steps[steps.length - 1]!];

export function familyRoles(
  family: Exclude<IdsColorFamily, 'neutral'>,
  shades: IdsPalette,
  mode: IdsMode,
  surface: string,
  path: string = family,
): { roles: IdsColorRoles; issues: IdsThemeIssue[] } {
  const rule = ROLE_RULES[mode];
  const issues: IdsThemeIssue[] = [];
  const subtler = mixed(shades[rule.subtler], surface, rule.subtlerTowardSurface);
  const subtle = shades[rule.subtle];

  const readable = readableFill(shades, rule.fill);
  if (readable === undefined)
    issues.push({
      path,
      message: `${mode}: neither white nor neutral 950 reaches Lc ${TEXT_LC} on ${family} steps ${rule.fill.flat().join(', ')} and under their hover and press layers.`,
    });
  const { fill, text: onFill } = readable ?? mostReadable([shades[600]]);

  const onSubtle = firstReadableOn(shades, rule.onSubtle, [subtle]);
  if (onSubtle === undefined)
    issues.push({
      path,
      message: `${mode}: no step of ${rule.onSubtle.join(', ')} reaches Lc ${TEXT_LC} on ${family}-subtle (step ${rule.subtle}) and under its hover and press layers.`,
    });

  const text = firstReadableOn(shades, rule.text, [surface, subtler, subtle], ACCENT_TEXT_LC);
  if (text === undefined)
    issues.push({
      path,
      message: `${mode}: no step of ${rule.text.join(', ')} reaches Lc ${ACCENT_TEXT_LC} as ${family} text on the surface, ${family}-subtler and ${family}-subtle, under their hover and press layers too.`,
    });

  const [bgSubtler, bgSubtle, bg, textOnSubtle, textOn, textFamily, borderFamily] =
    slotsOf(family);

  return {
    roles: {
      [bgSubtler!]: subtler,
      [bgSubtle!]: subtle,
      [bg!]: fill,
      [textOnSubtle!]: onSubtle ?? lastOf(shades, rule.onSubtle),
      [textOn!]: onFill,
      [textFamily!]: text ?? lastOf(shades, rule.text),
      [borderFamily!]: text ?? lastOf(shades, rule.text),
    },
    issues,
  };
}

const bell = (lightness: number) => 4 * lightness * (1 - lightness);

export function neutralPalette(kind: IdsNeutral, primary: IdsPalette): NeutralPalette {
  if (kind !== 'tinted') return { ...IDS_NEUTRAL_PALETTE };

  const hue = hueOf(primary);
  return Object.fromEntries(
    Object.entries(IDS_NEUTRAL_PALETTE).map(([step, pure]) => {
      const { l } = shadeOf(pure);
      const tinted = { mode: 'oklch' as const, l, c: TINTED_NEUTRAL_CHROMA * bell(l), h: hue };
      return [step, formatHex(clampChroma(tinted, 'oklch'))];
    }),
  );
}

export function neutralRoles(neutral: NeutralPalette, mode: IdsMode): IdsColorRoles {
  return Object.fromEntries(
    Object.entries(IDS_NEUTRAL_STEPS[mode]).map(([slot, step]) => [slot, neutral[step]!]),
  );
}

const isStatus = (family: IdsColorFamily): family is IdsStatusFamily =>
  (IDS_STATUS_FAMILIES as readonly string[]).includes(family);

function statusPalette(
  family: IdsStatusFamily,
  status: IdsTheme['status'],
  harmonized: () => { [family in IdsStatusFamily]: IdsPalette },
): { shades: IdsPalette | undefined; issues: IdsThemeIssue[] } {
  if (status === 'fixed') return { shades: fixedStatusPalette(family), issues: [] };

  const given = typeof status === 'object' && status !== null ? status[family] : undefined;
  if (given !== undefined) return parsePalette(given, `status.${family}`);

  return { shades: harmonized()[family], issues: [] };
}

function checkKnownValues(theme: IdsThemeOverrides, issues: IdsThemeIssue[]) {
  if (theme.neutral !== undefined && theme.neutral !== 'pure' && theme.neutral !== 'tinted')
    issues.push({
      path: 'neutral',
      message: `neutral is 'pure' or 'tinted'. Got ${String(theme.neutral)}.`,
    });

  const status = theme.status;
  if (status === undefined || status === 'harmonized' || status === 'fixed') return;
  if (typeof status !== 'object' || status === null) {
    issues.push({
      path: 'status',
      message: `status is 'harmonized', 'fixed' or an object of status colors. Got ${String(status)}.`,
    });
    return;
  }

  for (const key of Object.keys(status))
    if (!(IDS_STATUS_FAMILIES as readonly string[]).includes(key))
      issues.push({
        path: `status.${key}`,
        message: `status takes ${IDS_STATUS_FAMILIES.join(', ')}. Got ${key}.`,
      });
}

export function resolveColors(theme: IdsThemeOverrides): {
  colors: ResolvedColors | undefined;
  issues: IdsThemeIssue[];
} {
  const issues: IdsThemeIssue[] = [];
  checkKnownValues(theme, issues);

  const primary = parsePalette(theme.primary, 'primary');
  issues.push(...primary.issues);
  if (primary.shades === undefined) return { colors: undefined, issues };

  const palettes = { primary: primary.shades } as ResolvedColors['palettes'];
  const given: IdsColorFamily[] = ['primary'];

  for (const family of IDS_BRAND_FAMILIES) {
    if (family === 'primary' || theme[family] === undefined) continue;
    const parsed = parsePalette(theme[family], family);
    issues.push(...parsed.issues);
    if (parsed.shades === undefined) continue;
    palettes[family] = parsed.shades;
    given.push(family);
  }

  let harmonized: { [family in IdsStatusFamily]: IdsPalette } | undefined;
  const harmonizedOnce = () => (harmonized ??= harmonizedStatusPalettes(primary.shades!));

  for (const family of IDS_STATUS_FAMILIES) {
    const parsed = statusPalette(family, theme.status, harmonizedOnce);
    issues.push(...parsed.issues);
    palettes[family] = parsed.shades ?? fixedStatusPalette(family);
  }

  palettes.secondary ??= derivedSecondary(primary.shades);
  palettes.tertiary ??= derivedTertiary(primary.shades, palettes);

  const neutral = neutralPalette(theme.neutral ?? 'pure', primary.shades);

  const rolesIn = (mode: IdsMode) => {
    const roles = neutralRoles(neutral, mode);
    const surface = roles['bg-neutral-subtlest']!;

    for (const family of IDS_COLOR_FAMILIES) {
      if (family === 'neutral') continue;

      const path = isStatus(family) ? `status.${family}` : family;
      const resolved = familyRoles(family, palettes[family], mode, surface, path);
      issues.push(...resolved.issues);
      Object.assign(roles, resolved.roles);
    }

    return roles;
  };

  return {
    colors: { palettes, neutral, given, roles: { light: rolesIn('light'), dark: rolesIn('dark') } },
    issues,
  };
}

const resolvedThemes = new WeakMap<object, ReturnType<typeof resolveColors>>();

export function resolveColorsOnce(theme: IdsThemeOverrides) {
  let resolved = resolvedThemes.get(theme);
  if (resolved === undefined) {
    resolved = resolveColors(theme);
    resolvedThemes.set(theme, resolved);
  }
  return resolved;
}
