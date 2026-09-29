'use client';

import type { CSSProperties, MouseEvent } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { toasterStyle } from './style';
import { dismissToast, type ToastRecord } from './toast-store';
import { useToast, type SwipeDirections } from './use-toast';
import { messages } from '../../../internal/messages';
import { announcedAssertively, statusIcons } from '../../../internal/status-palette';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Spinner } from '../spinner';

import type { Toaster } from '.';
import type { ToastPosition } from './use-toaster';

function swipeDirectionsOf(placement: Toaster.Placement): SwipeDirections {
  const [side, align] = placement.split('-');

  return {
    y: side === 'top' ? -1 : 1,
    x: align === 'left' ? -1 : align === 'right' ? 1 : 0,
  };
}

function toastIcon(record: ToastRecord) {
  if (record.icon !== undefined) return record.icon;
  if (record.loading) return <Spinner decorative />;
  if (record.colorScheme === 'neutral') return null;
  const Glyph = statusIcons[record.colorScheme];
  return <Glyph />;
}

export type ToastViewProps = {
  record: ToastRecord;
  position: ToastPosition | undefined;
  placement: Toaster.Placement;
  expanded: boolean;
  paused: boolean;
  register: (id: ToastRecord['id'], node: HTMLElement | null) => void;
  releaseFocus: (options: { stayInRegion: boolean }) => void;
};

export function ToastView({
  record,
  position,
  placement,
  expanded,
  paused,
  register,
  releaseFocus,
}: ToastViewProps) {
  const { ref, place, mounted, ending, swiping, swipedOut, swipeHandlers } = useToast({
    record,
    position,
    paused,
    directions: swipeDirectionsOf(placement),
    register,
    releaseFocus,
  });

  if (!mounted) return null;

  const styles = toasterStyle({ placement, colorScheme: record.colorScheme });
  const icon = toastIcon(record);
  const { action } = record;

  const onAction = (event: MouseEvent<HTMLButtonElement>) => {
    action?.onClick(event);
    if (!event.defaultPrevented) dismissToast(record.id, 'user');
  };

  return (
    <div
      ref={ref}
      role={announcedAssertively.has(record.colorScheme) ? 'alert' : 'status'}
      aria-atomic="true"
      aria-busy={record.loading || undefined}
      inert={!place.visible || undefined}
      {...swipeHandlers}
      data-toast=""
      data-color-scheme={record.colorScheme}
      data-front={place.front ? '' : undefined}
      data-expanded={expanded ? '' : undefined}
      data-visible={place.visible ? '' : undefined}
      data-loading={record.loading ? '' : undefined}
      data-swiping={swiping ? '' : undefined}
      data-swipe-out={swipedOut ?? undefined}
      data-ending-style={ending ? '' : undefined}
      className={styles.toast({ className: record.className })}
      style={
        {
          '--toasts-before': place.index,
          '--offset': `${place.offset}px`,
          '--initial-height': place.height === undefined ? undefined : `${place.height}px`,
          '--toast-z': place.stackOrder,
          ...record.style,
        } as CSSProperties
      }
    >
      <div className={styles.body()}>
        {icon != null && (
          <span aria-hidden="true" data-toast-icon="" className={styles.icon()}>
            {icon}
          </span>
        )}
        <div className={styles.content()}>
          <div data-toast-title="" className={styles.title()}>
            {record.message}
          </div>
          {record.description != null && (
            <div data-toast-description="" className={styles.description()}>
              {record.description}
            </div>
          )}
        </div>
        {action && (
          <Button
            size="tiny"
            colorScheme="neutral"
            onClick={onAction}
            data-toast-action=""
            className={styles.action()}
          >
            {action.label}
          </Button>
        )}
        <IconButton
          aria-label={messages.toast.close}
          variant="ghost"
          colorScheme="neutral"
          icon={<XMarkIcon />}
          onClick={() => dismissToast(record.id, 'user')}
          data-toast-close=""
          className={styles.close()}
        />
      </div>
    </div>
  );
}
