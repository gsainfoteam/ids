import { createContext, useContext, useId } from 'react';
import type { ComponentProps, KeyboardEvent, ReactNode } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { cn, invariant, tv } from '../../utils';
import { Slot } from '../slot';

import type { IdsSize } from '../../tokens/types';

const TRIGGER_ATTRIBUTE = 'data-accordion-trigger';
const ROOT_ATTRIBUTE = 'data-accordion';

type AccordionContextValue = {
  size: IdsSize;
  variant: 'bordered' | 'separated' | 'ghost';
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6;
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(component: string) {
  const context = useContext(AccordionContext);
  invariant(context != null, `\`<${component}>\` must be used inside \`<Accordion>\`.`);
  return context;
}

type ItemContextValue = {
  open: boolean;
  disabled: boolean;
  value: string;
  triggerId: string;
  contentId: string;
};

const ItemContext = createContext<ItemContextValue | null>(null);

function useItemContext(component: string) {
  const context = useContext(ItemContext);
  invariant(context != null, `\`<${component}>\` must be used inside \`<Accordion.Item>\`.`);
  return context;
}

function moveFocus(event: KeyboardEvent<HTMLButtonElement>) {
  const root = event.currentTarget.closest(`[${ROOT_ATTRIBUTE}]`);
  if (root == null) return;

  const triggers = [
    ...root.querySelectorAll<HTMLButtonElement>(`[${TRIGGER_ATTRIBUTE}]:not(:disabled)`),
  ];
  if (triggers.length === 0) return;

  const current = triggers.indexOf(event.currentTarget);
  const next = {
    ArrowDown: (current + 1) % triggers.length,
    ArrowUp: (current - 1 + triggers.length) % triggers.length,
    Home: 0,
    End: triggers.length - 1,
  }[event.key];

  if (next == null) return;
  event.preventDefault();
  triggers[next].focus();
}

export function Accordion<T extends string>(props: Accordion.Props<T>) {
  const {
    variant = 'bordered',
    size = 'standard',
    headingLevel = 3,
    className,
    children,
    ...rest
  } = props;

  const single = props.type === 'single';
  const [value, setValue] = useControllableState<T | null | T[]>({
    value: props.value,
    defaultValue: props.defaultValue ?? (single ? null : ([] as T[])),
    onChange: props.onValueChange as ((next: T | null | T[]) => void) | undefined,
  });

  function isOpen(item: string) {
    return Array.isArray(value) ? value.includes(item as T) : value === item;
  }

  function toggle(item: string) {
    if (Array.isArray(value)) {
      setValue(value.includes(item as T) ? value.filter((v) => v !== item) : [...value, item as T]);
      return;
    }
    const collapsible = props.type === 'single' ? (props.collapsible ?? true) : true;
    if (value === item) setValue(collapsible ? null : value);
    else setValue(item as T);
  }

  const forwarded = { ...rest } as Record<string, unknown>;
  for (const key of [
    'type',
    'value',
    'defaultValue',
    'onValueChange',
    'collapsible',
    'headingLevel',
  ]) {
    delete forwarded[key];
  }

  return (
    <AccordionContext.Provider value={{ size, variant, headingLevel, isOpen, toggle }}>
      <div
        {...forwarded}
        {...{ [ROOT_ATTRIBUTE]: '' }}
        className={Accordion.Style({ variant, className })}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export namespace Accordion {
  export const Style = tv({
    base: 'flex w-full flex-col',
    variants: {
      variant: {
        bordered:
          'overflow-hidden rounded-xl inset-ring-1 inset-ring-(--ids-color-outline) [&>*+*]:border-t [&>*+*]:border-(--ids-color-outline)',
        separated: 'gap-2',
        ghost: '',
      },
    },
    defaultVariants: { variant: 'bordered' },
  });

  export const ItemStyle = tv({
    base: 'flex flex-col',
    variants: {
      variant: {
        bordered: '',
        separated: 'overflow-hidden rounded-xl inset-ring-1 inset-ring-(--ids-color-outline)',
        ghost: '',
      },
    },
    defaultVariants: { variant: 'bordered' },
  });

  export const TriggerStyle = tv({
    base: [
      'flex w-full cursor-pointer items-center gap-2 text-left transition-colors select-none',
      'text-(--ids-color-on-surface)',
      'hover:bg-(--ids-color-primary)/10',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ids-color-primary)',
      'disabled:cursor-not-allowed disabled:opacity-40',
      'motion-reduce:transition-none',
    ],
    variants: {
      size: {
        standard: 'min-h-12 px-4 py-3 text-body-b3-medium',
        tiny: 'min-h-9 px-3 py-2 text-caption-c1-medium',
      } satisfies Record<IdsSize, string>,
    },
    defaultVariants: { size: 'standard' },
  });

  export function Item({ value, disabled = false, className, children, ...rest }: ItemProps) {
    const { variant, isOpen } = useAccordionContext('Accordion.Item');
    const id = useId();
    const open = isOpen(value);

    return (
      <ItemContext.Provider
        value={{
          open,
          disabled,
          value,
          triggerId: `${id}-trigger`,
          contentId: `${id}-content`,
        }}
      >
        <div
          {...rest}
          data-state={open ? 'open' : 'closed'}
          className={ItemStyle({ variant, className })}
        >
          {children}
        </div>
      </ItemContext.Provider>
    );
  }

  export function Trigger({ className, children, ...rest }: TriggerProps) {
    const { size, headingLevel, toggle } = useAccordionContext('Accordion.Trigger');
    const { open, disabled, value, triggerId, contentId } = useItemContext('Accordion.Trigger');
    const Heading = `h${headingLevel}` as const;

    return (
      <Heading className="flex">
        <button
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={contentId}
          disabled={disabled}
          data-state={open ? 'open' : 'closed'}
          {...{ [TRIGGER_ATTRIBUTE]: '' }}
          {...rest}
          className={TriggerStyle({ size, className })}
          onClick={(event) => {
            rest.onClick?.(event);
            if (event.defaultPrevented) return;
            toggle(value);
          }}
          onKeyDown={(event) => {
            rest.onKeyDown?.(event);
            if (event.defaultPrevented) return;
            moveFocus(event);
          }}
        >
          {children}
        </button>
      </Heading>
    );
  }

  export function Indicator({ asChild, className, ...rest }: PartProps) {
    const { open } = useItemContext('Accordion.Indicator');
    const Root = asChild === true ? Slot : 'span';

    return (
      <Root
        aria-hidden
        data-state={open ? 'open' : 'closed'}
        {...rest}
        className={cn(
          'ml-auto inline-flex shrink-0 transition-transform duration-(--ids-motion-fast)',
          'data-[state=open]:rotate-180 motion-reduce:transition-none',
          '[&_svg]:size-4',
          className,
        )}
      />
    );
  }

  export function Content({ className, children, ...rest }: ContentProps) {
    const { size } = useAccordionContext('Accordion.Content');
    const { open, triggerId, contentId } = useItemContext('Accordion.Content');

    return (
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        data-state={open ? 'open' : 'closed'}
        inert={!open}
        {...rest}
        className={cn(
          'grid grid-rows-[0fr] transition-[grid-template-rows] duration-(--ids-motion-fast)',
          'data-[state=open]:grid-rows-[1fr] motion-reduce:transition-none',
          className,
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              'text-(--ids-color-on-surface)',
              size === 'tiny'
                ? 'text-caption-c1-regular px-3 pt-0.5 pb-2'
                : 'text-body-b3-regular px-4 pt-1 pb-3',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  export type PartProps = Omit<ComponentProps<'span'>, 'className'> & {
    asChild?: boolean;
    className?: string;
  };

  export type ItemProps = Omit<ComponentProps<'div'>, 'children' | 'className'> & {
    value: string;
    disabled?: boolean;
    className?: string;
    children?: ReactNode;
  };

  export type TriggerProps = Omit<
    ComponentProps<'button'>,
    'children' | 'className' | 'type' | 'disabled'
  > & {
    className?: string;
    children?: ReactNode;
  };

  export type ContentProps = Omit<ComponentProps<'div'>, 'children' | 'className' | 'role'> & {
    className?: string;
    children?: ReactNode;
  };

  type CommonProps = Omit<ComponentProps<'div'>, 'children' | 'className' | 'defaultValue'> & {
    variant?: 'bordered' | 'separated' | 'ghost';
    size?: IdsSize;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    children?: ReactNode;
  };

  export type SingleProps<T extends string> = CommonProps & {
    type: 'single';
    value?: T | null;
    defaultValue?: T | null;
    onValueChange?: (value: T | null) => void;
    collapsible?: boolean;
  };

  export type MultipleProps<T extends string> = CommonProps & {
    type: 'multiple';
    value?: T[];
    defaultValue?: T[];
    onValueChange?: (value: T[]) => void;
    collapsible?: never;
  };

  export type Props<T extends string> = SingleProps<T> | MultipleProps<T>;
}
