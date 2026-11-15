import palette from '../../core/tokens/palette.json';
import { PALETTE_STEPS, type IdsPalette } from '../src/components/utility/ids-provider/theme';

export type PaletteHue = Exclude<keyof typeof palette, 'neutral'>;

const shadesOf = (hue: keyof typeof palette): IdsPalette =>
  Object.fromEntries(
    PALETTE_STEPS.map((step) => [step, palette[hue][`${step}`].$value]),
  ) as unknown as IdsPalette;

export const paletteHues = (Object.keys(palette) as (keyof typeof palette)[]).filter(
  (hue): hue is PaletteHue => hue !== 'neutral',
);

export const palettes = Object.fromEntries(paletteHues.map((hue) => [hue, shadesOf(hue)])) as {
  [hue in PaletteHue]: IdsPalette;
};

export const neutralShades = Object.fromEntries(
  Object.entries(palette.neutral).map(([step, token]) => [step, token.$value]),
) as { [step: string]: string };
