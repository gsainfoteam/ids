'use client';

import { use, type ComponentProps } from 'react';

import { DocumentIcon } from '@heroicons/react/16/solid';

import { FileRowContext, useFile } from './context';
import { usePreviewUrl } from './use-file-field';
import { Item } from '../../data/item';

export type FilePreviewProps = Omit<ComponentProps<'span'>, 'children'> & { file: File };

export function FilePreview({ file, className, ...props }: FilePreviewProps) {
  const c = useFile('FileField.Preview');
  const inRow = use(FileRowContext);
  const url = usePreviewUrl(file);

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
