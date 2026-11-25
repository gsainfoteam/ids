'use client';

import { use, type ComponentProps } from 'react';

import { DocumentIcon } from '@heroicons/react/16/solid';

import { Item } from '../../../data/item';
import { FileRowContext, useInternalFile } from '../context';
import { useInternalFilePreviewUrl } from '../hooks/use-file-preview-url';

export type FilePreviewProps = Omit<ComponentProps<'span'>, 'children'> & { file: File };

export function FilePreview({ file, className, ...props }: FilePreviewProps) {
  const c = useInternalFile('FileField.Preview');
  const inRow = use(FileRowContext);
  const url = useInternalFilePreviewUrl(file);

  const glyph = url ? <img src={url} alt="" draggable={false} /> : <DocumentIcon />;

  if (!inRow)
    return (
      <span
        {...props}
        aria-hidden="true"
        data-file-field-preview=""
        className={c.styles.thumb({ className })}
      >
        {glyph}
      </span>
    );

  return (
    <Item.Media asChild variant="soft" className={c.styles.preview({ className })}>
      <span {...props} aria-hidden="true" data-file-field-preview="">
        {glyph}
      </span>
    </Item.Media>
  );
}

FilePreview.displayName = 'FileField.Preview';
