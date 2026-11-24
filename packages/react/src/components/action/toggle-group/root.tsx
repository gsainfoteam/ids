'use client';

import { ToggleGroupContext } from './context';
import { toggleGroupStyle } from './style';
import { useToggleGroup } from './use-toggle-group';
import { FormValue } from '../../../internal/form-value';
import { Group, useGroupNameWarning } from '../../utility/group';

import type { ToggleGroup } from '.';

export function ToggleGroupRoot<T extends string = string>(props: ToggleGroup.Props<T>) {
  const {
    selectionMode,
    value,
    defaultValue,
    onValueChange,
    orientation,
    disabled,
    loop,
    required,
    name,
    form,
    ref,
    className,
    children,
    onFocus,
    ...rest
  } = props;
  useGroupNameWarning('ToggleGroup', props);
  const { context, rootProps, formValue, forwardRootFocusToItem } = useToggleGroup({
    selectionMode,
    value,
    defaultValue,
    onValueChange,
    orientation,
    disabled,
    loop,
    required,
    name,
    form,
    ref,
  });

  return (
    <ToggleGroupContext value={context}>
      <Group
        {...rest}
        {...rootProps}
        orientation={orientation}
        separator={rootProps.role === 'radiogroup' ? 'decorative' : 'semantic'}
        className={toggleGroupStyle({ orientation, className })}
        onFocus={(event) => {
          forwardRootFocusToItem(event);
          onFocus?.(event);
        }}
      >
        {children}
        <FormValue {...formValue} />
      </Group>
    </ToggleGroupContext>
  );
}
