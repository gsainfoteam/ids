'use client';

import {
  isValidElement,
  useRef,
  type ComponentProps,
  type SubmitEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { PromptInputAttachments } from './attachments';
import { PromptInputContext } from './context';
import { PromptInputInput, type PromptInputInputProps } from './input';
import { promptInputStyle } from './style';
import { PromptInputSubmit } from './submit';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { keyHandler } from '../../../internal/keys';
import { useTranslate } from '../../../internal/translate';
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
import { useFileFieldRoot } from '../file-field/use-file-field-root';
import { TextArea } from '../text-area';
import { TextAreaInput } from '../text-area/input';

import type { IdsSize } from '../../../tokens/types';
import type { FileFieldRejection } from '../file-field/file-rules';

export type PromptInputStatus = 'idle' | 'submitting' | 'streaming';
export type PromptInputVariant = 'outline' | 'soft';
export type PromptInputMessage = { text: string; files: File[] };

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

const NO_FILES: File[] = [];
const ONE_LINE = 1;
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
  const t = useTranslate();
  const size = useFieldSize(sizeProp) ?? 'standard';
  const formRef = useRef<HTMLFormElement>(null);

  const [text, setText] = useControllableState({ value, defaultValue, onValueChange });
  const [files, setFiles] = useControllableState({
    value: filesProp,
    defaultValue: defaultFiles,
    onValueChange: onFilesChange,
  });
  const attachments = useFileFieldRoot(
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
  const styles = promptInputStyle();

  useFormReset(formRef, () => {
    setText(defaultValue, { silent: true });
    setFiles(defaultFiles, { silent: true });
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
    onSend({ text, files });
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

  const { top, input, bottom } = splitByInput(children);
  const {
    minRows,
    maxRows = LINES_BEFORE_SCROLLING,
    rows = ONE_LINE,
    onKeyDown,
    ...inputProps
  } = input;

  return (
    <PromptInputContext value={{ status, busy, canSend, stop: onStop, disabled, size, styles }}>
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
          {attachments.picker}
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
          {attachments.messages}
        </form>
      </FileContext>
    </PromptInputContext>
  );
}
