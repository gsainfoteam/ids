import { clampChroma, formatHex, interpolate } from 'culori/fn';
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
  base: 1,
  surface: 2,
  block: 3,
  soft: 4,
  border: 5,
  strongBorder: 6,
  solid: 7,
  text: 8,
  strongText: 9,
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

export type Backdrop = { kind: 'solid' } | { kind: 'neutral' } | { kind: 'tinted'; solid: string };

const layersOver = (backdrop: Backdrop, text: string): StateLayer[] => {
  if (backdrop.kind === 'solid') return [FILL_LAYER];
  if (backdrop.kind === 'neutral') return [contentLayer(text)];
  return [contentLayer(text), tintLayer(backdrop.solid)];
};

const lowestContrastOver = (text: string, background: string, backdrop: Backdrop) =>
  Math.min(
    ...underStateLayers(background, layersOver(backdrop, text)).map((state) =>
      lightnessContrast(text, state),
    ),
  );

const lightnessOf = (color: string) => shadeOf(color).l;

function candidatesToward(
  end: string,
  absoluteEnd: string,
  ramp: IdsRamp | undefined,
  darker: boolean,
) {
  const endL = lightnessOf(end);
  const beyond = (ramp === undefined ? [] : RAMP_STEPS.map((step) => ramp[step])).filter((color) =>
    darker ? lightnessOf(color) < endL : lightnessOf(color) > endL,
  );
  const outward = beyond.sort((a, b) =>
    darker ? lightnessOf(b) - lightnessOf(a) : lightnessOf(a) - lightnessOf(b),
  );
  return [end, ...outward, absoluteEnd];
}

export type TextOn = { text: string; lc: number; reaches: boolean };

export function textOn(
  background: string,
  backdrop: Backdrop,
  scale: IdsScale,
  mode: IdsMode,
  ramp?: IdsRamp,
): TextOn {
  const darkEnd = stepOf(scale, mode === 'light' ? SCALE_STEP.strongText : SCALE_STEP.base);
  const lightEnd = stepOf(scale, mode === 'light' ? SCALE_STEP.base : SCALE_STEP.strongText);
  const directions = [
    candidatesToward(darkEnd, DARK_TEXT, ramp, true),
    candidatesToward(lightEnd, LIGHT_TEXT, ramp, false),
  ];
  const contrastOf = (text: string) => ({
    text,
    lc: lowestContrastOver(text, background, backdrop),
  });

  const firstReaching = directions
    .map((candidates) => {
      for (const text of candidates) {
        const candidate = contrastOf(text);
        if (candidate.lc >= TEXT_LC) return candidate;
      }
      return undefined;
    })
    .filter((candidate) => candidate !== undefined);

  if (firstReaching.length > 0)
    return { ...maxBy(firstReaching, (pair) => pair.lc)!, reaches: true };
  return { ...maxBy(directions.flat().map(contrastOf), (pair) => pair.lc)!, reaches: false };
}

type SurfaceRule = { at: IdsRampStep } | { lightnessOf: IdsScaleStep };

type ScaleRule = {
  surfaces: readonly SurfaceRule[];
  strongBorder: readonly IdsRampStep[];
  solid: readonly (readonly IdsRampStep[])[];
  outward: readonly IdsRampStep[];
};

const SOLID_STEPS_OUTWARD_FROM_600: ScaleRule['solid'] = [[600], [500, 700], [400, 800]];

const LIGHT_OUTWARD: readonly IdsRampStep[] = RAMP_STEPS;

const DARK_OUTWARD: readonly IdsRampStep[] = [...RAMP_STEPS].reverse();

export const SCALE_RULES: { [mode in IdsMode]: ScaleRule } = {
  light: {
    surfaces: [
      { lightnessOf: SCALE_STEP.base },
      { lightnessOf: SCALE_STEP.surface },
      { lightnessOf: SCALE_STEP.block },
      { at: 100 },
      { at: 200 },
    ],
    strongBorder: LIGHT_OUTWARD.slice(LIGHT_OUTWARD.indexOf(300)),
    solid: SOLID_STEPS_OUTWARD_FROM_600,
    outward: LIGHT_OUTWARD,
  },
  dark: {
    surfaces: [
      { lightnessOf: SCALE_STEP.base },
      { lightnessOf: SCALE_STEP.surface },
      { lightnessOf: SCALE_STEP.block },
      { lightnessOf: SCALE_STEP.soft },
      { lightnessOf: SCALE_STEP.border },
    ],
    strongBorder: DARK_OUTWARD.slice(DARK_OUTWARD.indexOf(900)),
    solid: SOLID_STEPS_OUTWARD_FROM_600,
    outward: DARK_OUTWARD,
  },
};

const rampFromThePage = (ramp: IdsRamp, mode: IdsMode) =>
  (mode === 'light' ? LIGHT_OUTWARD : DARK_OUTWARD).map((step) => ramp[step]);

function towardTheRampKeepingChroma(page: string, rampEnd: string, lightness: number) {
  const pageL = lightnessOf(page);
  if (lightness === pageL) return page;

  const end = shadeOf(rampEnd);
  const along = (lightness - pageL) / (end.l - pageL);
  const tinted = { mode: 'oklch' as const, l: lightness, c: end.c * Math.sqrt(along), h: end.h };
  return formatHex(clampChroma(tinted, 'oklch'));
}

export function onRampAtLightness(ramp: IdsRamp, mode: IdsMode, page: string, lightness: number) {
  const points = rampFromThePage(ramp, mode);
  const pageL = lightnessOf(page);
  const firstL = lightnessOf(points[0]!);

  if (lightness >= Math.min(pageL, firstL) && lightness <= Math.max(pageL, firstL))
    return towardTheRampKeepingChroma(page, points[0]!, lightness);

  for (let index = 0; index < points.length - 1; index++) {
    const from = points[index]!;
    const to = points[index + 1]!;
    const fromL = lightnessOf(from);
    const toL = lightnessOf(to);
    if (lightness < Math.min(fromL, toL) || lightness > Math.max(fromL, toL)) continue;
    return toL === fromL ? from : mixed(from, to, (lightness - fromL) / (toL - fromL));
  }

  return points[points.length - 1]!;
}

function readableSolid(ramp: IdsRamp, stepsOutward: ScaleRule['solid']): IdsRampStep {
  for (const steps of stepsOutward) {
    const best = maxBy(
      steps.map((step) => ({ step, lc: mostReadable([ramp[step]]).lc })),
      (pair) => pair.lc,
    )!;
    if (best.lc >= TEXT_LC) return best.step;
  }
  return 600;
}

const firstStep = (candidates: readonly IdsRampStep[], passes: (step: IdsRampStep) => boolean) =>
  candidates.find(passes) ?? candidates[candidates.length - 1]!;

const stepsBeyond = (outward: readonly IdsRampStep[], step: IdsRampStep) => {
  const beyond = outward.slice(outward.indexOf(step) + 1);
  return beyond.length > 0 ? beyond : [step];
};

export const textBases = (neutral: IdsScale, soft: string) => [
  stepOf(neutral, SCALE_STEP.base),
  stepOf(neutral, SCALE_STEP.surface),
  stepOf(neutral, SCALE_STEP.block),
  soft,
];

export function scaleFromRamp(ramp: IdsRamp, mode: IdsMode, neutral: IdsScale): IdsScale {
  const rule = SCALE_RULES[mode];
  const page = stepOf(neutral, SCALE_STEP.base);
  const surfaces = rule.surfaces.map((surface) =>
    'at' in surface
      ? ramp[surface.at]
      : onRampAtLightness(ramp, mode, page, lightnessOf(stepOf(neutral, surface.lightnessOf))),
  );
  const bases = textBases(neutral, surfaces[SCALE_STEP.soft - 1]!);
  const solidStep = readableSolid(ramp, rule.solid);
  const solid = ramp[solidStep];
  const strongBorder = firstStep(rule.strongBorder, (step) => reaches(ramp[step], bases, MARK_LC));
  const fromTheSolid = rule.outward.slice(rule.outward.indexOf(solidStep));
  const text = firstStep(fromTheSolid, (step) => readsOn(ramp[step], bases, solid, ACCENT_TEXT_LC));
  const strongText = firstStep(stepsBeyond(fromTheSolid, text), (step) =>
    readsOn(ramp[step], bases, solid),
  );

  return [
    ...surfaces,
    ramp[strongBorder],
    solid,
    ramp[text],
    ramp[strongText],
  ] as unknown as IdsScale;
}

export const paletteFromRamp = (ramp: IdsRamp, neutral: IdsPalette = IDS_NEUTRAL_PALETTE) => ({
  light: scaleFromRamp(ramp, 'light', neutral.light),
  dark: scaleFromRamp(ramp, 'dark', neutral.dark),
});

export function createIdsPalette(seed: string): IdsPalette | undefined {
  const ramp = createIdsRamp(seed);
  return ramp === undefined ? undefined : paletteFromRamp(ramp);
}
