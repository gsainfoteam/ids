import { IdsProviderRoot, type IdsProviderRootProps } from './root';
import { IdsProviderScope, type IdsProviderScopeProps } from './scope';

import type { IdsTheme } from './theme';
import type { ThemeContextValue, ThemeMode } from './use-ids-provider';

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

export { ThemeContext } from './use-ids-provider';
export { useTheme } from './use-theme';
export { defineIdsTheme } from './theme';
export { checkIdsTheme } from './theme-variables';
export { createIdsPalette } from './palette-scales';
export { createIdsRamp } from './palette-seed';
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
} from './theme';
export type { IdsThemeIssue } from './theme-roles';
