import {
  composeStories,
  setProjectAnnotations,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { afterEach, beforeAll, beforeEach, describe, expect, inject, test, vi } from 'vitest';
import { page } from 'vitest/browser';

import * as preview from '../.storybook/preview';

type StoryFile = Record<string, StoryObj> & { default: Meta };

declare module 'vitest' {
  export interface ProvidedContext {
    visualReference: boolean;
  }
}

const project = setProjectAnnotations([preview]);
beforeAll(project.beforeAll);

const storyFiles = import.meta.glob<StoryFile>('../src/**/*.stories.tsx', { eager: true });

const VIEWPORT_WIDTH = 1440;
const VIEWPORT_HEIGHT = 900;

const A_FIXED_MORNING = new Date('2026-03-16T09:30:00');

const screenshotName = (path: string) =>
  path
    .replace('../src/', '')
    .replace(/^components\//, '')
    .replace(/\/index\.stories\.tsx$|\.stories\.tsx$/, '')
    .replaceAll('/', '-');

beforeEach(async () => {
  await page.viewport(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(A_FIXED_MORNING);
});

afterEach(() => {
  vi.useRealTimers();
});

for (const [path, module] of Object.entries(storyFiles)) {
  const { Gallery } = composeStories(module);
  if (!Gallery) continue;

  describe(screenshotName(path), () => {
    for (const mode of ['light', 'dark'] as const) {
      test(mode, async (context) => {
        context.skip(
          !inject('visualReference'),
          'Gallery screenshots are compared only in the Playwright Linux image, where the baselines are rendered. Run `pnpm test:visual` (Docker) or the CI visual job.',
        );

        await Gallery.run({ globals: { ...Gallery.globals, idsMode: mode } });
        await document.fonts.ready;
        const story = document.body.querySelector<HTMLElement>('[data-mode]')!;
        await page.viewport(
          VIEWPORT_WIDTH,
          Math.max(VIEWPORT_HEIGHT, Math.ceil(story.scrollHeight)),
        );
        await new Promise(requestAnimationFrame);

        await expect
          .element(page.elementLocator(story))
          .toMatchScreenshot(`${screenshotName(path)}-${mode}`, {
            screenshotOptions: { animations: 'disabled', caret: 'hide' },
          });
      });
    }
  });
}
