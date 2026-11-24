'use client';

import type { ComponentProps } from 'react';

import { ThemeContext, useInternalIdsProvider, type ThemeMode } from './hooks/use-ids-provider';
import { useInternalIdsProviderElement } from './hooks/use-ids-provider-element';
import { useInternalIdsProviderLanguage } from './hooks/use-ids-provider-language';
import { useInternalIdsProviderWarnings } from './hooks/use-ids-provider-warnings';
import { PortalRootContext } from '../../../internal/overlay/context';
import { OverlayHost } from '../../../internal/overlay/parts/host';
import { LanguageContext } from '../../../internal/translate';
import { cn } from '../../../utils';
import { DefaultToaster } from '../../feedback/toast';
import { TooltipDelayGroup } from '../../overlay/tooltip/parts/delay-group';
import { Slot } from '../slot';

import type { IdsThemeOverrides } from './lib/theme';
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
  const { context, ownVariables, ownScale, issues, outermost, paintsSurface } =
    useInternalIdsProvider({
      theme,
      mode,
      defaultMode,
      onModeChange,
    });
  const language = useInternalIdsProviderLanguage(locale);
  const { elementRef, element, mergedRef } = useInternalIdsProviderElement(ref);

  useInternalIdsProviderWarnings(context, issues, elementRef);

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
