import { COMPARED_STEP, tooClose } from './color-distance';
import { chromaRatioOf, hueOf, rampAtHue } from './palette-seed';

import type { IdsRamp, IdsStatusFamily } from './theme';

export const DERIVED_CHROMA_RATIO = 1 / 3;

export const TERTIARY_HUE_TURN = 60;

type StatusPalettes = { [family in IdsStatusFamily]: IdsRamp };

const derivedChroma = (primary: IdsRamp) => chromaRatioOf(primary) * DERIVED_CHROMA_RATIO;

export const derivedSecondary = (primary: IdsRamp) =>
  rampAtHue(hueOf(primary), derivedChroma(primary));

const closeToAStatus = (palette: IdsRamp, statuses: StatusPalettes) =>
  Object.values(statuses).some((status) =>
    tooClose(palette[COMPARED_STEP], status[COMPARED_STEP]),
  );

export function derivedTertiary(primary: IdsRamp, statuses: StatusPalettes): IdsRamp {
  const hue = hueOf(primary);
  const chroma = derivedChroma(primary);
  const turned = rampAtHue(hue + TERTIARY_HUE_TURN, chroma);
  return closeToAStatus(turned, statuses)
    ? rampAtHue(hue - TERTIARY_HUE_TURN, chroma)
    : turned;
}
