import { use, useEffect, useMemo, type ReactNode } from 'react';

import { palettes, type PaletteHue } from './palettes';
import { IdsProvider, defineIdsTheme, useTheme } from '../src/components/utility/ids-provider';
import { PortalRootContext } from '../src/internal/overlay';
import { cn } from '../src/utils/cn';

export type Globals = Record<string, unknown>;

function PaintThePageBehindWideStories() {
  const { resolvedMode } = useTheme();
  const provider = use(PortalRootContext);

  useEffect(() => {
    if (provider) document.body.style.backgroundColor = getComputedStyle(provider).backgroundColor;
  }, [provider, resolvedMode]);

  return null;
}

const MODES = ['light', 'dark', 'system'] as const;

const modeFrom = (global: unknown) => MODES.find((mode) => mode === global) ?? 'light';

const brandFamilyFrom = (global: unknown): PaletteHue | undefined =>
  typeof global === 'string' && global in palettes ? (global as PaletteHue) : undefined;

export type Placement = 'docs' | 'page' | 'padded';

const placementClass = {
  docs: cn('rounded-standard bg-base text-neutral-strong w-full p-6'),
  page: cn('bg-base text-neutral-strong min-h-screen w-full'),
  padded: cn('bg-base text-neutral-strong min-h-screen w-full p-8'),
} satisfies Record<Placement, string>;

export function IdsStoryFrame({
  globals,
  updateGlobals,
  placement,
  children,
}: {
  globals: Globals;
  updateGlobals: (globals: Globals) => void;
  placement: Placement;
  children: ReactNode;
}) {
  const hue = brandFamilyFrom(globals['idsColor']) ?? 'blue';
  const secondary = brandFamilyFrom(globals['idsSecondary']);
  const tertiary = brandFamilyFrom(globals['idsTertiary']);
  const cornerShape = globals['idsCornerShape'] === 'squircle' ? 'squircle' : 'round';
  const neutral = globals['idsNeutral'] === 'tinted' ? 'tinted' : 'pure';
  const status = globals['idsStatus'] === 'fixed' ? 'fixed' : 'harmonized';
  const mode = modeFrom(globals['idsMode']);
  const theme = useMemo(
    () =>
      defineIdsTheme({
        primary: palettes[hue],
        ...(secondary && { secondary: palettes[secondary] }),
        ...(tertiary && { tertiary: palettes[tertiary] }),
        neutral,
        status,
        cornerShape,
      }),
    [hue, secondary, tertiary, neutral, status, cornerShape],
  );

  return (
    <IdsProvider
      theme={theme}
      mode={mode}
      onModeChange={(next) => updateGlobals({ idsMode: next })}
      className={placementClass[placement]}
    >
      <PaintThePageBehindWideStories />
      {children}
    </IdsProvider>
  );
}
