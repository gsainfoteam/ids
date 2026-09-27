import {
  createContext,
  isValidElement,
  use,
  useCallback,
  type ComponentProps,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useChip, type ChipRemoveEvent } from './use-chip';
import {
  interactiveDataProps,
  useInteractive,
  type InteractiveState,
} from '../../../hooks/use-interactive';
import { messages } from '../../../internal/messages';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { useRegisteredId } from '../../../internal/surface';
import { flattenFragments, invariant, mergeRefs, tv } from '../../../utils';
import { IconButton } from '../../action/icon-button';
import { Slot } from '../../utility/slot';

import type { IdsSize } from '../../../tokens/types';

export type ChipVariant = 'solid' | 'soft' | 'outline';
export type ChipColorScheme = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

type Context = {
  styles: ReturnType<typeof Chip.Style>;
  // A chip that is itself a button cannot hold another button, so its close glyph is drawn for
  // the pointer only and the keyboard removes the chip with Backspace or Delete.
  rootIsButton: boolean;
  colorScheme: ChipColorScheme;
  size: IdsSize;
  disabled: boolean;
  labelId: string | undefined;
  setLabelId: (id: string | undefined) => void;
  remove: (event: ChipRemoveEvent) => void;
  removeOnKey: (event: KeyboardEvent<HTMLElement>) => boolean;
};

const ChipContext = createContext<Context | null>(null);

function useChipContext(part: string) {
  const context = use(ChipContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Chip>\`.`);
  return context;
}

function flag(on: boolean) {
  return on ? '' : undefined;
}

// Plain text becomes a Chip.Label, so it truncates and names the close button, and a removable
// chip without its own Chip.Close gets the default one at the end.
function arrange(content: ReactNode, removable: boolean) {
  const nodes = flattenFragments(content);
  const arranged: ReactNode[] = [];
  let text: ReactNode[] = [];
  const flush = () => {
    if (text.length === 0) return;
    arranged.push(<Chip.Label key={`label-${arranged.length}`}>{text}</Chip.Label>);
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
  if (removable && !nodes.some((node) => isValidElement(node) && node.type === Chip.Close))
    arranged.push(<Chip.Close key="close" />);
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
  const { state: interaction, handlers } = useInteractive<HTMLElement>({
    disabled,
    onInteractionChange,
    onKeyDown: (event) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented && rootIsButton && event.target === event.currentTarget)
        chip.removeOnKey(event);
    },
    onKeyUp,
    onFocus,
    onBlur,
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
    selected: chip.selected,
    removable: chip.removable,
    interactive: chip.interactive,
  };
  const styles = Chip.Style({ variant, colorScheme, size, interactive: chip.interactive });
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
        {...(chip.interactive ? interactiveDataProps(interaction) : {})}
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

  // The root is a button, a span or the asChild element, depending on what the chip can do.
  export type Props = Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'children'> & {
    ref?: Ref<HTMLElement>;
    variant?: ChipVariant;
    colorScheme?: ChipColorScheme;
    size?: IdsSize;
    selected?: boolean;
    defaultSelected?: boolean;
    onSelectedChange?: (selected: boolean) => void;
    // preventDefault() on the event keeps focus where the handler puts it instead of on the
    // neighbouring chip.
    onRemove?: (event: RemoveEvent) => void;
    disabled?: boolean;
    asChild?: boolean;
    onInteractionChange?: (state: InteractiveState) => void;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: StateValue<ReactNode, State>;
  };

  export function Icon({ asChild, className, ...props }: Icon.Props) {
    const { styles } = useChipContext('Chip.Icon');
    const Root = asChild === true ? Slot : 'span';
    return <Root aria-hidden {...props} data-chip-icon="" className={styles.icon({ className })} />;
  }
  export namespace Icon {
    export type Props = ComponentProps<'span'> & { asChild?: boolean };
  }

  export function Label({ asChild, className, id, ...props }: Label.Props) {
    const { styles, setLabelId } = useChipContext('Chip.Label');
    const labelId = useRegisteredId(setLabelId, id);
    const Root = asChild === true ? Slot : 'span';
    return (
      <Root {...props} id={labelId} data-chip-label="" className={styles.label({ className })} />
    );
  }
  export namespace Label {
    export type Props = ComponentProps<'span'> & { asChild?: boolean };
  }

  export function Close({
    className,
    children,
    id,
    onClick,
    onKeyDown,
    'aria-label': ariaLabel,
    ...rest
  }: Close.Props) {
    const context = useChipContext('Chip.Close');
    const closeId = useRegisteredId(undefined, id);
    const glyph = children ?? <XMarkIcon />;

    if (context.rootIsButton)
      return (
        <span
          aria-hidden="true"
          data-chip-close=""
          className={context.styles.close({ className })}
          onClick={(event) => {
            event.stopPropagation();
            context.remove(event);
          }}
        >
          {glyph}
        </span>
      );

    return (
      <IconButton
        {...rest}
        id={closeId}
        variant="ghost"
        colorScheme={context.colorScheme}
        size={context.size}
        // "frontend 삭제": the chip's own label followed by this button's label.
        aria-label={ariaLabel ?? messages.chip.remove}
        aria-labelledby={
          ariaLabel === undefined && context.labelId ? `${context.labelId} ${closeId}` : undefined
        }
        disabled={context.disabled}
        data-chip-close=""
        icon={isValidElement(glyph) ? glyph : <>{glyph}</>}
        className={context.styles.close({ className })}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          event.stopPropagation();
          context.remove(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) context.removeOnKey(event);
        }}
      />
    );
  }
  export namespace Close {
    export type Props = Omit<ComponentProps<'button'>, 'type'>;
  }

  export const Style = tv({
    slots: {
      // --chip-layer is a hover and press veil in the text color, laid over any background.
      root: [
        'inline-flex shrink-0 items-center rounded-full align-middle whitespace-nowrap',
        'bg-[image:linear-gradient(var(--chip-layer),var(--chip-layer))] [--chip-layer:transparent]',
        'data-disabled:opacity-50',
      ],
      icon: 'inline-flex shrink-0 [&_svg]:size-[1.15em]',
      label: 'min-w-0 truncate',
      // Chip.Close is a ghost IconButton turned into a small circle in the chip's own text color.
      // Its hover is also written as hover:, which the glyph a button chip draws instead needs,
      // since only the IconButton reports data-hovered.
      close: [
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-current opacity-60',
        'hover:bg-current/15 hover:opacity-100 data-hovered:bg-current/15 data-active:bg-current/15',
        'transition-[opacity,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
        '[&_svg]:size-[0.95em]',
      ],
    },
    variants: {
      colorScheme: {
        neutral: {
          root: '[--chip-fill:var(--ids-color-on-surface)] [--chip-on-fill:var(--ids-color-surface)] [--chip-tint:var(--ids-color-muted)] [--chip-text:var(--ids-color-on-surface)] [--chip-line:var(--ids-color-border)]',
        },
        primary: {
          root: '[--chip-fill:var(--ids-color-primary)] [--chip-on-fill:var(--ids-color-on-primary)] [--chip-tint:color-mix(in_oklab,var(--ids-color-primary)_12%,transparent)] [--chip-text:var(--ids-color-primary)] [--chip-line:color-mix(in_oklab,var(--ids-color-primary)_40%,transparent)]',
        },
        success: {
          root: '[--chip-fill:var(--ids-color-success)] [--chip-on-fill:var(--ids-color-on-success)] [--chip-tint:color-mix(in_oklab,var(--ids-color-success)_15%,transparent)] [--chip-text:var(--ids-color-success-strong)] [--chip-line:color-mix(in_oklab,var(--ids-color-success)_40%,transparent)]',
        },
        warning: {
          root: '[--chip-fill:var(--ids-color-warning)] [--chip-on-fill:var(--ids-color-on-warning)] [--chip-tint:color-mix(in_oklab,var(--ids-color-warning)_18%,transparent)] [--chip-text:var(--ids-color-warning-strong)] [--chip-line:color-mix(in_oklab,var(--ids-color-warning)_50%,transparent)]',
        },
        danger: {
          root: '[--chip-fill:var(--ids-color-danger)] [--chip-on-fill:var(--ids-color-on-danger)] [--chip-tint:color-mix(in_oklab,var(--ids-color-danger)_12%,transparent)] [--chip-text:var(--ids-color-danger-strong)] [--chip-line:color-mix(in_oklab,var(--ids-color-danger)_40%,transparent)]',
        },
        info: {
          root: '[--chip-fill:var(--ids-color-info)] [--chip-on-fill:var(--ids-color-on-info)] [--chip-tint:color-mix(in_oklab,var(--ids-color-info)_12%,transparent)] [--chip-text:var(--ids-color-info-strong)] [--chip-line:color-mix(in_oklab,var(--ids-color-info)_40%,transparent)]',
        },
      } satisfies Record<ChipColorScheme, object>,
      variant: {
        solid: { root: 'bg-(--chip-fill) text-(--chip-on-fill)' },
        soft: { root: 'bg-(--chip-tint) text-(--chip-text)' },
        outline: {
          root: 'bg-transparent text-(--chip-text) inset-ring-1 inset-ring-(--chip-line)',
        },
      } satisfies Record<ChipVariant, object>,
      size: {
        standard: {
          root: 'h-5.5 gap-1 px-2 text-caption-c1-medium has-[>[data-chip-close]:last-child]:pe-1',
          close: 'size-4',
        },
        tiny: {
          root: 'h-4.5 gap-0.5 px-1.5 text-caption-c2-medium has-[>[data-chip-close]:last-child]:pe-0.5',
          close: 'size-3.5',
        },
      } satisfies Record<IdsSize, object>,
      interactive: {
        true: {
          root: [
            'cursor-pointer select-none focus-ring',
            'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
            'motion-reduce:transition-none',
            'data-hovered:[--chip-layer:color-mix(in_oklab,currentColor_10%,transparent)]',
            'data-active:[--chip-layer:color-mix(in_oklab,currentColor_16%,transparent)]',
            'data-selected:bg-(--chip-fill) data-selected:text-(--chip-on-fill)',
            'disabled:cursor-not-allowed disabled:opacity-50',
          ],
        },
        false: {},
      },
    },
    defaultVariants: {
      variant: 'soft',
      colorScheme: 'neutral',
      size: 'standard',
      interactive: false,
    },
  });
}
