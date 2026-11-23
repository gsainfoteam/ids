import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, test } from 'vitest';

import { buildIr } from '../src/ir/build.ts';
import { IR_SCHEMA_FILE, irJsonSchema } from '../src/ir/write.ts';
import { CONFIG_FILES } from '../src/sources/config.ts';
import { loadSources, SourceError, validated, type Sources } from '../src/sources/load.ts';
import { cssOutputs } from '../src/targets/css/emit.ts';
import { dartOutputs } from '../src/targets/dart/run.ts';
import { tsOutputs } from '../src/targets/ts/emit.ts';

const root = new URL('../', import.meta.url);

const DART_COMPILES_BOTH_STEPS_FIRST = { timeout: 120_000 };

const read = (file: string) => readFileSync(new URL(file, root), 'utf8');

const sources = () => loadSources(root);

const writtenIr = (ir: unknown) => {
  const file = join(mkdtempSync(join(tmpdir(), 'ids-ir-')), 'ir.json');
  writeFileSync(file, JSON.stringify(ir));
  return pathToFileURL(file);
};

const buildWith = async (change: (sources: Sources) => void) => {
  const loaded = await sources();
  change(loaded);
  return () => buildIr(loaded);
};

describe('the IR', () => {
  test('matches the committed JSON Schema', async () => {
    const ir = buildIr(await sources());
    const schema = JSON.parse(read(IR_SCHEMA_FILE));

    expect(schema).toEqual(JSON.parse(JSON.stringify(irJsonSchema())));

    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    expect(validate(JSON.parse(JSON.stringify(ir))), ajv.errorsText(validate.errors)).toBe(true);
  });

  test(
    'gives every generated file the bytes that are committed',
    DART_COMPILES_BOTH_STEPS_FIRST,
    async () => {
      const ir = buildIr(await sources());
      const outputs = {
        ...(await cssOutputs(root, ir)),
        ...(await tsOutputs(root, ir)),
        ...dartOutputs(root, writtenIr(ir)),
      };

      for (const [file, source] of Object.entries(outputs)) expect(source, file).toBe(read(file));
    },
  );

  test('spells a name for every role a target declares', async () => {
    const ir = buildIr(await sources());
    const [role] = ir.color.roles;

    expect(role?.variable.css.customProperty).toBe('--ids-color-bg-base');
    expect(role?.variable.ts.constant).toBe('IDS_COLOR_BG_BASE');
    expect(role?.variable.dart.member).toBe('colorBgBase');
  });

  test('keeps the order tokens are written in', async () => {
    const ir = buildIr(await sources());

    expect(ir.state.tokens.map((token) => token.name.ts.key)).toEqual([
      'hover',
      'press',
      'tint-hover',
      'tint-press',
      'fill-color',
      'fill-hover',
      'fill-press',
    ]);
  });
});

describe('a source error names the file and the key', () => {
  test('in a config file', () => {
    expect(() =>
      validated(CONFIG_FILES.neutralRoles.file, CONFIG_FILES.neutralRoles.schema, { 'bg-base': 0 }),
    ).toThrow(/^config\/neutral-roles\.json: bg-base: /);
  });

  test('for a role that does not exist', async () => {
    const build = await buildWith(({ config }) => {
      config.componentTokens['bg-control-outline'] = {
        light: { role: 'bg-nowhere' },
        dark: { role: 'bg-block' },
      };
    });

    expect(build).toThrow(SourceError);
    expect(build).toThrow(
      'config/component-tokens.json: bg-control-outline.light: bg-nowhere is not a role',
    );
  });

  test('for a slot that does not exist', async () => {
    const build = await buildWith(({ config }) => {
      config.colorRoles.scheme.redirects = [
        { family: 'neutral', from: ['text', '$family'], to: ['text', '$family', 'faint'] },
      ];
    });

    expect(build).toThrow(/^config\/color-roles\.json: scheme\.redirects\.to: /);
  });

  test('for a color whose hex disagrees with its components', async () => {
    const build = await buildWith(({ tokens }) => {
      const token = tokens['state.fill.color'];
      if (token?.$type === 'color')
        tokens['state.fill.color'] = { ...token, $value: { ...token.$value, hex: '#123456' } };
    });

    expect(build).toThrow(/^tokens: state\.fill\.color: hex #123456 does not match/);
  });

  test('for a neutral step the scale does not have', async () => {
    const build = await buildWith(({ config }) => {
      config.neutralRoles['bg-base'] = 10;
    });

    expect(build).toThrow('config/neutral-roles.json: bg-base: step 10 is not in the light scale');
  });
});
