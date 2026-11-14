import {
  formatHex,
  interpolate,
  modeHsl,
  modeLab,
  modeLch,
  modeLrgb,
  modeOklab,
  modeOklch,
  modeRgb,
  parse,
  useMode as registerMode,
  wcagContrast,
} from 'culori/fn';

import {
  PALETTE_STEPS,
  type IdsBrandRoles,
  type IdsPalette,
  type IdsPaletteStep,
  type IdsThemeRoles,
} from './theme';

import type { IdsMode } from '../../../tokens/types';

registerMode(modeRgb);
registerMode(modeLrgb);
registerMode(modeHsl);
registerMode(modeLab);
registerMode(modeLch);
registerMode(modeOklab);
registerMode(modeOklch);

export const AA_TEXT = 4.5;

export const SOFT_TINTS = [0.06, 0.12] as const;

export const NEUTRAL_SURFACE: { [mode in IdsMode]: string } = { light: '#ffffff', dark: '#0a0a0a' };

export const LIGHT_TEXT = '#ffffff';

export const DARK_TEXT = '#0a0a0a';

type ModeRule = {
  primary: IdsPaletteStep;
  secondary: IdsPaletteStep;
  outline: IdsPaletteStep;
  onSecondary: readonly IdsPaletteStep[];
  accent: readonly IdsPaletteStep[];
};

export const ROLE_RULES: { [mode in IdsMode]: ModeRule } = {
  light: {
    primary: 600,
    secondary: 100,
    outline: 200,
    onSecondary: [700, 800, 900],
    accent: [600, 700, 800, 900],
  },
  dark: {
    primary: 600,
    secondary: 950,
    outline: 800,
    onSecondary: [400, 300, 200],
    accent: [500, 400, 300],
  },
};

export type IdsThemeIssue = {
  path: string;
  message: string;
};

export type ParsedPalette = { [step in IdsPaletteStep]: string };

export function parsePalette(palette: IdsPalette | undefined): {
  shades: ParsedPalette | undefined;
  issues: IdsThemeIssue[];
} {
  if (palette === undefined || palette === null || typeof palette !== 'object')
    return {
      shades: undefined,
      issues: [{ path: 'palette', message: 'The theme needs a palette with steps 50 to 950.' }],
    };

  const issues: IdsThemeIssue[] = [];
  const shades = {} as ParsedPalette;

  for (const step of PALETTE_STEPS) {
    const value = (palette as Partial<IdsPalette>)[step];
    const color = typeof value === 'string' ? parse(value) : undefined;

    if (color === undefined) {
      issues.push({
        path: `palette.${step}`,
        message:
          value === undefined
            ? `Step ${step} is missing.`
            : `Step ${step} is not a CSS color: ${String(value)}.`,
      });
      continue;
    }

    shades[step] = formatHex(color);
  }

  return { shades: issues.length === 0 ? shades : undefined, issues };
}

const reaches = (text: string, ...backgrounds: string[]) =>
  backgrounds.every((background) => wcagContrast(text, background) >= AA_TEXT);

function firstReaching(
  shades: ParsedPalette,
  candidates: readonly IdsPaletteStep[],
  backgrounds: string[],
) {
  const step = candidates.find((candidate) => reaches(shades[candidate], ...backgrounds));
  return step === undefined ? undefined : shades[step];
}

export function softTintsOf(secondary: string, primary: string) {
  const towardPrimary = interpolate([secondary, primary], 'oklab');
  return SOFT_TINTS.map((amount) => formatHex(towardPrimary(amount)));
}

function rolesFor(
  shades: ParsedPalette,
  mode: IdsMode,
): { roles: IdsBrandRoles; issues: IdsThemeIssue[] } {
  const rule = ROLE_RULES[mode];
  const issues: IdsThemeIssue[] = [];
  const primary = shades[rule.primary];
  const secondary = shades[rule.secondary];

  const onPrimary = reaches(LIGHT_TEXT, primary)
    ? LIGHT_TEXT
    : reaches(DARK_TEXT, primary)
      ? DARK_TEXT
      : undefined;
  if (onPrimary === undefined)
    issues.push({
      path: `palette.${rule.primary}`,
      message: `${mode}: neither white nor neutral 950 reaches ${AA_TEXT}:1 on primary (step ${rule.primary}).`,
    });

  const onSecondary = firstReaching(shades, rule.onSecondary, [
    secondary,
    ...softTintsOf(secondary, primary),
  ]);
  if (onSecondary === undefined)
    issues.push({
      path: 'palette',
      message: `${mode}: no step of ${rule.onSecondary.join(', ')} reaches ${AA_TEXT}:1 on secondary (step ${rule.secondary}) and its hover and press tints.`,
    });

  const accent = firstReaching(shades, rule.accent, [NEUTRAL_SURFACE[mode], secondary]);
  if (accent === undefined)
    issues.push({
      path: 'palette',
      message: `${mode}: no step of ${rule.accent.join(', ')} reaches ${AA_TEXT}:1 on the surface and on secondary.`,
    });

  const lastCandidate = (steps: readonly IdsPaletteStep[]) => shades[steps[steps.length - 1]!];

  return {
    roles: {
      primary,
      'on-primary': onPrimary ?? LIGHT_TEXT,
      secondary,
      'on-secondary': onSecondary ?? lastCandidate(rule.onSecondary),
      accent: accent ?? lastCandidate(rule.accent),
      outline: shades[rule.outline],
    },
    issues,
  };
}

export function resolveThemeRoles(palette: IdsPalette | undefined): {
  roles: IdsThemeRoles | undefined;
  issues: IdsThemeIssue[];
} {
  const { shades, issues } = parsePalette(palette);
  if (shades === undefined) return { roles: undefined, issues };

  const light = rolesFor(shades, 'light');
  const dark = rolesFor(shades, 'dark');

  return {
    roles: { light: light.roles, dark: dark.roles },
    issues: [...light.issues, ...dark.issues],
  };
}
