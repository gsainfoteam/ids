import { type ReactNode } from 'react';

import { DialogClose, type DialogCloseProps } from './close';
import { DialogContent, type DialogContentProps } from './content';
import { DialogDescription, type DialogDescriptionProps } from './description';
import { DialogFooter, type DialogFooterProps } from './footer';
import { DialogHeader, type DialogHeaderProps } from './header';
import { DialogOverlay, type DialogOverlayProps } from './overlay';
import { DialogRoot } from './root';
import { dialogStyle } from './style';
import { DialogTitle, type DialogTitleProps } from './title';
import { DialogTrigger, type DialogTriggerProps } from './trigger';

export function Dialog(props: Dialog.Props) {
  return <DialogRoot {...props} />;
}

export namespace Dialog {
  export type Role = 'dialog' | 'alertdialog';

  export type Props = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpenChangeComplete?: (open: boolean) => void;
    dismissible?: boolean;
    role?: Role;
    hideClose?: boolean;
    children?: ReactNode;
  };

  export const Trigger = DialogTrigger;
  export namespace Trigger {
    export type Props = DialogTriggerProps;
  }

  export const Overlay = DialogOverlay;
  export namespace Overlay {
    export type Props = DialogOverlayProps;
  }

  export const Content = DialogContent;
  export namespace Content {
    export type Props = DialogContentProps;
  }

  export const Header = DialogHeader;
  export namespace Header {
    export type Props = DialogHeaderProps;
  }

  export const Title = DialogTitle;
  export namespace Title {
    export type Props = DialogTitleProps;
  }

  export const Description = DialogDescription;
  export namespace Description {
    export type Props = DialogDescriptionProps;
  }

  export const Footer = DialogFooter;
  export namespace Footer {
    export type Props = DialogFooterProps;
  }

  export const Close = DialogClose;
  export namespace Close {
    export type Props = DialogCloseProps;
  }

  export const Style = dialogStyle;
}
