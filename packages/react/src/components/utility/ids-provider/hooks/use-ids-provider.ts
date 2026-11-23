'use client';

import {
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { noop } from 'es-toolkit';

import { useInternalMediaQuery } from '../../../../hooks/use-media-query';
import { resolveThemeVariables, type ThemeVariables } from '../lib/theme-variables';

import type { IdsMode } from '../../../../tokens/types';
import type { IdsThemeOverrides } from '../lib/theme';
import type { IdsThemeIssue } from '../lib/theme-roles';

export type ThemeMode = IdsMode | 'system';

export type ThemeContextValue = {
  theme: IdsThemeOverrides;
  variables: ThemeVariables;
  scale: number | undefined;
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
  scale: undefined,
  mode: 'light',
  resolvedMode: 'light',
  setMode: noop,
  toggleMode: noop,
};

export const ThemeContext = createContext<ThemeContextValue>(DEFAULT_THEME);

const DARK_QUERY = '(prefers-color-scheme: dark)';

type AxisOptions<T> = {
  owned: boolean;
  value: T | undefined;
  defaultValue: T;
  onChange: ((value: T) => void) | undefined;
  inherited: T;
  setInherited: (value: T) => void;
};

function useInternalAxis<T>({
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

export function useInternalIdsProvider({
  theme,
  mode,
  defaultMode,
  onModeChange,
}: UseIdsProviderOptions) {
  const parent = use(ThemeContext);
  const root = parent === DEFAULT_THEME;
  const ownsMode = root || mode !== undefined || defaultMode !== undefined;

  const own = useMemo(
    () =>
      theme === undefined
        ? { variables: NO_VARIABLES, scale: undefined, issues: NO_ISSUES }
        : resolveThemeVariables(theme, root ? undefined : parent.theme),
    [theme, root, parent.theme],
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
  const [currentMode, setMode] = useInternalAxis({
    owned: ownsMode,
    value: mode,
    defaultValue: defaultMode ?? parent.mode,
    onChange: onModeChange,
    inherited: parent.mode,
    setInherited: parent.setMode,
  });

  const prefersDark = useInternalMediaQuery(ownsMode && currentMode === 'system' ? DARK_QUERY : null);
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
      scale: own.scale ?? parent.scale,
      mode: currentMode,
      resolvedMode,
      setMode,
      toggleMode,
    }),
    [
      mergedTheme,
      mergedVariables,
      own.scale,
      parent.scale,
      currentMode,
      resolvedMode,
      setMode,
      toggleMode,
    ],
  );

  return {
    context,
    ownVariables: own.variables,
    ownScale: own.scale,
    issues: own.issues,
    outermost: root,
    paintsSurface: !root && resolvedMode !== parent.resolvedMode,
  };
}
