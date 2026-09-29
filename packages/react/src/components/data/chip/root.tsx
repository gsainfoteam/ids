'use client';

import { isValidElement, useCallback, useState, type ReactNode } from 'react';

import { ChipClose } from './close';
import { ChipContext } from './context';
import { ChipLabel } from './label';
import { chipStyle } from './style';
import { useChip } from './use-chip';
import { interactiveDataProps, useInteractive } from '../../../hooks/use-interactive';
import { resolveState } from '../../../internal/state-props';
import { elementTypeOf, flattenFragments, mergeRefs } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { Chip } from '.';

export type ChipVariant = 'solid' | 'soft' | 'outline';
export type ChipColorScheme = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

function flag(on: boolean) {
  return on ? '' : undefined;
}

function arrange(content: ReactNode, removable: boolean) {
  const nodes = flattenFragments(content);
  const arranged: ReactNode[] = [];
  let text: ReactNode[] = [];
  const flush = () => {
    if (text.length === 0) return;
    arranged.push(<ChipLabel key={`label-${arranged.length}`}>{text}</ChipLabel>);
    text = [];
  };
  for (const node of nodes) {
    if (typeof node === 'string' || typeof node === 'number') text.push(node);
    else {
      flush();
      arranged.push(node);
    }
  }
  flush();
  if (removable && !nodes.some((node) => isValidElement(node) && elementTypeOf(node) === ChipClose))
    arranged.push(<ChipClose key="close" />);
  return arranged;
}

export function ChipRoot({
  variant = 'soft',
  colorScheme = 'neutral',
  size = 'standard',
  selected,
  defaultSelected,
  onSelectedChange,
  onRemove,
  disabled = false,
  asChild = false,
  className,
  style,
  children,
  ref,
  onClick,
  onKeyDown,
  onKeyUp,
  onFocus,
  onBlur,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onInteractionChange,
  ...rest
}: Chip.Props) {
  const chip = useChip({
    selected,
    defaultSelected,
    onSelectedChange,
    onRemove,
    hasClick: onClick !== undefined,
    disabled,
  });
  const rootIsButton = chip.interactive && !asChild;
  const [innerFocusVisible, setInnerFocusVisible] = useState(false);
  const { state: interaction, handlers } = useInteractive<HTMLElement>({
    disabled,
    onInteractionChange,
    onKeyDown: (event) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented && rootIsButton && event.target === event.currentTarget)
        chip.removeOnKey(event);
    },
    onKeyUp,
    onFocus: (event) => {
      onFocus?.(event);
      if (event.target !== event.currentTarget)
        setInnerFocusVisible((event.target as Element).matches(':focus-visible'));
    },
    onBlur: (event) => {
      onBlur?.(event);
      setInnerFocusVisible(false);
    },
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  });
  const mergedRef = useCallback(
    (node: HTMLElement | null) => mergeRefs(chip.rootRef, ref)(node),
    [chip.rootRef, ref],
  );

  const state: Chip.State = {
    ...interaction,
    focusVisible: chip.interactive ? interaction.focusVisible : innerFocusVisible,
    selected: chip.selected,
    removable: chip.removable,
    interactive: chip.interactive,
  };
  const styles = chipStyle({ variant, colorScheme, size, interactive: chip.interactive });
  const content = resolveState(children, state);
  const Root = asChild ? Slot : rootIsButton ? 'button' : 'span';

  return (
    <ChipContext
      value={{
        styles,
        rootIsButton,
        colorScheme,
        size,
        disabled,
        labelId: chip.labelId,
        setLabelId: chip.setLabelId,
        remove: chip.remove,
        removeOnKey: chip.removeOnKey,
      }}
    >
      <Root
        {...(rootIsButton ? { type: 'button' as const, disabled } : {})}
        {...(chip.selectable ? { 'aria-pressed': chip.selected } : {})}
        {...(!rootIsButton && disabled ? { 'aria-disabled': true } : {})}
        {...rest}
        {...handlers}
        ref={mergedRef}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          if (chip.selectable) chip.toggle();
        }}
        data-chip=""
        data-variant={variant}
        data-color-scheme={colorScheme}
        data-size={size}
        data-selected={flag(chip.selected)}
        data-removable={flag(chip.removable)}
        data-interactive={flag(chip.interactive)}
        data-disabled={flag(disabled)}
        {...(chip.interactive
          ? interactiveDataProps(interaction)
          : { 'data-focus-visible': flag(innerFocusVisible) })}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        {asChild ? content : arrange(content, chip.removable)}
      </Root>
    </ChipContext>
  );
}
