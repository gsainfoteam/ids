import { react, runInPlaywrightImage } from './playwright-image.mjs';

const updating = process.argv.includes('--update');

const status = runInPlaywrightImage({
  env: { IDS_VISUAL_REFERENCE: '1' },
  mounts: { [`${react}/tests/__screenshots__`]: '/out', [`${react}/.vitest/visual`]: '/diff' },
  script: `
pnpm exec vitest run --project visual ${updating ? '--update' : ''} || status=$?
if [ "${updating ? 'update' : 'check'}" = update ] && [ "$status" = 0 ]; then
  find /out -name '*.png' -delete
  cp -R tests/__screenshots__/. /out/
fi
if [ -d .vitest/attachments ]; then cp -R .vitest/attachments/. /diff/; fi
`,
});

process.exit(status);
