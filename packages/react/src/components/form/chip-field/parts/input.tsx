'use client';

import {
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { invariant, mergeProps, mergeRefs } from '../../../../utils';
import { Slot } from '../../../utility/slot';
import { ChipContext } from '../context';

import type { ChipFieldInputProps } from '..';

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

  const merged = mergeProps(
    mergeProps(c.inputDefaults, mergeProps(c.inputProps, rest)),
    c.comboboxWiring,
  );
  const placeholder = c.field.state.selected.length === 0 ? merged.placeholder : undefined;
  const props = {
    ...merged,
    placeholder,
    className: c.styles.input({ className }),
    style,
  };
  const widthFromText = (control: ReactNode) => (
    <span data-chip-field-sizer="" className={c.styles.inputSizer()}>
      {control}
      <span aria-hidden="true" className={c.styles.inputMirror()}>
        {c.field.state.query || placeholder}
      </span>
    </span>
  );

  if (asChild === true) {
    invariant(
      isValidElement(children) && (typeof children.type !== 'string' || children.type === 'input'),
      '`<ChipField.Input asChild>` requires one input, or a component forwarding input props and ref.',
    );

    return widthFromText(
      <Slot {...(props as Slot.Props)} ref={mergeRefs(inputRef, c.inputProps.ref, ref)}>
        {children}
      </Slot>,
    );
  }

  invariant(children == null, '`<ChipField.Input>` renders the search text itself, not children.');

  return widthFromText(<input {...props} ref={mergeRefs(inputRef, c.inputProps.ref, ref)} />);
}

ChipInput.displayName = 'ChipField.Input';
