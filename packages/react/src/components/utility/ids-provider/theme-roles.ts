import { clampChroma, converter, formatHex, interpolate, parse } from 'culori/fn';

import { AA_MARK, AA_TEXT, DARK_TEXT, LIGHT_TEXT, reaches } from './contrast';
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
  IDS_NEUTRAL_PALETTE,
  IDS_NEUTRAL_STEPS,
  IDS_STATUS_FAMILIES,
} from '../../../tokens/color-roles';

import type { IdsMode } from '../../../tokens/types';

export { AA_MARK, AA_TEXT, DARK_TEXT, LIGHT_TEXT };

export const MODES: readonly IdsMode[] = ['light', 'dark'];

export const FILL_STATES = [0.1, 0.2] as const;

export const SOFT_TINTS = [0.06, 0.12] as const;

export const TINTED_NEUTRAL_CHROMA = 0.02;

type ModeRule = {
  fill: IdsPaletteStep;
  soft: IdsPaletteStep;
  onSoft: readonly IdsPaletteStep[];
  text: readonly IdsPaletteStep[];
  border: readonly IdsPaletteStep[];
};

export const ROLE_RULES: { [mode in IdsMode]: ModeRule } = {
  light: {
    fill: 600,
    soft: 100,
    onSoft: [700, 800, 900],
    text: [600, 700, 800, 900],
    border: [600, 700, 800, 900],
  },
  dark: {
    fill: 600,
    soft: 950,
    onSoft: [400, 300, 200],
    text: [500, 400, 300],
    border: [600, 500, 400, 300],
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

const toOklch = converter('oklch');

export const slotsOf = (family: IdsColorFamily) =>
  IDS_FAMILY_SLOTS.map((slot) => slot.replace('{family}', family));

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

export const awayFromText = (text: string) =>
  (toOklch(parse(text)!).l ?? 0) > 0.5 ? '#000000' : '#ffffff';

export const fillStatesOf = (fill: string, onFill: string) =>
  FILL_STATES.map((amount) => mixed(fill, awayFromText(onFill), amount));

export const softTintsOf = (soft: string, fill: string) =>
  SOFT_TINTS.map((amount) => mixed(soft, fill, amount));

function firstReaching(
  shades: IdsPalette,
  candidates: readonly IdsPaletteStep[],
  backgrounds: string[],
  ratio = AA_TEXT,
) {
  const step = candidates.find((candidate) => reaches(shades[candidate], backgrounds, ratio));
  return step === undefined ? undefined : shades[step];
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
  const fill = shades[rule.fill];
  const soft = shades[rule.soft];

  const onFill = reaches(LIGHT_TEXT, [fill])
    ? LIGHT_TEXT
    : reaches(DARK_TEXT, [fill])
      ? DARK_TEXT
      : undefined;
  if (onFill === undefined)
    issues.push({
      path: `${path}.${rule.fill}`,
      message: `${mode}: neither white nor neutral 950 reaches ${AA_TEXT}:1 on ${family} (step ${rule.fill}).`,
    });

  const [fillHover, fillActive] = fillStatesOf(fill, onFill ?? LIGHT_TEXT);
  const [softHover, softActive] = softTintsOf(soft, fill);

  const onSoft = firstReaching(shades, rule.onSoft, [soft, softHover!, softActive!]);
  if (onSoft === undefined)
    issues.push({
      path,
      message: `${mode}: no step of ${rule.onSoft.join(', ')} reaches ${AA_TEXT}:1 on ${family}-soft (step ${rule.soft}) and its hover and press tints.`,
    });

  const text = firstReaching(shades, rule.text, [surface, soft]);
  if (text === undefined)
    issues.push({
      path,
      message: `${mode}: no step of ${rule.text.join(', ')} reaches ${AA_TEXT}:1 as ${family} text on the surface and on ${family}-soft.`,
    });

  const border = firstReaching(shades, rule.border, [surface], AA_MARK);
  if (border === undefined)
    issues.push({
      path,
      message: `${mode}: no step of ${rule.border.join(', ')} reaches ${AA_MARK}:1 as a ${family} line on the surface.`,
    });

  const [
    bg,
    bgHover,
    bgActive,
    bgSoft,
    bgSoftHover,
    bgSoftActive,
    textOn,
    textOnSoft,
    textFamily,
    borderFamily,
  ] = slotsOf(family);

  return {
    roles: {
      [bg!]: fill,
      [bgHover!]: fillHover!,
      [bgActive!]: fillActive!,
      [bgSoft!]: soft,
      [bgSoftHover!]: softHover!,
      [bgSoftActive!]: softActive!,
      [textOn!]: onFill ?? LIGHT_TEXT,
      [textOnSoft!]: onSoft ?? lastOf(shades, rule.onSoft),
      [textFamily!]: text ?? lastOf(shades, rule.text),
      [borderFamily!]: border ?? lastOf(shades, rule.border),
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
    const surface = roles['surface']!;

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
