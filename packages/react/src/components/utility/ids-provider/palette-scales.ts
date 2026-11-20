import { formatHex, interpolate } from 'culori/fn';
import { maxBy } from 'es-toolkit';

import { ACCENT_TEXT_LC, DARK_TEXT, LIGHT_TEXT, TEXT_LC, lightnessContrast, reaches } from './contrast';
import { createIdsRamp, shadeOf } from './palette-seed';
import {
  RAMP_STEPS,
  type IdsPalette,
  type IdsRamp,
  type IdsRampStep,
  type IdsScale,
  type IdsScaleStep,
} from './theme';
import {
  IDS_NEUTRAL_SCALES,
  IDS_STATE_FILL_COLOR,
  IDS_STATE_OPACITY,
} from '../../../tokens/color-roles';

import type { IdsMode } from '../../../tokens/types';

export const SCALE_STEP = {
  page: 1,
  band: 2,
  soft: 3,
  line: 4,
  handle: 5,
  text: 6,
  fill: 7,
  strongText: 8,
} as const satisfies { [use: string]: IdsScaleStep };

export const stepOf = (scale: IdsScale, step: IdsScaleStep) => scale[step - 1]!;

export const IDS_NEUTRAL_PALETTE: IdsPalette = {
  light: IDS_NEUTRAL_SCALES.light,
  dark: IDS_NEUTRAL_SCALES.dark,
};

export type StateLayer = { color: string; opacities: readonly number[] };

export const contentLayer = (content: string): StateLayer => ({
  color: content,
  opacities: [IDS_STATE_OPACITY.hover, IDS_STATE_OPACITY.press],
});

export const tintLayer = (fill: string): StateLayer => ({
  color: fill,
  opacities: [IDS_STATE_OPACITY.tintHover, IDS_STATE_OPACITY.tintPress],
});

export const FILL_LAYER: StateLayer = {
  color: IDS_STATE_FILL_COLOR,
  opacities: [IDS_STATE_OPACITY.fillHover, IDS_STATE_OPACITY.fillPress],
};

export const mixed = (from: string, to: string, amount: number) =>
  formatHex(interpolate([from, to], 'oklab')(amount));

export const withStateLayer = (base: string, layer: string, opacity: number) =>
  formatHex(interpolate([base, layer], 'rgb')(opacity));

export const underStateLayers = (base: string, layers: readonly StateLayer[]) => [
  base,
  ...layers.flatMap(({ color, opacities }) =>
    opacities.map((opacity) => withStateLayer(base, color, opacity)),
  ),
];

export const readsOn = (text: string, bases: readonly string[], fill: string, lc = TEXT_LC) =>
  reaches(
    text,
    bases.flatMap((base) => underStateLayers(base, [contentLayer(text), tintLayer(fill)])),
    lc,
  );

const lowestContrastUnderStateLayers = (text: string, fill: string) =>
  Math.min(...underStateLayers(fill, [FILL_LAYER]).map((state) => lightnessContrast(text, state)));

export function mostReadable(fills: readonly string[]) {
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

type SurfaceRule = { at: IdsRampStep } | { lightnessOf: IdsScaleStep };

type ScaleRule = {
  surfaces: readonly SurfaceRule[];
  fill: readonly (readonly IdsRampStep[])[];
  text: readonly IdsRampStep[];
  strongText: readonly IdsRampStep[];
};

const FILL_STEPS_OUTWARD_FROM_600: ScaleRule['fill'] = [[600], [500, 700], [400, 800]];

const SAME_LIGHTNESS_AS_THE_NEUTRAL: readonly SurfaceRule[] = [
  { lightnessOf: SCALE_STEP.page },
  { lightnessOf: SCALE_STEP.band },
  { lightnessOf: SCALE_STEP.soft },
  { lightnessOf: SCALE_STEP.line },
  { lightnessOf: SCALE_STEP.handle },
];

export const SCALE_RULES: { [mode in IdsMode]: ScaleRule } = {
  light: {
    surfaces: [{ lightnessOf: SCALE_STEP.page }, { at: 50 }, { at: 100 }, { at: 200 }, { at: 300 }],
    fill: FILL_STEPS_OUTWARD_FROM_600,
    text: [600, 700, 800, 900, 950],
    strongText: [700, 800, 900, 950],
  },
  dark: {
    surfaces: SAME_LIGHTNESS_AS_THE_NEUTRAL,
    fill: FILL_STEPS_OUTWARD_FROM_600,
    text: [500, 400, 300, 200, 100, 50],
    strongText: [400, 300, 200, 100, 50],
  },
};

const rampFromThePage = (ramp: IdsRamp, mode: IdsMode, page: string) => {
  const steps = mode === 'light' ? RAMP_STEPS : [...RAMP_STEPS].reverse();
  return [page, ...steps.map((step) => ramp[step])];
};

export function onRampAtLightness(ramp: IdsRamp, mode: IdsMode, page: string, lightness: number) {
  const points = rampFromThePage(ramp, mode, page);

  for (let index = 0; index < points.length - 1; index++) {
    const from = points[index]!;
    const to = points[index + 1]!;
    const fromL = shadeOf(from).l;
    const toL = shadeOf(to).l;
    if (lightness < Math.min(fromL, toL) || lightness > Math.max(fromL, toL)) continue;
    return toL === fromL ? from : mixed(from, to, (lightness - fromL) / (toL - fromL));
  }

  return points[points.length - 1]!;
}

function readableFill(ramp: IdsRamp, stepsOutward: ScaleRule['fill']) {
  for (const steps of stepsOutward) {
    const best = mostReadable(steps.map((step) => ramp[step]));
    if (best.lc >= TEXT_LC) return best.fill;
  }
  return mostReadable([ramp[600]]).fill;
}

const firstReadableOn = (
  ramp: IdsRamp,
  candidates: readonly IdsRampStep[],
  bases: readonly string[],
  fill: string,
  lc = TEXT_LC,
) =>
  ramp[
    candidates.find((candidate) => readsOn(ramp[candidate], bases, fill, lc)) ??
      candidates[candidates.length - 1]!
  ];

export function scaleFromRamp(ramp: IdsRamp, mode: IdsMode, neutral: IdsScale): IdsScale {
  const rule = SCALE_RULES[mode];
  const page = stepOf(neutral, SCALE_STEP.page);
  const surfaces = rule.surfaces.map((surface) =>
    'at' in surface
      ? ramp[surface.at]
      : onRampAtLightness(ramp, mode, page, shadeOf(stepOf(neutral, surface.lightnessOf)).l),
  );
  const band = surfaces[SCALE_STEP.band - 1]!;
  const soft = surfaces[SCALE_STEP.soft - 1]!;
  const fill = readableFill(ramp, rule.fill);
  const text = firstReadableOn(ramp, rule.text, [page, band, soft], fill, ACCENT_TEXT_LC);
  const strongText = firstReadableOn(ramp, rule.strongText, [band, soft], fill);

  return [...surfaces, text, fill, strongText] as unknown as IdsScale;
}

export const paletteFromRamp = (ramp: IdsRamp, neutral: IdsPalette = IDS_NEUTRAL_PALETTE) => ({
  light: scaleFromRamp(ramp, 'light', neutral.light),
  dark: scaleFromRamp(ramp, 'dark', neutral.dark),
});

export function createIdsPalette(seed: string): IdsPalette | undefined {
  const ramp = createIdsRamp(seed);
  return ramp === undefined ? undefined : paletteFromRamp(ramp);
}
