'use client';

import {
  type ComponentProps,
  type CSSProperties,
  type DragEventHandler,
  type ReactNode,
} from 'react';

import { PaperClipIcon } from '@heroicons/react/16/solid';

import { FileContext } from './context';
import { useInternalFileFieldRoot } from './hooks/use-file-field-root';
import { type FileFieldRejection } from './lib/file-rules';
import { isType } from './lib/is-type';
import { FileClear } from './parts/clear';
import { FileList } from './parts/list';
import { FilePreview } from './parts/preview';
import { FileTrigger } from './parts/trigger';
import { FileValue } from './parts/value';
import { fileFieldStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { flattenFragments, invariant } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type FileFieldVariant = 'outline' | 'soft' | 'ghost';

export type FileFieldState = {
  dragging: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  empty: boolean;
  multiple: boolean;
};

export type FileFieldItemState = { file: File; index: number };

type ButtonProps = 'onClick' | 'onBlur' | 'onFocus' | 'onKeyDown' | 'ref';

type BaseProps = Omit<
  ComponentProps<'input'>,
  | 'type'
  | 'size'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'multiple'
  | 'onDrop'
  | 'onDragOver'
  | 'onDragEnter'
  | 'onDragLeave'
  | 'className'
  | 'style'
  | 'children'
  | 'placeholder'
  | ButtonProps
> &
  Pick<ComponentProps<'button'>, ButtonProps> & {
    variant?: FileFieldVariant;
    size?: IdsSize;
    invalid?: boolean;
    maxSize?: number;
    maxCount?: number;
    onReject?: (rejections: FileFieldRejection[]) => void;
    onDrop?: DragEventHandler<HTMLDivElement>;
    onDragOver?: DragEventHandler<HTMLDivElement>;
    placeholder?: ReactNode;
    className?: string | ((state: FileFieldState) => string | undefined);
    style?: CSSProperties;
    children?: ReactNode;
  };

export type FileFieldProps = BaseProps &
  (
    | {
        multiple?: false;
        value?: File | null;
        defaultValue?: File | null;
        onValueChange?: (value: File | null) => void;
      }
    | {
        multiple: true;
        value?: File[];
        defaultValue?: File[];
        onValueChange?: (value: File[]) => void;
      }
  );

export function FileFieldRoot(props: FileFieldProps) {
  const { variant = 'outline', multiple = false, children, className, style } = props;
  const { context, rootProps, picker, messages } = useInternalFileFieldRoot(props, 'field');
  const { state } = context;
  const styles = fileFieldStyle({ variant, size: context.size });
  const [first] = context.field.state.files;

  const nodes = flattenFragments(children);
  invariant(
    !nodes.length || nodes.filter(isType(FileTrigger)).length === 1,
    'FileField: explicit children require exactly one Trigger.',
  );
  const controls = nodes.filter((node) => isType(FileTrigger)(node) || isType(FileClear)(node));
  const others = nodes.filter((node) => !controls.includes(node));
  const composed = nodes.length
    ? { controls, others }
    : {
        controls: [<FileTrigger key="trigger" />, <FileClear key="clear" />],
        others: multiple ? [<FileList key="list" />] : [],
      };

  const triggerContent = (
    <>
      {!multiple && first ? (
        <FilePreview file={first} />
      ) : (
        <PaperClipIcon aria-hidden="true" className={styles.icon()} />
      )}
      <FileValue />
    </>
  );

  return (
    <FileContext value={{ ...context, styles, triggerContent }}>
      <div
        {...rootProps}
        className={styles.root({ className: resolveState(className, state) })}
        style={style}
      >
        {picker}
        <div
          data-file-field-control=""
          data-invalid={state.invalid ? '' : undefined}
          data-disabled={state.disabled ? '' : undefined}
          className={styles.control()}
        >
          {composed.controls}
        </div>
        {composed.others}
        {messages}
      </div>
    </FileContext>
  );
}
