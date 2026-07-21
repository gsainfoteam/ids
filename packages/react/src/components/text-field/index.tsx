import type { ComponentProps, CSSProperties } from 'react';

import { textFieldSurface, useTextFieldGroupContext, type TextFieldVariant } from './surface';
import { invariant, mergeRefs, tv } from '../../utils';

import type { IdsSize } from '../../tokens/types';

export function TextField({
  variant = 'outline',
  size,
  disabled: disabledProp,
  className,
  style,
  ref,
  ...rest
}: TextField.Props) {
  const group = useTextFieldGroupContext();
  const grouped = group != null;

  invariant(
    !grouped || size == null || size === group.size,
    `\`<TextField>\` inside a group must use the group's \`size\` (${group?.size}).`,
  );

  const resolvedSize = grouped ? group.size : (size ?? 'standard');
  const disabled = disabledProp ?? group?.disabled;

  return (
    <input
      data-text-field=""
      data-size={resolvedSize}
      data-variant={grouped ? undefined : variant}
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      className={
        grouped
          ? TextField.Style({ grouped: true, className })
          : textFieldSurface({
              as: 'field',
              variant,
              size: resolvedSize,
              className: TextField.Style({ grouped: false, className }),
            })
      }
      style={style}
      ref={mergeRefs(group?.inputRef, ref)}
      {...rest}
    />
  );
}

export namespace TextField {
  export const Style = tv({
    base: [
      'min-w-0 bg-transparent outline-none',
      'text-inherit placeholder:text-(--ids-color-on-muted)',
      'selection:bg-(--ids-color-primary)/30 selection:text-(--ids-color-on-surface)',
      'disabled:cursor-not-allowed',
    ],
    variants: {
      grouped: {
        true: 'flex-1',
        false: '',
      },
    },
    defaultVariants: {
      grouped: false,
    },
  });

  export type Props = Omit<
    ComponentProps<'input'>,
    'size' | 'children' | 'className' | 'style' | 'color'
  > & {
    variant?: TextFieldVariant;
    size?: IdsSize;
    disabled?: boolean;
    className?: string;
    style?: CSSProperties;
  };
}

export {
  TextFieldGroupContext,
  textFieldSurface,
  useTextFieldGroupContext,
  type TextFieldGroupContextValue,
  type TextFieldVariant,
} from './surface';
