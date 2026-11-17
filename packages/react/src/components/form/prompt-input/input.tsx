'use client';

import type { TextAreaInputPartProps } from '../text-area/input';

export type PromptInputInputProps = TextAreaInputPartProps & {
  minRows?: number;
  maxRows?: number;
};

export function PromptInputInput(_props: PromptInputInputProps): null {
  return null;
}

PromptInputInput.displayName = 'PromptInput.Input';
