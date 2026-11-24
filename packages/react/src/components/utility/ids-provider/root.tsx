'use client';

import { use, useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';

import { ThemeContext, useIdsProvider, type ThemeMode } from './use-ids-provider';
import { warnWhenTagLeavesLanguage } from '../../../internal/date-locale';
import { OverlayHost, PortalRootContext } from '../../../internal/overlay/host';
import { LanguageContext } from '../../../internal/translate';
import { cn, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { DefaultToaster } from '../../feedback/toast';
import { TooltipDelayGroup } from '../../overlay/tooltip/delay-group';
import { Slot } from '../slot';

import type { IdsThemeOverrides } from './theme';
import type { IdsLocale } from '../../../internal/locale';

export type IdsProviderRootProps<Language extends string = string> = Omit<
  ComponentProps<'div'>,
  'color'
> & {
  theme?: IdsThemeOverrides;
  mode?: ThemeMode;
  defaultMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
  locale?: IdsLocale<Language>;
  asChild?: boolean;
};

export function IdsProviderRoot<const Language extends string = string>({
  theme,
  mode,
  defaultMode,
  onModeChange,
  locale,
  asChild = false,
  className,
  style,
  ref,
  children,
  ...rest
}: IdsProviderRootProps<Language>) {
  const { context, ownVariables, ownScale, issues, outermost, paintsSurface } = useIdsProvider({
    theme,
    mode,
    defaultMode,
    onModeChange,
  });
  const inherited = use(LanguageContext);
  const language = useMemo(() => (locale ? { locale } : inherited), [locale, inherited]);
  const elementRef = useRef<HTMLElement>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const mergedRef = useCallback(
    (node: HTMLElement | null) => mergeRefs(elementRef, setElement, ref)(node),
    [ref],
  );

  const hasPrimary = context.theme.primary !== undefined;

  useEffect(() => {
    if (!isDevelopment) return;
    if (!hasPrimary)
      console.error(
        "[IDS] IdsProvider: the outermost IdsProvider needs a theme with a primary color, such as <IdsProvider theme={defineIdsTheme({ primary: '#0d9488' })}>. IdsProvider.Scope only changes the theme it inherits.",
      );
    for (const issue of issues)
      console.warn(`[IDS] IdsProvider theme.${issue.path}: ${issue.message}`);
  }, [hasPrimary, issues]);

  useEffect(() => {
    if (locale) warnWhenTagLeavesLanguage(locale);
  }, [locale]);

  useEffect(() => {
    if (!isDevelopment || !hasPrimary || !elementRef.current) return;
    const surface = getComputedStyle(elementRef.current).getPropertyValue('--ids-color-bg-base');
    if (surface.trim() === '')
      console.warn(
        '[IDS] IdsProvider: no IDS color tokens on this element. Import @gsainfoteam/ids-css after tailwindcss.',
      );
  }, [hasPrimary, context.resolvedMode]);

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
            data-scale={ownScale}
            className={cn(
              'scheme-primary',
              paintsSurface && 'bg-base text-neutral-strong',
              className,
            )}
            style={{ colorScheme: context.resolvedMode, ...ownVariables, ...style }}
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
