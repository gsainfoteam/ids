import { IdsProviderRoot, type IdsProviderRootProps } from './root';
import { IdsProviderScope, type IdsProviderScopeProps } from './scope';

import type { IdsTheme } from './theme';
import type { ThemeContextValue, ThemeMode } from './use-ids-provider';

export function IdsProvider(props: IdsProvider.Props) {
  return <IdsProviderRoot {...props} />;
}

export namespace IdsProvider {
  export type Mode = ThemeMode;

  export type State = ThemeContextValue;

  export type Props = Omit<IdsProviderRootProps, 'theme'> & { theme: IdsTheme };

  export const Scope = IdsProviderScope;
  export namespace Scope {
    export type Props = IdsProviderScopeProps;
  }
}

export { ThemeContext } from './use-ids-provider';
export { useTheme } from './use-theme';
export { defineIdsTheme } from './theme';
export { checkIdsTheme } from './theme-variables';
export { createIdsPalette } from './palette-seed';
export type {
  IdsCornerShape,
  IdsPalette,
  IdsPaletteStep,
  IdsScale,
  IdsTheme,
  IdsThemeFont,
  IdsThemeOverrides,
} from './theme';
export type { IdsThemeIssue } from './theme-roles';
