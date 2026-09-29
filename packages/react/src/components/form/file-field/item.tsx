'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { FileRowContext, useFile } from './context';
import { formatBytes } from './file-rules';
import { FilePreview } from './preview';
import { FileRemove } from './remove';
import { Item } from '../../data/item';

import type { FileFieldItemState } from '.';

export type FileItemProps = Omit<ComponentProps<'div'>, 'children'> & {
  file: File;
  asChild?: boolean;
  children?: ReactNode | ((state: FileFieldItemState) => ReactNode);
};

export function FileItem({ file, asChild, children, className, ...props }: FileItemProps) {
  const c = useFile('FileField.Item');

  const state: FileFieldItemState = { file, index: c.field.state.files.indexOf(file) };
  const content =
    typeof children === 'function'
      ? children(state)
      : (children ?? (
          <>
            <FilePreview file={file} />
            <Item.Content>
              <Item.Title truncate title={file.name}>
                {file.name}
              </Item.Title>
              <Item.Description className={c.styles.itemSize()}>
                {formatBytes(file.size)}
              </Item.Description>
            </Item.Content>
            <Item.Actions>
              <FileRemove file={file} />
            </Item.Actions>
          </>
        ));

  return (
    <FileRowContext value>
      <Item
        {...props}
        asChild={asChild}
        variant="outline"
        size={c.size}
        dense
        data-file-field-item=""
        className={c.styles.item({ className })}
      >
        {content}
      </Item>
    </FileRowContext>
  );
}

FileItem.displayName = 'FileField.Item';
