import { createIdsRamp } from '../src';

import type { IdsRamp } from '../src/components/utility/ids-provider/theme';

export const paletteSeeds = {
  red: '#fb2c36',
  orange: '#ff5722',
  amber: '#fe9a00',
  yellow: '#f0b100',
  lime: '#7ccf00',
  green: '#22c53e',
  emerald: '#00bc7d',
  teal: '#00bba7',
  cyan: '#00b8db',
  sky: '#00a6f4',
  blue: '#2b7fff',
  indigo: '#615fff',
  violet: '#8e51ff',
  purple: '#ad46ff',
  fuchsia: '#e12afb',
  pink: '#f6339a',
  rose: '#ff2056',
} as const;

export type PaletteHue = keyof typeof paletteSeeds;

export const paletteHues = Object.keys(paletteSeeds) as PaletteHue[];

export const palettes = Object.fromEntries(
  paletteHues.map((hue) => [hue, createIdsRamp(paletteSeeds[hue])!]),
) as { [hue in PaletteHue]: IdsRamp };
