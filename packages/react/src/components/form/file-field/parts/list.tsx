'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useInternalFile } from '../context';
import { FileItem } from './item';
import { useInternalTranslate } from '../../../../internal/translate';
import { mergeProps, part } from '../../../../utils';
import { ItemGroup } from '../../../data/item-group';
import { fileKey } from '../lib/file-rules';

export type FileListProps = Omit<ComponentProps<'ul'>, 'children'> & {
  asChild?: boolean;
  children?: ReactNode | ((files: File[]) => ReactNode);
};

export function FileList({ asChild, children, className, ...props }: FileListProps) {
  const t = useInternalTranslate();

  const c = useInternalFile('FileField.List');
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
