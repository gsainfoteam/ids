'use client';

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

import { resolveThemeVariables, type ThemeVariables } from './theme-variables';

import type { IdsThemeOverrides } from './theme';
import type { IdsThemeIssue } from './theme-roles';
import type { IdsMode } from '../../../tokens/types';

export type ThemeMode = IdsMode | 'system';

export type ThemeContextValue = {
  theme: IdsThemeOverrides;
  variables: ThemeVariables;
  mode: ThemeMode;
  resolvedMode: IdsMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const NO_VARIABLES: ThemeVariables = {};

const NO_ISSUES: IdsThemeIssue[] = [];

const DEFAULT_THEME: ThemeContextValue = {
  theme: {},
  variables: NO_VARIABLES,
  mode: 'light',
  resolvedMode: 'light',
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
  theme?: IdsThemeOverrides;
  mode?: ThemeMode;
  defaultMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
};

export function useIdsProvider({ theme, mode, defaultMode, onModeChange }: UseIdsProviderOptions) {
  const parent = use(ThemeContext);
  const root = parent === DEFAULT_THEME;
  const ownsMode = root || mode !== undefined || defaultMode !== undefined;

  const own = useMemo(
    () =>
      theme === undefined
        ? { variables: NO_VARIABLES, issues: NO_ISSUES }
        : resolveThemeVariables(theme),
    [theme],
  );
  const mergedTheme = useMemo(
    () => (theme === undefined ? parent.theme : { ...parent.theme, ...theme }),
    [parent.theme, theme],
  );
  const mergedVariables = useMemo(
    () =>
      own.variables === NO_VARIABLES ? parent.variables : { ...parent.variables, ...own.variables },
    [parent.variables, own.variables],
  );
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
      theme: mergedTheme,
      variables: mergedVariables,
      mode: currentMode,
      resolvedMode,
      setMode,
      toggleMode,
    }),
    [mergedTheme, mergedVariables, currentMode, resolvedMode, setMode, toggleMode],
  );

  return {
    context,
    ownVariables: own.variables,
    issues: own.issues,
    outermost: root,
    paintsSurface: !root && resolvedMode !== parent.resolvedMode,
  };
}
