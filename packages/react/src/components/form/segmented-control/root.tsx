'use client';

import { useId, type ComponentProps, type ComponentType, type ReactNode } from 'react';

import { SegmentedControlContext, type SegmentedControlOrientation } from './context';
import { useInternalSegmentedControlChildrenWarning } from './hooks/use-segmented-control-children-warning';
import { SegmentedControlItem, type SegmentedControlItemProps } from './parts/item';
import { segmentedControlStyle } from './style';
import { useFieldSize } from '../field/context';
import { useInternalRadioGroup } from '../radio-group/hooks/use-radio-group';

import type { IdsSize } from '../../../tokens/types';

export type SegmentedControlRenderProps<T extends string> = {
  Item: ComponentType<SegmentedControlItemProps<T>>;
};

export type SegmentedControlProps<T extends string> = Omit<
  ComponentProps<'fieldset'>,
  'children' | 'defaultValue' | 'onChange' | 'role'
> & {
  value?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T) => void;
  name?: string;
  form?: string;
  orientation?: SegmentedControlOrientation;
  size?: IdsSize;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  children: ReactNode | ((render: SegmentedControlRenderProps<T>) => ReactNode);
};

const render = { Item: SegmentedControlItem } as SegmentedControlRenderProps<string>;

export function SegmentedControlRoot<T extends string>({
  value: valueProp,
  defaultValue,
  onValueChange,
  name,
  form,
  orientation = 'horizontal',
  size,
  disabled = false,
  readOnly = false,
  required = false,
  className,
  children,
  ref,
  onFocus,
  onKeyDown,
  ...rest
}: SegmentedControlProps<T>) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const { value, select, rootRef, forwardRootFocusToRadio, moveToEnd } = useInternalRadioGroup<T>({
    value: valueProp,
    defaultValue,
    onValueChange,
    name: groupName,
    ref,
  });
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const ariaInvalid = rest['aria-invalid'];
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';
  const styles = segmentedControlStyle({ orientation, size: resolvedSize });

  const items =
    typeof children === 'function'
      ? children(render as unknown as SegmentedControlRenderProps<T>)
      : children;
  useInternalSegmentedControlChildrenWarning(items);

  return (
    <SegmentedControlContext.Provider
      value={{
        name: groupName,
        value,
        select,
        disabled,
        readOnly,
        required,
        invalid: isInvalid,
        form,
        styles,
      }}
    >
      <fieldset
        {...rest}
        ref={rootRef}
        role="radiogroup"
        tabIndex={-1}
        disabled={disabled}
        aria-orientation={orientation}
        aria-readonly={readOnly || undefined}
        aria-required={required || undefined}
        aria-invalid={ariaInvalid}
        data-segmented-control=""
        data-orientation={orientation}
        data-size={resolvedSize}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-required={required ? '' : undefined}
        data-invalid={isInvalid ? '' : undefined}
        className={styles.root({ className })}
        onFocus={(event) => {
          forwardRootFocusToRadio(event);
          onFocus?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) moveToEnd(event);
        }}
      >
        {items}
      </fieldset>
    </SegmentedControlContext.Provider>
  );
}
