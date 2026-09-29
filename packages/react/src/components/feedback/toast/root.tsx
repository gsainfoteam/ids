'use client';

import type { CSSProperties } from 'react';

import { parseHotkey, useHotkey, type Hotkey } from '@tanstack/react-hotkeys';

import { toasterStyle } from './style';
import { ToastView } from './toast-view';
import { useToaster } from './use-toaster';
import { messages } from '../../../internal/messages';
import { usePlatform } from '../../typography/kbd/use-kbd';

import type { Toaster } from '.';
import type { KbdPlatform } from '../../typography/kbd/keys';

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

  const styles = toasterStyle({ placement });

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

export function ToasterRoot(props: Toaster.Props) {
  return <ToasterRegion {...props} explicit />;
}

export function DefaultToaster() {
  return <ToasterRegion explicit={false} />;
}
