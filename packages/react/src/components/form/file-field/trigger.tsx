import { type ComponentProps } from 'react';

import { ArrowUpTrayIcon, PaperClipIcon } from '@heroicons/react/16/solid';

import { FileClear } from './clear';
import { useFile } from './context';
import { isType } from './is-type';
import { FileItem } from './item';
import { FileList } from './list';
import { FilePreview } from './preview';
import { FileValue } from './value';
import { messages } from '../../../internal/messages';
import { resolveState } from '../../../internal/state-props';
import { flattenFragments, invariant, mergeProps, part } from '../../../utils';

import type { FileFieldState } from '.';

export type FileTriggerProps = Omit<ComponentProps<'button'>, 'className'> & {
  asChild?: boolean;
  className?: string | ((state: FileFieldState) => string | undefined);
};

export function FileTrigger({ asChild, children, className, ...props }: FileTriggerProps) {
  const c = useFile('FileField.Trigger');
  invariant(
    !flattenFragments(children).some(
      (node) => isType(FileClear)(node) || isType(FileList)(node) || isType(FileItem)(node),
    ),
    'FileField: Clear/List/Item must be siblings of Trigger.',
  );

  const { files } = c.field.state;
  const content =
    c.state.appearance === 'dropzone' ? (
      <>
        <ArrowUpTrayIcon aria-hidden="true" className={c.styles.dropzoneIcon()} />
        <span className={c.styles.dropzoneTitle()}>
          {c.state.dragging ? messages.fileField.dropzoneActive : c.placeholder}
        </span>
        {c.limits && (
          <span id={c.limitsId} className={c.styles.dropzoneHint()}>
            {c.limits}
          </span>
        )}
      </>
    ) : (
      <>
        {!c.state.multiple && files[0] ? (
          <FilePreview file={files[0]} />
        ) : (
          <PaperClipIcon aria-hidden="true" className={c.styles.icon()} />
        )}
        <FileValue />
      </>
    );

  return part(
    'button',
    asChild,
    children ?? content,
    mergeProps(props, {
      ...c.triggerProps,
      className: c.styles.trigger({ className: resolveState(className, c.state) }),
    }),
  );
}

FileTrigger.displayName = 'FileField.Trigger';
