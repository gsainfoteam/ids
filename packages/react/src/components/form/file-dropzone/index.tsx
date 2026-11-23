import {
  FileDropzoneClear,
  FileDropzoneItem,
  FileDropzoneList,
  FileDropzonePreview,
  FileDropzoneRemove,
  FileDropzoneTrigger,
  FileDropzoneValue,
  type FileDropzoneClearProps,
  type FileDropzoneItemProps,
  type FileDropzoneListProps,
  type FileDropzonePreviewProps,
  type FileDropzoneRemoveProps,
  type FileDropzoneTriggerProps,
  type FileDropzoneValueProps,
} from './parts/parts';
import {
  FileDropzoneRoot,
  type FileDropzoneProps,
  type FileDropzoneState,
  type FileDropzoneVariant,
} from './root';
import { fileDropzoneStyle } from './style';

import type { FileFieldItemState, FileFieldRejection } from '../file-field';

export function FileDropzone(props: FileDropzoneProps) {
  return <FileDropzoneRoot {...props} />;
}

export namespace FileDropzone {
  export type Props = FileDropzoneProps;
  export type State = FileDropzoneState;
  export type ItemState = FileFieldItemState;
  export type Variant = FileDropzoneVariant;
  export type Rejection = FileFieldRejection;

  export type TriggerProps = FileDropzoneTriggerProps;
  export type ValueProps = FileDropzoneValueProps;
  export type ClearProps = FileDropzoneClearProps;
  export type ListProps = FileDropzoneListProps;
  export type ItemProps = FileDropzoneItemProps;
  export type RemoveProps = FileDropzoneRemoveProps;
  export type PreviewProps = FileDropzonePreviewProps;

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
