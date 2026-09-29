import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/16/solid';

import { usePicker } from './context';
import { useClipboardSupport } from './use-color-picker';
import { messages } from '../../../internal/messages';
import { mergeEventHandlers } from '../../../utils';
import { IconButton } from '../../action/icon-button';

import type { ColorPicker } from '.';

export function ColorPickerCopy({
  className,
  children,
  onClick,
  ...props
}: ColorPicker.ButtonProps) {
  const c = usePicker('ColorPicker.Copy');
  const supported = useClipboardSupport();
  if (!supported) return null;
  const { copied, parsed } = c.picker.state;
  return (
    <>
      <IconButton
        {...props}
        aria-label={
          props['aria-label'] ?? (copied ? messages.colorPicker.copied : messages.colorPicker.copy)
        }
        disabled={c.state.disabled || !parsed}
        data-color-picker-copy=""
        data-copied={copied ? '' : undefined}
        variant="outline"
        size={c.size}
        icon={
          children ??
          (copied ? <CheckIcon aria-hidden="true" /> : <ClipboardDocumentIcon aria-hidden="true" />)
        }
        className={c.styles.tool({ className })}
        onClick={mergeEventHandlers(onClick, c.picker.actions.copy)}
      />
      <span role="status" className={c.styles.channel()}>
        {copied ? messages.colorPicker.copied : ''}
      </span>
    </>
  );
}

ColorPickerCopy.displayName = 'ColorPicker.Copy';
