'use client';

import { use, useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';

import { themeStyle } from './theme-variables';
import { ThemeContext, useIdsProvider, type ThemeMode } from './use-ids-provider';
import { OverlayHost, PortalRootContext } from '../../../internal/overlay/host';
import { LanguageContext, type IdsTranslate } from '../../../internal/translate';
import { cn, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { DefaultToaster } from '../../feedback/toast';
import { TooltipDelayGroup } from '../../overlay/tooltip/delay-group';
import { Slot } from '../slot';

import type { IdsThemeOverrides } from './theme';

export type IdsProviderRootProps = Omit<ComponentProps<'div'>, 'color' | 'translate'> & {
  theme?: IdsThemeOverrides;
  mode?: ThemeMode;
  defaultMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
  translate?: IdsTranslate;
  locale?: string;
  asChild?: boolean;
};

export function IdsProviderRoot({
  theme,
  mode,
  defaultMode,
  onModeChange,
  translate,
  locale,
  asChild = false,
  className,
  style,
  ref,
  children,
  ...rest
}: IdsProviderRootProps) {
  const { context, ownVariables, issues, outermost, paintsSurface } = useIdsProvider({
    theme,
    mode,
    defaultMode,
    onModeChange,
  });
  const inherited = use(LanguageContext);
  const language = useMemo(
    () => ({
      translate: translate ?? inherited.translate,
      locale: locale ?? inherited.locale,
    }),
    [translate, locale, inherited.translate, inherited.locale],
  );
  const elementRef = useRef<HTMLElement>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const mergedRef = useCallback(
    (node: HTMLElement | null) => mergeRefs(elementRef, setElement, ref)(node),
    [ref],
  );

  const hasPalette = context.theme.palette !== undefined;

  useEffect(() => {
    if (!isDevelopment) return;
    if (!hasPalette)
      console.error(
        '[IDS] IdsProvider: the outermost IdsProvider needs a theme with a palette, such as <IdsProvider theme={defineIdsTheme({ palette })}>. IdsProvider.Scope only changes the theme it inherits.',
      );
    for (const issue of issues)
      console.warn(`[IDS] IdsProvider theme.${issue.path}: ${issue.message}`);
  }, [hasPalette, issues]);

  useEffect(() => {
    if (!isDevelopment || !hasPalette || !elementRef.current) return;
    const surface = getComputedStyle(elementRef.current).getPropertyValue('--ids-color-surface');
    if (surface.trim() === '')
      console.warn(
        '[IDS] IdsProvider: no IDS color tokens on this element. Import @gsainfoteam/ids-css after tailwindcss.',
      );
  }, [hasPalette, context.resolvedMode]);

  const Root = asChild ? Slot : 'div';
  const host = outermost && (
    <>
      <OverlayHost />
      <DefaultToaster />
    </>
  );

  const themed = (
    <LanguageContext value={language}>
      <ThemeContext value={context}>
        <PortalRootContext value={element}>
          <Root
            {...rest}
            ref={mergedRef}
            data-mode={context.resolvedMode}
            className={cn(
              paintsSurface && 'bg-(--ids-color-surface) text-(--ids-color-on-surface)',
              className,
            )}
            style={{ colorScheme: context.resolvedMode, ...themeStyle(ownVariables), ...style }}
          >
            {asChild ? (
              children
            ) : (
              <>
                {children}
                {host}
              </>
            )}
          </Root>
          {asChild && host}
        </PortalRootContext>
      </ThemeContext>
    </LanguageContext>
  );

  return outermost ? <TooltipDelayGroup>{themed}</TooltipDelayGroup> : themed;
}
