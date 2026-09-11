import { Children, isValidElement, useEffect, useRef } from 'react';
import type { ChangeEvent, ComponentProps, ReactNode } from 'react';

import { CheckIcon, MinusIcon } from '@heroicons/react/16/solid';

import { invariant, mergeRefs, tv } from '../../utils';
import { Slot } from '../slot';

import type { IdsSize } from '../../tokens/types';

export function Checkbox({
  variant = 'outline',
  size = 'standard',
  indeterminate = false,
  invalid = false,
  onChange,
  className,
  children,
  ref,
  ...rest
}: Checkbox.Props) {
  invariant(
    rest.checked == null || rest.defaultChecked == null,
    '`<Checkbox>` takes either `checked` or `defaultChecked`, not both.',
  );

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current != null) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const indicator = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === Checkbox.Indicator,
  );

  const { root, box } = Checkbox.Style({ size, variant, invalid });

  return (
    <span className={root()}>
      <input
        {...rest}
        type="checkbox"
        aria-invalid={invalid || undefined}
        ref={mergeRefs(inputRef, ref)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.checked, event)}
        className={box({ className })}
      />
      {indicator ?? (
        <Checkbox.Indicator>{indeterminate ? <MinusIcon /> : <CheckIcon />}</Checkbox.Indicator>
      )}
    </span>
  );
}

export namespace Checkbox {
  export const Style = tv({
    slots: {
      root: 'relative inline-grid shrink-0 align-middle has-disabled:opacity-50',
      box: [
        'peer col-start-1 row-start-1 size-full appearance-none rounded-xs shadow-xs',
        'cursor-pointer transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) disabled:cursor-not-allowed',
        'inset-ring-1 inset-ring-(--ids-color-outline)',
        'enabled:hover:bg-(--ids-color-primary)/10',
        'checked:bg-(--checkbox-fill) checked:inset-ring-(--checkbox-fill)',
        'indeterminate:bg-(--checkbox-fill) indeterminate:inset-ring-(--checkbox-fill)',
        'focus-ring',
        'motion-reduce:transition-none',
      ],
      indicator: [
        'pointer-events-none col-start-1 row-start-1 grid place-items-center',
        'text-(--ids-color-on-primary) opacity-0',
        'peer-checked:opacity-100 peer-indeterminate:opacity-100',
        '[&_svg]:size-(--checkbox-glyph)',
      ],
    },
    variants: {
      size: {
        standard: { root: 'size-5 [--checkbox-glyph:1rem]' },
        tiny: { root: 'size-4 [--checkbox-glyph:0.75rem]' },
      } satisfies Record<IdsSize, { root: string }>,
      variant: {
        outline: { box: 'bg-(--ids-color-surface)' },
        filled: { box: 'bg-(--ids-color-muted) inset-ring-transparent' },
      },
      invalid: {
        true: { box: '[--checkbox-fill:var(--ids-color-danger)] inset-ring-(--ids-color-danger)' },
        false: { box: '[--checkbox-fill:var(--ids-color-primary)]' },
      },
    },
    defaultVariants: { size: 'standard', variant: 'outline', invalid: false },
  });

  export function Indicator({ asChild, className, children, ...rest }: IndicatorProps) {
    const Root = asChild === true ? Slot : 'span';

    return (
      <Root aria-hidden {...rest} className={Style().indicator({ className })}>
        {children}
      </Root>
    );
  }

  export type IndicatorProps = Omit<ComponentProps<'span'>, 'className'> & {
    asChild?: boolean;
    className?: string;
  };

  export type Props = Omit<
    ComponentProps<'input'>,
    'type' | 'size' | 'className' | 'children' | 'onChange'
  > & {
    variant?: 'outline' | 'filled';
    size?: IdsSize;
    indeterminate?: boolean;
    invalid?: boolean;
    onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    children?: ReactNode;
  };
}
