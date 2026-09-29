import { type ComponentProps, type ReactElement } from 'react';

import { useFile } from './context';
import { GhostButton } from './ghost-button';
import { messages } from '../../../internal/messages';

export type FileClearProps = Omit<ComponentProps<'button'>, 'children'> & {
  asChild?: boolean;
  children?: ReactElement;
};

export function FileClear({ className, onClick, ...props }: FileClearProps) {
  const c = useFile('FileField.Clear');
  const { files, rejections } = c.field.state;
  if ((!files.length && !rejections.length) || c.state.readOnly) return null;

  return (
    <GhostButton
      {...props}
      aria-label={props['aria-label'] ?? messages.fileField.clear}
      disabled={c.state.disabled}
      data-file-field-clear=""
      size={c.size}
      className={c.styles.clear({ className })}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) c.field.actions.clear();
      }}
    />
  );
}

FileClear.displayName = 'FileField.Clear';
