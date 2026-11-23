import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts, { type Node, type SourceFile } from 'typescript';
import { expect, test } from 'vitest';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const PACKAGE = fileURLToPath(new URL('../', import.meta.url));
const PUBLIC_ENTRIES = [
  'index.ts',
  'chart.ts',
  'editor.ts',
  'rich-text.ts',
  'react-hook-form.tsx',
  'tanstack-form.tsx',
];
const CUSTOM_DESIGN = 'custom-design';
const COMPONENTS = `${SRC}components/`;
const PUBLIC_PACKAGE = /^@gsainfoteam\/ids-react(\/|$)/;
const DATA_VARIANT = /(^|[\s"'`])(?:[\w-]+:)*(?:group-|peer-|in-)?data-(?:\[[^\]]+\]|[a-z][\w-]*):/;
const DATA_ATTRIBUTE_TABLE_ROW = /^\|\s*`data-[\w-]+/;
const PUBLIC_DOCS = /^(components|blocks|foundations|overview)\//;
const CODE_FENCE = /^```(tsx|jsx)([^\n]*)\n([\s\S]*?)^```/gm;
const CLASSES_A_PART_DOCUMENTS = [{ tag: 'Card.Header', value: '"border-b"' }];

const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' }).sort();
const storyFiles = files.filter((file) => file.endsWith('.stories.tsx'));
const readmes = [
  ...files
    .filter((file) => file.endsWith('README.md') && PUBLIC_DOCS.test(file))
    .map((file) => SRC + file),
  `${PACKAGE}README.md`,
];

const publicNames = new Set(
  PUBLIC_ENTRIES.flatMap((entry) =>
    [...readFileSync(SRC + entry, 'utf8').matchAll(/export (?:type )?\{([^}]*)\}/g)].flatMap(
      (match) =>
        match[1]!
          .split(',')
          .map((part) =>
            part
              .trim()
              .replace(/^type\s+/, '')
              .split(/\s+as\s+/)
              .pop()!,
          )
          .filter((name) => /^[A-Z]/.test(name)),
    ),
  ),
);

const ENTRY_MODULES = new Set(PUBLIC_ENTRIES.map((entry) => SRC + entry.replace(/\.tsx?$/, '')));

const importsIds = (specifier: string, directory: string) =>
  PUBLIC_PACKAGE.test(specifier) ||
  (specifier.startsWith('.') &&
    (resolve(directory, specifier).startsWith(COMPONENTS) ||
      ENTRY_MODULES.has(resolve(directory, specifier))));

function idsNamesImportedBy(source: SourceFile, directory: string) {
  const names = new Set<string>();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
    if (!importsIds(statement.moduleSpecifier.text, directory)) continue;
    const clause = statement.importClause;
    if (!clause || clause.isTypeOnly) continue;
    if (clause.name) names.add(clause.name.text);
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) names.add(element.name.text);
    }
  }
  return names;
}

function tagsOfTheEnclosingObject(node: Node, source: SourceFile) {
  for (let current: Node | undefined = node; current; current = current.parent) {
    if (!ts.isVariableDeclaration(current) || !current.initializer) continue;
    const initializer = ts.isSatisfiesExpression(current.initializer)
      ? current.initializer.expression
      : current.initializer;
    if (!ts.isObjectLiteralExpression(initializer)) continue;
    const tags = initializer.properties.find(
      (property) => property.name?.getText(source) === 'tags',
    );
    return tags?.getText(source) ?? '';
  }
  return '';
}

function metaTags(source: SourceFile) {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name.getText(source) === 'meta') {
        return tagsOfTheEnclosingObject(declaration, source);
      }
    }
  }
  return '';
}

type Scan = {
  file: string;
  code: string;
  firstLine: number;
  idsNames: Set<string>;
  fenceInfo?: string;
};

function usageProblems({ file, code, firstLine, idsNames, fenceInfo }: Scan) {
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const ids = new Set([...idsNames, ...idsNamesImportedBy(source, dirname(PACKAGE + file))]);
  const isStory = fenceInfo === undefined;
  const fileIsCustomDesign = isStory && metaTags(source).includes(CUSTOM_DESIGN);
  const isCustomDesign = (node: Node) =>
    isStory
      ? fileIsCustomDesign || tagsOfTheEnclosingObject(node, source).includes(CUSTOM_DESIGN)
      : fenceInfo.includes(CUSTOM_DESIGN);
  const lineOf = (node: Node) =>
    firstLine + source.getLineAndCharacterOfPosition(node.getStart(source)).line;
  const problems: string[] = [];

  const visit = (node: Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source);
      if (ids.has(tag.split('.')[0]!)) {
        for (const attribute of node.attributes.properties) {
          if (!ts.isJsxAttribute(attribute)) continue;
          const name = attribute.name.getText(source);
          if (name !== 'className' && name !== 'style') continue;
          const value = attribute.initializer?.getText(source) ?? '';
          const documented = CLASSES_A_PART_DOCUMENTS.some(
            (allowed) => allowed.tag === tag && allowed.value === value,
          );
          if (documented || isCustomDesign(node)) continue;
          problems.push(`${file}:${lineOf(attribute)} <${tag} ${name}=${value.slice(0, 60)}>`);
        }
      }
    }
    if (isStory && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))) {
      if (DATA_VARIANT.test(node.text) && !isCustomDesign(node)) {
        problems.push(`${file}:${lineOf(node)} data-* variant in "${node.text.slice(0, 60)}"`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return problems;
}

function readmeProblems(path: string) {
  const file = path.replace(PACKAGE, '');
  const text = readFileSync(path, 'utf8');
  const lineAt = (index: number) => text.slice(0, index).split('\n').length;
  const tableRows = text
    .split('\n')
    .flatMap((line, index) =>
      DATA_ATTRIBUTE_TABLE_ROW.test(line) ? [`${file}:${index + 1} data attribute table row`] : [],
    );
  const samples = [...text.matchAll(CODE_FENCE)].flatMap((match) =>
    usageProblems({
      file,
      code: match[3]!,
      firstLine: lineAt(match.index!) + 1,
      idsNames: publicNames,
      fenceInfo: match[2]!,
    }),
  );
  return [...tableRows, ...samples];
}

test('stories and blocks give IDS components no className, style or data-* variant', () => {
  const problems = storyFiles.flatMap((file) =>
    usageProblems({
      file: `src/${file}`,
      code: readFileSync(SRC + file, 'utf8'),
      firstLine: 1,
      idsNames: new Set(),
    }),
  );
  expect(problems).toEqual([]);
});

test('READMEs have no data attribute table and their samples give IDS components no className or style', () => {
  expect(readmes.flatMap(readmeProblems)).toEqual([]);
});

test('the scan recognises IDS components', () => {
  expect(publicNames).toContain('Button');
  expect(publicNames).toContain('Card');
  expect(
    usageProblems({
      file: 'src/blocks/sample.stories.tsx',
      code: 'import { Button } from \'~story-kit\';\nconst a = <Button className="w-full" />;',
      firstLine: 1,
      idsNames: new Set(),
    }),
  ).toEqual([]);
  expect(
    usageProblems({
      file: 'src/blocks/login/sample.stories.tsx',
      code: 'import { Button } from \'../../components/action/button\';\nconst a = <Button className="w-full" />;',
      firstLine: 1,
      idsNames: new Set(),
    }),
  ).toHaveLength(1);
});
