import './styles.css';

import { afterAll, afterEach } from 'vitest';
import { commands } from 'vitest/browser';

const probing =
  /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Firefox/.test(navigator.userAgent);
const rows: string[] = [];
let seen = 0;

const lateBy = (ms: number) =>
  new Promise<number>((resolve) => {
    const start = performance.now();
    setTimeout(() => resolve(Math.round(performance.now() - start - ms)), ms);
  });

const nextFrame = () =>
  new Promise<number>((resolve) => {
    const start = performance.now();
    requestAnimationFrame(() => resolve(Math.round(performance.now() - start)));
    setTimeout(() => resolve(-1), 3000);
  });

const topVisibility = () => {
  try {
    return window.top?.document.visibilityState;
  } catch {
    return 'cross-origin';
  }
};

if (probing) {
  afterEach(async (context) => {
    seen++;
    const failed = context.task.result?.state === 'fail';
    if (!failed && seen % 25 !== 1) return;
    const frame = window.frameElement?.getBoundingClientRect();
    rows.push(
      JSON.stringify({
        file: context.task.file?.name,
        test: context.task.name,
        failed,
        at: Math.round(performance.now()),
        visibility: document.visibilityState,
        topVisibility: topVisibility(),
        focus: document.hasFocus(),
        timeout0Late: await lateBy(0),
        timeout100Late: await lateBy(100),
        frameMs: await nextFrame(),
        iframe: frame && [frame.x, frame.y, frame.width, frame.height].map(Math.round),
        viewport: [innerWidth, innerHeight],
      }),
    );
  });

  afterAll(async () => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await commands.writeFile(`.vitest/webkit-probe/${id}.jsonl`, rows.join('\n'));
  });
}
