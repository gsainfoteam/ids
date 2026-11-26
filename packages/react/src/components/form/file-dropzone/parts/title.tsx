'use client';

import { type ComponentProps } from 'react';

import { invariant, mergeProps, part } from '../../../../utils';
import { useInternalFile } from '../../file-field/context';
import { fileDropzoneStyle } from '../style';

export type FileDropzoneTitleProps = ComponentProps<'span'> & {
  asChild?: boolean;
};

export function FileDropzoneTitle({
  asChild,
  children,
  className,
  ...props
}: FileDropzoneTitleProps) {
  const { owner } = useInternalFile('FileDropzone.Title');
  invariant(owner === 'FileDropzone', 'FileDropzone.Title must be rendered inside FileDropzone.');
  const { title } = fileDropzoneStyle();

  return part(
    'span',
    asChild,
    children,
    mergeProps(props, { 'data-file-dropzone-title': '', className: title({ className }) }),
  );
}

FileDropzoneTitle.displayName = 'FileDropzone.Title';
