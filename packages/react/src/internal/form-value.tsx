import type { RefObject } from 'react';

export type FormValueProps = {
  name?: string;
  form?: string;
  value: string | readonly string[] | null | undefined;
  required?: boolean;
  disabled?: boolean;
  // The visible control that should take focus when the browser reports the value missing.
  anchor: RefObject<HTMLElement | null>;
};

const noop = () => {};

// A custom control (a button trigger, a listbox, a group of radios drawn as buttons) has no native
// input, so it is invisible to FormData and to the form's constraint validation.
//
// Hidden inputs carry the value into FormData, one per entry for a multi-value control. They are
// barred from validation, so `required` is enforced by a second, nameless input that covers the
// control: the browser anchors its "please fill out this field" bubble to it, and when the browser
// focuses it to show the bubble, focus moves on to the real control. It must not be readOnly or
// disabled, since either bars it from validation too. Render this inside a `relative` root.
export function FormValue({ name, form, value, required, disabled, anchor }: FormValueProps) {
  const values = value == null ? [] : typeof value === 'string' ? [value] : [...value];
  const filled = values.filter((entry) => entry !== '');

  return (
    <>
      {name != null &&
        filled.map((entry, index) => (
          <input
            key={`${index}:${entry}`}
            type="hidden"
            name={name}
            form={form}
            value={entry}
            disabled={disabled}
          />
        ))}
      {required && !disabled && (
        <input
          aria-hidden="true"
          tabIndex={-1}
          required
          form={form}
          value={filled.join(',')}
          onChange={noop}
          onFocus={() => anchor.current?.focus()}
          data-form-value-validator=""
          className="pointer-events-none absolute inset-0 size-full opacity-0"
        />
      )}
    </>
  );
}
