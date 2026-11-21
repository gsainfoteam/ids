'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useFile } from './context';
import { fileKey } from './file-rules';
import { FileItem } from './item';
import { useTranslate } from '../../../internal/translate';
import { mergeProps, part } from '../../../utils';
import { ItemGroup } from '../../data/item-group';

export type FileListProps = Omit<ComponentProps<'ul'>, 'children'> & {
  asChild?: boolean;
  children?: ReactNode | ((files: File[]) => ReactNode);
};

export function FileList({ asChild, children, className, ...props }: FileListProps) {
  const t = useTranslate();

  const c = useFile('FileField.List');
  const { files } = c.field.state;
  if (!files.length) return null;

  const items =
    typeof children === 'function'
      ? children(files)
      : (children ?? files.map((file) => <FileItem key={fileKey(file)} file={file} />));
  const list = {
    'aria-label': props['aria-label'] ?? t('fileField.list'),
    className: c.styles.list({ className }),
  };

  if (asChild) return part('div', true, items, mergeProps(props, { ...list, role: 'list' }));

  return (
    <ItemGroup variant="ghost" {...props} {...list} size={c.size}>
      {items}
    </ItemGroup>
  );
}

FileList.displayName = 'FileField.List';
