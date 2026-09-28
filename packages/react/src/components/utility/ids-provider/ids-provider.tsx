import { useCallback, useEffect, useRef, type ComponentProps } from 'react';

import {
  ThemeContext,
  useIdsProvider,
  type ThemeContextValue,
  type ThemeMode,
} from './use-ids-provider';
import { cn, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
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
  ...rest
}: IdsProvider.Props) {
  const { context, paintsSurface } = useIdsProvider({
    color,
    defaultColor,
    onColorChange,
    mode,
    defaultMode,
    onModeChange,
  });
  const elementRef = useRef<HTMLElement>(null);
  const mergedRef = useCallback(
    (node: HTMLElement | null) => mergeRefs(elementRef, ref)(node),
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

  return (
    <ThemeContext value={context}>
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
      />
    </ThemeContext>
  );
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
