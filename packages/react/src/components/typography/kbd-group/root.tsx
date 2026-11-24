'use client';

import { kbdGroupStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { KbdGroupContext, useInternalKbd } from '../kbd/hooks/use-kbd';

import type { KbdGroup } from '.';

export function KbdGroupRoot({
  size,
  platform,
  labels,
  className,
  children,
  ...rest
}: KbdGroup.Props) {
  const kbd = useInternalKbd({ size, platform, labels });
  const state: KbdGroup.State = { size: kbd.size, platform: kbd.platform, combination: true };

  return (
    <KbdGroupContext value={{ size: kbd.size, platform: kbd.platform, labels: kbd.labels }}>
      <kbd
        {...rest}
        data-kbd-group=""
        data-size={kbd.size}
        data-platform={kbd.platform}
        className={kbdGroupStyle({ size: kbd.size, className: resolveState(className, state) })}
      >
        {children}
      </kbd>
    </KbdGroupContext>
  );
}
