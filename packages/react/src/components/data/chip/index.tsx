import {
  isValidElement,
  useCallback,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import { ChipClose, type ChipCloseProps } from './close';
import { ChipContext } from './context';
import { ChipIcon, type ChipIconProps } from './icon';
import { ChipLabel, type ChipLabelProps } from './label';
import { chipStyle } from './style';
import { useChip, type ChipRemoveEvent } from './use-chip';
import {
  interactiveDataProps,
  useInteractive,
  type InteractiveState,
} from '../../../hooks/use-interactive';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { flattenFragments, mergeRefs } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { IdsSize } from '../../../tokens/types';

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
  if (removable && !nodes.some((node) => isValidElement(node) && node.type === ChipClose))
    arranged.push(<ChipClose key="close" />);
  return arranged;
}

export function Chip({
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

export namespace Chip {
  export type Variant = ChipVariant;
  export type ColorScheme = ChipColorScheme;
  export type RemoveEvent = ChipRemoveEvent;

  export type State = InteractiveState & {
    selected: boolean;
    removable: boolean;
    interactive: boolean;
  };

  export type Props = Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'children'> & {
    ref?: Ref<HTMLElement>;
    variant?: ChipVariant;
    colorScheme?: ChipColorScheme;
    size?: IdsSize;
    selected?: boolean;
    defaultSelected?: boolean;
    onSelectedChange?: (selected: boolean) => void;
    onRemove?: (event: RemoveEvent) => void;
    disabled?: boolean;
    asChild?: boolean;
    onInteractionChange?: (state: InteractiveState) => void;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: StateValue<ReactNode, State>;
  };

  export const Icon = ChipIcon;
  export namespace Icon {
    export type Props = ChipIconProps;
  }

  export const Label = ChipLabel;
  export namespace Label {
    export type Props = ChipLabelProps;
  }

  export const Close = ChipClose;
  export namespace Close {
    export type Props = ChipCloseProps;
  }

  export const Style = chipStyle;
}
