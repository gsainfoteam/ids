import type { CSSProperties, MouseEvent } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';
import { parseHotkey, useHotkey, type Hotkey } from '@tanstack/react-hotkeys';

import { dismissToast, type ToastRecord } from './toast-store';
import { useToast, type SwipeDirections } from './use-toast';
import { useToaster, type ToastPosition } from './use-toaster';
import { messages } from '../../../internal/messages';
import {
  announcedAssertively,
  statusIcons,
  type StatusColorScheme,
} from '../../../internal/status-palette';
import { tv } from '../../../utils';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { usePlatform } from '../../typography/kbd/use-kbd';
import { Spinner } from '../spinner';

import type { KbdPlatform } from '../../typography/kbd/keys';

export {
  toast,
  type ToastAction,
  type ToastId,
  type ToastOptions,
  type ToastPromiseMessages,
  type ToastRecord,
} from './toast-store';

const REGION_KEY = 'F6';
const DEFAULT_HOTKEY: Hotkey = 'Alt+T';
const ONCE_PER_PRESS_EVEN_IN_INPUTS = {
  requireReset: true,
  ignoreInputs: false,
  stopPropagation: false,
} as const;

function ariaShortcutOf(hotkey: Hotkey, platform: KbdPlatform) {
  const parsed = parseHotkey(hotkey, platform);
  return [...parsed.modifiers, parsed.key ?? parsed.code].join('+');
}

type ToasterShortcutsProps = { hotkey: Hotkey; enabled: boolean; onPress: () => void };

function ToasterShortcuts({ hotkey, enabled, onPress }: ToasterShortcutsProps) {
  const options = { ...ONCE_PER_PRESS_EVEN_IN_INPUTS, enabled };

  useHotkey(REGION_KEY, onPress, options);
  useHotkey(hotkey, onPress, options);

  return null;
}

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

type ToastViewProps = {
  record: ToastRecord;
  position: ToastPosition | undefined;
  placement: Toaster.Placement;
  expanded: boolean;
  paused: boolean;
  register: (id: ToastRecord['id'], node: HTMLElement | null) => void;
  releaseFocus: (options: { stayInRegion: boolean }) => void;
};

function ToastView({
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

  const styles = Toaster.Style({ placement, colorScheme: record.colorScheme });
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

function ToasterRegion({
  explicit,
  placement = 'bottom-right',
  max = 3,
  gap = 14,
  offset = 24,
  expand = false,
  hotkey = DEFAULT_HOTKEY,
  className,
  style,
  'aria-label': ariaLabel = messages.toast.region,
}: Toaster.Props & { explicit: boolean }) {
  const toaster = useToaster({ explicit, max, gap, expand });
  const platform = usePlatform(undefined);

  if (!toaster.elected) return null;

  const styles = Toaster.Style({ placement });

  return (
    <div data-toaster="" aria-live="polite" aria-relevant="additions text" aria-atomic="false">
      <ToasterShortcuts
        hotkey={hotkey}
        enabled={toaster.hasLive}
        onPress={toaster.toggleRegionFocus}
      />
      <div
        {...toaster.regionProps}
        popover="manual"
        tabIndex={-1}
        role={toaster.shown ? 'region' : undefined}
        aria-label={toaster.shown ? ariaLabel : undefined}
        aria-keyshortcuts={
          toaster.shown ? `${REGION_KEY} ${ariaShortcutOf(hotkey, platform)}` : undefined
        }
        data-toaster-region=""
        data-placement={placement}
        data-expanded={toaster.expanded ? '' : undefined}
        className={styles.region({ className })}
        style={
          {
            '--gap': `${gap}px`,
            '--toaster-offset': `${offset}px`,
            '--front-toast-height':
              toaster.frontHeight === undefined ? undefined : `${toaster.frontHeight}px`,
            ...style,
          } as CSSProperties
        }
      >
        {toaster.toasts.map((record) => (
          <ToastView
            key={record.id}
            record={record}
            position={toaster.positions.get(record.id)}
            placement={placement}
            expanded={toaster.expanded}
            paused={toaster.paused}
            register={toaster.registerToast}
            releaseFocus={toaster.releaseFocus}
          />
        ))}
      </div>
    </div>
  );
}

export function Toaster(props: Toaster.Props) {
  return <ToasterRegion {...props} explicit />;
}

export function DefaultToaster() {
  return <ToasterRegion explicit={false} />;
}

export namespace Toaster {
  export type Placement =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

  export type ColorScheme = StatusColorScheme;

  export type Props = {
    placement?: Placement;
    max?: number;
    gap?: number;
    offset?: number;
    expand?: boolean;
    hotkey?: Hotkey;
    className?: string;
    style?: CSSProperties;
    'aria-label'?: string;
  };

  export const Style = tv({
    slots: {
      region: [
        'fixed inset-x-4 z-50 m-0 h-(--front-toast-height) w-auto overflow-visible border-0 bg-transparent p-0',
        'text-(--ids-color-on-surface) outline-none sm:w-[356px]',
      ],
      toast: [
        'absolute inset-x-0 z-(--toast-z) touch-none concentric-p-3 px-4',
        'bg-(--ids-color-surface) text-body-b3-regular text-(--ids-color-on-surface)',
        'shadow-lg inset-ring-1 inset-ring-(--ids-color-border)',
        'after:absolute after:inset-x-0 after:h-(--gap)',
        'h-(--front-toast-height) [scale:calc(1-0.05*var(--toasts-before))]',
        '[--toast-y:calc(var(--lift)*var(--gap)*var(--toasts-before))]',
        '[translate:var(--swipe-x,0px)_calc(var(--toast-y)+var(--swipe-y,0px))]',
        'data-front:h-(--initial-height) data-front:[scale:1] data-front:[--toast-y:0px]',
        'data-expanded:h-(--initial-height) data-expanded:[scale:1]',
        'data-expanded:[--toast-y:calc(var(--lift)*var(--offset))]',
        '[&:not([data-front],[data-expanded])>*]:opacity-0',
        'transition-[translate,scale,opacity,height] duration-(--ids-motion-slow) ease-out',
        'starting:[translate:0_calc(var(--lift)*-100%)] starting:opacity-0',
        'not-data-visible:pointer-events-none not-data-visible:opacity-0',
        'data-ending-style:pointer-events-none data-ending-style:opacity-0',
        'data-front:data-ending-style:[--toast-y:calc(var(--lift)*-100%)]',
        'data-swiping:transition-none data-swiping:select-none motion-reduce:transition-none',
      ],
      body: [
        'flex items-center gap-3 transition-opacity duration-(--ids-motion-fast) ease-out',
        'motion-reduce:transition-none',
      ],
      icon: [
        'flex shrink-0 items-center text-(--toast-accent)',
        '[&_svg]:size-(--ids-size-icon-standard)',
      ],
      content: 'flex min-w-0 flex-1 flex-col gap-0.5',
      title: 'text-body-b3-semibold [overflow-wrap:anywhere]',
      description: 'text-(--ids-color-on-muted) [overflow-wrap:anywhere]',
      action: 'shrink-0',
      close: '-me-1.5 size-6 shrink-0 rounded-full',
    },
    variants: {
      placement: {
        'top-left': {
          region:
            'top-4 bottom-auto [--lift:1] sm:top-(--toaster-offset) sm:right-auto sm:left-(--toaster-offset)',
          toast: 'top-0 origin-bottom after:top-full',
        },
        'top-center': {
          region:
            'top-4 bottom-auto [--lift:1] sm:top-(--toaster-offset) sm:right-auto sm:left-1/2 sm:-translate-x-1/2',
          toast: 'top-0 origin-bottom after:top-full',
        },
        'top-right': {
          region:
            'top-4 bottom-auto [--lift:1] sm:top-(--toaster-offset) sm:right-(--toaster-offset) sm:left-auto',
          toast: 'top-0 origin-bottom after:top-full',
        },
        'bottom-left': {
          region:
            'top-auto bottom-4 [--lift:-1] sm:bottom-(--toaster-offset) sm:right-auto sm:left-(--toaster-offset)',
          toast: 'bottom-0 origin-top after:bottom-full',
        },
        'bottom-center': {
          region:
            'top-auto bottom-4 [--lift:-1] sm:bottom-(--toaster-offset) sm:right-auto sm:left-1/2 sm:-translate-x-1/2',
          toast: 'bottom-0 origin-top after:bottom-full',
        },
        'bottom-right': {
          region:
            'top-auto bottom-4 [--lift:-1] sm:right-(--toaster-offset) sm:bottom-(--toaster-offset) sm:left-auto',
          toast: 'bottom-0 origin-top after:bottom-full',
        },
      } satisfies Record<Placement, object>,
      colorScheme: {
        neutral: { toast: '[--toast-accent:var(--ids-color-on-surface)]' },
        info: { toast: '[--toast-accent:var(--ids-color-info-strong)]' },
        success: { toast: '[--toast-accent:var(--ids-color-success-strong)]' },
        warning: { toast: '[--toast-accent:var(--ids-color-warning-strong)]' },
        danger: { toast: '[--toast-accent:var(--ids-color-danger-strong)]' },
      } satisfies Record<ColorScheme, object>,
    },
    defaultVariants: { placement: 'bottom-right', colorScheme: 'neutral' },
  });
}
