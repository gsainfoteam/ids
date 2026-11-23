import type { Dimension, Ir, LineHeight, Name } from '../ir/schema.ts';

interface LegacyToken {
  path: string[];
  $value: unknown;
  $type: string;
  attributes: { category: string };
  filePath: string;
}

const dimension = ({ value, unit }: Dimension) => `${value}${unit}`;

const lineHeight = (value: LineHeight) =>
  value.kind === 'length' ? dimension(value.length) : value.multiplier;

const token = (
  category: string,
  segments: readonly string[],
  $type: string,
  $value: unknown,
): LegacyToken => ({
  path: [category, ...segments],
  $value,
  $type,
  attributes: { category },
  filePath: `tokens/${category}.json`,
});

function dictionary(ir: Ir) {
  const { typography } = ir;
  const allTokens = [
    ...ir.enums.map((entry) =>
      token(
        'ids',
        [entry.name.css.identifier, 'values'],
        'other',
        entry.ts.map((value) => value.css.identifier),
      ),
    ),
    ...ir.motion.map((entry) =>
      token('motion', entry.name.segments, 'duration', `${entry.milliseconds}ms`),
    ),
    ...ir.color.neutralScales.flatMap(({ mode, steps }) =>
      steps.map((color, index) => token('neutral', [mode, String(index + 1)], 'color', color.hex)),
    ),
    ...ir.radius.map((entry) =>
      token('radius', entry.name.segments, 'dimension', dimension(entry.value)),
    ),
    ...ir.size.map((entry) =>
      token('size', entry.name.segments, 'dimension', dimension(entry.value)),
    ),
    ...ir.spacing.map((entry) =>
      token('spacing', entry.name.segments, 'dimension', dimension(entry.value)),
    ),
    ...ir.state.tokens.map((entry) =>
      entry.kind === 'opacity'
        ? token('state', entry.name.segments, 'number', `${entry.percent}%`)
        : token('state', entry.name.segments, 'color', entry.color.hex),
    ),
    ...typography.fontSizes.map((entry) =>
      token('font-size', entry.name.segments, 'dimension', dimension(entry.value)),
    ),
    ...typography.fontWeights.map((entry) =>
      token('font-weight', entry.name.segments, 'fontWeight', entry.value),
    ),
    ...typography.lineHeights.map((entry) =>
      token(
        'line-height',
        entry.name.segments,
        entry.value.kind === 'length' ? 'dimension' : 'number',
        lineHeight(entry.value),
      ),
    ),
    ...typography.letterSpacings.map((entry) =>
      token('letter-spacing', entry.name.segments, 'dimension', dimension(entry.value)),
    ),
    ...typography.fontFamilies.map((entry) =>
      token('font-family', entry.name.segments, 'fontFamily', entry.stack),
    ),
    ...typography.fontSizeAdjusts.map((entry) =>
      token('font-size-adjust', entry.name.segments, 'number', entry.value),
    ),
  ];
  return { allTokens };
}

const roleKey = (name: Name) => name.css.identifier;

function colorRoles(ir: Ir) {
  const { color } = ir;
  const placeholder = ir.placeholders.family;
  const slotName = (key: string, property: string) => key.slice(property.length + 1);
  const properties = [...new Set(color.slots.map((slot) => slot.property))];
  const namespaceOf = (property: string) => {
    const role = color.roles.find((entry) => entry.property === property);
    if (!role) return [];
    const suffix = role.name.segments.length - 1;
    return role.tailwind.map((name) =>
      ['', '', ...name.segments.slice(0, name.segments.length - suffix)].join('-'),
    );
  };
  const neutralRedirects = Object.fromEntries(
    color.scheme.roles.flatMap((role) => {
      const target = role.targets.find((entry) => entry.family === 'neutral');
      const expected = role.slot.replaceAll(placeholder, 'neutral');
      if (!target || target.role === expected) return [];
      const [property] = role.slot.split('-');
      const redirected = color.slots.find(
        (slot) => slot.template.key.replaceAll(placeholder, 'neutral') === target.role,
      );
      return redirected && property ? [[role.slot, redirected.template.key]] : [];
    }),
  );
  return {
    families: Object.fromEntries(
      color.familyGroups.map((group) => [roleKey(group.name), group.families]),
    ),
    slots: Object.fromEntries(
      properties.map((property) => [
        property,
        color.slots
          .filter((slot) => slot.property === property)
          .map((slot) => slotName(slot.template.key, property)),
      ]),
    ),
    scheme: { neutral: neutralRedirects },
    neutralOnly: color.slots.filter((slot) => slot.neutralOnly).map((slot) => slot.template.key),
    namespaces: Object.fromEntries(properties.map((property) => [property, namespaceOf(property)])),
  };
}

const shadowLayer = (layer: Ir['shadows'][number]['layers'][number]) => ({
  x: layer.offsetX.value,
  y: layer.offsetY.value,
  blur: layer.blur.value,
  spread: layer.spread.value,
  color: layer.color.hex,
});

function tokenFiles(ir: Ir) {
  return {
    'shadow.json': {
      shadow: Object.fromEntries(
        ir.shadows.map((shadow) => [
          shadow.name.css.identifier,
          { $value: shadow.layers.map(shadowLayer) },
        ]),
      ),
    },
    'component.json': {
      component: Object.fromEntries([
        ...ir.componentShadows.map((entry) => [
          roleKey(entry.name),
          {
            $type: 'component',
            $value: Object.fromEntries(
              entry.modes.map(({ mode, shadow }) => [mode, `{shadow.${shadow}}`]),
            ),
          },
        ]),
        ...ir.componentColors.map((entry) => [
          roleKey(entry.name),
          {
            $type: 'component',
            $value: Object.fromEntries(entry.modes.map(({ mode, role }) => [mode, role])),
          },
        ]),
      ]),
    },
  };
}

const typographyEntries = (ir: Ir) =>
  ir.typography.textStyles.map((style) => ({
    name: style.name.css.identifier,
    fontSize: dimension(style.fontSize),
    fontWeight: style.fontWeight,
    lineHeight: lineHeight(style.lineHeight),
    letterSpacing: dimension(style.letterSpacing),
  }));

export function legacyInputs(ir: Ir) {
  return {
    jsDictionary: dictionary(ir),
    neutralRoleSteps: Object.fromEntries(
      ir.color.neutralSteps.map(({ role, step }) => [role, step]),
    ),
    typographyEntries: typographyEntries(ir),
    colorRoles: colorRoles(ir),
    tokenFiles: tokenFiles(ir),
  };
}

export function legacyPaletteModel(ir: Ir) {
  return {
    model: Object.fromEntries(
      ir.paletteModel.series.map((series) => [series.name.ts.member, series.coefficients]),
    ),
    statusPalettes: ir.paletteModel.statusPalettes.map((palette) => ({
      name: palette.name.css.identifier,
      hexes: palette.colors.map((color) => color.hex),
    })),
  };
}
