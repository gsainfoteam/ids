'use client';

import { createContext, use } from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { popupStyle } from './styles';
import { IconButton } from '../../components/action/icon-button';
import { useRegisteredId } from '../surface';

type FieldPopupHeaderProps = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  autoFocus?: boolean;
};

export const FieldPopupTitleContext = createContext<((id: string | undefined) => void) | undefined>(
  undefined,
);

export function FieldPopupHeader({ title, closeLabel, onClose, autoFocus }: FieldPopupHeaderProps) {
  const styles = popupStyle();
  const titleId = useRegisteredId(use(FieldPopupTitleContext));

  return (
    <div data-field-popup-header="" className={styles.header()}>
      <h2 id={titleId} className={styles.title()}>
        {title}
      </h2>
      <IconButton
        variant="ghost"
        size="tiny"
        aria-label={closeLabel}
        data-popup-autofocus={autoFocus ? '' : undefined}
        icon={<XMarkIcon aria-hidden="true" />}
        onClick={onClose}
      />
    </div>
  );
}
