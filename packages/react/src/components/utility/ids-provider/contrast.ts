import {
  differenceEuclidean,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  modeHsl,
  modeLab,
  modeLch,
  modeLrgb,
  modeOklab,
  modeOklch,
  modeRgb,
  useMode as registerMode,
  wcagContrast,
  type Color,
} from 'culori/fn';

registerMode(modeRgb);
registerMode(modeLrgb);
registerMode(modeHsl);
registerMode(modeLab);
registerMode(modeLch);
registerMode(modeOklab);
registerMode(modeOklch);

export const AA_TEXT = 4.5;

export const AA_MARK = 3;

export const LIGHT_TEXT = '#ffffff';

export const DARK_TEXT = '#0a0a0a';

export const reaches = (foreground: string, backgrounds: readonly string[], ratio = AA_TEXT) =>
  backgrounds.every((background) => wcagContrast(foreground, background) >= ratio);

export const takesLightOrDarkText = (background: string) =>
  reaches(LIGHT_TEXT, [background]) || reaches(DARK_TEXT, [background]);

export const oklabDistance: (a: string | Color, b: string | Color) => number =
  differenceEuclidean('oklab');

type ColorFilter = (color: Color) => Color;

export const redGreenDeficiencies: ColorFilter[] = [
  filterDeficiencyDeuter(1),
  filterDeficiencyProt(1),
];
