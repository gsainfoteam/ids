'use client';

import type { ChangeEventHandler, ComponentProps, Ref } from 'react';

export type FilePickerProps = {
  native: ComponentProps<'input'>;
  ref: Ref<HTMLInputElement>;
  multiple: boolean;
  disabled: boolean;
  form: string | undefined;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function FilePicker({ native, ref, multiple, disabled, form, onChange }: FilePickerProps) {
  return (
    <input
      {...native}
      ref={ref}
      type="file"
      multiple={multiple}
      disabled={disabled}
      form={form}
      hidden
      tabIndex={-1}
      aria-hidden="true"
      onChange={onChange}
    />
  );
}
