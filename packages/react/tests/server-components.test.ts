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

const listCompoundExports = `
  const ids = await import('./dist/index.js');
  const compound = {};
  for (const [name, value] of Object.entries(ids)) {
    const members = typeof value === 'function' ? Object.keys(value) : [];
    const parts = members.filter((key) => key !== 'displayName' && key !== 'Style');
    if (parts.length) compound[name] = members.filter((key) => key !== 'displayName');
  }
  console.log(JSON.stringify(compound));
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

const renderFromAServerComponent = (compound: Record<string, string[]>) => `
  ${clientModulesAsReferences}

  const { createElement: h } = await import('react');
  const { renderToPipeableStream } = await import('react-server-dom-turbopack/server');
  const { Writable } = await import('node:stream');
  const ids = await import('./dist/index.js');

  const clientReference = Symbol.for('react.client.reference');
  const compound = ${JSON.stringify(compound)};
  const unreachable = [];
  for (const [name, members] of Object.entries(compound)) {
    if (ids[name].$$typeof === clientReference) {
      unreachable.push(name);
      continue;
    }
    for (const member of members) if (ids[name][member] === undefined) unreachable.push(name + '.' + member);
    if (!members.includes('Style')) continue;
    if (ids[name].Style.$$typeof === clientReference) unreachable.push(name + '.Style');
    else ids[name].Style();
  }
  if (unreachable.length) {
    console.error('Parts a Server Component cannot reach: ' + unreachable.join(', '));
    process.exit(1);
  }

  const { IdsProvider, Dialog, Select, Card, Field, TextField, Button } = ids;
  const page = h(
    IdsProvider,
    { color: 'blue', mode: 'light' },
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
  console.log(payload);
`;

test(
  'a Server Component renders compound parts as client references',
  () => {
    const listed = runNode([], listCompoundExports);
    expect(listed.status, listed.stderr).toBe(0);
    const compound = JSON.parse(listed.stdout) as Record<string, string[]>;
    expect(Object.keys(compound)).toEqual(expect.arrayContaining(['Dialog', 'Select', 'Card']));

    const rendered = runNode(['react-server'], renderFromAServerComponent(compound));
    expect(rendered.status, rendered.stderr).toBe(0);
    for (const reference of [
      'DialogRoot',
      'DialogTrigger',
      'SelectRoot',
      'SelectItem',
      'FieldLabel',
    ])
      expect(rendered.stdout).toContain(`"${reference}"`);
  },
  coldNodeStartOnABusyRunner * 2,
);
