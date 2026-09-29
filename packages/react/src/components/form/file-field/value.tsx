import { type ComponentProps, type ReactNode } from 'react';

import { useFile } from './context';
import { messages } from '../../../internal/messages';
import { mergeProps, part } from '../../../utils';

export type FileValueProps = Omit<ComponentProps<'span'>, 'placeholder'> & {
  asChild?: boolean;
  placeholder?: ReactNode;
};

export function FileValue({ asChild, children, placeholder, className, ...props }: FileValueProps) {
  const c = useFile('FileField.Value');

  const { files } = c.field.state;
  const text =
    files.length === 0
      ? (placeholder ?? c.placeholder)
      : files.length === 1
        ? files[0].name
        : messages.fileField.count(files.length);

  return part(
    'span',
    asChild,
    children ?? text,
    mergeProps(props, {
      'data-placeholder': files.length ? undefined : '',
      title: files.length === 1 ? files[0].name : undefined,
      className: c.styles.value({ className }),
    }),
  );
}

FileValue.displayName = 'FileField.Value';
