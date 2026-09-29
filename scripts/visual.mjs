import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { userInfo } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const react = `${root}packages/react`;
const baselines = `${react}/tests/__screenshots__`;
const diffs = `${react}/.vitest/visual`;
const updating = process.argv.includes('--update');

const lockfile = readFileSync(`${root}pnpm-lock.yaml`, 'utf8');
const playwrightVersion = lockfile.match(/^ {2}playwright@(\d+\.\d+\.\d+):/m)?.[1];
if (!playwrightVersion) throw new Error('pnpm-lock.yaml has no playwright entry.');

const image = `mcr.microsoft.com/playwright:v${playwrightVersion}-noble`;
const hostUser = userInfo();

mkdirSync(baselines, { recursive: true });
mkdirSync(diffs, { recursive: true });

const insideTheContainer = `
set -eu
mkdir -p /work
tar -C /src --exclude=node_modules --exclude=.git --exclude=.turbo --exclude=.vitest -cf - . | tar -C /work -xf -
cd /work
corepack enable
pnpm install --frozen-lockfile --filter @gsainfoteam/ids-react... > /tmp/install.log 2>&1 || { cat /tmp/install.log; exit 1; }
cd packages/react
status=0
IDS_VISUAL_REFERENCE=1 pnpm exec vitest run --project visual ${updating ? '--update' : ''} || status=$?
if [ "${updating ? 'update' : 'check'}" = update ] && [ "$status" = 0 ]; then
  find /out -name '*.png' -delete
  cp -R tests/__screenshots__/. /out/
fi
if [ -d .vitest/attachments ]; then cp -R .vitest/attachments/. /diff/; fi
chown -R ${hostUser.uid}:${hostUser.gid} /out /diff
exit "$status"
`;

const docker = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--init',
    '--ipc=host',
    '--platform=linux/amd64',
    '-e',
    'COREPACK_ENABLE_DOWNLOAD_PROMPT=0',
    '-e',
    'CI=true',
    '-v',
    `${root}:/src:ro`,
    '-v',
    `${baselines}:/out`,
    '-v',
    `${diffs}:/diff`,
    image,
    'bash',
    '-c',
    insideTheContainer,
  ],
  { stdio: 'inherit' },
);

if (docker.error) throw docker.error;
process.exit(docker.status ?? 1);
