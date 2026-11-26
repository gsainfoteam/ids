import type { Ir, Name } from '../../ir/schema.ts';
import { SourceError } from '../../sources/load.ts';
import { shadowValue } from '../css/emit.ts';
import { serialize } from '../css/values.ts';
import { formatted, outputOf, writeFormatted } from '../output.ts';
import { messageModules } from './messages.ts';
import {
  array,
  exportConst,
  exportUnion,
  inlineRecord,
  moduleSource,
  number,
  record,
  string,
  strings,
} from './nodes.ts';

const OUTPUTS = ['types', 'colorRoles', 'componentTokens', 'paletteModel'] as const;

type Module = (typeof OUTPUTS)[number];

function symbolsOf(ir: Ir) {
  return (symbol: string) => {
    const name: Name | undefined = ir.targets.ts.symbols[symbol];
    if (!name) throw new SourceError(`config/targets.json: targets.ts.symbols.${symbol}: missing`);
    return name.ts.constant;
  };
}

const modeKeys = (ir: Ir) => ir.modes.map((mode) => mode.name.css.identifier);

const MODULES: Record<Module, (ir: Ir) => string> = {
  types: (ir) =>
    moduleSource(
      ir.enums.map((entry) =>
        exportUnion(
          entry.name.ts.type,
          entry.ts.map((value) => value.ts.key),
        ),
      ),
    ),

  colorRoles: (ir) => {
    const symbol = symbolsOf(ir);
    const { color, state } = ir;
    const opacities = state.tokens.flatMap((token) =>
      token.kind === 'opacity' ? [[token.name.ts.member, number(token.ratio)] as const] : [],
    );
    const [fill] = state.tokens.flatMap((token) => (token.kind === 'color' ? [token.color] : []));
    if (!fill) throw new SourceError('ir: state has no fill color');
    return moduleSource([
      ...color.familyGroups.map((group) =>
        exportConst(group.list.ts.constant, strings(group.families)),
      ),
      exportConst(
        symbol('colorFamilies'),
        strings(color.families.map((family) => family.css.identifier)),
      ),
      exportConst(symbol('familySlots'), strings(color.slots.map((slot) => slot.template.key))),
      exportConst(
        symbol('neutralOnlySlots'),
        strings(color.slots.filter((slot) => slot.neutralOnly).map((slot) => slot.template.key)),
      ),
      exportConst(symbol('stateOpacity'), record(opacities)),
      exportConst(symbol('stateFillColor'), string(fill.hex), { readonly: false }),
      exportConst(
        symbol('neutralScales'),
        record(
          color.neutralScales.map(({ mode, steps }) => [
            mode,
            strings(steps.map((step) => step.hex)),
          ]),
        ),
      ),
      exportConst(
        symbol('neutralSteps'),
        record(color.neutralSteps.map(({ role, step }) => [role, number(step)])),
      ),
    ]);
  },

  componentTokens: (ir) => {
    const symbol = symbolsOf(ir);
    const modes = modeKeys(ir);
    const byMode = <Entry extends { mode: string }>(
      entries: readonly Entry[],
      value: (entry: Entry) => string,
    ) =>
      inlineRecord(
        modes.map((mode) => {
          const entry = entries.find((candidate) => candidate.mode === mode);
          if (!entry) throw new SourceError(`ir: nothing for mode ${mode}`);
          return [mode, string(value(entry))];
        }),
      );
    return moduleSource([
      exportConst(
        symbol('shadows'),
        record(
          ir.shadows.map((shadow) => [
            shadow.name.css.identifier,
            string(serialize(shadowValue(shadow.layers))),
          ]),
        ),
      ),
      exportConst(
        symbol('componentColors'),
        record(
          ir.componentColors.map((token) => [
            token.name.css.identifier,
            byMode(token.modes, (entry) => entry.role),
          ]),
        ),
      ),
      exportConst(
        symbol('componentShadows'),
        record(
          ir.componentShadows.map((token) => [
            token.name.css.identifier,
            byMode(token.modes, (entry) => entry.shadow),
          ]),
        ),
      ),
    ]);
  },

  paletteModel: (ir) => {
    const symbol = symbolsOf(ir);
    const { paletteModel } = ir;
    return moduleSource([
      exportConst(
        symbol('paletteModel'),
        record(
          paletteModel.series.map((series) => [
            series.name.ts.member,
            array(series.coefficients.map((row) => array(row.map(number)))),
          ]),
        ),
      ),
      exportConst(
        symbol('statusPalettes'),
        record(
          paletteModel.statusPalettes.map((palette) => [
            palette.name.css.identifier,
            strings(palette.colors.map((color) => color.hex)),
          ]),
        ),
      ),
    ]);
  },
};

const modulesOf = (root: URL, ir: Ir) => [
  ...OUTPUTS.map((module) => [outputOf(root, ir, 'ts', module), MODULES[module](ir)] as const),
  ...messageModules(root, ir),
];

export async function tsOutputs(root: URL, ir: Ir) {
  return Object.fromEntries(
    await Promise.all(
      modulesOf(root, ir).map(
        async ([output, source]) => [output.path, await formatted(output, source)] as const,
      ),
    ),
  );
}

export async function writeTs(root: URL, ir: Ir) {
  await Promise.all(modulesOf(root, ir).map(([output, source]) => writeFormatted(output, source)));
}
