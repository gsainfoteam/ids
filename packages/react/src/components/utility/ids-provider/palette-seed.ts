import { clampChroma, converter, formatHex, parse } from 'culori/fn';

import { takesLightOrDarkText } from './contrast';
import { REFERENCE_PALETTES } from './reference-palettes';
import { PALETTE_STEPS, type IdsPalette } from './theme';

type Shade = { l: number; c: number; h: number };

type Reference = { anchorHue: number; shades: Shade[] };

const toOklch = converter('oklch');

const ANCHOR_STEP_INDEX = PALETTE_STEPS.indexOf(500);

const PRIMARY_STEP_INDEX = PALETTE_STEPS.indexOf(600);

const LIGHTNESS_SEARCH_ROUNDS = 30;

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

const turnsFrom = (from: number, to: number) => (((to - from) % 360) + 360) % 360;

const signedHueDelta = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180;

function shadeOf(color: string): Shade {
  const { l, c, h } = toOklch(parse(color)!);
  return { l, c, h: h ?? 0 };
}

export function referencesFrom(palettes: readonly (readonly string[])[]): Reference[] {
  return palettes
    .map((palette) => {
      const shades = palette.map(shadeOf);
      return { anchorHue: shades[ANCHOR_STEP_INDEX]!.h, shades };
    })
    .sort((a, b) => a.anchorHue - b.anchorHue);
}

let defaultReferences: Reference[] | undefined;

const referencesInIds = () => (defaultReferences ??= referencesFrom(REFERENCE_PALETTES));

function neighboursOf(hue: number, references: Reference[]) {
  for (const [index, below] of references.entries()) {
    const above = references[(index + 1) % references.length]!;
    const span = turnsFrom(below.anchorHue, above.anchorHue) || 360;
    const offset = turnsFrom(below.anchorHue, hue);
    if (offset <= span) return { below, above, amount: offset / span };
  }
  return { below: references[0]!, above: references[0]!, amount: 0 };
}

function blendedShades(hue: number, references: Reference[]): Shade[] {
  const { below, above, amount } = neighboursOf(hue, references);
  return below.shades.map((low, index) => {
    const high = above.shades[index]!;
    return {
      l: lerp(low.l, high.l, amount),
      c: lerp(low.c, high.c, amount),
      h:
        hue +
        lerp(
          signedHueDelta(below.anchorHue, low.h),
          signedHueDelta(above.anchorHue, high.h),
          amount,
        ),
    };
  });
}

function chromaAtLightness(shades: Shade[], lightness: number) {
  const lightest = shades[0]!;
  const darkest = shades[shades.length - 1]!;
  if (lightness >= lightest.l) return lightest.c;
  if (lightness <= darkest.l) return darkest.c;

  for (let index = 0; index < shades.length - 1; index++) {
    const lighter = shades[index]!;
    const darker = shades[index + 1]!;
    if (lightness <= lighter.l && lightness >= darker.l)
      return lerp(lighter.c, darker.c, (lighter.l - lightness) / (lighter.l - darker.l || 1));
  }
  return darkest.c;
}

const inSrgb = (shade: Shade) =>
  formatHex(clampChroma({ mode: 'oklch', l: shade.l, c: shade.c, h: shade.h }, 'oklch'));

function nearestLightnessWithReadableText(shade: Shade) {
  const at = (l: number) => inSrgb({ ...shade, l });
  const searchToward = (limit: number) => {
    let failing = shade.l;
    let passing = limit;
    for (let round = 0; round < LIGHTNESS_SEARCH_ROUNDS; round++) {
      const middle = (failing + passing) / 2;
      if (takesLightOrDarkText(at(middle))) passing = middle;
      else failing = middle;
    }
    return passing;
  };

  const darker = searchToward(0);
  const lighter = searchToward(1);
  return at(shade.l - darker <= lighter - shade.l ? darker : lighter);
}

export function paletteFromSeed(
  seed: string,
  references: Reference[] = referencesInIds(),
): IdsPalette | undefined {
  const parsed = parse(seed);
  if (parsed === undefined) return undefined;

  const { l, c, h } = shadeOf(seed);
  const shades = blendedShades(h, references);
  const referenceChroma = chromaAtLightness(shades, l);
  const chromaRatio = referenceChroma > 0 ? Math.min(1, c / referenceChroma) : 0;
  const steps = shades.map((shade) => ({ ...shade, c: shade.c * chromaRatio }));

  const hexes = steps.map(inSrgb);
  if (!takesLightOrDarkText(hexes[PRIMARY_STEP_INDEX]!))
    hexes[PRIMARY_STEP_INDEX] = nearestLightnessWithReadableText(steps[PRIMARY_STEP_INDEX]!);

  return Object.fromEntries(
    PALETTE_STEPS.map((step, index) => [step, hexes[index]!]),
  ) as unknown as IdsPalette;
}

export function createIdsPalette(seed: string): IdsPalette | undefined {
  return paletteFromSeed(seed);
}
