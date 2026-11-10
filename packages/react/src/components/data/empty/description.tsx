'use client';

import { type ComponentProps } from 'react';

import { useEmptyContext } from './context';
import { useParagraphRef } from '../../../internal/paragraph';
import { Slot } from '../../utility/slot';

export type EmptyDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function EmptyDescription({ asChild, className, ref, ...props }: EmptyDescriptionProps) {
  const { styles } = useEmptyContext('Empty.Description');
  const paragraphRef = useParagraphRef('Empty.Description', ref);
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
