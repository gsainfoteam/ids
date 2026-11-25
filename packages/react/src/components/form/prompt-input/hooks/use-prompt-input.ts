'use client';

import { useRef, type SubmitEvent } from 'react';

import { useControllableState } from '../../../../hooks/use-controllable-state';
import { useInternalFormReset } from '../../../../hooks/use-form-reset';
import { keyHandler } from '../../../../internal/lib/keys';
import { useInternalFileFieldRoot } from '../../file-field/hooks/use-file-field-root';
import { NO_FILES, NO_TOOLS } from '../lib/empty-defaults';

import type { IdsSize } from '../../../../tokens/types';
import type { PromptInputProps } from '../root';

type PromptInputOptions = Pick<
  PromptInputProps,
  | 'value'
  | 'onValueChange'
  | 'files'
  | 'onFilesChange'
  | 'tools'
  | 'onToolsChange'
  | 'onSend'
  | 'onStop'
  | 'onSubmit'
  | 'accept'
  | 'maxSize'
  | 'maxCount'
  | 'onReject'
> & {
  defaultValue: string;
  defaultFiles: File[] | undefined;
  defaultTools: string[] | undefined;
  status: NonNullable<PromptInputProps['status']>;
  disabled: boolean;
  size: IdsSize;
};

export function useInternalPromptInput({
  value,
  defaultValue,
  onValueChange,
  files: filesProp,
  defaultFiles = NO_FILES,
  onFilesChange,
  tools: toolsProp,
  defaultTools = NO_TOOLS,
  onToolsChange,
  onSend,
  onStop,
  onSubmit,
  status,
  accept,
  maxSize,
  maxCount,
  onReject,
  disabled,
  size,
}: PromptInputOptions) {
  const formRef = useRef<HTMLFormElement>(null);

  const [text, setText] = useControllableState({ value, defaultValue, onValueChange });
  const [files, setFiles] = useControllableState({
    value: filesProp,
    defaultValue: defaultFiles,
    onValueChange: onFilesChange,
  });
  const [tools, setTools] = useControllableState({
    value: toolsProp,
    defaultValue: defaultTools,
    onValueChange: onToolsChange,
  });
  const toggleTool = (tool: string) =>
    setTools(tools.includes(tool) ? tools.filter((on) => on !== tool) : [...tools, tool]);

  const attachments = useInternalFileFieldRoot(
    {
      multiple: true,
      value: files,
      onValueChange: setFiles,
      accept,
      maxSize,
      maxCount,
      onReject,
      disabled,
      size,
    },
    'embedded',
  );

  const busy = status !== 'idle';
  const canSend = !disabled && !busy && (text.trim() !== '' || files.length > 0);

  useInternalFormReset(formRef, () => {
    setText(defaultValue, { silent: true });
    setFiles(defaultFiles, { silent: true });
    setTools(defaultTools, { silent: true });
  });

  const send = (event: SubmitEvent<HTMLFormElement>) => {
    onSubmit?.(event);
    if (event.defaultPrevented) return;
    if (!canSend) {
      event.preventDefault();
      return;
    }
    if (!onSend) return;
    event.preventDefault();
    onSend({ text, files, tools });
    setText('');
    setFiles(NO_FILES);
  };

  const sendOrStop = keyHandler<HTMLTextAreaElement>({
    Enter: (event) => event.currentTarget.form?.requestSubmit(),
    Escape: () => {
      if (!busy || !onStop) return false;
      onStop();
    },
  });

  return {
    formRef,
    text,
    setText,
    tools,
    toggleTool,
    attachments,
    busy,
    canSend,
    send,
    sendOrStop,
  };
}
