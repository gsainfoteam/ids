'use client';

import { type ComponentProps } from 'react';

import { useCodeBlockContext } from './context';

export type CodeBlockTitleProps = ComponentProps<'span'>;

export function CodeBlockTitle({ className, ...props }: CodeBlockTitleProps) {
  const { styles } = useCodeBlockContext('CodeBlock.Title');

  return <span {...props} className={styles.title({ className })} />;
}

CodeBlockTitle.displayName = 'CodeBlock.Title';
