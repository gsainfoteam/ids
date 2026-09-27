import {
  Children,
  createContext,
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { useItem } from './use-item';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { useRegisteredId } from '../../../internal/surface';
import { invariant, tv } from '../../../utils';
import { Divider } from '../../layout/divider';
import { Slot } from '../../utility/slot';

import type { InteractiveState } from '../../../hooks/use-interactive';
import type { IdsSize } from '../../../tokens/types';

export type ItemVariant = 'ghost' | 'outline' | 'soft';

type Context = {
  styles: ReturnType<typeof Item.Style>;
  setTitleId: (id: string | undefined) => void;
  setDescriptionId: (id: string | undefined) => void;
};

const ItemContext = createContext<Context | null>(null);
const ItemGroupContext = createContext<{ size: IdsSize | undefined } | null>(null);

function useItemContext(part: string) {
  const context = use(ItemContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Item>\`.`);
  return context;
}

function flag(on: boolean) {
  return on ? '' : undefined;
}

function isCurrent(value: unknown) {
  return value !== undefined && value !== false && value !== 'false';
}

export function Item({
  variant = 'ghost',
  size,
  interactive: interactiveProp,
  selected,
  disabled = false,
  asChild = false,
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
  onInteractionChange,
  ...rest
}: Item.Props) {
  const group = use(ItemGroupContext);
  const resolvedSize = size ?? group?.size ?? 'standard';
  // A link or button passed through asChild is interactive by what it is.
  const nativeControl =
    asChild && isValidElement(children) && (children.type === 'a' || children.type === 'button');
  const interactive = interactiveProp ?? (onClick != null || nativeControl);
  const { interaction, props, dataProps, labelling, register } = useItem<HTMLDivElement>({
    interactive,
    asChild,
    disabled,
    selected,
    current: isCurrent(rest['aria-current']),
    handlers: {
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
    },
  });
  const state: Item.State = { ...interaction, interactive, selected: selected === true };
  const styles = Item.Style({ variant, size: resolvedSize, interactive });
  const Root = asChild ? Slot : 'div';

  return (
    <ItemContext value={{ styles, ...register }}>
      <Root
        {...rest}
        {...props}
        {...labelling}
        {...(asChild && disabled
          ? { 'aria-disabled': true, onClick: (event) => event.preventDefault() }
          : {})}
        data-item=""
        data-variant={variant}
        data-size={resolvedSize}
        data-interactive={flag(interactive)}
        data-selected={flag(selected === true)}
        data-disabled={flag(disabled)}
        {...dataProps}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        {resolveState(children, state)}
      </Root>
    </ItemContext>
  );
}

function Part({
  asChild,
  kind,
  ...props
}: ComponentProps<'div'> & { asChild?: boolean; kind: string }) {
  const Root = asChild === true ? Slot : 'div';
  return <Root {...props} {...{ [`data-item-${kind}`]: '' }} />;
}

export namespace Item {
  export type Variant = ItemVariant;

  export type State = InteractiveState & { interactive: boolean; selected: boolean };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    variant?: ItemVariant;
    size?: IdsSize;
    interactive?: boolean;
    selected?: boolean;
    disabled?: boolean;
    asChild?: boolean;
    onInteractionChange?: (state: InteractiveState) => void;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: StateValue<ReactNode, State>;
  };

  export type PartProps = ComponentProps<'div'> & { asChild?: boolean };

  export function Media({ variant = 'ghost', className, ...props }: Media.Props) {
    const { styles } = useItemContext('Item.Media');
    return (
      <Part
        {...props}
        kind="media"
        data-variant={variant}
        className={styles.media({ media: variant, className })}
      />
    );
  }
  export namespace Media {
    export type Variant = ItemVariant;
    export type Props = PartProps & { variant?: ItemVariant };
  }

  export function Content({ className, ...props }: Content.Props) {
    const { styles } = useItemContext('Item.Content');
    return <Part {...props} kind="content" className={styles.content({ className })} />;
  }
  export namespace Content {
    export type Props = PartProps;
  }

  export function Title({ className, id, ...props }: Title.Props) {
    const { styles, setTitleId } = useItemContext('Item.Title');
    const titleId = useRegisteredId(setTitleId, id);
    return <Part {...props} id={titleId} kind="title" className={styles.title({ className })} />;
  }
  export namespace Title {
    export type Props = PartProps;
  }

  export function Description({ className, id, ...props }: Description.Props) {
    const { styles, setDescriptionId } = useItemContext('Item.Description');
    const descriptionId = useRegisteredId(setDescriptionId, id);
    return (
      <Part
        {...props}
        id={descriptionId}
        kind="description"
        className={styles.description({ className })}
      />
    );
  }
  export namespace Description {
    export type Props = PartProps;
  }

  export function Actions({ className, ...props }: Actions.Props) {
    const { styles } = useItemContext('Item.Actions');
    return <Part {...props} kind="actions" className={styles.actions({ className })} />;
  }
  export namespace Actions {
    export type Props = PartProps;
  }

  // Safari drops the list role of a <ul> without bullets unless it is written out. Each child is
  // placed in an <li>, so items can be dropped in as they are.
  export function Group({ size, className, children, ...props }: Group.Props) {
    const styles = Style();
    return (
      <ItemGroupContext value={{ size }}>
        <ul role="list" {...props} data-item-group="" className={styles.group({ className })}>
          {Children.map(children, (child) => {
            if (child == null || typeof child === 'boolean') return child;
            if (isValidElement(child) && (child.type === 'li' || child.type === Separator))
              return child;
            return <li className={styles.groupItem()}>{child}</li>;
          })}
        </ul>
      </ItemGroupContext>
    );
  }
  export namespace Group {
    export type Props = ComponentProps<'ul'> & { size?: IdsSize };
  }

  // In a group the line is an li left out of the list count; on its own it is an hr.
  export function Separator({ className, ...props }: Separator.Props) {
    const inGroup = use(ItemGroupContext) !== null;
    const separator = Style().separator({ className });
    if (inGroup)
      return (
        <Divider asChild decorative data-item-separator="" className={separator}>
          <li />
        </Divider>
      );
    return (
      <Divider asChild data-item-separator="" className={separator}>
        <hr {...props} />
      </Divider>
    );
  }
  export namespace Separator {
    export type Props = ComponentProps<'hr'>;
  }

  export const Style = tv({
    slots: {
      // Hover, press and selection lay a translucent layer over whatever the variant's background
      // is, instead of one color per variant and state.
      root: [
        'group/item relative isolate flex w-full items-center text-start text-(--ids-color-on-surface)',
        'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit]',
        'before:bg-(--ids-color-on-surface) before:opacity-0',
        'before:transition-opacity before:duration-(--ids-motion-fast) motion-reduce:before:transition-none',
        'data-selected:before:opacity-6',
      ],
      // With a description the row grows to two lines, and the media stays on the first.
      media: [
        'flex shrink-0 items-center justify-center gap-2 text-(--ids-color-on-muted)',
        'group-has-[[data-item-description]]/item:self-start [&_img]:object-cover',
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
      ],
      content: 'flex min-w-0 flex-1 flex-col gap-0.5 [&+[data-item-content]]:flex-none',
      title: 'flex w-fit items-center gap-2',
      description: 'line-clamp-2 text-(--ids-color-on-muted)',
      actions: 'ms-auto flex shrink-0 items-center gap-2',
      group: 'flex flex-col',
      groupItem: 'flex',
      // Divider draws the line; an hr also brings its own border, which would thicken it.
      separator: 'border-0',
    },
    variants: {
      variant: {
        ghost: {},
        outline: { root: 'inset-ring-1 inset-ring-(--ids-color-border)' },
        soft: { root: 'bg-(--ids-color-muted)' },
      } satisfies Record<ItemVariant, object>,
      media: {
        ghost: {},
        soft: { media: 'rounded-standard bg-(--ids-color-muted) text-(--ids-color-on-surface)' },
        outline: {
          media:
            'rounded-standard inset-ring-1 inset-ring-(--ids-color-border) text-(--ids-color-on-surface)',
        },
      } satisfies Record<ItemVariant, object>,
      size: {
        standard: {
          root: 'min-h-14 gap-3 concentric-p-3',
          title: 'text-body-b3-medium',
          description: 'text-body-b3-regular',
        },
        tiny: {
          root: 'min-h-10 gap-2 concentric-p-2',
          title: 'text-caption-c1-medium',
          description: 'text-caption-c1-regular',
        },
      } satisfies Record<IdsSize, object>,
      interactive: {
        true: {
          root: [
            'cursor-pointer select-none focus-ring',
            'data-hovered:before:opacity-4 data-active:before:opacity-8',
            'data-selected:data-hovered:before:opacity-10',
            'data-disabled:cursor-not-allowed data-disabled:opacity-50',
          ],
        },
        false: {},
      },
    },
    compoundVariants: [
      { media: ['soft', 'outline'], size: 'standard', class: { media: 'size-8' } },
      { media: ['soft', 'outline'], size: 'tiny', class: { media: 'size-7' } },
    ],
    defaultVariants: { variant: 'ghost', media: 'ghost', size: 'standard', interactive: false },
  });
}
