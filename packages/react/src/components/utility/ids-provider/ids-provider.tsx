import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react';

import {
  ThemeContext,
  useIdsProvider,
  type ThemeContextValue,
  type ThemeMode,
} from './use-ids-provider';
import { OverlayHost, PortalRootContext } from '../../../internal/overlay/host';
import { cn, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { DefaultToaster } from '../../feedback/toast';
import { TooltipDelayGroup } from '../../overlay/tooltip/delay-group';
import { Slot } from '../slot';

import type { IdsColor } from '../../../tokens/types';

export { ThemeContext };

export function IdsProvider({
  color,
  defaultColor,
  onColorChange,
  mode,
  defaultMode,
  onModeChange,
  asChild = false,
  className,
  style,
  ref,
  children,
  ...rest
}: IdsProvider.Props) {
  const { context, outermost, paintsSurface } = useIdsProvider({
    color,
    defaultColor,
    onColorChange,
    mode,
    defaultMode,
    onModeChange,
  });
  const elementRef = useRef<HTMLElement>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const mergedRef = useCallback(
    (node: HTMLElement | null) => mergeRefs(elementRef, setElement, ref)(node),
    [ref],
  );

  useEffect(() => {
    if (!isDevelopment || !elementRef.current) return;
    const primary = getComputedStyle(elementRef.current).getPropertyValue('--ids-color-primary');
    if (primary.trim() === '')
      console.warn(
        `[IDS] IdsProvider: no color tokens for data-color="${context.color}" data-mode="${context.resolvedMode}". Import @gsainfoteam/ids-css and use a color it defines.`,
      );
  }, [context.color, context.resolvedMode]);

  const Root = asChild ? Slot : 'div';
  const host = outermost && (
    <>
      <OverlayHost />
      <DefaultToaster />
    </>
  );

  const themed = (
    <ThemeContext value={context}>
      <PortalRootContext value={element}>
        <Root
          {...rest}
          ref={mergedRef}
          data-color={context.color}
          data-mode={context.resolvedMode}
          className={cn(
            paintsSurface && 'bg-(--ids-color-surface) text-(--ids-color-on-surface)',
            className,
          )}
          style={{ colorScheme: context.resolvedMode, ...style }}
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
  );

  return outermost ? <TooltipDelayGroup>{themed}</TooltipDelayGroup> : themed;
}

export namespace IdsProvider {
  export type Mode = ThemeMode;

  export type State = ThemeContextValue;

  export type Props = Omit<ComponentProps<'div'>, 'color'> & {
    color?: IdsColor;
    defaultColor?: IdsColor;
    onColorChange?: (color: IdsColor) => void;
    mode?: Mode;
    defaultMode?: Mode;
    onModeChange?: (mode: Mode) => void;
    asChild?: boolean;
  };
}
