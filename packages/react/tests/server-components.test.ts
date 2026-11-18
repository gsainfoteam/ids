import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { expect, test } from 'vitest';

const PACKAGE = fileURLToPath(new URL('../', import.meta.url));
const coldNodeStartOnABusyRunner = 30_000;

const runNode = (conditions: string[], script: string) =>
  spawnSync(
    process.execPath,
    [...conditions.map((name) => `--conditions=${name}`), '--input-type=module', '-e', script],
    { cwd: PACKAGE, encoding: 'utf8' },
  );

const listNamespacedExports = `
  const ids = await import('./dist/index.js');
  const holdsParts = (value) =>
    typeof value === 'function' && Object.keys(value).some((key) => /^[A-Z]/.test(key));
  const membersOf = (value, path = '') =>
    Object.keys(value)
      .filter((key) => key !== 'displayName')
      .flatMap((key) => [
        path + key,
        ...(holdsParts(value[key]) ? membersOf(value[key], path + key + '.') : []),
      ]);
  const namespaced = {};
  for (const [name, value] of Object.entries(ids)) {
    const members = typeof value === 'function' ? membersOf(value) : [];
    if (members.length) namespaced[name] = members;
  }
  console.log(JSON.stringify(namespaced));
`;

const clientModulesAsReferences = `
  import { registerHooks } from 'node:module';
  import { pathToFileURL } from 'node:url';

  const dist = pathToFileURL(process.cwd() + '/dist/').href;
  const exportedNames = (code) => {
    const list = code.match(/export\\s*\\{([^}]*)\\};?\\s*$/);
    if (!list) throw new Error('No export list in a client module');
    return list[1].split(',').map((entry) => entry.trim().split(/\\s+as\\s+/).pop()).filter(Boolean);
  };

  registerHooks({
    load(url, context, nextLoad) {
      const loaded = nextLoad(url, context);
      if (!url.startsWith(dist)) return loaded;
      const code = String(loaded.source);
      if (!code.startsWith('"use client"')) return loaded;
      const names = exportedNames(code);
      return {
        format: 'module',
        shortCircuit: true,
        source: [
          "import { createClientModuleProxy } from 'react-server-dom-turbopack/server';",
          'const module = createClientModuleProxy(' + JSON.stringify(url) + ');',
          ...names.map((name) => 'export const ' + name + ' = module[' + JSON.stringify(name) + '];'),
        ].join('\\n'),
      };
    },
  });
`;

const renderFromAServerComponent = (namespaced: Record<string, string[]>) => `
  ${clientModulesAsReferences}

  const { createElement: h } = await import('react');
  const { renderToPipeableStream } = await import('react-server-dom-turbopack/server');
  const { Writable } = await import('node:stream');
  const ids = await import('./dist/index.js');

  const clientReference = Symbol.for('react.client.reference');
  const namespaced = ${JSON.stringify(namespaced)};
  const reach = (value, path) =>
    path.split('.').reduce(
      (parent, key) => (parent === undefined || parent.$$typeof === clientReference ? undefined : parent[key]),
      value,
    );
  const unreachable = [];
  for (const [name, members] of Object.entries(namespaced)) {
    if (ids[name].$$typeof === clientReference) {
      unreachable.push(name);
      continue;
    }
    for (const member of members) if (reach(ids[name], member) === undefined) unreachable.push(name + '.' + member);
    if (!members.includes('Style')) continue;
    if (ids[name].Style.$$typeof === clientReference) unreachable.push(name + '.Style');
    else ids[name].Style();
  }
  if (unreachable.length) {
    console.error('Parts a Server Component cannot reach: ' + unreachable.join(', '));
    process.exit(1);
  }

  const clientComponents = Object.keys(ids).filter(
    (name) => /^[A-Z][a-z]/.test(name) && ids[name].$$typeof === clientReference,
  );

  const { IdsProvider, Dialog, Select, Card, Field, TextField, Button, Badge, Bubble, Divider, Image, defineIdsTheme, checkIdsTheme } = ids;
  const palette = { 50: '#eff6ff', 100: '#dbeafe', 200: '#bedbff', 300: '#8ec5ff', 400: '#51a2ff', 500: '#2b7fff', 600: '#155dfc', 700: '#1447e6', 800: '#193cb8', 900: '#1c398e', 950: '#162456' };
  const theme = defineIdsTheme({ primary: palette, radius: 12 });
  if (checkIdsTheme(theme).length) {
    console.error('A Server Component could not check the theme');
    process.exit(1);
  }
  const page = h(
    IdsProvider,
    { theme, mode: 'light' },
    h(IdsProvider.Scope, { mode: 'dark' }, 'A dark region'),
    h('a', { href: '/', className: Button.Style({ variant: 'outline' }) }, 'A link styled as a button'),
    h(Badge, { content: 3 }, h(Button, null, 'Inbox')),
    h(Divider),
    h(Bubble, { align: 'end' }, 'Hi', h(Bubble.Reactions, null, '👍')),
    h(Card, null, h(Card.Header, null, h(Card.Title, null, 'Card'))),
    h(
      Dialog,
      null,
      h(Dialog.Trigger, { asChild: true }, h(Button, null, 'Open')),
      h(Dialog.Content, null, h(Dialog.Header, null, h(Dialog.Title, null, 'Title'))),
    ),
    h(
      Field,
      { name: 'fruit' },
      h(Field.Label, null, 'Fruit'),
      h(
        Select,
        { defaultValue: 'apple' },
        h(Select.Trigger),
        h(Select.Content, null, h(Select.Item, { value: 'apple' }, 'Apple')),
      ),
    ),
    h(TextField, { name: 'note' }, h(TextField.Clear)),
    h(
      Image.Group,
      { 'aria-label': 'Photos' },
      h(Image, { src: '/lake.png', alt: 'Lake' }),
      h(
        Image.Viewer,
        { 'aria-label': 'Photo viewer' },
        h(Image.Viewer.Toolbar, null, h(Image.Viewer.Counter), h(Image.Viewer.Close)),
        h(Image.Viewer.Caption),
      ),
    ),
  );

  const manifest = new Proxy({}, {
    get: (_, id) => {
      const [module, name] = String(id).split('#');
      return { id: module, chunks: [], name };
    },
  });
  const errors = [];
  let payload = '';
  await new Promise((resolve) => {
    const sink = new Writable({
      write(chunk, _encoding, done) { payload += chunk; done(); },
      final(done) { resolve(); done(); },
    });
    renderToPipeableStream(page, manifest, { onError: (error) => { errors.push(String(error)); } }).pipe(sink);
  });
  if (errors.length) {
    console.error(errors.join('\\n'));
    process.exit(1);
  }
  console.log(JSON.stringify({ clientComponents, payload }));
`;

const renderEntryFromAServerComponent = ({
  entry,
  component,
  parts,
  page,
}: {
  entry: string;
  component: string;
  parts: string[];
  page: string;
}) => `
  ${clientModulesAsReferences}

  const { createElement: h } = await import('react');
  const { renderToPipeableStream } = await import('react-server-dom-turbopack/server');
  const { Writable } = await import('node:stream');
  const { ${component} } = await import('./dist/${entry}.js');

  const clientReference = Symbol.for('react.client.reference');
  const parts = ${JSON.stringify(parts)};
  const unreachable = ${component}.$$typeof === clientReference ? ['${component}'] : parts.filter((part) => ${component}[part] === undefined);
  if (unreachable.length) {
    console.error('Parts a Server Component cannot reach: ' + unreachable.join(', '));
    process.exit(1);
  }
  ${component}.Style();

  const page = ${page};
  const manifest = new Proxy({}, {
    get: (_, id) => {
      const [module, name] = String(id).split('#');
      return { id: module, chunks: [], name };
    },
  });
  const errors = [];
  let payload = '';
  await new Promise((resolve) => {
    const sink = new Writable({
      write(chunk, _encoding, done) { payload += chunk; done(); },
      final(done) { resolve(); done(); },
    });
    renderToPipeableStream(page, manifest, { onError: (error) => { errors.push(String(error)); } }).pipe(sink);
  });
  if (errors.length) {
    console.error(errors.join('\\n'));
    process.exit(1);
  }
  console.log(payload);
`;

const renderChartFromAServerComponent = renderEntryFromAServerComponent({
  entry: 'chart',
  component: 'Chart',
  parts: [
    'Title',
    'Description',
    'Tooltip',
    'TooltipContent',
    'Legend',
    'LegendContent',
    'Table',
    'Style',
  ],
  page: `h(
    Chart,
    { config: { web: { label: 'Web' } } },
    h(Chart.Title, null, 'Visits'),
    h(Chart.Description, null, 'Last week'),
    h(Chart.Table),
  )`,
});

const renderEditorFromAServerComponent = renderEntryFromAServerComponent({
  entry: 'editor',
  component: 'Editor',
  parts: [
    'Content',
    'BlockType',
    'Bold',
    'Highlight',
    'Link',
    'Image',
    'TaskList',
    'HorizontalRule',
    'Table',
    'TextAlign',
    'Separator',
    'BubbleMenu',
    'Count',
    'Style',
  ],
  page: `h(
    Editor,
    { name: 'body', defaultValue: '<p>Hello</p>' },
    h(Editor.Bold),
    h(Editor.Highlight),
    h(Editor.Link),
    h(Editor.TaskList),
    h(Editor.HorizontalRule),
    h(Editor.Table),
    h(Editor.TextAlign),
    h(Editor.Content),
    h(Editor.Count),
  )`,
});

test(
  'a Server Component renders Chart and its parts from the chart entry',
  () => {
    const rendered = runNode(['react-server'], renderChartFromAServerComponent);
    expect(rendered.status, rendered.stderr).toBe(0);

    for (const reference of ['ChartRoot', 'ChartTitle', 'ChartDescription', 'ChartTable'])
      expect(rendered.stdout).toContain(`"${reference}"`);
  },
  coldNodeStartOnABusyRunner,
);

test(
  'a Server Component renders Editor and its parts from the editor entry',
  () => {
    const rendered = runNode(['react-server'], renderEditorFromAServerComponent);
    expect(rendered.status, rendered.stderr).toBe(0);

    for (const reference of [
      'EditorRoot',
      'EditorBold',
      'EditorLink',
      'EditorHighlight',
      'EditorTaskList',
      'EditorHorizontalRule',
      'EditorTable',
      'EditorTextAlign',
      'EditorContentPart',
      'EditorCount',
    ])
      expect(rendered.stdout).toContain(`"${reference}"`);
  },
  coldNodeStartOnABusyRunner,
);

test(
  'a Server Component renders every component, its parts and its Style',
  () => {
    const listed = runNode([], listNamespacedExports);
    expect(listed.status, listed.stderr).toBe(0);
    const namespaced = JSON.parse(listed.stdout) as Record<string, string[]>;
    expect(Object.keys(namespaced)).toEqual(
      expect.arrayContaining(['Button', 'Dialog', 'Divider', 'Select', 'Spinner']),
    );

    const rendered = runNode(['react-server'], renderFromAServerComponent(namespaced));
    expect(rendered.status, rendered.stderr).toBe(0);
    const { clientComponents, payload } = JSON.parse(rendered.stdout) as {
      clientComponents: string[];
      payload: string;
    };

    expect(clientComponents).toEqual(['ThemeContext', 'TooltipDelayGroup']);
    expect(namespaced.Image).toEqual(
      expect.arrayContaining(['Group', 'Viewer', 'Viewer.Toolbar', 'Viewer.Close']),
    );
    expect(payload).toContain('"600":"#155dfc"');
    for (const reference of [
      'IdsProviderRoot',
      'IdsProviderScope',
      'ButtonRoot',
      'BubbleRoot',
      'BubbleReactions',
      'DialogRoot',
      'DialogTrigger',
      'SelectRoot',
      'SelectItem',
      'FieldLabel',
      'ImageGroup',
      'ImageViewer',
      'ImageViewerToolbar',
      'ImageViewerClose',
    ])
      expect(payload).toContain(`"${reference}"`);
  },
  coldNodeStartOnABusyRunner * 2,
);
