import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { userInfo } from 'node:os';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('..', import.meta.url));
export const react = `${root}packages/react`;

function playwrightImage() {
  const lockfile = readFileSync(`${root}pnpm-lock.yaml`, 'utf8');
  const version = lockfile.match(/^ {2}playwright@(\d+\.\d+\.\d+):/m)?.[1];
  if (!version) throw new Error('pnpm-lock.yaml has no playwright entry.');
  return `mcr.microsoft.com/playwright:v${version}-noble`;
}

export function runInPlaywrightImage({ env = {}, mounts = {}, script }) {
  const hostUser = userInfo();
  for (const hostPath of Object.keys(mounts)) mkdirSync(hostPath, { recursive: true });

  const insideTheContainer = `
set -eu
mkdir -p /work
tar -C /src --exclude=node_modules --exclude=.git --exclude=.turbo --exclude=.vitest -cf - . | tar -C /work -xf -
cd /work
corepack enable
pnpm install --frozen-lockfile --filter @gsainfoteam/ids-react... > /tmp/install.log 2>&1 || { cat /tmp/install.log; exit 1; }
cd packages/react
status=0
${script}
${Object.values(mounts)
  .map((containerPath) => `chown -R ${hostUser.uid}:${hostUser.gid} ${containerPath}`)
  .join('\n')}
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
      ...Object.entries(env).flatMap(([name, value]) => ['-e', `${name}=${value}`]),
      '-v',
      `${root}:/src:ro`,
      ...Object.entries(mounts).flatMap(([hostPath, containerPath]) => [
        '-v',
        `${hostPath}:${containerPath}`,
      ]),
      playwrightImage(),
      'bash',
      '-c',
      insideTheContainer,
    ],
    { stdio: 'inherit' },
  );

  if (docker.error) throw docker.error;
  return docker.status ?? 1;
}
