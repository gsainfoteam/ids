import {
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { noop } from 'es-toolkit';

import type { IdsColor, IdsMode } from '../../../tokens/types';

export type ThemeMode = IdsMode | 'system';

export type ThemeContextValue = {
  color: IdsColor;
  mode: ThemeMode;
  resolvedMode: IdsMode;
  setColor: (color: IdsColor) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const DEFAULT_THEME: ThemeContextValue = {
  color: 'blue',
  mode: 'light',
  resolvedMode: 'light',
  setColor: noop,
  setMode: noop,
  toggleMode: noop,
};

export const ThemeContext = createContext<ThemeContextValue>(DEFAULT_THEME);

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToScheme(notify: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}

const subscribeToNothing = () => noop;

function usePrefersDark(enabled: boolean) {
  const supported = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  return useSyncExternalStore(
    enabled && supported ? subscribeToScheme : subscribeToNothing,
    () => enabled && supported && window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
}

type AxisOptions<T> = {
  owned: boolean;
  value: T | undefined;
  defaultValue: T;
  onChange: ((value: T) => void) | undefined;
  inherited: T;
  setInherited: (value: T) => void;
};

function useAxis<T>({
  owned,
  value,
  defaultValue,
  onChange,
  inherited,
  setInherited,
}: AxisOptions<T>) {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = !owned ? inherited : controlled ? value : inner;

  const latest = useRef({ current, controlled, onChange });
  useLayoutEffect(() => {
    latest.current = { current, controlled, onChange };
  });

  const setOwn = useCallback((next: T) => {
    const { current, controlled, onChange } = latest.current;
    if (Object.is(next, current)) return;
    if (!controlled) setInner(next);
    onChange?.(next);
  }, []);

  return [current, owned ? setOwn : setInherited] as const;
}

export type UseIdsProviderOptions = {
  color?: IdsColor;
  defaultColor?: IdsColor;
  onColorChange?: (color: IdsColor) => void;
  mode?: ThemeMode;
  defaultMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
};

export function useIdsProvider({
  color,
  defaultColor,
  onColorChange,
  mode,
  defaultMode,
  onModeChange,
}: UseIdsProviderOptions) {
  const parent = use(ThemeContext);
  const root = parent === DEFAULT_THEME;
  const ownsMode = root || mode !== undefined || defaultMode !== undefined;

  const [currentColor, setColor] = useAxis({
    owned: root || color !== undefined || defaultColor !== undefined,
    value: color,
    defaultValue: defaultColor ?? parent.color,
    onChange: onColorChange,
    inherited: parent.color,
    setInherited: parent.setColor,
  });
  const [currentMode, setMode] = useAxis({
    owned: ownsMode,
    value: mode,
    defaultValue: defaultMode ?? parent.mode,
    onChange: onModeChange,
    inherited: parent.mode,
    setInherited: parent.setMode,
  });

  const prefersDark = usePrefersDark(ownsMode && currentMode === 'system');
  const resolvedMode: IdsMode = !ownsMode
    ? parent.resolvedMode
    : currentMode === 'system'
      ? prefersDark
        ? 'dark'
        : 'light'
      : currentMode;

  const latestResolved = useRef(resolvedMode);
  useLayoutEffect(() => {
    latestResolved.current = resolvedMode;
  });
  const toggleMode = useCallback(
    () => setMode(latestResolved.current === 'dark' ? 'light' : 'dark'),
    [setMode],
  );

  const context = useMemo<ThemeContextValue>(
    () => ({
      color: currentColor,
      mode: currentMode,
      resolvedMode,
      setColor,
      setMode,
      toggleMode,
    }),
    [currentColor, currentMode, resolvedMode, setColor, setMode, toggleMode],
  );

  return {
    context,
    paintsSurface: !root && resolvedMode !== parent.resolvedMode,
  };
}
