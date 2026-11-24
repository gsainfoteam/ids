'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { popupStyle } from './styles';
import { IconButton } from '../../components/action/icon-button';

type FieldPopupHeaderProps = {
  closeLabel: string;
  onClose: () => void;
  autoFocus?: boolean;
};

export function FieldPopupHeader({ closeLabel, onClose, autoFocus }: FieldPopupHeaderProps) {
  const styles = popupStyle();

  return (
    <div data-field-popup-header="" className={styles.header()}>
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
