'use client';

import { useInternalParagraphRef } from '../../../../internal/lib/paragraph';
import { Slot } from '../../../utility/slot';
import { useInternalAlertContext } from '../context';
import { resolve, type PartProps } from '../lib/part-props';

export type AlertDescriptionProps = PartProps<'p'>;

export function AlertDescription({ asChild, className, ref, ...props }: AlertDescriptionProps) {
  const { state, styles } = useInternalAlertContext('Alert.Description');
  const paragraphRef = useInternalParagraphRef('Alert.Description', ref);
  const Root = asChild ? Slot : 'p';
  return (
    <Root
      {...props}
      ref={paragraphRef}
      data-alert-description=""
      className={styles.description({ className: resolve(className, state) })}
    />
  );
}

AlertDescription.displayName = 'Alert.Description';
