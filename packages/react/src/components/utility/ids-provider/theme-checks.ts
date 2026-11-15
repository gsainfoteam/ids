import {
  COMPARED_STEP,
  DISTINCT_FAMILIES,
  DISTINCT_UNDER_RED_GREEN_CVD,
  RED_GREEN_PAIRS,
  distanceBetween,
  distanceUnderRedGreenCvd,
} from './color-distance';
import { hueOf } from './palette-seed';
import { STATUS_HUES, readsAs } from './status';
import { IDS_BRAND_FAMILIES, IDS_STATUS_FAMILIES } from '../../../tokens/color-roles';

import type { IdsColorFamily } from './theme';
import type { IdsThemeIssue, ResolvedColors } from './theme-roles';

const pathOf = (family: IdsColorFamily) =>
  (IDS_STATUS_FAMILIES as readonly string[]).includes(family) ? `status.${family}` : family;

const rounded = (value: number) => value.toFixed(3);

export function checkColorDistinction({ palettes, given }: ResolvedColors): IdsThemeIssue[] {
  const issues: IdsThemeIssue[] = [];
  const fill = (family: Exclude<IdsColorFamily, 'neutral'>) => palettes[family][COMPARED_STEP];
  const brands = IDS_BRAND_FAMILIES.filter((family) => given.includes(family));

  const tooClose = (
    a: Exclude<IdsColorFamily, 'neutral'>,
    b: Exclude<IdsColorFamily, 'neutral'>,
  ) => {
    const distance = distanceBetween(fill(a), fill(b));
    if (distance < DISTINCT_FAMILIES)
      issues.push({
        path: pathOf(b),
        message: `${b} is too close to ${a} to tell apart (OKLab ${rounded(distance)}, below ${DISTINCT_FAMILIES}).`,
      });
  };

  for (const [index, brand] of brands.entries())
    for (const other of brands.slice(index + 1)) tooClose(brand, other);

  for (const brand of brands) for (const status of IDS_STATUS_FAMILIES) tooClose(status, brand);

  for (const status of IDS_STATUS_FAMILIES) {
    const hue = hueOf(palettes[status]);
    if (!readsAs(status, hue)) {
      const { from, to } = STATUS_HUES[status];
      issues.push({
        path: `status.${status}`,
        message: `${status} has the hue ${Math.round(hue)}°, which no longer reads as ${status}. Keep it from ${from}° to ${to}°.`,
      });
    }
  }

  for (const [status, other] of RED_GREEN_PAIRS) {
    const distance = distanceUnderRedGreenCvd(fill(status), fill(other));
    if (distance < DISTINCT_UNDER_RED_GREEN_CVD)
      issues.push({
        path: `status.${status}`,
        message: `${status} and ${other} look alike to red-green color blindness (OKLab ${rounded(distance)}, below ${DISTINCT_UNDER_RED_GREEN_CVD}).`,
      });
  }

  return issues;
}
