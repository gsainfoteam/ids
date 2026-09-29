import {
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { ItemActions, type ItemActionsProps } from './actions';
import { ItemContent, type ItemContentProps } from './content';
import { ItemContext, ItemGroupContext } from './context';
import { ItemDescription, type ItemDescriptionProps } from './description';
import { ItemGroup, type ItemGroupProps } from './group';
import { ItemMedia, type ItemMediaProps } from './media';
import { type ItemPartProps } from './part';
import { ItemSeparator, type ItemSeparatorProps } from './separator';
import { itemStyle } from './style';
import { ItemTitle, type ItemTitleProps } from './title';
import { useItem } from './use-item';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { Slot } from '../../utility/slot';

import type { InteractiveState } from '../../../hooks/use-interactive';
import type { IdsSize } from '../../../tokens/types';

export type ItemVariant = 'ghost' | 'outline' | 'soft';

function flag(on: boolean) {
  return on ? '' : undefined;
}

function isCurrent(value: unknown) {
  return value !== undefined && value !== false && value !== 'false';
}

export function Item({
  variant = 'ghost',
  size,
  dense,
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
  const resolvedDense = dense ?? group?.dense ?? false;
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
  const styles = itemStyle({ variant, size: resolvedSize, dense: resolvedDense, interactive });
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
        data-dense={flag(resolvedDense)}
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

export namespace Item {
  export type Variant = ItemVariant;

  export type State = InteractiveState & { interactive: boolean; selected: boolean };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    variant?: ItemVariant;
    size?: IdsSize;
    dense?: boolean;
    interactive?: boolean;
    selected?: boolean;
    disabled?: boolean;
    asChild?: boolean;
    onInteractionChange?: (state: InteractiveState) => void;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: StateValue<ReactNode, State>;
  };

  export type PartProps = ItemPartProps;

  export const Media = ItemMedia;
  export namespace Media {
    export type Variant = ItemVariant;
    export type Props = ItemMediaProps;
  }

  export const Content = ItemContent;
  export namespace Content {
    export type Props = ItemContentProps;
  }

  export const Title = ItemTitle;
  export namespace Title {
    export type Props = ItemTitleProps;
  }

  export const Description = ItemDescription;
  export namespace Description {
    export type Props = ItemDescriptionProps;
  }

  export const Actions = ItemActions;
  export namespace Actions {
    export type Props = ItemActionsProps;
  }

  export const Group = ItemGroup;
  export namespace Group {
    export type Props = ItemGroupProps;
  }

  export const Separator = ItemSeparator;
  export namespace Separator {
    export type Props = ItemSeparatorProps;
  }

  export const Style = itemStyle;
}
