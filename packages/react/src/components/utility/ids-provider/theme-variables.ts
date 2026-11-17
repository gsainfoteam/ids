import { COLOR_KEYS, type IdsCornerShape, type IdsTheme, type IdsThemeOverrides } from './theme';
import { checkColorDistinction } from './theme-checks';
import { MODES, resolveColorsOnce, slotsOf, type IdsThemeIssue } from './theme-roles';
import { IDS_BASE_SLOTS, IDS_COLOR_FAMILIES } from '../../../tokens/color-roles';

import type { IdsMode } from '../../../tokens/types';

export const RADIUS_RANGE = { min: 0, max: 18 } as const;

export const INDICATOR_RADIUS_RATIO = 0.4;

export const CONTAINER_RADIUS_RATIO = 1.6;

export const SCALE_RANGE = { min: 0.5, max: 2 } as const;

const CORNER_SHAPES: readonly IdsCornerShape[] = ['round', 'squircle'];

const insetAt45Degrees = (exponent: number) => 1 - 2 ** (-1 / exponent);

const SUPERELLIPSE_EXPONENT_OF_SQUIRCLE = 4;

const squircleRadiusAsDeepAsRound =
  insetAt45Degrees(2) / insetAt45Degrees(SUPERELLIPSE_EXPONENT_OF_SQUIRCLE);

export const CORNER_RADIUS_SCALE: { [shape in IdsCornerShape]: number } = {
  round: 1,
  squircle: Math.round(squircleRadiusAsDeepAsRound * 100) / 100,
};

export type ThemeVariables = { [variable: `--${string}`]: string };

export const themeRoleVariable = (mode: IdsMode, role: string) =>
  `--ids-theme-${mode}-${role}` as const;

const px = (value: number) => `${Math.round(value)}px`;

function radiusVariables(radius: number | undefined, issues: IdsThemeIssue[]): ThemeVariables {
  if (radius === undefined) return {};

  if (
    typeof radius !== 'number' ||
    !Number.isFinite(radius) ||
    radius < RADIUS_RANGE.min ||
    radius > RADIUS_RANGE.max
  ) {
    issues.push({
      path: 'radius',
      message: `radius is the standard corner in px, from ${RADIUS_RANGE.min} to ${RADIUS_RANGE.max} (half a 36px control). Got ${String(radius)}.`,
    });
    return {};
  }

  return {
    '--ids-theme-radius-standard': px(radius),
    '--ids-theme-radius-indicator': px(radius * INDICATOR_RADIUS_RATIO),
    '--ids-theme-radius-container': px(radius * CONTAINER_RADIUS_RATIO),
  };
}

function cornerShapeVariables(
  cornerShape: IdsCornerShape | undefined,
  issues: IdsThemeIssue[],
): ThemeVariables {
  if (cornerShape === undefined) return {};

  if (!CORNER_SHAPES.includes(cornerShape)) {
    issues.push({
      path: 'cornerShape',
      message: `cornerShape is ${CORNER_SHAPES.map((shape) => `'${shape}'`).join(' or ')}. Got ${String(cornerShape)}.`,
    });
    return {};
  }

  return {
    '--ids-corner-shape': cornerShape,
    '--ids-theme-corner-radius-scale': String(CORNER_RADIUS_SCALE[cornerShape]),
  };
}

const writesColors = (theme: IdsThemeOverrides) => COLOR_KEYS.some((key) => key in theme);

function writtenFamilies(theme: IdsThemeOverrides, complete: boolean) {
  if (complete) return IDS_COLOR_FAMILIES;
  return IDS_COLOR_FAMILIES.filter((family) => family !== 'neutral' || theme.neutral === 'tinted');
}

function colorVariables(
  theme: IdsThemeOverrides,
  complete: boolean,
  issues: IdsThemeIssue[],
): ThemeVariables {
  const { colors, issues: colorIssues } = resolveColorsOnce(theme);
  issues.push(...colorIssues);
  if (colors === undefined) return {};
  issues.push(...checkColorDistinction(colors));

  const families = writtenFamilies(theme, complete);
  const slots = [
    ...(families.includes('neutral') ? IDS_BASE_SLOTS : []),
    ...families.flatMap(slotsOf),
  ];

  const variables: ThemeVariables = {};
  for (const mode of MODES)
    for (const slot of slots) variables[themeRoleVariable(mode, slot)] = colors.roles[mode][slot]!;

  return variables;
}

function scaleVariables(scale: number | undefined, issues: IdsThemeIssue[]): ThemeVariables {
  if (scale === undefined) return {};

  if (
    typeof scale !== 'number' ||
    !Number.isFinite(scale) ||
    scale < SCALE_RANGE.min ||
    scale > SCALE_RANGE.max
  ) {
    issues.push({
      path: 'scale',
      message: `scale multiplies sizes, from ${SCALE_RANGE.min} to ${SCALE_RANGE.max}. Got ${String(scale)}.`,
    });
    return {};
  }

  return { '--ids-scale': String(scale) };
}

export function resolveThemeVariables(
  theme: IdsThemeOverrides,
  inherited?: IdsThemeOverrides,
): {
  variables: ThemeVariables;
  scale: number | undefined;
  issues: IdsThemeIssue[];
} {
  const issues: IdsThemeIssue[] = [];
  const isScope = inherited !== undefined;

  const variables = {
    ...(writesColors(theme) || !isScope
      ? colorVariables(isScope ? { ...inherited, ...theme } : theme, isScope, issues)
      : {}),
    ...radiusVariables(theme.radius, issues),
    ...cornerShapeVariables(theme.cornerShape, issues),
    ...scaleVariables(theme.scale, issues),
  };
  const scale = '--ids-scale' in variables ? theme.scale : undefined;

  return { variables, scale, issues };
}

export function checkIdsTheme(theme: IdsTheme): IdsThemeIssue[] {
  return resolveThemeVariables({ ...theme, primary: theme?.primary }).issues;
}
