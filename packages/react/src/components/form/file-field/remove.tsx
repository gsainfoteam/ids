'use client';

import { type ComponentProps, type ReactElement } from 'react';

import { useFile } from './context';
import { GhostButton } from './ghost-button';
import { messages } from '../../../internal/messages';

export type FileRemoveProps = Omit<ComponentProps<'button'>, 'children'> & {
  file: File;
  asChild?: boolean;
  children?: ReactElement;
};

export function FileRemove({ file, className, onClick, ...props }: FileRemoveProps) {
  const c = useFile('FileField.Remove');
  if (c.state.readOnly) return null;

  return (
    <GhostButton
      {...props}
      aria-label={props['aria-label'] ?? messages.fileField.remove(file.name)}
      disabled={c.state.disabled}
      data-file-field-remove=""
      size={c.size}
      className={c.styles.itemRemove({ className })}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) c.field.actions.remove(file);
      }}
    />
  );
}

FileRemove.displayName = 'FileField.Remove';
