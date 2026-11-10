import { expect, onTestFinished } from 'vitest';
import { cdp } from 'vitest/browser';

const lazyImagesStartLateOnASlowRunner = 5_000;
const probesBeforeGivingUp = 20;

type Session = ReturnType<typeof cdp>;

async function cdpReadyForListeners() {
  const session = cdp();
  await session.send('Fetch.disable');
  return session;
}

async function probeIsHeld(probe: string, paused: Map<string, string>) {
  const reachedTheServer = fetch(probe).then(
    () => false,
    () => false,
  );
  const held = expect
    .poll(() => paused.get(probe), { timeout: lazyImagesStartLateOnASlowRunner })
    .toBeDefined()
    .then(
      () => true,
      () => false,
    );
  return Promise.race([reachedTheServer, held]);
}

async function untilTheFrameLoadsThroughInterception(
  session: Session,
  held: string,
  paused: Map<string, string>,
) {
  for (let attempt = 0; attempt < probesBeforeGivingUp; attempt++) {
    const probe = `${held}interception-probe-${attempt}`;
    if (await probeIsHeld(probe, paused)) {
      await session.send('Fetch.fulfillRequest', {
        requestId: paused.get(probe)!,
        responseCode: 204,
      });
      return;
    }
  }
  throw new Error(`Requests under ${held} still reach the server after Fetch.enable.`);
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
  await untilTheFrameLoadsThroughInterception(session, held, paused);

  const requestOf = async (src: string) => {
    await expect
      .poll(() => paused.get(src), {
        message: `${src} is requested`,
        timeout: lazyImagesStartLateOnASlowRunner,
      })
      .toBeDefined();
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
