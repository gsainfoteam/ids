import { XMarkIcon } from '@heroicons/react/24/outline';

import { popupStyle } from './styles';
import { IconButton } from '../../components/action/icon-button';


type FieldPopupHeaderProps = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  autoFocus?: boolean;
};

// A drawer covers the field that opened it, so it names itself and offers a way out. A popover
// leaves the field in view, and there the header is not drawn.
export function FieldPopupHeader({ title, closeLabel, onClose, autoFocus }: FieldPopupHeaderProps) {
  const styles = popupStyle();
  return (
    <div data-field-popup-header="" className={styles.header()}>
      <span className={styles.title()}>{title}</span>
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
