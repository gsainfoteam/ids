import { parse } from 'culori/fn';

import { oklabDistance, redGreenDeficiencies } from './contrast';

import type { IdsStatusFamily } from './theme';

export const DISTINCT_FAMILIES = 0.039;

export const DISTINCT_UNDER_RED_GREEN_CVD = 0.07;

export const COMPARED_STEP = 600;

export const RED_GREEN_PAIRS = [
  ['success', 'danger'],
  ['warning', 'danger'],
] as const satisfies readonly (readonly [IdsStatusFamily, IdsStatusFamily])[];

export const distanceBetween = (a: string, b: string) => oklabDistance(a, b);

export const distanceUnderRedGreenCvd = (a: string, b: string) =>
  Math.min(
    ...redGreenDeficiencies.map((simulate) =>
      oklabDistance(simulate(parse(a)!), simulate(parse(b)!)),
    ),
  );

export const tooClose = (a: string, b: string) => distanceBetween(a, b) < DISTINCT_FAMILIES;

export const alikeUnderRedGreenCvd = (a: string, b: string) =>
  distanceUnderRedGreenCvd(a, b) < DISTINCT_UNDER_RED_GREEN_CVD;
