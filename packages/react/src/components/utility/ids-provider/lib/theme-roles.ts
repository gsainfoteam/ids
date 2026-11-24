import { clampChroma, formatHex, parse } from 'culori/fn';

import { ACCENT_TEXT_LC, DARK_TEXT, LIGHT_TEXT, MARK_LC, TEXT_LC, reaches } from './contrast';
import { derivedSecondary, derivedTertiary } from './derived-brands';
import {
  FILL_LAYER,
  IDS_NEUTRAL_PALETTE,
  SCALE_RULES,
  SCALE_STEP,
  contentLayer,
  paletteFromRamp,
  readsOn,
  stepOf,
  textBases,
  textOn,
  tintLayer,
  underStateLayers,
  withStateLayer,
  type Backdrop,
  type StateLayer,
} from './palette-scales';
import { createIdsRamp, hueOf, shadeOf } from './palette-seed';
import { fixedStatusPalette, harmonizedStatusPalettes } from './status';
import {
  COLOR_KEYS,
  RAMP_STEPS,
  SCALE_STEPS,
  type IdsColorFamily,
  type IdsColorRoles,
  type IdsNeutral,
  type IdsPalette,
  type IdsRamp,
  type IdsScale,
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
  IDS_NEUTRAL_STEPS,
  IDS_STATUS_FAMILIES,
} from '../../../../tokens/color-roles';

import type { IdsMode } from '../../../../tokens/types';

export { ACCENT_TEXT_LC, DARK_TEXT, LIGHT_TEXT, MARK_LC, TEXT_LC };

export {
  FILL_LAYER,
  SCALE_RULES,
  contentLayer,
  tintLayer,
  underStateLayers,
  withStateLayer,
  type StateLayer,
};

export const MODES: readonly IdsMode[] = ['light', 'dark'];

export const TINTED_NEUTRAL_CHROMA = 0.02;

export type IdsThemeIssue = {
  path: string;
  message: string;
};

type ColoredFamily = Exclude<IdsColorFamily, 'neutral'>;

export type ResolvedColors = {
  ramps: { [family in ColoredFamily]: IdsRamp };
  palettes: { [family in ColoredFamily]: IdsPalette };
  neutral: IdsPalette;
  given: readonly IdsColorFamily[];
  roles: IdsThemeRoles;
};

type FamilyColors = { ramp: IdsRamp; palette?: IdsPalette };

const isNeutralOnly = (slot: string) =>
  (IDS_NEUTRAL_ONLY_SLOTS as readonly string[]).includes(slot);

export const slotsOf = (family: IdsColorFamily) =>
  IDS_FAMILY_SLOTS.filter((slot) => family === 'neutral' || !isNeutralOnly(slot)).map((slot) =>
    slot.replace('{family}', family),
  );

const isPalette = (value: object): value is Partial<IdsPalette> =>
  'light' in value || 'dark' in value;

function parseScale(value: unknown, path: string, issues: IdsThemeIssue[]): IdsScale | undefined {
  if (!Array.isArray(value) || value.length !== SCALE_STEPS.length) {
    issues.push({
      path,
      message: `${path} takes ${SCALE_STEPS.length} colors, steps 1 to ${SCALE_STEPS.length}.`,
    });
    return undefined;
  }

  const colors = value.map((step: unknown, index) => {
    const color = typeof step === 'string' ? parse(step) : undefined;
    if (color === undefined)
      issues.push({
        path: `${path}.${index + 1}`,
        message: `Step ${index + 1} is not a CSS color: ${String(step)}.`,
      });
    return color === undefined ? undefined : formatHex(color);
  });

  return colors.includes(undefined) ? undefined : (colors as unknown as IdsScale);
}

function parseRamp(value: object, path: string, issues: IdsThemeIssue[]): IdsRamp | undefined {
  const before = issues.length;
  const shades = {} as IdsRamp;

  for (const step of RAMP_STEPS) {
    const stepValue = (value as Partial<IdsRamp>)[step];
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

  return issues.length === before ? shades : undefined;
}

export function parseThemeColor(
  value: IdsThemeColor | undefined,
  path: string,
): { colors: FamilyColors | undefined; issues: IdsThemeIssue[] } {
  if (typeof value === 'string') {
    const ramp = createIdsRamp(value);
    return ramp === undefined
      ? { colors: undefined, issues: [{ path, message: `${path} is not a CSS color: ${value}.` }] }
      : { colors: { ramp }, issues: [] };
  }

  if (value === undefined || value === null || typeof value !== 'object')
    return {
      colors: undefined,
      issues: [
        {
          path,
          message: `The theme needs ${path}: one CSS color, steps 50 to 950, or light and dark scales of ${SCALE_STEPS.length} colors.`,
        },
      ],
    };

  const issues: IdsThemeIssue[] = [];

  if (isPalette(value)) {
    const light = parseScale(value.light, `${path}.light`, issues);
    const dark = parseScale(value.dark, `${path}.dark`, issues);
    if (light === undefined || dark === undefined) return { colors: undefined, issues };
    return {
      colors: { ramp: createIdsRamp(stepOf(light, SCALE_STEP.solid))!, palette: { light, dark } },
      issues,
    };
  }

  const ramp = parseRamp(value, path, issues);
  return { colors: ramp === undefined ? undefined : { ramp }, issues };
}

const textOnRole = (
  role: string,
  background: string,
  backdrop: Backdrop,
  scale: IdsScale,
  mode: IdsMode,
  ramp: IdsRamp | undefined,
  path: string,
  issues: IdsThemeIssue[],
) => {
  const on = textOn(background, backdrop, scale, mode, ramp);
  if (!on.reaches)
    issues.push({
      path,
      message: `${mode}: no color of the scale, its ramp, white or neutral 950 reaches Lc ${TEXT_LC} as ${role}, under the hover and press layers too.`,
    });
  return on.text;
};

export function familyRoles(
  family: ColoredFamily,
  scale: IdsScale,
  mode: IdsMode,
  neutral: IdsScale,
  ramp?: IdsRamp,
  path: string = family,
): { roles: IdsColorRoles; issues: IdsThemeIssue[] } {
  const issues: IdsThemeIssue[] = [];
  const soft = stepOf(scale, SCALE_STEP.soft);
  const solid = stepOf(scale, SCALE_STEP.solid);
  const strongBorder = stepOf(scale, SCALE_STEP.strongBorder);
  const text = stepOf(scale, SCALE_STEP.text);
  const strongText = stepOf(scale, SCALE_STEP.strongText);
  const bases = textBases(neutral, soft);
  const surfaces = `base, surface, block and ${family}-soft`;

  if (!reaches(strongBorder, bases, MARK_LC))
    issues.push({
      path,
      message: `${mode}: border-${family}-strong (step ${SCALE_STEP.strongBorder}) does not reach Lc ${MARK_LC} on ${surfaces}.`,
    });

  if (!readsOn(text, bases, solid, ACCENT_TEXT_LC))
    issues.push({
      path,
      message: `${mode}: text-${family} (step ${SCALE_STEP.text}) does not reach Lc ${ACCENT_TEXT_LC} on ${surfaces}, under their hover and press layers too.`,
    });

  if (!readsOn(strongText, bases, solid))
    issues.push({
      path,
      message: `${mode}: text-${family}-strong (step ${SCALE_STEP.strongText}) does not reach Lc ${TEXT_LC} on ${surfaces}, under their hover and press layers too.`,
    });

  return {
    roles: {
      [`bg-${family}-soft`]: soft,
      [`bg-${family}-solid`]: solid,
      [`border-${family}`]: stepOf(scale, SCALE_STEP.border),
      [`border-${family}-strong`]: strongBorder,
      [`text-${family}`]: text,
      [`text-${family}-strong`]: strongText,
      [`text-on-${family}-soft`]: textOnRole(
        `text-on-${family}-soft`,
        soft,
        { kind: 'tinted', solid },
        scale,
        mode,
        ramp,
        path,
        issues,
      ),
      [`text-on-${family}-solid`]: textOnRole(
        `text-on-${family}-solid`,
        solid,
        { kind: 'solid' },
        scale,
        mode,
        ramp,
        path,
        issues,
      ),
    },
    issues,
  };
}

const bell = (lightness: number) => 4 * lightness * (1 - lightness);

const tintedScale = (scale: IdsScale, hue: number) =>
  scale.map((pure) => {
    const { l } = shadeOf(pure);
    const tinted = { mode: 'oklch' as const, l, c: TINTED_NEUTRAL_CHROMA * bell(l), h: hue };
    return formatHex(clampChroma(tinted, 'oklch'));
  }) as unknown as IdsScale;

export function neutralPalette(kind: IdsNeutral, primary: IdsRamp): IdsPalette {
  if (kind !== 'tinted') return IDS_NEUTRAL_PALETTE;

  const hue = hueOf(primary);
  return {
    light: tintedScale(IDS_NEUTRAL_PALETTE.light, hue),
    dark: tintedScale(IDS_NEUTRAL_PALETTE.dark, hue),
  };
}

const NEUTRAL_TEXT_ON: readonly (readonly [string, string, Backdrop])[] = [
  ['text-on-base', 'bg-base', { kind: 'neutral' }],
  ['text-on-surface', 'bg-surface', { kind: 'neutral' }],
  ['text-on-block', 'bg-block', { kind: 'neutral' }],
  ['text-on-neutral-soft', 'bg-neutral-soft', { kind: 'neutral' }],
  ['text-on-neutral-solid', 'bg-neutral-solid', { kind: 'solid' }],
];

export function neutralRoles(
  neutral: IdsScale,
  mode: IdsMode,
  issues: IdsThemeIssue[] = [],
): IdsColorRoles {
  const roles: IdsColorRoles = Object.fromEntries(
    Object.entries(IDS_NEUTRAL_STEPS).map(([slot, step]) => [slot, neutral[step - 1]!]),
  );

  for (const [role, background, backdrop] of NEUTRAL_TEXT_ON)
    roles[role] = textOnRole(
      role,
      roles[background]!,
      backdrop,
      neutral,
      mode,
      undefined,
      'neutral',
      issues,
    );

  return roles;
}

const isStatus = (family: IdsColorFamily): family is IdsStatusFamily =>
  (IDS_STATUS_FAMILIES as readonly string[]).includes(family);

function statusColors(
  family: IdsStatusFamily,
  status: IdsTheme['status'],
  harmonized: () => { [family in IdsStatusFamily]: IdsRamp },
): { colors: FamilyColors | undefined; issues: IdsThemeIssue[] } {
  if (status === 'fixed') return { colors: { ramp: fixedStatusPalette(family) }, issues: [] };

  const given = typeof status === 'object' && status !== null ? status[family] : undefined;
  if (given !== undefined) return parseThemeColor(given, `status.${family}`);

  return { colors: { ramp: harmonized()[family] }, issues: [] };
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

  const primary = parseThemeColor(theme.primary, 'primary');
  issues.push(...primary.issues);
  if (primary.colors === undefined) return { colors: undefined, issues };

  const families = { primary: primary.colors } as { [family in ColoredFamily]: FamilyColors };
  const given: IdsColorFamily[] = ['primary'];

  for (const family of IDS_BRAND_FAMILIES) {
    if (family === 'primary' || theme[family] === undefined) continue;
    const parsed = parseThemeColor(theme[family], family);
    issues.push(...parsed.issues);
    if (parsed.colors === undefined) continue;
    families[family] = parsed.colors;
    given.push(family);
  }

  const primaryRamp = primary.colors.ramp;
  let harmonized: { [family in IdsStatusFamily]: IdsRamp } | undefined;
  const harmonizedOnce = () => (harmonized ??= harmonizedStatusPalettes(primaryRamp));

  for (const family of IDS_STATUS_FAMILIES) {
    const parsed = statusColors(family, theme.status, harmonizedOnce);
    issues.push(...parsed.issues);
    families[family] = parsed.colors ?? { ramp: fixedStatusPalette(family) };
  }

  const statusRamps = Object.fromEntries(
    IDS_STATUS_FAMILIES.map((family) => [family, families[family].ramp]),
  ) as { [family in IdsStatusFamily]: IdsRamp };

  families.secondary ??= { ramp: derivedSecondary(primaryRamp) };
  families.tertiary ??= { ramp: derivedTertiary(primaryRamp, statusRamps) };

  const neutral = neutralPalette(theme.neutral ?? 'pure', primaryRamp);

  const coloredFamilies = IDS_COLOR_FAMILIES.filter(
    (family): family is ColoredFamily => family !== 'neutral',
  );

  const ramps = Object.fromEntries(
    coloredFamilies.map((family) => [family, families[family].ramp]),
  ) as ResolvedColors['ramps'];

  const palettes = Object.fromEntries(
    coloredFamilies.map((family) => [
      family,
      families[family].palette ?? paletteFromRamp(families[family].ramp, neutral),
    ]),
  ) as ResolvedColors['palettes'];

  const rolesIn = (mode: IdsMode) => {
    const roles = neutralRoles(neutral[mode], mode, issues);

    for (const family of coloredFamilies) {
      const path = isStatus(family) ? `status.${family}` : family;
      const resolved = familyRoles(
        family,
        palettes[family][mode],
        mode,
        neutral[mode],
        ramps[family],
        path,
      );
      issues.push(...resolved.issues);
      Object.assign(roles, resolved.roles);
    }

    return roles;
  };

  return {
    colors: {
      ramps,
      palettes,
      neutral,
      given,
      roles: { light: rolesIn('light'), dark: rolesIn('dark') },
    },
    issues,
  };
}

const RESOLVED_COLOR_SETS_KEPT = 64;

const resolvedColorSets = new Map<string, ReturnType<typeof resolveColors>>();

function colorSetKey(theme: IdsThemeOverrides) {
  try {
    return JSON.stringify(COLOR_KEYS.map((key) => theme[key]));
  } catch {
    return undefined;
  }
}

export function resolveColorsOnce(theme: IdsThemeOverrides) {
  const key = colorSetKey(theme);
  if (key === undefined) return resolveColors(theme);

  const kept = resolvedColorSets.get(key);
  if (kept !== undefined) {
    resolvedColorSets.delete(key);
    resolvedColorSets.set(key, kept);
    return kept;
  }

  const resolved = resolveColors(theme);
  resolvedColorSets.set(key, resolved);
  if (resolvedColorSets.size > RESOLVED_COLOR_SETS_KEPT)
    resolvedColorSets.delete(resolvedColorSets.keys().next().value!);
  return resolved;
}
