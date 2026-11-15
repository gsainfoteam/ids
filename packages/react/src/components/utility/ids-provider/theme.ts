import type {
  IDS_BRAND_FAMILIES,
  IDS_COLOR_FAMILIES,
  IDS_STATUS_FAMILIES,
} from '../../../tokens/color-roles';
import type { IdsMode } from '../../../tokens/types';

export const PALETTE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export type IdsPaletteStep = (typeof PALETTE_STEPS)[number];

export type IdsPalette = { [step in IdsPaletteStep]: string };

export type IdsThemeColor = IdsPalette | string;

export type IdsCornerShape = 'round' | 'squircle';

export type IdsBrandFamily = (typeof IDS_BRAND_FAMILIES)[number];

export type IdsStatusFamily = (typeof IDS_STATUS_FAMILIES)[number];

export type IdsColorFamily = (typeof IDS_COLOR_FAMILIES)[number];

export type IdsNeutral = 'pure' | 'tinted';

export type IdsStatusColors = { [family in IdsStatusFamily]?: IdsThemeColor };

export type IdsStatus = 'harmonized' | 'fixed' | IdsStatusColors;

export type IdsTheme = {
  primary: IdsThemeColor;
  secondary?: IdsThemeColor;
  tertiary?: IdsThemeColor;
  neutral?: IdsNeutral;
  status?: IdsStatus;
  radius?: number;
  cornerShape?: IdsCornerShape;
  scale?: number;
};

export type IdsThemeOverrides = Partial<IdsTheme>;

export const COLOR_KEYS = ['primary', 'secondary', 'tertiary', 'neutral', 'status'] as const;

export type IdsColorRoles = { [slot: string]: string };

export type IdsThemeRoles = { [mode in IdsMode]: IdsColorRoles };

export function defineIdsTheme<const Theme extends IdsTheme>(theme: Theme): Theme {
  return theme;
}
