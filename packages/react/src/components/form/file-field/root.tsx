'use client';

import {
  type ComponentProps,
  type CSSProperties,
  type DragEventHandler,
  type ReactNode,
} from 'react';

import { FileClear } from './clear';
import { FileContext } from './context';
import { type FileFieldRejection } from './file-rules';
import { isType } from './is-type';
import { FileList } from './list';
import { FileTrigger } from './trigger';
import { useFileFieldRoot } from './use-file-field-root';
import { resolveState } from '../../../internal/state-props';
import { flattenFragments, invariant } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type FileFieldAppearance = 'field' | 'dropzone';
export type FileFieldVariant = 'outline' | 'soft' | 'ghost';

export type FileFieldState = {
  appearance: FileFieldAppearance;
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
    appearance?: FileFieldAppearance;
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
  const { appearance = 'field', multiple = false, children, className, style } = props;
  const { context, rootProps, picker, messages } = useFileFieldRoot(props, 'standalone');
  const { state, styles } = context;

  const nodes = flattenFragments(children);
  const triggers = nodes.filter(isType(FileTrigger));
  invariant(
    !nodes.length || triggers.length === 1,
    'FileField: explicit children require exactly one Trigger.',
  );
  const controls = nodes.filter((node) => isType(FileTrigger)(node) || isType(FileClear)(node));
  const others = nodes.filter((node) => !controls.includes(node));
  const composed = nodes.length
    ? { controls, others }
    : appearance === 'dropzone'
      ? { controls: [<FileTrigger key="trigger" />], others: [<FileList key="list" />] }
      : {
          controls: [<FileTrigger key="trigger" />, <FileClear key="clear" />],
          others: multiple ? [<FileList key="list" />] : [],
        };

  return (
    <FileContext value={context}>
      <div
        {...rootProps}
        className={styles.root({ className: resolveState(className, state) })}
        style={style}
      >
        {picker}
        {appearance === 'field' ? (
          <div
            data-file-field-control=""
            data-invalid={state.invalid ? '' : undefined}
            data-disabled={state.disabled ? '' : undefined}
            className={styles.control()}
          >
            {composed.controls}
          </div>
        ) : (
          composed.controls
        )}
        {composed.others}
        {messages}
      </div>
    </FileContext>
  );
}
