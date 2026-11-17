import { COMPARED_STEP, tooClose } from './color-distance';
import { chromaRatioOf, hueOf, paletteAtHue } from './palette-seed';

import type { IdsPalette, IdsStatusFamily } from './theme';

export const DERIVED_CHROMA_RATIO = 1 / 3;

export const TERTIARY_HUE_TURN = 60;

type StatusPalettes = { [family in IdsStatusFamily]: IdsPalette };

const derivedChroma = (primary: IdsPalette) => chromaRatioOf(primary) * DERIVED_CHROMA_RATIO;

export const derivedSecondary = (primary: IdsPalette) =>
  paletteAtHue(hueOf(primary), derivedChroma(primary));

const closeToAStatus = (palette: IdsPalette, statuses: StatusPalettes) =>
  Object.values(statuses).some((status) =>
    tooClose(palette[COMPARED_STEP], status[COMPARED_STEP]),
  );

export function derivedTertiary(primary: IdsPalette, statuses: StatusPalettes): IdsPalette {
  const hue = hueOf(primary);
  const chroma = derivedChroma(primary);
  const turned = paletteAtHue(hue + TERTIARY_HUE_TURN, chroma);
  return closeToAStatus(turned, statuses)
    ? paletteAtHue(hue - TERTIARY_HUE_TURN, chroma)
    : turned;
}
