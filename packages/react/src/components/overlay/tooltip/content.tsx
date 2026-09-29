'use client';

import { use, type ComponentProps } from 'react';

import { createPortal } from 'react-dom';

import { useTooltipContext } from './context';
import { PortalRootContext } from '../../../internal/overlay';
import { mergeRefs } from '../../../utils';
import { KbdGroupContext, type KbdGroupContextValue } from '../../typography/kbd/use-kbd';

export type TooltipContentProps = ComponentProps<'div'>;

const shortcutsSizedToTheBubble: KbdGroupContextValue = {
  size: 'tiny',
  platform: undefined,
  labels: undefined,
};

export function TooltipContent(props: TooltipContentProps) {
  const { tooltip } = useTooltipContext('Tooltip.Content');
  if (!tooltip.mounted) return null;
  return <TooltipPopup {...props} />;
}

TooltipContent.displayName = 'Tooltip.Content';

function TooltipPopup({ className, style, ref, children, ...props }: TooltipContentProps) {
  const { tooltip, styles } = useTooltipContext('Tooltip.Content');
  const portalRoot = use(PortalRootContext);

  const popup = (
    <div
      {...tooltip.floatingProps}
      {...props}
      ref={mergeRefs(ref, tooltip.setContent)}
      popover="manual"
      data-tooltip-content=""
      data-side={tooltip.side}
      data-align={tooltip.align}
      data-open={tooltip.open ? '' : undefined}
      data-instant={tooltip.instant ? '' : undefined}
      data-ending-style={tooltip.ending ? '' : undefined}
      className={styles.content({ className })}
      style={{ ...tooltip.floatingStyles, ...style }}
    >
      <KbdGroupContext value={shortcutsSizedToTheBubble}>{children}</KbdGroupContext>
    </div>
  );

  return portalRoot ? createPortal(popup, portalRoot) : popup;
}
