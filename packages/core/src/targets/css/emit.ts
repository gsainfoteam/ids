import { readFileSync } from 'node:fs';

import { uniq } from 'es-toolkit/array';
import postcss, { type ChildNode } from 'postcss';

import type { Dimension, Ir, Name } from '../../ir/schema.ts';
import { SourceError } from '../../sources/load.ts';
import { formatted, outputOf, writeFormatted } from '../output.ts';
import {
  color,
  customVariantShorthand,
  dimension,
  fontFamily,
  functionalUtility,
  keyword,
  lengthOrZero,
  lineHeight,
  milliseconds,
  NEUTRAL_FACTOR,
  NO_SHADOW_THAT_STILL_COMPOSES,
  number,
  percent,
  pseudoClass,
  THEME_INLINE,
  UTILITIES_LAYER,
} from './literals.ts';
import {
  attribute,
  className,
  compound,
  descendant,
  nesting,
  PSEUDO,
  pseudo,
  selectorList,
  universal,
} from './selectors.ts';
import { call, commas, product, serialize, spaced, variable, type Value } from './values.ts';

const STYLESHEET = 'stylesheet';

const STATIC_DIRECTORY = new URL('static/', import.meta.url);

type Typography = Ir['typography'];

const staticCss = (file: string): ChildNode[] =>
  postcss.parse(readFileSync(new URL(file, STATIC_DIRECTORY), 'utf8')).nodes;

const declaration = (property: string, value: Value) =>
  postcss.decl({ prop: property, value: serialize(value) });

const rule = (selector: string, nodes: ChildNode[]) => postcss.rule({ selector, nodes });

const atRule = (name: string, params: string, nodes?: ChildNode[]) =>
  postcss.atRule({ name, params, ...(nodes ? { nodes } : {}) });

const themeInline = (nodes: ChildNode[]) => atRule('theme', THEME_INLINE, nodes);

const reference = (name: Name) => variable(name.css.customProperty);

const bridge = (entry: { tailwind: readonly Name[]; variable: Name }) =>
  entry.tailwind.map((tailwind) =>
    declaration(tailwind.css.themeProperty, reference(entry.variable)),
  );

function lookups(ir: Ir) {
  const find =
    <Entry extends { name: Name }>(what: string, entries: readonly Entry[]) =>
    (key: string) => {
      const entry = entries.find((candidate) => candidate.name.css.identifier === key);
      if (!entry) throw new SourceError(`ir: no ${what} ${key}`);
      return entry;
    };
  return {
    role: find('role', ir.color.roles),
    state: find('state token', ir.state.tokens),
    shadow: find('shadow', ir.shadows),
  };
}

function colorBridge(ir: Ir) {
  return [
    themeInline([
      ...ir.color.roles.flatMap(bridge),
      ...ir.color.scheme.roles.flatMap(bridge),
      ...ir.componentColors.flatMap(bridge),
      ...ir.componentShadows.flatMap(bridge),
    ]),
  ];
}

const shadowValue = (layers: Ir['shadows'][number]['layers']) =>
  layers.length === 0
    ? NO_SHADOW_THAT_STILL_COMPOSES
    : commas(
        ...layers.map((layer) =>
          spaced(
            lengthOrZero(layer.offsetX),
            lengthOrZero(layer.offsetY),
            lengthOrZero(layer.blur),
            lengthOrZero(layer.spread),
            color(layer.color),
          ),
        ),
      );

function staticTokens(ir: Ir) {
  const dimensionDeclaration = (token: { variable: Name; value: Dimension }) =>
    declaration(token.variable.css.customProperty, dimension(token.value));
  return [
    rule(':root', [
      ...ir.motion.map((token) =>
        declaration(token.variable.css.customProperty, milliseconds(token.milliseconds)),
      ),
      ...ir.radius.map(dimensionDeclaration),
      ...ir.size.map(dimensionDeclaration),
      ...ir.state.tokens.map((token) =>
        declaration(
          token.variable.css.customProperty,
          token.kind === 'opacity' ? percent(token.percent) : color(token.color),
        ),
      ),
      ...ir.shadows.map((shadow) =>
        declaration(shadow.variable.css.customProperty, shadowValue(shadow.layers)),
      ),
    ]),
    themeInline(ir.radius.flatMap(bridge)),
  ];
}

function modeSelector(ir: Ir, mode: string) {
  return attribute(ir.css.attributes.mode, mode);
}

function modeVariants(ir: Ir) {
  return ir.css.modeVariants.map(({ name, mode, others }) => {
    const region = (...inside: string[]) => {
      const path = [mode, ...inside].flatMap((entry, index) =>
        index === 0 ? [modeSelector(ir, entry)] : [descendant(), modeSelector(ir, entry)],
      );
      return [
        compound(...path),
        compound(...path.map((node) => node.clone()), descendant(), universal()),
      ];
    };
    const selector = compound(
      nesting(),
      pseudo(PSEUDO.where, ...region()),
      pseudo(
        PSEUDO.not,
        compound(pseudo(PSEUDO.where, ...others.flatMap((other) => region(other)))),
      ),
    );
    return atRule(
      'custom-variant',
      customVariantShorthand(name.css.identifier, selectorList(selector)),
    );
  });
}

function focusRingTrigger(ir: Ir, trigger: Ir['css']['focusRing']['triggers'][number]) {
  if (trigger.kind === 'pseudo') return compound(nesting(), pseudo(pseudoClass(trigger.pseudo)));
  if (trigger.kind === 'attribute')
    return compound(
      nesting(),
      attribute(trigger.attribute),
      ...(trigger.unlessPseudo
        ? [pseudo(PSEUDO.not, compound(pseudo(pseudoClass(trigger.unlessPseudo))))]
        : []),
    );
  const focusedInside = (...scope: ReturnType<typeof attribute>[]) =>
    pseudo(
      PSEUDO.has,
      compound(
        ...scope.flatMap((node) => [node, descendant()]),
        attribute(trigger.attribute),
        pseudo(PSEUDO.focusVisible),
      ),
    );
  return compound(
    nesting(),
    focusedInside(),
    pseudo(PSEUDO.not, compound(focusedInside(attribute(trigger.exceptIn)))),
  );
}

function variants(ir: Ir) {
  const { focusRing } = ir.css;
  return [
    ...modeVariants(ir),
    atRule('custom-variant', focusRing.variant, [
      rule(selectorList(...focusRing.triggers.map((trigger) => focusRingTrigger(ir, trigger))), [
        atRule('slot', ''),
      ]),
    ]),
  ];
}

function schemeUtilities(ir: Ir) {
  const find = lookups(ir);
  const { scheme } = ir.color;
  return scheme.utilities.map((utility) => {
    const target = (role: (typeof scheme.roles)[number]) => {
      const entry = role.targets.find(({ family }) => family === utility.family);
      if (!entry) throw new SourceError(`ir: scheme ${role.slot} has no ${utility.family}`);
      return find.role(entry.role).variable;
    };
    const { layer } = utility;
    return atRule('utility', utility.name.css.identifier, [
      ...scheme.roles.map((role) =>
        declaration(role.variable.css.customProperty, reference(target(role))),
      ),
      declaration(
        layer.variable.css.customProperty,
        layer.color.kind === 'role'
          ? reference(find.role(layer.color.role).variable)
          : keyword(layer.color.keyword),
      ),
      declaration(
        layer.hover.variable.css.customProperty,
        reference(find.state(layer.hover.opacity).variable),
      ),
      declaration(
        layer.press.variable.css.customProperty,
        reference(find.state(layer.press.opacity).variable),
      ),
    ]);
  });
}

function concentric(ir: Ir) {
  const { concentric: config, attributes } = ir.css;
  const { pads } = config;
  const withinPopovers = (depth: number) => {
    const path = Array.from({ length: depth }, (_, index) =>
      index === 0 ? [attribute(attributes.popover)] : [descendant(), attribute(attributes.popover)],
    ).flat();
    return [
      compound(...path),
      compound(...path.map((node) => node.clone()), descendant(), universal()),
    ];
  };
  const chains = [
    ...pads.map((only) => ({ sum: only.pad, nodes: () => [className(only.className)] })),
    ...pads.flatMap((outer) =>
      pads.map((inner) => ({
        sum: outer.pad + inner.pad,
        nodes: () => [
          pseudo(PSEUDO.where, compound(className(outer.className))),
          descendant(),
          className(inner.className),
        ],
      })),
    ),
  ];
  const sums = uniq(chains.map((chain) => chain.sum)).toSorted((a, b) => a - b);
  const nestedAt = (depth: number) =>
    sums.map((sum) =>
      rule(
        selectorList(
          compound(
            attribute('class', config.classPrefix, '*='),
            ...(depth === 0 ? [] : [pseudo(PSEUDO.is, ...withinPopovers(depth))]),
            pseudo(
              PSEUDO.has,
              ...chains
                .filter((chain) => chain.sum === sum)
                .map((chain) =>
                  compound(...chain.nodes(), pseudo(PSEUDO.not, ...withinPopovers(depth + 1))),
                ),
            ),
          ),
        ),
        [
          declaration(
            config.nested.css.customProperty,
            call('calc', product(variable(config.spacing.css.themeProperty), number(sum))),
          ),
        ],
      ),
    );
  return [
    ...staticCss('concentric-properties.css'),
    atRule(
      'utility',
      functionalUtility(config.utility.css.identifier),
      staticCss('concentric-utility.css'),
    ),
    atRule(
      'layer',
      UTILITIES_LAYER,
      Array.from({ length: config.overlayDepths }, (_, depth) => nestedAt(depth)).flat(),
    ),
  ];
}

const TYPOGRAPHY_VALUES: {
  [Group in keyof Omit<Typography, 'textStyles'>]: (token: Typography[Group][number]) => Value;
} = {
  fontSizes: (token) => dimension(token.value),
  fontWeights: (token) => number(token.value),
  lineHeights: (token) => lineHeight(token.value),
  letterSpacings: (token) => dimension(token.value),
  fontFamilies: (token) => commas(...token.stack.map(fontFamily)),
  fontSizeAdjusts: (token) => number(token.value),
};

const TEXT_STYLE_VALUES: Record<
  Typography['textStyles'][number]['parts'][number]['part'],
  (style: Typography['textStyles'][number]) => Value
> = {
  fontSize: (style) => dimension(style.fontSize),
  fontWeight: (style) => number(style.fontWeight),
  lineHeight: (style) => lineHeight(style.lineHeight),
  letterSpacing: (style) => dimension(style.letterSpacing),
};

function typographyTokens<Group extends keyof typeof TYPOGRAPHY_VALUES>(
  typography: Typography,
  group: Group,
) {
  const value = TYPOGRAPHY_VALUES[group] as (token: Typography[Group][number]) => Value;
  return typography[group].map((token: Typography[Group][number]) => ({
    token,
    value: value(token),
  }));
}

function typography(ir: Ir) {
  const { textStyles } = ir.typography;
  const groups = ir.css.typographyOrder.flatMap((group) => typographyTokens(ir.typography, group));
  return [
    rule(':root', [
      ...textStyles.flatMap((style) =>
        style.parts.map((part) =>
          declaration(part.variable.css.customProperty, TEXT_STYLE_VALUES[part.part](style)),
        ),
      ),
      ...groups.map(({ token, value }) => declaration(token.variable.css.customProperty, value)),
    ]),
    themeInline([
      ...textStyles.flatMap((style) => style.parts.flatMap(bridge)),
      ...groups.flatMap(({ token }) => bridge(token)),
    ]),
  ];
}

function scale(ir: Ir) {
  const { scale: config, attributes } = ir.css;
  const scaled = (value: Value) =>
    call(
      'calc',
      product(value, variable(config.factor.css.customProperty, number(NEUTRAL_FACTOR))),
    );
  const toWholePixels = (value: Value) =>
    call('round', scaled(value), dimension(config.wholePixel));
  return [
    rule(
      selectorList(compound(attribute(attributes.mode))),
      config.providerRadius.map((entry) =>
        declaration(
          entry.variable.css.customProperty,
          toWholePixels(
            product(
              variable(entry.provider.css.customProperty, dimension(entry.fallback)),
              variable(config.cornerRadiusScale.css.customProperty, number(NEUTRAL_FACTOR)),
            ),
          ),
        ),
      ),
    ),
    rule(selectorList(compound(attribute(attributes.scale))), [
      declaration(config.spacing.css.themeProperty, scaled(dimension(config.spacingUnit))),
      ...config.lengths.map((entry) =>
        declaration(entry.variable.css.customProperty, toWholePixels(dimension(entry.value))),
      ),
    ]),
  ];
}

function modeRoles(ir: Ir) {
  const find = lookups(ir);
  return ir.modes.map(({ name }) => {
    const mode = name.css.identifier;
    const pick = <Entry extends { mode: string }>(entries: readonly Entry[]) => {
      const entry = entries.find((candidate) => candidate.mode === mode);
      if (!entry) throw new SourceError(`ir: nothing for mode ${mode}`);
      return entry;
    };
    return rule(selectorList(compound(modeSelector(ir, mode))), [
      ...ir.color.roles.map((role) => {
        const theme = pick(role.theme);
        return declaration(
          role.variable.css.customProperty,
          variable(
            theme.variable.css.customProperty,
            theme.fallback ? color(theme.fallback) : undefined,
          ),
        );
      }),
      ...ir.componentColors.map((token) =>
        declaration(
          token.variable.css.customProperty,
          reference(find.role(pick(token.modes).role).variable),
        ),
      ),
      ...ir.componentShadows.map((token) =>
        declaration(
          token.variable.css.customProperty,
          reference(find.shadow(pick(token.modes).shadow).variable),
        ),
      ),
    ]);
  });
}

const NEW_LINE = '\n';

const BLANK_LINE = '\n\n';

export function stylesheet(ir: Ir) {
  const nodes = [
    ...colorBridge(ir),
    ...staticTokens(ir),
    ...staticCss('animations.css'),
    ...staticCss('animations-reading-variables.css'),
    ...variants(ir),
    ...staticCss('utilities.css'),
    ...schemeUtilities(ir),
    ...concentric(ir),
    ...typography(ir),
    ...staticCss('corner-shape.css'),
    ...staticCss('background-underneath.css'),
    ...scale(ir),
    ...staticCss('registered-lengths.css'),
    ...staticCss('state-layer-properties.css'),
    ...modeRoles(ir),
  ];
  const sheet = postcss.root({ nodes });
  sheet.walk((node) => {
    node.raws.before ??= NEW_LINE;
  });
  sheet.nodes.forEach((node, index) => {
    node.raws.before = index === 0 ? '' : BLANK_LINE;
  });
  return sheet.toString();
}

export async function cssOutputs(root: URL, ir: Ir) {
  const output = outputOf(root, ir, 'css', STYLESHEET);
  return { [output.path]: await formatted(output, stylesheet(ir)) };
}

export async function writeCss(root: URL, ir: Ir) {
  await writeFormatted(outputOf(root, ir, 'css', STYLESHEET), stylesheet(ir));
}
