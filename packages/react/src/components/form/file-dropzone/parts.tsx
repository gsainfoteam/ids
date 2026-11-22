'use client';

import { type ComponentType } from 'react';

import { FileClear, type FileClearProps } from '../file-field/clear';
import { registerPartAlias } from '../file-field/is-type';
import { FileItem, type FileItemProps } from '../file-field/item';
import { FileList, type FileListProps } from '../file-field/list';
import { FilePreview, type FilePreviewProps } from '../file-field/preview';
import { FileRemove, type FileRemoveProps } from '../file-field/remove';
import { FileTrigger, type FileTriggerProps } from '../file-field/trigger';
import { FileValue, type FileValueProps } from '../file-field/value';

function renamedPart<P extends object>(Part: ComponentType<P>, displayName: string) {
  function Renamed(props: P) {
    return <Part {...props} />;
  }
  Renamed.displayName = displayName;
  registerPartAlias(Renamed, Part);

  return Renamed;
}

export const FileDropzoneTrigger = renamedPart<FileTriggerProps>(
  FileTrigger,
  'FileDropzone.Trigger',
);
export const FileDropzoneValue = renamedPart<FileValueProps>(FileValue, 'FileDropzone.Value');
export const FileDropzoneClear = renamedPart<FileClearProps>(FileClear, 'FileDropzone.Clear');
export const FileDropzoneList = renamedPart<FileListProps>(FileList, 'FileDropzone.List');
export const FileDropzoneItem = renamedPart<FileItemProps>(FileItem, 'FileDropzone.Item');
export const FileDropzoneRemove = renamedPart<FileRemoveProps>(FileRemove, 'FileDropzone.Remove');
export const FileDropzonePreview = renamedPart<FilePreviewProps>(
  FilePreview,
  'FileDropzone.Preview',
);
