import { transform } from '@babel/standalone';

type Node = { type: string; start: number; end: number; params?: unknown[]; body?: Node };

type Path = {
  node: Node & { name?: string };
  get(key: string): Path | Path[];
  scope: { hasBinding(name: string, options: { noGlobals: boolean }): boolean };
  traverse(visitor: Record<string, (path: Path) => void>): void;
  isReferencedIdentifier(): boolean;
};

type Body = { kind: 'expression' | 'block'; node: Node; path: Path };

export type ResolveImport = (name: string) => string | undefined | null;

const RENDER_FUNCTIONS = new Set(['ArrowFunctionExpression', 'FunctionExpression', 'ObjectMethod']);
const JSX_ROOTS = new Set(['JSXElement', 'JSXFragment']);

const single = (path: Path | Path[]) => (Array.isArray(path) ? path[0] : path);

function renderOf(story: Path): Path | undefined {
  const properties = story.get('properties');
  if (!Array.isArray(properties)) return undefined;

  return properties
    .map((property) => property as Path & { node: { key?: { name?: string } } })
    .find((property) => property.node.key?.name === 'render');
}

function bodyOf(expression: Path): Body | undefined {
  if (JSX_ROOTS.has(expression.node.type))
    return { kind: 'expression', node: expression.node, path: expression };
  if (expression.node.type !== 'ObjectExpression') return undefined;

  const render = renderOf(expression);
  if (!render) return undefined;

  const fn = render.node.type === 'ObjectMethod' ? render : single(render.get('value'));
  if (!fn || !RENDER_FUNCTIONS.has(fn.node.type) || fn.node.params?.length) return undefined;

  const body = single(fn.get('body'));
  if (!body) return undefined;
  return body.node.type === 'BlockStatement'
    ? { kind: 'block', node: body.node, path: body }
    : { kind: 'expression', node: body.node, path: body };
}

function freeNamesIn(path: Path) {
  const names = new Set<string>();
  const collect = (inner: Path) => {
    const name = inner.node.name;
    if (!name || !inner.isReferencedIdentifier()) return;
    if (!inner.scope.hasBinding(name, { noGlobals: true })) names.add(name);
  };

  collect(path);
  path.traverse({ ReferencedIdentifier: collect });
  return names;
}

function readBody(source: string) {
  const wrapped = `(${source}\n)`;
  let found: { body: Body; names: Set<string> } | undefined;

  const pickTheRender = () => ({
    visitor: {
      Program(program: Path) {
        const statement = single(program.get('body'));
        const expression = statement && single(statement.get('expression'));
        const body = expression && bodyOf(expression);
        if (body) found = { body, names: freeNamesIn(body.path) };
      },
    },
  });

  try {
    transform(wrapped, {
      filename: 'story.tsx',
      code: false,
      plugins: ['syntax-jsx', ['syntax-typescript', { isTSX: true }], pickTheRender],
    });
  } catch {
    return undefined;
  }

  if (!found) return undefined;
  const text = wrapped.slice(found.body.node.start, found.body.node.end);
  return { kind: found.body.kind, text, names: found.names };
}

const indentOf = (line: string) => line.length - line.trimStart().length;

function dedent(lines: string[]) {
  const written = lines.filter((line) => line.trim());
  const least = written.length ? Math.min(...written.map(indentOf)) : 0;
  return lines.map((line) => line.slice(Math.min(least, indentOf(line))));
}

const indent = (lines: string[], by: string) => lines.map((line) => (line ? by + line : line));

function functionBody(kind: 'expression' | 'block', text: string) {
  const [first = '', ...rest] = text.split('\n');

  if (kind === 'block') {
    const inner = dedent(rest.slice(0, -1));
    return ['{', ...indent(inner, '  '), '}'].join('\n');
  }

  if (!rest.length) return `{\n  return ${first};\n}`;
  const lines = [first, ...dedent(rest)];
  return ['{', '  return (', ...indent(lines, '    '), '  );', '}'].join('\n');
}

const MODULE_ORDER = ['react', '@gsainfoteam/ids-react'];

const byModuleOrder = (a: string, b: string) => {
  const rank = (name: string) => {
    const index = MODULE_ORDER.indexOf(name);
    return index === -1 ? MODULE_ORDER.length : index;
  };
  return rank(a) - rank(b) || a.localeCompare(b);
};

function importLines(names: Set<string>, resolve: ResolveImport) {
  const modules = new Map<string, string[]>();
  let namespaceReact = false;

  for (const name of [...names].sort()) {
    if (name === 'React') {
      namespaceReact = true;
      continue;
    }
    const module = resolve(name);
    if (module === null) continue;
    if (module === undefined) return undefined;
    modules.set(module, [...(modules.get(module) ?? []), name]);
  }

  const lines = [...modules.keys()]
    .sort(byModuleOrder)
    .map((module) => `import { ${modules.get(module)!.join(', ')} } from '${module}';`);
  return namespaceReact ? ["import * as React from 'react';", ...lines] : lines;
}

export function liveModuleFrom(source: string, resolve: ResolveImport) {
  const read = readBody(source.trim());
  if (!read) return undefined;

  const imports = importLines(read.names, resolve);
  if (!imports) return undefined;

  const header = imports.length ? `${imports.join('\n')}\n\n` : '';
  return `${header}export default function Example() ${functionBody(read.kind, read.text)}\n`;
}
