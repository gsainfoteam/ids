'use client';

import { type ComponentProps, type ReactElement } from 'react';

import { useInternalFile } from '../context';
import { GhostButton } from './ghost-button';
import { useInternalTranslate } from '../../../../internal/translate';

export type FileClearProps = Omit<ComponentProps<'button'>, 'children'> & {
  asChild?: boolean;
  children?: ReactElement;
};

export function FileClear({ className, onClick, ...props }: FileClearProps) {
  const t = useInternalTranslate();

  const c = useInternalFile('FileField.Clear');
  const { files, rejections } = c.field.state;
  if ((!files.length && !rejections.length) || c.state.readOnly) return null;

  return (
    <GhostButton
      {...props}
      aria-label={props['aria-label'] ?? t('common.clear')}
      disabled={c.state.disabled}
      data-file-field-clear=""
      size={c.size}
      owner={c.owner}
      className={c.styles.clear({ className })}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) c.field.actions.clear();
      }}
    />
  );
}

FileClear.displayName = 'FileField.Clear';
