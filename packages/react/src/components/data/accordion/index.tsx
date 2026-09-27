import {
  createContext,
  isValidElement,
  use,
  useCallback,
  type ComponentProps,
  type KeyboardEvent,
  type Ref,
} from 'react';

import { ChevronDownIcon } from '@heroicons/react/16/solid';

import {
  ROOT_ATTRIBUTE,
  TRIGGER_ATTRIBUTE,
  useAccordion,
  useAccordionItem,
  useAccordionPanel,
} from './use-accordion';
import {
  interactiveDataProps,
  useInteractive,
  type InteractiveState,
} from '../../../hooks/use-interactive';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { flattenFragments, invariant, mergeRefs, tv } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { AccordionValue } from './accordion-value';
import type { IdsSize } from '../../../tokens/types';

export type AccordionVariant = 'outline' | 'soft' | 'ghost';
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type RootContext = {
  open: readonly string[];
  disabled: boolean;
  canCollapse: boolean;
  headingLevel: AccordionHeadingLevel;
  styles: ReturnType<typeof Accordion.Style>;
  toggle: (value: string) => void;
  reveal: (value: string) => void;
  register: (value: string) => () => void;
  onTriggerKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
};

type ItemContext = {
  state: Accordion.Item.State;
  locked: boolean;
  triggerId: string;
  contentId: string;
};

const AccordionContext = createContext<RootContext | null>(null);
const AccordionItemContext = createContext<ItemContext | null>(null);
// Text nodes do not count for :last-child, so the trigger tells its indicator whether it closes
// the row (and takes the free space before it) or sits inline, for example ahead of the label.
const IndicatorPlacementContext = createContext<'end' | 'inline'>('end');

function useRootContext(part: string) {
  const context = use(AccordionContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Accordion>\`.`);
  return context;
}

function useItemContext(part: string) {
  const context = use(AccordionItemContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Accordion.Item>\`.`);
  return context;
}

function flag(on: boolean) {
  return on ? '' : undefined;
}

function openState(open: boolean) {
  return { 'data-state': open ? 'open' : 'closed', 'data-open': flag(open) } as const;
}

export function Accordion<T extends string = string>(props: Accordion.Props<T>) {
  const {
    type,
    value,
    defaultValue,
    onValueChange,
    collapsible,
    disabled = false,
    variant = 'outline',
    size = 'standard',
    headingLevel = 3,
    className,
    style,
    children,
    ref,
    ...rest
  } = props;

  const { rootRef, state, toggle, reveal, register, onTriggerKeyDown } = useAccordion<T>({
    type,
    value,
    defaultValue,
    onValueChange: onValueChange as ((value: AccordionValue<T>) => void) | undefined,
    collapsible,
    disabled,
  });
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [rootRef, ref],
  );

  const styles = Accordion.Style({ variant, size });
  const rootState: Accordion.State<T> = { value: state.value, disabled };

  return (
    <AccordionContext
      value={{
        open: state.open,
        disabled,
        canCollapse: state.canCollapse,
        headingLevel,
        styles,
        toggle: toggle as (value: string) => void,
        reveal: reveal as (value: string) => void,
        register,
        onTriggerKeyDown,
      }}
    >
      <div
        {...rest}
        ref={mergedRef}
        {...{ [ROOT_ATTRIBUTE]: '' }}
        data-variant={variant}
        data-size={size}
        data-disabled={flag(disabled)}
        className={styles.root({ className: resolveState(className, rootState) })}
        style={resolveState(style, rootState)}
      >
        {resolveState(children, rootState)}
      </div>
    </AccordionContext>
  );
}

export namespace Accordion {
  export type Variant = AccordionVariant;
  export type HeadingLevel = AccordionHeadingLevel;

  export type State<T extends string = string> = {
    value: AccordionValue<T>;
    disabled: boolean;
  };

  type RootProps<T extends string> = Omit<
    ComponentProps<'div'>,
    'children' | 'className' | 'style' | 'defaultValue'
  > &
    StateRenderProps<State<T>> & {
      variant?: AccordionVariant;
      size?: IdsSize;
      disabled?: boolean;
      headingLevel?: AccordionHeadingLevel;
    };

  export type SingleProps<T extends string = string> = RootProps<T> & {
    type: 'single';
    value?: T | null;
    defaultValue?: T | null;
    onValueChange?: (value: T | null) => void;
    collapsible?: boolean;
  };

  export type MultipleProps<T extends string = string> = RootProps<T> & {
    type: 'multiple';
    value?: T[];
    defaultValue?: T[];
    onValueChange?: (value: T[]) => void;
    collapsible?: never;
  };

  export type Props<T extends string = string> = SingleProps<T> | MultipleProps<T>;

  export function Item({ value, disabled, className, style, children, ...rest }: Item.Props) {
    const root = useRootContext('Accordion.Item');
    const open = root.open.includes(value);
    const isDisabled = root.disabled || disabled === true;
    const { triggerId, contentId, locked } = useAccordionItem({
      value,
      open,
      disabled: isDisabled,
      canCollapse: root.canCollapse,
      register: root.register,
    });
    const state: Item.State = { value, open, disabled: isDisabled };

    return (
      <AccordionItemContext value={{ state, locked, triggerId, contentId }}>
        <div
          {...rest}
          data-accordion-item=""
          {...openState(open)}
          data-disabled={flag(isDisabled)}
          className={root.styles.item({ className: resolveState(className, state) })}
          style={resolveState(style, state)}
        >
          {resolveState(children, state)}
        </div>
      </AccordionItemContext>
    );
  }

  export namespace Item {
    export type State = { value: string; open: boolean; disabled: boolean };

    export type Props = Omit<ComponentProps<'div'>, 'children' | 'className' | 'style'> &
      StateRenderProps<State> & {
        value: string;
        disabled?: boolean;
      };
  }

  export function Trigger({
    className,
    style,
    children,
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
    ...rest
  }: Trigger.Props) {
    const root = useRootContext('Accordion.Trigger');
    const item = useItemContext('Accordion.Trigger');
    const { state: interaction, handlers } = useInteractive<HTMLButtonElement>({
      disabled: item.state.disabled,
      onKeyDown: (event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) root.onTriggerKeyDown(event);
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
    const state: Trigger.State = { ...interaction, ...item.state };
    const content = resolveState(children, state);
    // A consumer's own Indicator replaces the default chevron wherever it is placed.
    const nodes = flattenFragments(content);
    const indicatorIndex = nodes.findIndex(
      (child) => isValidElement(child) && child.type === Indicator,
    );
    const Heading = `h${root.headingLevel}` as const;

    return (
      <Heading className={root.styles.heading()}>
        <button
          type="button"
          {...rest}
          {...handlers}
          id={item.triggerId}
          aria-expanded={item.state.open}
          aria-controls={item.contentId}
          aria-disabled={item.locked ? true : undefined}
          disabled={item.state.disabled}
          {...{ [TRIGGER_ATTRIBUTE]: '' }}
          {...interactiveDataProps(interaction)}
          {...openState(item.state.open)}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented || item.locked) return;
            root.toggle(item.state.value);
          }}
          className={root.styles.trigger({ className: resolveState(className, state) })}
          style={resolveState(style, state)}
        >
          <IndicatorPlacementContext
            value={indicatorIndex === -1 || indicatorIndex === nodes.length - 1 ? 'end' : 'inline'}
          >
            {content}
            {indicatorIndex === -1 && <Indicator />}
          </IndicatorPlacementContext>
        </button>
      </Heading>
    );
  }

  export namespace Trigger {
    export type State = InteractiveState & Item.State;

    export type Props = Omit<
      ComponentProps<'button'>,
      'children' | 'className' | 'style' | 'type' | 'disabled' | 'id'
    > &
      StateRenderProps<State>;
  }

  export function Indicator({ asChild, className, style, children, ...rest }: Indicator.Props) {
    const root = useRootContext('Accordion.Indicator');
    const { state } = useItemContext('Accordion.Indicator');
    const placement = use(IndicatorPlacementContext);
    const props = {
      'aria-hidden': true,
      ...rest,
      'data-accordion-indicator': '',
      ...openState(state.open),
      className: root.styles.indicator({ placement, className: resolveState(className, state) }),
      style: resolveState(style, state),
    };
    const content = resolveState(children, state);

    if (asChild === true) return <Slot {...props}>{content}</Slot>;
    return <span {...props}>{content ?? <ChevronDownIcon />}</span>;
  }

  export namespace Indicator {
    export type State = Item.State;

    export type Props = Omit<ComponentProps<'span'>, 'children' | 'className' | 'style'> &
      StateRenderProps<State> & {
        asChild?: boolean;
      };
  }

  export function Content({ className, style, children, ref, ...rest }: Content.Props) {
    const root = useRootContext('Accordion.Content');
    const item = useItemContext('Accordion.Content');
    const { state } = item;
    const { panelRef, hidden, closing, instant } = useAccordionPanel({
      open: state.open,
      disabled: state.disabled,
      triggerId: item.triggerId,
      onReveal: () => root.reveal(state.value),
    });
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => mergeRefs(panelRef, ref)(node),
      [panelRef, ref],
    );

    return (
      <div
        {...rest}
        ref={mergedRef}
        id={item.contentId}
        role="region"
        aria-labelledby={item.triggerId}
        hidden={hidden}
        inert={closing}
        data-accordion-content=""
        {...openState(state.open)}
        data-disabled={flag(state.disabled)}
        data-instant={flag(instant)}
        className={root.styles.content()}
      >
        <div className={root.styles.clip()}>
          <div
            className={root.styles.body({ className: resolveState(className, state) })}
            style={resolveState(style, state)}
          >
            {resolveState(children, state)}
          </div>
        </div>
      </div>
    );
  }

  export namespace Content {
    export type State = Item.State;

    export type Props = Omit<
      ComponentProps<'div'>,
      'children' | 'className' | 'style' | 'id' | 'role' | 'hidden' | 'inert'
    > &
      StateRenderProps<State> & {
        ref?: Ref<HTMLDivElement>;
      };
  }

  export const Style = tv({
    slots: {
      root: 'flex w-full flex-col',
      item: '',
      heading: 'flex',
      trigger: [
        'flex w-full flex-1 cursor-pointer items-start gap-2 rounded-standard text-start',
        'text-(--ids-color-on-surface) focus-ring',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
        'motion-reduce:transition-none',
        'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-default',
      ],
      // h-[1lh] keeps the chevron on the first line of a trigger that wraps.
      indicator: [
        'pointer-events-none inline-flex h-[1lh] shrink-0 items-center',
        'text-(--ids-color-on-muted) [&_svg]:size-4',
        'transition-transform duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
        'data-open:rotate-180',
      ],
      // Rows animate from 0fr to 1fr, which moves the height to the content's own height without
      // measuring it, including when the content changes size while open.
      content: [
        'grid grid-rows-[0fr] transition-[grid-template-rows] duration-(--ids-motion-normal) ease-out',
        'data-open:grid-rows-[1fr] data-instant:transition-none motion-reduce:transition-none',
      ],
      clip: 'min-h-0 overflow-hidden',
      body: 'text-(--ids-color-on-surface)',
    },
    variants: {
      variant: {
        outline: {
          item: 'border-b border-(--ids-color-border) last:border-b-0',
          trigger: 'underline-offset-4 data-hovered:underline',
        },
        soft: {
          root: 'gap-2',
          item: 'bg-(--ids-color-muted) concentric-p-1',
          trigger: 'px-3 data-hovered:bg-(--ids-color-on-surface)/5',
          body: 'px-3',
        },
        ghost: {
          root: 'gap-1',
          trigger: 'px-3 data-hovered:bg-(--ids-color-muted)',
          body: 'px-3',
        },
      } satisfies Record<AccordionVariant, object>,
      size: {
        standard: {
          trigger: 'py-4 text-body-b3-medium',
          body: 'pb-4 text-body-b3-regular',
        },
        tiny: {
          trigger: 'py-3 text-caption-c1-medium',
          body: 'pb-3 text-caption-c1-regular',
        },
      } satisfies Record<IdsSize, object>,
      placement: {
        end: { indicator: 'ms-auto' },
        inline: {},
      },
    },
    compoundVariants: [
      { variant: 'soft', size: 'standard', class: { trigger: 'py-3', body: 'pb-3' } },
      { variant: 'soft', size: 'tiny', class: { trigger: 'py-2', body: 'pb-2' } },
      { variant: 'ghost', size: 'standard', class: { trigger: 'py-2.5', body: 'pb-3' } },
      { variant: 'ghost', size: 'tiny', class: { trigger: 'py-1.5', body: 'pb-2' } },
    ],
    defaultVariants: { variant: 'outline', size: 'standard', placement: 'end' },
  });
}
