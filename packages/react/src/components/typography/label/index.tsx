import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { useLabel } from './use-label';
import { mergeEventHandlers, tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

export function Label({
  size = 'standard',
  required,
  disabled,
  invalid = false,
  id,
  htmlFor,
  onClick,
  className,
  style,
  children,
  ref,
  ...rest
}: Label.Props) {
  const {
    labelId,
    labelRef,
    state: mirrored,
    onLabelClick,
  } = useLabel({
    id,
    htmlFor,
    disabled,
    required,
    ref,
  });
  const state: Label.State = { ...mirrored, invalid };
  const { root, marker } = Label.Style({ size });

  return (
    <label
      {...rest}
      ref={labelRef}
      id={labelId}
      htmlFor={htmlFor}
      onClick={mergeEventHandlers(onClick, onLabelClick)}
      data-label=""
      data-disabled={state.disabled ? '' : undefined}
      data-required={state.required ? '' : undefined}
      data-invalid={state.invalid ? '' : undefined}
      className={root({ className: resolve(className, state) })}
      style={resolve(style, state)}
    >
      {children}
      {state.required && (
        <span aria-hidden="true" data-label-required="" className={marker()}>
          *
        </span>
      )}
    </label>
  );
}

export namespace Label {
  export type State = {
    disabled: boolean;
    required: boolean;
    invalid: boolean;
  };

  export type Props = Omit<ComponentProps<'label'>, 'className' | 'style'> & {
    size?: IdsSize;
    required?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
    children?: ReactNode;
  };

  export const Style = tv({
    slots: {
      root: [
        'inline-flex items-center gap-2 text-(--ids-color-on-surface) select-none',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        'data-invalid:text-(--ids-color-danger)',
      ],
      // The asterisk repeats what `required` on the control already tells assistive technology.
      marker: '-ms-1 text-(--ids-color-danger)',
    },
    variants: {
      size: {
        standard: { root: 'text-body-b3-medium' },
        tiny: { root: 'text-caption-c1-medium' },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { size: 'standard' },
  });
}
