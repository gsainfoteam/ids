'use client';

import {
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { PromptInputContext } from './context';
import { useInternalPromptInput } from './hooks/use-prompt-input';
import { NO_FILES, NO_TOOLS } from './lib/empty-defaults';
import { PromptInputAttachments } from './parts/attachments';
import { PromptInputInput, type PromptInputInputProps } from './parts/input';
import { PromptInputSubmit } from './parts/submit';
import { promptInputStyle } from './style';
import { useInternalTranslate } from '../../../internal/translate';
import {
  elementTypeOf,
  flattenFragments,
  invariant,
  mergeEventHandlers,
  mergeProps,
  mergeRefs,
} from '../../../utils';
import { useFieldSize } from '../field/context';
import { FileContext } from '../file-field/context';
import { FileMessages } from '../file-field/parts/messages';
import { FilePicker } from '../file-field/parts/picker';
import { TextArea } from '../text-area';
import { TextAreaInput } from '../text-area/parts/input';

import type { IdsSize } from '../../../tokens/types';
import type { FileFieldRejection } from '../file-field/lib/file-rules';

export type PromptInputStatus = 'idle' | 'submitting' | 'streaming';
export type PromptInputVariant = 'outline' | 'soft';
export type PromptInputMessage = { text: string; files: File[]; tools: string[] };

export type PromptInputProps = Omit<
  ComponentProps<'form'>,
  'children' | 'defaultValue' | 'onChange'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  tools?: string[];
  defaultTools?: string[];
  onToolsChange?: (tools: string[]) => void;
  onSend?: (message: PromptInputMessage) => void;
  onStop?: () => void;
  status?: PromptInputStatus;
  accept?: string;
  maxSize?: number;
  maxCount?: number;
  onReject?: (rejections: FileFieldRejection[]) => void;
  disabled?: boolean;
  variant?: PromptInputVariant;
  size?: IdsSize;
  children?: ReactNode;
};

const ROOM_FOR_TWO_LINES = 2;
const LINES_BEFORE_SCROLLING = 6;

const isPart =
  (part: unknown) =>
  (node: ReactNode): node is ReactElement =>
    isValidElement(node) && elementTypeOf(node) === part;

function splitByInput(children: ReactNode) {
  const items = flattenFragments(children);
  const inputs = items.filter(isPart(PromptInputInput));
  invariant(inputs.length <= 1, '`<PromptInput>` accepts at most one `<PromptInput.Input />`.');

  const input = inputs[0] as ReactElement<PromptInputInputProps> | undefined;
  const index = input ? items.indexOf(input) : -1;
  const top = items.slice(0, Math.max(index, 0));
  const bottom = items.slice(index + 1);

  if (!items.some(isPart(PromptInputAttachments)))
    top.unshift(<PromptInputAttachments key="attachments" />);
  if (!items.some(isPart(PromptInputSubmit))) bottom.push(<PromptInputSubmit key="submit" />);

  return { top, input: input?.props ?? {}, bottom };
}

export function PromptInputRoot({
  value,
  defaultValue = '',
  onValueChange,
  files: filesProp,
  defaultFiles = NO_FILES,
  onFilesChange,
  tools: toolsProp,
  defaultTools = NO_TOOLS,
  onToolsChange,
  onSend,
  onStop,
  status = 'idle',
  accept,
  maxSize,
  maxCount,
  onReject,
  disabled = false,
  variant = 'outline',
  size: sizeProp,
  className,
  children,
  onSubmit,
  ref,
  ...formProps
}: PromptInputProps) {
  const t = useInternalTranslate();
  const size = useFieldSize(sizeProp) ?? 'standard';
  const {
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
  } = useInternalPromptInput({
    value,
    defaultValue,
    onValueChange,
    files: filesProp,
    defaultFiles,
    onFilesChange,
    tools: toolsProp,
    defaultTools,
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
  });
  const styles = promptInputStyle({ size });

  const { top, input, bottom } = splitByInput(children);
  const {
    minRows,
    maxRows = LINES_BEFORE_SCROLLING,
    rows = ROOM_FOR_TWO_LINES,
    onKeyDown,
    ...inputProps
  } = input;

  return (
    <PromptInputContext
      value={{
        status,
        busy,
        canSend,
        stop: onStop,
        tools,
        toggleTool,
        disabled,
        size,
        styles,
      }}
    >
      <FileContext value={attachments.context}>
        <form
          {...mergeProps(formProps, attachments.rootProps)}
          ref={mergeRefs(formRef, attachments.rootProps.ref, ref)}
          data-prompt-input=""
          data-status={status}
          data-disabled={disabled ? '' : undefined}
          className={styles.root({ className })}
          onSubmit={send}
        >
          <FilePicker {...attachments.picker} />
          <TextArea
            variant={variant}
            size={size}
            disabled={disabled}
            value={text}
            onValueChange={setText}
            onKeyDown={mergeEventHandlers(onKeyDown, sendOrStop)}
            rows={rows}
            minRows={minRows}
            maxRows={maxRows}
            className={styles.textArea()}
          >
            {top}
            <TextAreaInput
              key="input"
              aria-label={
                inputProps['aria-labelledby'] === undefined ? t('promptInput.label') : undefined
              }
              placeholder={t('promptInput.placeholder')}
              enterKeyHint="send"
              {...inputProps}
            />
            {bottom}
          </TextArea>
          <FileMessages {...attachments.messages} />
        </form>
      </FileContext>
    </PromptInputContext>
  );
}
