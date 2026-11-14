import type { IdsMode } from '../../../tokens/types';

export const PALETTE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export type IdsPaletteStep = (typeof PALETTE_STEPS)[number];

export type IdsPalette = { [step in IdsPaletteStep]: string };

export type IdsCornerShape = 'round' | 'squircle';

export type IdsThemeFont = {
  sans?: string;
  mono?: string;
};

export const SCALE_PRESETS = { default: 1, large: 1.25, tv: 1.5 } as const;

export type IdsScale = keyof typeof SCALE_PRESETS;

export type IdsTheme = {
  palette: IdsPalette | string;
  radius?: number;
  font?: IdsThemeFont;
  cornerShape?: IdsCornerShape;
  scale?: IdsScale;
};

export type IdsThemeOverrides = Partial<IdsTheme>;

export const BRAND_ROLES = [
  'primary',
  'on-primary',
  'secondary',
  'on-secondary',
  'accent',
  'outline',
] as const;

export type IdsBrandRole = (typeof BRAND_ROLES)[number];

export type IdsBrandRoles = { [role in IdsBrandRole]: string };

export type IdsThemeRoles = { [mode in IdsMode]: IdsBrandRoles };

export function defineIdsTheme<const Theme extends IdsTheme>(theme: Theme): Theme {
  return theme;
}
