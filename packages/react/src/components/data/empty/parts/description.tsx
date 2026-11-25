'use client';

import { type ComponentProps } from 'react';

import { useInternalParagraphRef } from '../../../../internal/hooks/use-paragraph-ref';
import { Slot } from '../../../utility/slot';
import { useInternalEmptyContext } from '../context';

export type EmptyDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function EmptyDescription({ asChild, className, ref, ...props }: EmptyDescriptionProps) {
  const { styles } = useInternalEmptyContext('Empty.Description');
  const paragraphRef = useInternalParagraphRef('Empty.Description', ref);
  const Root = asChild === true ? Slot : 'p';
  return (
    <Root
      {...props}
      ref={paragraphRef}
      data-empty-description=""
      className={styles.description({ className })}
    />
  );
}

EmptyDescription.displayName = 'Empty.Description';
