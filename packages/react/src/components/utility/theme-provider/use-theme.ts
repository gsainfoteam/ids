import { use } from 'react';

import { ThemeContext, type ThemeContextValue } from './use-theme-provider';

export function useTheme(): ThemeContextValue {
  return use(ThemeContext);
}
