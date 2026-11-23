'use client';

import { Divider } from '../../../layout/divider';
import { useInternalEditorContext } from '../context';

export type EditorSeparatorProps = { className?: string };

export function EditorSeparator({ className }: EditorSeparatorProps) {
  const { styles } = useInternalEditorContext('Editor.Separator');
  return <Divider orientation="vertical" className={styles.separator({ className })} />;
}

EditorSeparator.displayName = 'Editor.Separator';
