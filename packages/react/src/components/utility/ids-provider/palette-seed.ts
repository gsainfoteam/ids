import {
  clampChroma,
  formatHex,
  modeHsl,
  modeLab,
  modeLch,
  modeLrgb,
  modeOklab,
  modeOklch,
  modeRgb,
  parse,
  useMode as registerMode,
} from 'culori/fn';
import { clamp, minBy, range } from 'es-toolkit';

import { PALETTE_STEPS, type IdsPalette } from './theme';
import { PALETTE_MODEL } from '../../../tokens/palette-model';

type Shade = { l: number; c: number; h: number };

type ModelShade = { l: number; gamutShare: number; h: number };

const CSS_COLOR_MODES_A_SEED_MAY_BE_WRITTEN_IN = [
  modeRgb,
  modeLrgb,
  modeHsl,
  modeLab,
  modeLch,
  modeOklab,
];

for (const mode of CSS_COLOR_MODES_A_SEED_MAY_BE_WRITTEN_IN) registerMode(mode);

const toOklch = registerMode(modeOklch);

const BEYOND_SRGB_CHROMA = 0.5;

const DEGREES = Math.PI / 180;

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

export const signedHueDelta = (from: number, to: number) =>
  ((((to - from) % 360) + 540) % 360) - 180;

export function shadeOf(color: string): Shade {
  const { l, c, h } = toOklch(parse(color)!);
  return { l, c, h: h ?? 0 };
}

const harmonicTerm = (index: number, hue: number) => {
  if (index === 0) return 1;
  const angle = Math.ceil(index / 2) * hue * DEGREES;
  return index % 2 === 1 ? Math.cos(angle) : Math.sin(angle);
};

const seriesAt = (coefficients: readonly number[], hue: number) =>
  coefficients.reduce((sum, coefficient, index) => sum + coefficient * harmonicTerm(index, hue), 0);

const gamutChroma = (l: number, h: number) =>
  clampChroma({ mode: 'oklch', l, c: BEYOND_SRGB_CHROMA, h }, 'oklch').c;

function modelAt(hue: number): ModelShade[] {
  return PALETTE_STEPS.map((_, index) => ({
    l: seriesAt(PALETTE_MODEL.lightness[index]!, hue),
    gamutShare: clamp(seriesAt(PALETTE_MODEL.chroma[index]!, hue), 0, 1),
    h: hue + seriesAt(PALETTE_MODEL.hueShift[index]!, hue),
  }));
}

const nearestStepIndex = (model: ModelShade[], lightness: number) =>
  minBy(range(model.length), (index) => Math.abs(model[index]!.l - lightness))!;

function gamutShareAtLightness(model: ModelShade[], lightness: number) {
  const lightest = model[0]!;
  const darkest = model[model.length - 1]!;
  if (lightness >= lightest.l) return lightest.gamutShare;
  if (lightness <= darkest.l) return darkest.gamutShare;

  for (let index = 0; index < model.length - 1; index++) {
    const lighter = model[index]!;
    const darker = model[index + 1]!;
    if (lightness <= lighter.l && lightness >= darker.l)
      return lerp(
        lighter.gamutShare,
        darker.gamutShare,
        (lighter.l - lightness) / (lighter.l - darker.l || 1),
      );
  }
  return darkest.gamutShare;
}

function chromaRatioAgainst(model: ModelShade[], shade: Shade) {
  const modelChroma = gamutShareAtLightness(model, shade.l) * gamutChroma(shade.l, shade.h);
  return modelChroma > 0 ? Math.min(1, shade.c / modelChroma) : 0;
}

const shadesOf = (model: ModelShade[], chromaRatio: number): Shade[] =>
  model.map(({ l, gamutShare, h }) => ({ l, h, c: gamutShare * chromaRatio * gamutChroma(l, h) }));

const inSrgb = (shade: Shade) =>
  formatHex(clampChroma({ mode: 'oklch', l: shade.l, c: shade.c, h: shade.h }, 'oklch'));

function paletteOf(steps: Shade[]): IdsPalette {
  return paletteFromSteps(steps.map(inSrgb));
}

export function paletteFromSeed(seed: string): IdsPalette | undefined {
  if (parse(seed) === undefined) return undefined;

  const shade = shadeOf(seed);
  const model = modelAt(shade.h);
  const steps = shadesOf(model, chromaRatioAgainst(model, shade));
  steps[nearestStepIndex(model, shade.l)] = shade;

  return paletteOf(steps);
}

export const hueOf = (palette: IdsPalette) => shadeOf(palette[500]).h;

export function chromaRatioOf(palette: IdsPalette) {
  const shade = shadeOf(palette[500]);
  return chromaRatioAgainst(modelAt(shade.h), shade);
}

export const paletteAtHue = (hue: number, chromaRatio: number): IdsPalette =>
  paletteOf(shadesOf(modelAt(hue), chromaRatio));

export const chromaOf = (palette: IdsPalette) => shadeOf(palette[500]).c;

export function rotatedPalette(palette: IdsPalette, degrees: number): IdsPalette {
  return paletteOf(
    PALETTE_STEPS.map((step) => {
      const shade = shadeOf(palette[step]);
      return { ...shade, h: shade.h + degrees };
    }),
  );
}

export function paletteFromSteps(steps: readonly string[]): IdsPalette {
  return Object.fromEntries(
    PALETTE_STEPS.map((step, index) => [step, steps[index]!]),
  ) as unknown as IdsPalette;
}

export function createIdsPalette(seed: string): IdsPalette | undefined {
  return paletteFromSeed(seed);
}
