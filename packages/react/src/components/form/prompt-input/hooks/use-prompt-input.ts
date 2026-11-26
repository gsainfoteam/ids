'use client';

import { checkedLimits, type FileFieldLimitsOptions } from '../../file-field/lib/file-limits';

type ValueOptions<T> = {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
};

export type PromptInputAttachmentsOptions = ValueOptions<File[]> &
  FileFieldLimitsOptions & {
    accept?: string;
  };

export type PromptInputToolsOptions = ValueOptions<string[]>;

export type PromptInputOptions = {
  attachments?: PromptInputAttachmentsOptions;
  tools?: PromptInputToolsOptions;
};

export type PromptInputInstance = {
  attachments: PromptInputAttachmentsOptions;
  tools: PromptInputToolsOptions;
};

const NO_OPTIONS = {};

export function usePromptInput({
  attachments = NO_OPTIONS,
  tools = NO_OPTIONS,
}: PromptInputOptions = {}): PromptInputInstance {
  return { attachments: checkedLimits('usePromptInput', attachments), tools };
}
