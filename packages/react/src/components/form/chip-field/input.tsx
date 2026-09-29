import {
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { ChipContext } from './context';
import { invariant, mergeProps, mergeRefs } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { ChipFieldInputProps } from '.';

export type ChipInputProps = ChipFieldInputProps & {
  onChange?: ComponentProps<'input'>['onChange'];
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  asChild?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function ChipInput({
  asChild,
  children,
  disabled: _disabled,
  className,
  style,
  ref,
  ...rest
}: ChipInputProps) {
  const c = use(ChipContext);
  invariant(c != null, '`<ChipField.Input>` must be used inside `<ChipField>`.');
  const { inputRef } = c;

  const props = {
    ...mergeProps(mergeProps(c.inputDefaults, mergeProps(c.inputProps, rest)), c.comboboxWiring),
    className: c.styles.input({ className }),
    style,
  };

  if (asChild === true) {
    invariant(
      isValidElement(children) && (typeof children.type !== 'string' || children.type === 'input'),
      '`<ChipField.Input asChild>` requires one input, or a component forwarding input props and ref.',
    );

    return (
      <Slot {...(props as Slot.Props)} ref={mergeRefs(inputRef, c.inputProps.ref, ref)}>
        {children}
      </Slot>
    );
  }

  invariant(children == null, '`<ChipField.Input>` renders the search text itself, not children.');

  return <input {...props} ref={mergeRefs(inputRef, c.inputProps.ref, ref)} />;
}

ChipInput.displayName = 'ChipField.Input';
