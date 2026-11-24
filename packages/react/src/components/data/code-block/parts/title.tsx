'use client';

import { type ComponentProps } from 'react';

import { useInternalCodeBlockContext } from '../context';

export type CodeBlockTitleProps = ComponentProps<'span'>;

export function CodeBlockTitle({ className, ...props }: CodeBlockTitleProps) {
  const { styles } = useInternalCodeBlockContext('CodeBlock.Title');

  return <span {...props} className={styles.title({ className })} />;
}

CodeBlockTitle.displayName = 'CodeBlock.Title';
