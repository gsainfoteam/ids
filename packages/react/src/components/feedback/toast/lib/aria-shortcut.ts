import { parseHotkey, type Hotkey } from '@tanstack/react-hotkeys';

import type { KbdPlatform } from '../../../typography/kbd/lib/keys';

export function ariaShortcutOf(hotkey: Hotkey, platform: KbdPlatform) {
  const parsed = parseHotkey(hotkey, platform);
  return [...parsed.modifiers, parsed.key ?? parsed.code].join('+');
}
