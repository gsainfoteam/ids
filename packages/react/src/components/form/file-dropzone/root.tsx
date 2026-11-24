'use client';

import { ArrowUpTrayIcon } from '@heroicons/react/16/solid';

import { fileDropzoneStyle } from './style';
import { resolveState } from '../../../internal/state-props';
import { invariant } from '../../../utils';
import { FileClear } from '../file-field/clear';
import { FileContext } from '../file-field/context';
import { isType } from '../file-field/is-type';
import { FileList } from '../file-field/list';
import { FileTrigger } from '../file-field/trigger';
import { useFileFieldRoot } from '../file-field/use-file-field-root';

import type { FileFieldProps, FileFieldState, FileFieldVariant } from '../file-field/root';

export type FileDropzoneVariant = FileFieldVariant;
export type FileDropzoneState = FileFieldState;
export type FileDropzoneProps = FileFieldProps;

export function FileDropzoneRoot(props: FileDropzoneProps) {
  const { variant = 'outline', className, style } = props;
  const {
    context,
    rootProps,
    picker,
    messages,
    structure: nodes,
    limitsParts,
  } = useFileFieldRoot(props, 'dropzone');
  const { state, placeholder } = context;
  const styles = fileDropzoneStyle({ variant, size: context.size });

  invariant(
    !nodes.length || nodes.filter(isType(FileTrigger)).length === 1,
    'FileDropzone: explicit children require exactly one Trigger.',
  );
  const controls = nodes.filter((node) => isType(FileTrigger)(node) || isType(FileClear)(node));
  const others = nodes.filter((node) => !controls.includes(node));
  const composed = nodes.length
    ? [...controls, ...others]
    : [<FileTrigger key="trigger" />, <FileList key="list" />];

  const triggerContent = (
    <>
      <ArrowUpTrayIcon aria-hidden="true" className={styles.dropIcon()} />
      {placeholder && <span className={styles.title()}>{placeholder}</span>}
      {limitsParts}
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
        {composed}
        {messages}
      </div>
    </FileContext>
  );
}
