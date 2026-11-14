import {
  modeHsl,
  modeLab,
  modeLch,
  modeLrgb,
  modeOklab,
  modeOklch,
  modeRgb,
  useMode as registerMode,
  wcagContrast,
} from 'culori/fn';

registerMode(modeRgb);
registerMode(modeLrgb);
registerMode(modeHsl);
registerMode(modeLab);
registerMode(modeLch);
registerMode(modeOklab);
registerMode(modeOklch);

export const AA_TEXT = 4.5;

export const LIGHT_TEXT = '#ffffff';

export const DARK_TEXT = '#0a0a0a';

export const reaches = (text: string, ...backgrounds: string[]) =>
  backgrounds.every((background) => wcagContrast(text, background) >= AA_TEXT);

export const takesLightOrDarkText = (background: string) =>
  reaches(LIGHT_TEXT, background) || reaches(DARK_TEXT, background);
