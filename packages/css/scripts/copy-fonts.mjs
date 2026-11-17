import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const packageDirectory = (name) => dirname(require.resolve(`${name}/package.json`));
const out = fileURLToPath(new URL('../fonts/', import.meta.url));

const PRETENDARD_GOV = join(packageDirectory('pretendard-gov'), 'dist/web/variable');
const GEIST_MONO = packageDirectory('@fontsource-variable/geist-mono');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(
  join(PRETENDARD_GOV, 'pretendardvariable-gov-dynamic-subset.css'),
  join(out, 'pretendard-gov/pretendard-gov.css'),
);
cpSync(
  join(PRETENDARD_GOV, 'woff2-dynamic-subset'),
  join(out, 'pretendard-gov/woff2-dynamic-subset'),
  { recursive: true },
);
cpSync(join(GEIST_MONO, 'index.css'), join(out, 'geist-mono/geist-mono.css'));
cpSync(join(GEIST_MONO, 'files'), join(out, 'geist-mono/files'), {
  recursive: true,
  filter: (source) => !source.includes('-italic'),
});
cpSync(join(GEIST_MONO, 'LICENSE'), join(out, 'geist-mono/LICENSE'));
cpSync(fileURLToPath(new URL('../licenses/pretendard.txt', import.meta.url)), join(out, 'pretendard-gov/LICENSE'));

writeFileSync(
  join(out, 'fonts.css'),
  "@import './pretendard-gov/pretendard-gov.css';\n@import './geist-mono/geist-mono.css';\n",
);
