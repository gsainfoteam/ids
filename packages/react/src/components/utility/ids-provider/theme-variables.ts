import type { CSSProperties } from 'react';

import {
  BRAND_ROLES,
  type IdsCornerShape,
  type IdsTheme,
  type IdsThemeOverrides,
} from './theme';
import { resolveThemeRoles, type IdsThemeIssue } from './theme-roles';

import type { IdsMode } from '../../../tokens/types';

export const RADIUS_RANGE = { min: 0, max: 18 } as const;

export const INDICATOR_RADIUS_RATIO = 0.4;

export const CONTAINER_RADIUS_RATIO = 1.6;

export const SCALE_RANGE = { min: 0.5, max: 2 } as const;

const CORNER_SHAPES: readonly IdsCornerShape[] = ['round', 'squircle'];

const MODES: readonly IdsMode[] = ['light', 'dark'];

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

function fontVariables(font: IdsThemeOverrides['font'], issues: IdsThemeIssue[]): ThemeVariables {
  if (font === undefined) return {};

  const variables: ThemeVariables = {};

  for (const family of ['sans', 'mono'] as const) {
    const value = font[family];
    if (value === undefined) continue;

    if (typeof value !== 'string' || value.trim() === '') {
      issues.push({
        path: `font.${family}`,
        message: `font.${family} is a CSS font-family value.`,
      });
      continue;
    }

    variables[`--ids-font-family-${family}`] = value;
  }

  return variables;
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

  return { '--ids-corner-shape': cornerShape };
}

function paletteVariables(
  palette: IdsThemeOverrides['palette'],
  issues: IdsThemeIssue[],
): ThemeVariables {
  const { roles, issues: paletteIssues } = resolveThemeRoles(palette);
  issues.push(...paletteIssues);
  if (roles === undefined) return {};

  const variables: ThemeVariables = {};
  for (const mode of MODES)
    for (const role of BRAND_ROLES) variables[themeRoleVariable(mode, role)] = roles[mode][role];

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

export function resolveThemeVariables(theme: IdsThemeOverrides): {
  variables: ThemeVariables;
  scale: number | undefined;
  issues: IdsThemeIssue[];
} {
  const issues: IdsThemeIssue[] = [];

  const variables = {
    ...('palette' in theme ? paletteVariables(theme.palette, issues) : {}),
    ...radiusVariables(theme.radius, issues),
    ...fontVariables(theme.font, issues),
    ...cornerShapeVariables(theme.cornerShape, issues),
    ...scaleVariables(theme.scale, issues),
  };
  const scale = '--ids-scale' in variables ? theme.scale : undefined;

  return { variables, scale, issues };
}

export function checkIdsTheme(theme: IdsTheme): IdsThemeIssue[] {
  return resolveThemeVariables({ ...theme, palette: theme?.palette }).issues;
}

const SANS_FAMILY = '--ids-font-family-sans';

export const themeStyle = (variables: ThemeVariables): CSSProperties =>
  SANS_FAMILY in variables ? { ...variables, fontFamily: `var(${SANS_FAMILY})` } : variables;
