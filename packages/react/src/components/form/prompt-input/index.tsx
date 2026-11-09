import { PromptInputAttach, type PromptInputAttachProps } from './attach';
import { PromptInputAttachments, type PromptInputAttachmentsProps } from './attachments';
import { PromptInputInput, type PromptInputInputProps } from './input';
import {
  PromptInputRoot,
  type PromptInputMessage,
  type PromptInputProps,
  type PromptInputStatus,
  type PromptInputVariant,
} from './root';
import { promptInputStyle } from './style';
import { PromptInputSubmit, type PromptInputSubmitProps } from './submit';

export function PromptInput(props: PromptInput.Props) {
  return <PromptInputRoot {...props} />;
}

export namespace PromptInput {
  export type Props = PromptInputProps;
  export type Status = PromptInputStatus;
  export type Variant = PromptInputVariant;
  export type Message = PromptInputMessage;

  export type InputProps = PromptInputInputProps;
  export type AttachmentsProps = PromptInputAttachmentsProps;
  export type AttachProps = PromptInputAttachProps;
  export type SubmitProps = PromptInputSubmitProps;

  export const Input = PromptInputInput;
  export const Attachments = PromptInputAttachments;
  export const Attach = PromptInputAttach;
  export const Submit = PromptInputSubmit;

  export const Style = promptInputStyle;
}

export type {
  PromptInputMessage,
  PromptInputProps,
  PromptInputStatus,
  PromptInputVariant,
} from './root';
