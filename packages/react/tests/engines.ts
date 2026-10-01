import { server } from 'vitest/browser';

import type { TestContext } from 'vitest';

export const NEEDS_CDP =
  'drives the browser through the Chrome DevTools Protocol, which only Chromium exposes: a held mouse button, touch points, IME composition, key repeat, emulated media or time zone, a held network response';

export const FIREFOX_DROPS_SYNTHETIC_CLIPBOARD_DATA =
  'Firefox ignores the clipboardData of a synthetic paste event, and a test cannot paste files from the OS';

export function skipWithoutCdp(context: TestContext) {
  context.skip(server.browser !== 'chromium', NEEDS_CDP);
}

export function skipInFirefox(context: TestContext, reason: string) {
  context.skip(server.browser === 'firefox', reason);
}
