import { expect, onTestFinished } from 'vitest';
import { cdp } from 'vitest/browser';

const lazyImagesStartLateOnASlowRunner = 5_000;

async function cdpReadyForListeners() {
  const session = cdp();
  await session.send('Fetch.disable');
  return session;
}

function countFrames() {
  let frames = 0;
  let counting = true;
  const tick = () => {
    frames++;
    if (counting) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return () => {
    counting = false;
    return frames;
  };
}

function describeTheImage(src: string, paused: Map<string, string>, frames: number, waited: number) {
  const img = [...document.querySelectorAll('img')].find((i) => i.getAttribute('src') === src);
  const entries = performance
    .getEntriesByType('resource')
    .filter((e) => e.name.includes(src)) as PerformanceResourceTiming[];
  const frame = window.frameElement?.getBoundingClientRect();
  const box = img?.getBoundingClientRect();
  return JSON.stringify({
    waited,
    frames,
    pausedPaths: [...paused.keys()],
    img: img && {
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      currentSrc: img.currentSrc,
      loading: img.loading,
      box: box && [box.x, box.y, box.width, box.height].map(Math.round),
      status: img.closest('[data-status]')?.getAttribute('data-status'),
    },
    resourceEntries: entries.map((e) => ({
      start: Math.round(e.startTime),
      duration: Math.round(e.duration),
      status: e.responseStatus,
    })),
    iframeAge: Math.round(performance.now()),
    visibility: document.visibilityState,
    hasFocus: document.hasFocus(),
    frameRect: frame && [frame.x, frame.y, frame.width, frame.height].map(Math.round),
    top: window.top && {
      size: [window.top.innerWidth, window.top.innerHeight],
      scrollY: window.top.scrollY,
      iframes: window.top.document.querySelectorAll('iframe').length,
    },
  });
}

export async function holdImages(held: string, picture: string) {
  const session = await cdpReadyForListeners();
  const paused = new Map<string, string>();
  const onPaused = (event: { requestId: string; request: { url: string } }) => {
    paused.set(new URL(event.request.url).pathname, event.requestId);
  };
  session.on('Fetch.requestPaused', onPaused);
  await session.send('Fetch.enable', { patterns: [{ urlPattern: `*${held}*` }] });
  onTestFinished(async () => {
    session.off('Fetch.requestPaused', onPaused);
    await session.send('Fetch.disable');
  });
  const requestOf = async (src: string) => {
    const start = performance.now();
    const stopCounting = countFrames();
    try {
      await expect
        .poll(() => paused.get(src), {
          message: `${src} is requested`,
          timeout: lazyImagesStartLateOnASlowRunner,
        })
        .toBeDefined();
    } catch (error) {
      const atTimeout = describeTheImage(src, paused, stopCounting(), Math.round(performance.now() - start));
      console.error(`HELD-DIAG ${src} at timeout: ${atTimeout}`);
      const stopLate = countFrames();
      const lateStart = performance.now();
      await expect
        .poll(() => paused.get(src) ?? (performance.getEntriesByName(new URL(src, location.href).href).length ? 'served' : undefined), { timeout: 15_000 })
        .toBeDefined()
        .catch(() => {});
      const late = describeTheImage(src, paused, stopLate(), Math.round(performance.now() - lateStart));
      console.error(`HELD-DIAG ${src} later: ${late}`);
      throw new Error(`HELD-DIAG ${src}\n at timeout: ${atTimeout}\n 15s later: ${late}`, { cause: error });
    }
    stopCounting();
    return paused.get(src)!;
  };
  return {
    requested: requestOf,
    async load(src: string) {
      await session.send('Fetch.fulfillRequest', {
        requestId: await requestOf(src),
        responseCode: 200,
        responseHeaders: [{ name: 'Content-Type', value: 'image/svg+xml' }],
        body: btoa(picture),
      });
    },
    async fail(src: string) {
      await session.send('Fetch.failRequest', {
        requestId: await requestOf(src),
        errorReason: 'Failed',
      });
    },
  };
}
