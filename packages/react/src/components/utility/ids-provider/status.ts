import { COMPARED_STEP, RED_GREEN_PAIRS, alikeUnderRedGreenCvd, tooClose } from './color-distance';
import { chromaOf, hueOf, paletteFromSteps, rotatedPalette, signedHueDelta } from './palette-seed';
import { referencePalette, type ReferenceName } from './reference-palettes';

import type { IdsPalette, IdsStatusFamily } from './theme';

export const STATUS_REFERENCES = {
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  info: 'sky',
} as const satisfies { [family in IdsStatusFamily]: ReferenceName };

export const STATUS_HUES: { [family in IdsStatusFamily]: { from: number; to: number } } = {
  danger: { from: 5, to: 31 },
  warning: { from: 31, to: 108 },
  success: { from: 108, to: 200 },
  info: { from: 200, to: 268 },
};

export const HARMONIZE_LIMIT = 15;

const STAYS_INSIDE_ITS_HUES = 1;

const ACHROMATIC = 0.02;

const around = (hue: number) => ((hue % 360) + 360) % 360;

export function readsAs(family: IdsStatusFamily, hue: number) {
  const { from, to } = STATUS_HUES[family];
  return around(hue - from) < to - from;
}

export function harmonizedRotation(family: IdsStatusFamily, hue: number, primaryHue: number) {
  const distance = signedHueDelta(hue, primaryHue);
  const toward = Math.sign(distance) * Math.min(HARMONIZE_LIMIT, Math.abs(distance) / 2);
  const { from, to } = STATUS_HUES[family];
  const roomBelow = around(hue - from) - STAYS_INSIDE_ITS_HUES;
  const roomAbove = around(to - hue) - STAYS_INSIDE_ITS_HUES;
  return Math.min(Math.max(toward, -Math.max(roomBelow, 0)), Math.max(roomAbove, 0));
}

export const fixedStatusPalette = (family: IdsStatusFamily) =>
  paletteFromSteps(referencePalette(STATUS_REFERENCES[family]));

const HALVINGS_BEFORE_GIVING_UP = 6;

type StatusPalettes = { [family in IdsStatusFamily]: IdsPalette };

const statusFamilies = Object.keys(STATUS_REFERENCES) as IdsStatusFamily[];

const fixedPalettes = () =>
  Object.fromEntries(
    statusFamilies.map((family) => [family, fixedStatusPalette(family)]),
  ) as StatusPalettes;

function familiesLosingDistinction(
  palettes: StatusPalettes,
  fixed: StatusPalettes,
  primary: string,
) {
  const fill = (family: IdsStatusFamily) => palettes[family][COMPARED_STEP];
  const losing = new Set<IdsStatusFamily>();

  for (const family of statusFamilies)
    if (tooClose(fill(family), primary) && !tooClose(fixed[family][COMPARED_STEP], primary))
      losing.add(family);

  for (const [status, other] of RED_GREEN_PAIRS)
    if (alikeUnderRedGreenCvd(fill(status), fill(other))) {
      losing.add(status);
      losing.add(other);
    }

  return losing;
}

export function harmonizedStatusPalettes(primary: IdsPalette): StatusPalettes {
  const fixed = fixedPalettes();
  if (chromaOf(primary) < ACHROMATIC) return fixed;

  const rotations = Object.fromEntries(
    statusFamilies.map((family) => [
      family,
      harmonizedRotation(family, hueOf(fixed[family]), hueOf(primary)),
    ]),
  ) as { [family in IdsStatusFamily]: number };

  const rotate = () =>
    Object.fromEntries(
      statusFamilies.map((family) => [
        family,
        rotations[family] === 0 ? fixed[family] : rotatedPalette(fixed[family], rotations[family]),
      ]),
    ) as StatusPalettes;

  let palettes = rotate();
  for (let halving = 0; halving <= HALVINGS_BEFORE_GIVING_UP; halving++) {
    const losing = familiesLosingDistinction(palettes, fixed, primary[COMPARED_STEP]);
    if (losing.size === 0) return palettes;
    for (const family of losing)
      rotations[family] = halving === HALVINGS_BEFORE_GIVING_UP ? 0 : rotations[family] / 2;
    palettes = rotate();
  }

  return palettes;
}
