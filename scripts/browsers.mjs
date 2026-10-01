import { react, runInPlaywrightImage } from './playwright-image.mjs';

const status = runInPlaywrightImage({
  mounts: { [`${react}/.vitest/browsers`]: '/failures' },
  script: `
pnpm exec vitest run --project 'browser (*)' --project 'clipboard (*)' || status=$?
if [ -d .vitest/attachments ]; then cp -R .vitest/attachments/. /failures/; fi
`,
});

process.exit(status);
