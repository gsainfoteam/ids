import { ColorSpace, contrastAPCA, sRGB } from 'colorjs.io/fn';
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
  type Color,
} from 'culori/fn';

registerMode(modeRgb);
registerMode(modeLrgb);
registerMode(modeHsl);
registerMode(modeLab);
registerMode(modeLch);
registerMode(modeOklab);
registerMode(modeOklch);

ColorSpace.register(sRGB);

export const TEXT_LC = 75;

export const ACCENT_TEXT_LC = 60;

export const MARK_LC = 45;

export const LIGHT_TEXT = '#ffffff';

export const DARK_TEXT = '#0a0a0a';

export const lightnessContrast = (foreground: string, background: string) =>
  Math.abs(contrastAPCA(background, foreground));

export const reaches = (foreground: string, backgrounds: readonly string[], lc = TEXT_LC) =>
  backgrounds.every((background) => lightnessContrast(foreground, background) >= lc);

export const oklabDistance: (a: string | Color, b: string | Color) => number =
  differenceEuclidean('oklab');

type ColorFilter = (color: Color) => Color;

export const redGreenDeficiencies: ColorFilter[] = [
  filterDeficiencyDeuter(1),
  filterDeficiencyProt(1),
];
