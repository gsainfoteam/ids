import {
  FileDropzoneClear,
  FileDropzoneItem,
  FileDropzoneList,
  FileDropzonePreview,
  FileDropzoneRemove,
  FileDropzoneTrigger,
  FileDropzoneValue,
} from './parts';
import {
  FileDropzoneRoot,
  type FileDropzoneProps,
  type FileDropzoneState,
  type FileDropzoneVariant,
} from './root';
import { fileDropzoneStyle } from './style';

import type { FileFieldItemState, FileFieldRejection } from '../file-field';
import type { FileClearProps } from '../file-field/clear';
import type { FileItemProps } from '../file-field/item';
import type { FileListProps } from '../file-field/list';
import type { FilePreviewProps } from '../file-field/preview';
import type { FileRemoveProps } from '../file-field/remove';
import type { FileTriggerProps } from '../file-field/trigger';
import type { FileValueProps } from '../file-field/value';

export function FileDropzone(props: FileDropzoneProps) {
  return <FileDropzoneRoot {...props} />;
}

export namespace FileDropzone {
  export type Props = FileDropzoneProps;
  export type State = FileDropzoneState;
  export type ItemState = FileFieldItemState;
  export type Variant = FileDropzoneVariant;
  export type Rejection = FileFieldRejection;

  export type TriggerProps = FileTriggerProps;
  export type ValueProps = FileValueProps;
  export type ClearProps = FileClearProps;
  export type ListProps = FileListProps;
  export type ItemProps = FileItemProps;
  export type RemoveProps = FileRemoveProps;
  export type PreviewProps = FilePreviewProps;

  export const Trigger = FileDropzoneTrigger;
  export const Value = FileDropzoneValue;
  export const Clear = FileDropzoneClear;
  export const List = FileDropzoneList;
  export const Item = FileDropzoneItem;
  export const Remove = FileDropzoneRemove;
  export const Preview = FileDropzonePreview;

  export const Style = fileDropzoneStyle;
}

export type { FileDropzoneVariant, FileDropzoneState, FileDropzoneProps } from './root';
