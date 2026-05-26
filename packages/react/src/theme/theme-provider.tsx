import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

import type { IdsColor, IdsMode } from '../tokens/types';

type ThemeContextValue = {
  color: IdsColor;
  mode: IdsMode;
  setColor: (color: IdsColor) => void;
  setMode: (mode: IdsMode) => void;
  toggleMode: () => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  color: 'blue',
  mode: 'light',
  setColor: () => {},
  setMode: () => {},
  toggleMode: () => {},
});

type ThemeProviderProps = {
  color?: IdsColor;
  mode?: IdsMode;
  children: ReactNode;
};

export function ThemeProvider({ color: initialColor = 'blue', mode: initialMode = 'light', children }: ThemeProviderProps) {
  const [color, setColor] = useState<IdsColor>(initialColor);
  const [mode, setMode] = useState<IdsMode>(initialMode);
  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ color, mode, setColor, setMode, toggleMode }}>
      <div data-color={color} data-mode={mode}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
