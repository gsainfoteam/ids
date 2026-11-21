'use client';

import { useEditorContext } from './context';
import { Divider } from '../../layout/divider';

export type EditorSeparatorProps = { className?: string };

export function EditorSeparator({ className }: EditorSeparatorProps) {
  const { styles } = useEditorContext('Editor.Separator');
  return <Divider orientation="vertical" className={styles.separator({ className })} />;
}

EditorSeparator.displayName = 'Editor.Separator';
