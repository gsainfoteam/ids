'use client';

import { ArrowUpTrayIcon } from '@heroicons/react/16/solid';

import { fileDropzoneStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { useInternalTranslate } from '../../../internal/translate';
import { flattenFragments, invariant } from '../../../utils';
import { FileContext } from '../file-field/context';
import { useInternalFileFieldRoot } from '../file-field/hooks/use-file-field-root';
import { isType } from '../file-field/lib/is-type';
import { FileClear } from '../file-field/parts/clear';
import { FileList } from '../file-field/parts/list';
import { FileTrigger } from '../file-field/parts/trigger';

import type { FileFieldProps, FileFieldState, FileFieldVariant } from '../file-field/root';

export type FileDropzoneVariant = FileFieldVariant;
export type FileDropzoneState = FileFieldState;
export type FileDropzoneProps = FileFieldProps;

export function FileDropzoneRoot(props: FileDropzoneProps) {
  const t = useInternalTranslate();

  const { variant = 'outline', children, className, style } = props;
  const { context, rootProps, picker, messages } = useInternalFileFieldRoot(props, 'dropzone');
  const { state, limits, limitsId, placeholder } = context;
  const styles = fileDropzoneStyle({ variant, size: context.size });

  const nodes = flattenFragments(children);
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
      <span className={styles.title()}>
        {state.dragging ? t('fileField.dropzoneActive') : placeholder}
      </span>
      {limits && (
        <span id={limitsId} className={styles.hint()}>
          {limits}
        </span>
      )}
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
