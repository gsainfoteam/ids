'use client';

import type { ComponentProps } from 'react';

import { ThemeContext, useInternalIdsProvider, type ThemeMode } from './hooks/use-ids-provider';
import { useInternalIdsProviderElement } from './hooks/use-ids-provider-element';
import { useInternalIdsProviderLanguage } from './hooks/use-ids-provider-language';
import { useInternalIdsProviderWarnings } from './hooks/use-ids-provider-warnings';
import { OverlayHost, PortalRootContext } from '../../../internal/overlay/parts/host';
import { LanguageContext, type IdsTranslate } from '../../../internal/translate';
import { cn } from '../../../utils';
import { DefaultToaster } from '../../feedback/toast';
import { TooltipDelayGroup } from '../../overlay/tooltip/parts/delay-group';
import { Slot } from '../slot';

import type { IdsThemeOverrides } from './lib/theme';

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
  const { context, ownVariables, ownScale, issues, outermost, paintsSurface } =
    useInternalIdsProvider({
      theme,
      mode,
      defaultMode,
      onModeChange,
    });
  const language = useInternalIdsProviderLanguage(translate, locale);
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
