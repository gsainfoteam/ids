'use client';

import { type ComponentProps } from 'react';

import { omit, pick } from 'es-toolkit';

import { editorStyle } from './style';
import {
  INTERACTIVE_HANDLER_KEYS,
  interactiveDataProps,
  useInteractive,
} from '../../../hooks/use-interactive';

export type EditorGlyphButtonProps = Omit<ComponentProps<'button'>, 'type'>;

const styles = editorStyle();

export function EditorGlyphButton({ className, disabled, ...props }: EditorGlyphButtonProps) {
  const { state, handlers } = useInteractive<HTMLButtonElement>({
    disabled,
    ...pick(props, INTERACTIVE_HANDLER_KEYS),
  });

  return (
    <button
      type="button"
      {...omit(props, INTERACTIVE_HANDLER_KEYS)}
      {...handlers}
      {...interactiveDataProps(state)}
      disabled={disabled}
      className={styles.glyphButton({ className })}
    />
  );
}
