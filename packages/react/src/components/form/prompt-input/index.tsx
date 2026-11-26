import { PromptInputActionMenu, type PromptInputActionMenuProps } from './parts/action-menu';
import {
  PromptInputAddAttachments,
  type PromptInputAddAttachmentsProps,
} from './parts/add-attachments';
import { PromptInputAttach, type PromptInputAttachProps } from './parts/attach';
import { PromptInputAttachments, type PromptInputAttachmentsProps } from './parts/attachments';
import { PromptInputInput, type PromptInputInputProps } from './parts/input';
import { PromptInputSubmit, type PromptInputSubmitProps } from './parts/submit';
import { PromptInputTool, type PromptInputToolProps } from './parts/tool';
import {
  PromptInputRoot,
  type PromptInputMessage,
  type PromptInputProps,
  type PromptInputStatus,
  type PromptInputVariant,
} from './root';
import { promptInputStyle } from './style';

import type {
  PromptInputAttachmentsOptions,
  PromptInputInstance,
  PromptInputOptions,
  PromptInputToolsOptions,
} from './hooks/use-prompt-input';

export function PromptInput(props: PromptInput.Props) {
  return <PromptInputRoot {...props} />;
}

export namespace PromptInput {
  export type Props = PromptInputProps;
  export type Status = PromptInputStatus;
  export type Variant = PromptInputVariant;
  export type Message = PromptInputMessage;
  export type Options = PromptInputOptions;
  export type Instance = PromptInputInstance;
  export type AttachmentsOptions = PromptInputAttachmentsOptions;
  export type ToolsOptions = PromptInputToolsOptions;

  export type InputProps = PromptInputInputProps;
  export type AttachmentsProps = PromptInputAttachmentsProps;
  export type AttachProps = PromptInputAttachProps;
  export type SubmitProps = PromptInputSubmitProps;
  export type ToolProps = PromptInputToolProps;
  export type ActionMenuProps = PromptInputActionMenuProps;
  export type AddAttachmentsProps = PromptInputAddAttachmentsProps;

  export const Input = PromptInputInput;
  export const Attachments = PromptInputAttachments;
  export const Attach = PromptInputAttach;
  export const Submit = PromptInputSubmit;
  export const Tool = PromptInputTool;
  export const ActionMenu = PromptInputActionMenu;
  export const AddAttachments = PromptInputAddAttachments;

  export const Style = promptInputStyle;
}

export { usePromptInput } from './hooks/use-prompt-input';

export type {
  PromptInputAttachmentsOptions,
  PromptInputInstance,
  PromptInputOptions,
  PromptInputToolsOptions,
} from './hooks/use-prompt-input';
export type {
  PromptInputMessage,
  PromptInputProps,
  PromptInputStatus,
  PromptInputVariant,
} from './root';
