import ts from 'typescript';

import { GENERATED_HEADER, isIdentifier, STATEMENT_SEPARATOR } from './literals.ts';

const { factory } = ts;

export type Expression = ts.Expression;

export const string = (value: string) =>
  ts.setEmitFlags(factory.createStringLiteral(value, true), ts.EmitFlags.NoAsciiEscaping);

export const number = (value: number): Expression =>
  value < 0
    ? factory.createPrefixUnaryExpression(
        ts.SyntaxKind.MinusToken,
        factory.createNumericLiteral(Math.abs(value)),
      )
    : factory.createNumericLiteral(value);

export const array = (items: readonly Expression[]) =>
  factory.createArrayLiteralExpression([...items], false);

export const strings = (values: readonly string[]) => array(values.map(string));

const propertyName = (key: string) =>
  isIdentifier(key) ? factory.createIdentifier(key) : string(key);

type Entries = readonly (readonly [string, Expression])[];

const properties = (entries: Entries) =>
  entries.map(([key, value]) => factory.createPropertyAssignment(propertyName(key), value));

export const record = (entries: Entries) =>
  factory.createObjectLiteralExpression(properties(entries), true);

export const inlineRecord = (entries: Entries) =>
  factory.createObjectLiteralExpression(properties(entries), false);

const asConst = (expression: Expression) =>
  factory.createAsExpression(expression, factory.createTypeReferenceNode('const'));

const exported = [factory.createModifier(ts.SyntaxKind.ExportKeyword)];

export const exportConst = (name: string, value: Expression, { readonly = true } = {}) =>
  factory.createVariableStatement(
    exported,
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          name,
          undefined,
          undefined,
          readonly ? asConst(value) : value,
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );

export const exportUnion = (name: string, values: readonly string[]) =>
  factory.createTypeAliasDeclaration(
    exported,
    name,
    undefined,
    factory.createUnionTypeNode(
      values.map((value) => factory.createLiteralTypeNode(string(value))),
    ),
  );

export const call = (callee: string, args: readonly Expression[]) =>
  factory.createCallExpression(factory.createIdentifier(callee), undefined, [...args]);

export const importNamed = (names: readonly string[], from: string) =>
  factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports(
        names.map((name) =>
          factory.createImportSpecifier(false, undefined, factory.createIdentifier(name)),
        ),
      ),
    ),
    string(from),
  );

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

const sourceFile = ts.createSourceFile(
  'module.ts',
  '',
  ts.ScriptTarget.Latest,
  false,
  ts.ScriptKind.TS,
);

export const moduleSource = (statements: readonly ts.Statement[]) =>
  [
    GENERATED_HEADER,
    ...statements.map((statement) =>
      printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile),
    ),
  ].join(STATEMENT_SEPARATOR);
