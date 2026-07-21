import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import {
  useInteractiveProps,
  type InteractiveState,
  type WithInteractiveValues,
} from '../../hooks/use-interactive';
import { tv, type VariantProps } from '../../utils';
import { controlSurface } from '../control-surface';
import { useGroupedSize } from '../group';

import type { IdsSize } from '../../tokens/types';

export function Button(props: Button.Props) {
  const {
    props: { children, className, style, variant, size, type = 'button', disabled, ...rest },
    handlers,
    dataProps,
  } = useInteractiveProps<HTMLButtonElement, Button.Props>(props);
  const groupedSize = useGroupedSize('Button', size as IdsSize | undefined);

  return (
    <button
      type={type}
      disabled={disabled}
      className={Button.Style({ variant, size: groupedSize, className })}
      style={style}
      {...dataProps}
      {...handlers}
      {...rest}
    >
      {children}
    </button>
  );
}

export namespace Button {
  export const Style = tv({
    base: controlSurface.base,
    variants: {
      variant: controlSurface.variant,
      size: controlSurface.size,
    },
    defaultVariants: {
      variant: 'solid',
      size: 'standard',
    },
  });

  type BaseProps = Omit<ComponentProps<'button'>, 'children' | 'className' | 'style'> &
    VariantProps<typeof Style> & {
      children?: ReactNode;
      className?: string;
      style?: CSSProperties;
      onInteractionChange?: (state: InteractiveState) => void;
    };

  export type Props = WithInteractiveValues<BaseProps>;
}
