'use client';

import { ArrowUpTrayIcon } from '@heroicons/react/16/solid';

import { FileDropzoneTitle } from './parts/title';
import { fileDropzoneStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { invariant } from '../../../utils';
import { FileContext } from '../file-field/context';
import { useInternalFileFieldRoot } from '../file-field/hooks/use-file-field-root';
import { isType } from '../file-field/lib/is-type';
import { FileClear } from '../file-field/parts/clear';
import { FileList } from '../file-field/parts/list';
import { FileMessages } from '../file-field/parts/messages';
import { FilePicker } from '../file-field/parts/picker';
import { FileTrigger } from '../file-field/parts/trigger';

import type {
  FileFieldBaseProps,
  FileFieldState,
  FileFieldValueProps,
  FileFieldVariant,
} from '../file-field/root';

export type FileDropzoneVariant = FileFieldVariant;
export type FileDropzoneState = FileFieldState;
export type FileDropzoneProps = FileFieldBaseProps & FileFieldValueProps;

export function FileDropzoneRoot(props: FileDropzoneProps) {
  const { variant = 'outline', className, style } = props;
  const { context, rootProps, picker, messages, structure, limitsParts } = useInternalFileFieldRoot(
    props,
    'dropzone',
  );
  const { state } = context;
  const styles = fileDropzoneStyle({ variant, size: context.size });

  const titleParts = structure.filter(isType(FileDropzoneTitle));
  const nodes = structure.filter((node) => !titleParts.includes(node));
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
      {titleParts}
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
        <FilePicker {...picker} />
        {composed}
        <FileMessages {...messages} />
      </div>
    </FileContext>
  );
}
