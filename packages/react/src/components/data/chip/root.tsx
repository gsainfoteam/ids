'use client';

import { isValidElement, type ReactNode } from 'react';

import { ChipContext } from './context';
import { useInternalChip } from './hooks/use-chip';
import { useInternalChipInteraction } from './hooks/use-chip-interaction';
import { ChipClose } from './parts/close';
import { ChipLabel } from './parts/label';
import { chipStyle } from './style';
import { interactiveDataProps } from '../../../hooks/use-interactive';
import { resolveState } from '../../../internal/lib/state-props';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { Chip } from '.';

export type ChipVariant = 'solid' | 'soft' | 'outline';
export type ChipColorScheme =
  'neutral' | 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'info';

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
  size: sizeProp,
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
  const chip = useInternalChip({
    selected,
    defaultSelected,
    onSelectedChange,
    onRemove,
    hasClick: onClick !== undefined,
    disabled,
  });
  const size = sizeProp ?? chip.groupSize ?? 'standard';
  const rootIsButton = chip.interactive && !asChild;
  const { interaction, handlers, innerFocusVisible, mergedRef, toggleOnClick } =
    useInternalChipInteraction({
      chip,
      rootIsButton,
      disabled,
      ref,
      onClick,
      onInteractionChange,
      onKeyDown,
      onKeyUp,
      onFocus,
      onBlur,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
    });

  const state: Chip.State = {
    ...interaction,
    focusVisible: chip.interactive ? interaction.focusVisible : innerFocusVisible,
    selected: chip.selected,
    removable: chip.removable,
    interactive: chip.interactive,
  };
  const content = resolveState(children, state);
  const dot = !asChild && !chip.removable && flattenFragments(content).length === 0;
  const styles = chipStyle({ variant, colorScheme, size, dot, interactive: chip.interactive });
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
        {...(dot && !rootIsButton && rest['aria-label'] !== undefined ? { role: 'img' } : {})}
        {...rest}
        {...handlers}
        ref={mergedRef}
        onClick={toggleOnClick}
        data-chip=""
        data-variant={variant}
        data-color-scheme={colorScheme}
        data-size={size}
        data-dot={flag(dot)}
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
