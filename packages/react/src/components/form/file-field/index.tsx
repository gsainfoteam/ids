import { FileClear, type FileClearProps } from './clear';
import { type FileFieldRejection } from './file-rules';
import { FileItem, type FileItemProps } from './item';
import { FileList, type FileListProps } from './list';
import { FilePreview, type FilePreviewProps } from './preview';
import { FileRemove, type FileRemoveProps } from './remove';
import {
  FileFieldRoot,
  type FileFieldAppearance,
  type FileFieldVariant,
  type FileFieldState,
  type FileFieldItemState,
  type FileFieldProps,
} from './root';
import { fileFieldStyle } from './style';
import { FileTrigger, type FileTriggerProps } from './trigger';
import { FileValue, type FileValueProps } from './value';

export function FileField(props: FileFieldProps) {
  return <FileFieldRoot {...props} />;
}

export namespace FileField {
  export type Props = FileFieldProps;
  export type State = FileFieldState;
  export type ItemState = FileFieldItemState;
  export type Appearance = FileFieldAppearance;
  export type Variant = FileFieldVariant;
  export type Rejection = FileFieldRejection;

  export type TriggerProps = FileTriggerProps;
  export type ValueProps = FileValueProps;
  export type ClearProps = FileClearProps;
  export type ListProps = FileListProps;
  export type ItemProps = FileItemProps;
  export type RemoveProps = FileRemoveProps;
  export type PreviewProps = FilePreviewProps;

  export const Trigger = FileTrigger;
  export const Value = FileValue;
  export const Clear = FileClear;
  export const List = FileList;
  export const Item = FileItem;
  export const Remove = FileRemove;
  export const Preview = FilePreview;

  export const Style = fileFieldStyle;
}

export type {
  FileFieldAppearance,
  FileFieldVariant,
  FileFieldState,
  FileFieldItemState,
  FileFieldProps,
} from './root';
export type { FileFieldRejection } from './file-rules';
