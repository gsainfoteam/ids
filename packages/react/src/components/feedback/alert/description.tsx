'use client';

import { useAlertContext } from './context';
import { resolve, type PartProps } from './part-props';
import { useParagraphRef } from '../../../internal/paragraph';
import { Slot } from '../../utility/slot';

export type AlertDescriptionProps = PartProps<'p'>;

export function AlertDescription({ asChild, className, ref, ...props }: AlertDescriptionProps) {
  const { state, styles } = useAlertContext('Alert.Description');
  const paragraphRef = useParagraphRef('Alert.Description', ref);
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
