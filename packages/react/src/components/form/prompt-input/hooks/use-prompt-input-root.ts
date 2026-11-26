'use client';

import { useRef, type SubmitEvent } from 'react';

import { useControllableState } from '../../../../hooks/use-controllable-state';
import { useInternalFormReset } from '../../../../hooks/use-form-reset';
import { keyHandler } from '../../../../internal/lib/keys';
import { useInternalFileFieldRoot } from '../../file-field/hooks/use-file-field-root';
import { NO_FILES, NO_TOOLS } from '../lib/empty-defaults';

import type { PromptInputInstance } from './use-prompt-input';
import type { IdsSize } from '../../../../tokens/types';
import type { PromptInputProps } from '../root';

type PromptInputRootOptions = Pick<
  PromptInputProps,
  'value' | 'onValueChange' | 'onSend' | 'onStop' | 'onSubmit'
> & {
  defaultValue: string;
  promptInput: PromptInputInstance;
  status: NonNullable<PromptInputProps['status']>;
  disabled: boolean;
  size: IdsSize;
};

export function useInternalPromptInputRoot({
  value,
  defaultValue,
  onValueChange,
  onSend,
  onStop,
  onSubmit,
  promptInput,
  status,
  disabled,
  size,
}: PromptInputRootOptions) {
  const {
    value: filesProp,
    defaultValue: defaultFiles = NO_FILES,
    onValueChange: onFilesChange,
    accept,
    ...limits
  } = promptInput.attachments;
  const {
    value: toolsProp,
    defaultValue: defaultTools = NO_TOOLS,
    onValueChange: onToolsChange,
  } = promptInput.tools;

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
      fileField: { limits },
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
