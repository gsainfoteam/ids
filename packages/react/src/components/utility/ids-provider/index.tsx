import { IdsProviderScope, type IdsProviderScopeProps } from './parts/scope';
import { IdsProviderRoot, type IdsProviderRootProps } from './root';

import type { ThemeContextValue, ThemeMode } from './hooks/use-ids-provider';
import type { IdsTheme } from './lib/theme';

export function IdsProvider<const Language extends string = string>(
  props: IdsProvider.Props<Language>,
) {
  return <IdsProviderRoot {...props} />;
}

export namespace IdsProvider {
  export type Mode = ThemeMode;

  export type State = ThemeContextValue;

  export type Props<Language extends string = string> = Omit<
    IdsProviderRootProps<Language>,
    'theme'
  > & { theme: IdsTheme };

  export const Scope = IdsProviderScope;
  export namespace Scope {
    export type Props = IdsProviderScopeProps;
  }
}

export { ThemeContext } from './hooks/use-ids-provider';
export { useTheme } from './hooks/use-theme';
export { defineIdsTheme } from './lib/theme';
export { checkIdsTheme } from './lib/theme-variables';
export { createIdsPalette } from './lib/palette-scales';
export { createIdsRamp } from './lib/palette-seed';
export type {
  IdsBrandFamily,
  IdsColorFamily,
  IdsCornerShape,
  IdsNeutral,
  IdsPalette,
  IdsRamp,
  IdsRampStep,
  IdsScale,
  IdsScaleStep,
  IdsStatus,
  IdsStatusColors,
  IdsStatusFamily,
  IdsTheme,
  IdsThemeColor,
  IdsThemeOverrides,
} from './lib/theme';
export type { IdsThemeIssue } from './lib/theme-roles';
