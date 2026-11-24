import { type FileFieldRejection } from './lib/file-rules';
import { FileClear, type FileClearProps } from './parts/clear';
import { FileItem, type FileItemProps } from './parts/item';
import { FileLimits, type FileFieldLimits, type FileLimitsProps } from './parts/limits';
import { FileList, type FileListProps } from './parts/list';
import { FilePreview, type FilePreviewProps } from './parts/preview';
import { FileRejection, type FileRejectionProps } from './parts/rejection';
import { FileRemove, type FileRemoveProps } from './parts/remove';
import { FileTrigger, type FileTriggerProps } from './parts/trigger';
import { FileValue, type FileValueProps } from './parts/value';
import {
  FileFieldRoot,
  type FileFieldVariant,
  type FileFieldState,
  type FileFieldItemState,
  type FileFieldProps,
} from './root';
import { fileFieldStyle } from './style';

export function FileField(props: FileFieldProps) {
  return <FileFieldRoot {...props} />;
}

export namespace FileField {
  export type Props = FileFieldProps;
  export type State = FileFieldState;
  export type ItemState = FileFieldItemState;
  export type Variant = FileFieldVariant;
  export type Rejection = FileFieldRejection;
  export type Limits = FileFieldLimits;

  export type TriggerProps = FileTriggerProps;
  export type ValueProps = FileValueProps;
  export type ClearProps = FileClearProps;
  export type ListProps = FileListProps;
  export type ItemProps = FileItemProps;
  export type RemoveProps = FileRemoveProps;
  export type PreviewProps = FilePreviewProps;
  export type LimitsProps = FileLimitsProps;
  export type RejectionProps = FileRejectionProps;

  export const Trigger = FileTrigger;
  export const Value = FileValue;
  export const Clear = FileClear;
  export const List = FileList;
  export const Item = FileItem;
  export const Remove = FileRemove;
  export const Preview = FilePreview;
  export const Limits = FileLimits;
  export const Rejection = FileRejection;

  export const Style = fileFieldStyle;
}

export type { FileFieldVariant, FileFieldState, FileFieldItemState, FileFieldProps } from './root';
export type { FileFieldRejection } from './lib/file-rules';
export type { FileFieldLimits } from './parts/limits';
