import { useEffect, useRef } from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { mergeRefs } from '../../utils';
import { useFieldSize } from '../field/context';
import { IconButton } from '../icon-button';
import { NumberField, type NumberFieldProps } from '../number-field';
import { PasswordField, type PasswordFieldProps } from '../password-field';
import { TelField, type TelFieldProps } from '../tel-field';
import { TextField } from '../text-field';
import { TextFieldGroup } from '../text-field-group';

type TextInputProps = Omit<TextField.Props, 'type'> & {
  type?: 'text' | 'email' | 'url' | 'search';
  invalid?: boolean;
};
export type InputProps =
  | TextInputProps
  | ({ type: 'number' } & NumberFieldProps)
  | ({ type: 'password' } & PasswordFieldProps)
  | ({ type: 'tel' } & TelFieldProps);

/** Dispatches a schema's input type without changing the delegated field's value contract. */
export function Input(props: InputProps) {
  const { type = 'text' } = props;
  const supported = ['text', 'email', 'url', 'search', 'number', 'password', 'tel'].includes(type);
  useEffect(() => {
    if (import.meta.env.DEV && !supported)
      console.warn(
        `[IDS] Input: unsupported type "${type}"; using text. Use the dedicated field for dates, times, colors, files and OTP.`,
      );
  }, [supported, type]);
  if (props.type === 'number') {
    const { type: _type, ...rest } = props;
    return <NumberField {...rest} />;
  }
  if (props.type === 'password') {
    const { type: _type, ...rest } = props;
    return <PasswordField {...rest} />;
  }
  if (props.type === 'tel') {
    const { type: _type, ...rest } = props;
    return <TelField {...rest} />;
  }
  const { invalid, type: _type, ...rest } = props;
  const native = { ...rest, 'aria-invalid': rest['aria-invalid'] ?? invalid };
  if (type === 'search') return <SearchInput {...native} />;
  return <TextField {...native} type={supported ? type : 'text'} />;
}

function SearchInput({ variant, size, className, style, ref, ...props }: TextField.Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resolvedSize = useFieldSize(size) ?? 'standard';
  return (
    <TextFieldGroup
      variant={variant}
      size={resolvedSize}
      disabled={props.disabled}
      className={className}
      style={style}
    >
      <TextField
        {...props}
        type="search"
        ref={mergeRefs(inputRef, ref)}
        className="[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
      />
      <IconButton
        type="button"
        aria-label="검색어 지우기"
        icon={<XMarkIcon aria-hidden="true" />}
        variant="ghost"
        size={resolvedSize}
        className="size-7 shrink-0 p-1"
        disabled={props.disabled || props.readOnly}
        onPointerDown={(event) => {
          if (event.button === 0) event.preventDefault();
        }}
        onClick={() => {
          const input = inputRef.current;
          if (!input) return;
          input.focus({ preventScroll: true });
          if (!input.value) return;
          // Use a native input event so both React and native RHF registration observe clear.
          // The owner window also supports inputs rendered into another document.
          const view = input.ownerDocument.defaultView!;
          Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, 'value')!.set!.call(
            input,
            '',
          );
          input.dispatchEvent(new view.Event('input', { bubbles: true }));
        }}
      />
    </TextFieldGroup>
  );
}

export namespace Input {
  export type Props = InputProps;
}
