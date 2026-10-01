import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const examples = fileURLToPath(new URL('../examples/', import.meta.url));

const serverRenderedIds = [
  ['IdsProvider theme', 'data-color="blue"'],
  ['glossy Button', 'data-variant="glossy"'],
  ['Dialog.Trigger', 'aria-haspopup="dialog"'],
  ['Select', 'data-select=""'],
  ['Select placeholder', '과일을 고르세요'],
  ['TextField in Field', 'data-text-field=""'],
  ['DateField in Field', 'data-date-field=""'],
  ['Menu.Trigger', 'aria-haspopup="menu"'],
];

const utilityOnlyIdsUses = '.bg-\\(--ids-color-surface\\)';

const apps = [
  {
    name: 'next-app-router',
    html: () => readFileSync(join(examples, 'next-app-router/.next/server/app/index.html'), 'utf8'),
    stylesheet: (href) => join(examples, 'next-app-router/.next', href.replace(/^\/_next\//, '')),
  },
  {
    name: 'tanstack-start',
    html: async () => {
      const entry = pathToFileURL(join(examples, 'tanstack-start/dist/server/server.js')).href;
      const { default: server } = await import(entry);
      const response = await server.fetch(new Request('http://localhost/'));
      if (!response.ok) throw new Error(`GET / answered ${response.status}`);
      return response.text();
    },
    stylesheet: (href) => join(examples, 'tanstack-start/dist/client', href),
  },
  {
    name: 'astro',
    html: () => readFileSync(join(examples, 'astro/dist/index.html'), 'utf8'),
    stylesheet: (href) => join(examples, 'astro/dist', href),
    extra: [
      ['React island', '<astro-island'],
      ['static React outside the island', '정적 버튼'],
    ],
  },
];

const failures = [];

for (const app of apps) {
  let html;
  try {
    html = await app.html();
  } catch (error) {
    failures.push(`${app.name}: no server-rendered HTML (${error.message}). Build it first.`);
    continue;
  }

  for (const [what, marker] of [...serverRenderedIds, ...(app.extra ?? [])])
    if (!html.includes(marker)) failures.push(`${app.name}: ${what} is missing (${marker})`);

  const hrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+\.css)"/g)].map(
    (match) => match[1],
  );
  const css = hrefs
    .map(app.stylesheet)
    .filter((file) => existsSync(file))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
  if (!css.includes(utilityOnlyIdsUses))
    failures.push(
      `${app.name}: the stylesheet has no ${utilityOnlyIdsUses}, so Tailwind did not scan @gsainfoteam/ids-react`,
    );

  if (!failures.some((failure) => failure.startsWith(`${app.name}:`)))
    console.log(`ok ${app.name}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
