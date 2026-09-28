import { use } from 'react';

import { ThemeContext, type ThemeContextValue } from './use-ids-provider';

export function useTheme(): ThemeContextValue {
  return use(ThemeContext);
}
