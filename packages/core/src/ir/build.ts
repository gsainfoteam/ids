import type {
  ColorValueNormalized,
  DimensionValue,
  TokenNormalized,
  TokenNormalizedSet,
} from '@terrazzo/parser';
import { Decimal } from 'decimal.js';
import { uniq } from 'es-toolkit/array';
import { posix } from 'node:path';
import * as v from 'valibot';

import {
  FAMILY_PLACEHOLDER,
  TEXT_STYLE_PARTS,
  type CssConfig,
  type TargetsConfig,
} from '../sources/config.ts';
import { SourceError, type Sources } from '../sources/load.ts';
import { buildMessages } from './messages.ts';
import { createNaming, type Naming, type Segments } from './naming.ts';
import {
  IR_VERSION,
  IrSchema,
  type Color,
  type Dimension,
  type DimensionToken,
  type Ir,
  type LineHeight,
} from './schema.ts';

export const MODE_ENUM = 'mode';

type TokenOf<Type extends TokenNormalized['$type']> = Extract<TokenNormalized, { $type: Type }>;

interface Entry<Type extends TokenNormalized['$type']> {
  path: string[];
  token: TokenOf<Type>;
}

const idPath = (id: string) => id.split('.');

const segmentsOf = (path: readonly string[]) => path.flatMap((part) => part.split('-'));

function tokensIn<Type extends TokenNormalized['$type']>(
  tokens: TokenNormalizedSet,
  group: Segments,
  types: readonly Type[],
): Entry<Type>[] {
  const entries = Object.values(tokens)
    .map((token) => ({ path: idPath(token.id), token }))
    .filter(({ path }) => group.every((part, index) => path[index] === part))
    .map(({ path, token }) => ({ path: path.slice(group.length), token }));

  if (entries.length === 0) throw new SourceError(`tokens: no tokens under "${group.join('.')}"`);

  for (const { token } of entries)
    if (!types.includes(token.$type as Type))
      throw new SourceError(
        `tokens: ${token.id}: expected $type ${types.join(' or ')}, got ${token.$type}`,
      );

  return entries as Entry<Type>[];
}

function tokenAt<Type extends TokenNormalized['$type']>(
  tokens: TokenNormalizedSet,
  id: string,
  type: Type,
): TokenOf<Type> {
  const token = tokens[id];
  if (!token) throw new SourceError(`tokens: ${id}: missing`);
  if (token.$type !== type)
    throw new SourceError(`tokens: ${id}: expected $type ${type}, got ${token.$type}`);
  return token as TokenOf<Type>;
}

const toChannel = (component: number) => Math.round(component * 255);

const hexPair = (channel: number) => channel.toString(16).padStart(2, '0');

function colorOf(id: string, value: ColorValueNormalized): Color {
  if (value.colorSpace !== 'srgb')
    throw new SourceError(`tokens: ${id}: colorSpace must be srgb, got ${value.colorSpace}`);

  const channels = value.components.map((component) => toChannel(Number(component)));
  const [red, green, blue] = channels;
  if (channels.length !== 3 || red === undefined || green === undefined || blue === undefined)
    throw new SourceError(`tokens: ${id}: an srgb color needs three components`);
  const alpha = toChannel(value.alpha ?? 1);
  const opaque = ['#', ...[red, green, blue].map(hexPair)].join('');

  if (value.hex && value.hex.toLowerCase() !== opaque)
    throw new SourceError(`tokens: ${id}: hex ${value.hex} does not match components (${opaque})`);

  return {
    red,
    green,
    blue,
    alpha,
    hex: alpha === 255 ? opaque : [opaque, hexPair(alpha)].join(''),
  };
}

function fontWeightOf(id: string, value: number | string) {
  if (typeof value !== 'number')
    throw new SourceError(`tokens: ${id}: write the font weight as a number`);
  return value;
}

const dimensionOf = (value: DimensionValue): Dimension => ({
  value: value.value,
  unit: value.unit,
});

function pixels(id: string, value: Dimension) {
  if (value.unit !== 'px')
    throw new SourceError(`tokens: ${id}: expected a px length, got ${value.unit}`);
  return value.value;
}

const ROUNDING_FLUTTER_KEEPS = 4;

function buildIrUnchecked(sources: Sources): Ir {
  const { config, tokens, manifests } = sources;
  const naming = createNaming(config.targets);
  const { name } = naming;

  const theme = themeNames(config.css, naming);

  const variableToken = (group: Segments, path: readonly string[], namespace?: ThemeGroup) => ({
    name: name(segmentsOf(path)),
    variable: name([...segmentsOf(group), ...segmentsOf(path)]),
    tailwind: theme(namespace, segmentsOf(path)),
  });

  const dimensionTokens = (group: string, namespace?: ThemeGroup): DimensionToken[] =>
    tokensIn(tokens, [group], ['dimension']).map(({ path, token }) => ({
      ...variableToken([group], path, namespace),
      value: dimensionOf(token.$value),
    }));

  const modeEnum = config.enums[MODE_ENUM];
  if (!modeEnum) throw new SourceError(`config/enums.json: ${MODE_ENUM}: missing`);
  const modes = modeEnum.values;

  const color = buildColor(sources, naming, modes);
  const state = buildState(tokens, naming);
  const radius = dimensionTokens('radius', 'radius');
  const size = dimensionTokens('size');
  const typography = buildTypography(sources, naming);

  return {
    version: IR_VERSION,
    packages: {
      css: {
        name: manifests.css.name,
        directory: packageDirectory(config.targets.targets.css.manifest),
      },
      ts: {
        name: manifests.ts.name,
        directory: packageDirectory(config.targets.targets.ts.manifest),
      },
      dart: {
        name: manifests.dart.name,
        directory: packageDirectory(config.targets.targets.dart.manifest),
      },
    },
    targets: {
      css: targetOf(naming, config.targets.targets.css),
      ts: targetOf(naming, config.targets.targets.ts),
      dart: targetOf(naming, config.targets.targets.dart),
    },
    placeholders: config.targets.placeholders,
    modes: modes.map((mode) => ({ name: name([mode]) })),
    enums: Object.entries(config.enums).map(([key, { values, extend }]) => ({
      name: name([key]),
      ts: [...values, ...(extend?.ts ?? [])].map((value) => name([value])),
      dart: [...values, ...(extend?.dart ?? [])].map((value) => name([value])),
    })),
    color,
    state,
    shadows: buildShadows(tokens, naming),
    ...buildComponentTokens(
      sources,
      naming,
      modes,
      color.roles.map((role) => role.name.css.identifier),
    ),
    motion: tokensIn(tokens, ['motion'], ['duration']).map(({ path, token }) => ({
      ...variableToken(['motion'], path),
      milliseconds: token.$value.unit === 's' ? token.$value.value * 1000 : token.$value.value,
    })),
    radius,
    size,
    spacing: dimensionTokens('spacing'),
    typography,
    fonts: buildFonts(sources),
    paletteModel: buildPaletteModel(sources, naming),
    css: buildCss(sources, naming, { modes, radius, size, typography }),
    messages: buildMessages(sources, naming),
  };
}

function buildColor(sources: Sources, naming: Naming, modes: readonly string[]) {
  const { config, tokens } = sources;
  const { name, key } = naming;
  const roles = config.colorRoles;
  const placeholder = config.targets.placeholders.family;

  const families = Object.values(roles.families).flat();
  const [neutralFamily] = roles.families.neutral ?? [];
  if (!neutralFamily)
    throw new SourceError('config/color-roles.json: families.neutral: needs one family');

  const fill = (slot: readonly string[], family: string) =>
    slot.map((segment) => (segment === FAMILY_PLACEHOLDER ? family : segment));

  const templateKey = (slot: readonly string[]) => key(fill(slot, placeholder));

  const usesFamily = (slot: readonly string[]) => slot.includes(FAMILY_PLACEHOLDER);

  const slotKeys = new Set(roles.slots.map(templateKey));

  const requireSlot = (where: string, slot: readonly string[]) => {
    if (!slotKeys.has(templateKey(slot)))
      throw new SourceError(
        `config/color-roles.json: ${where}: ${templateKey(slot)} is not a slot`,
      );
  };

  const neutralScale = (mode: string) => {
    const steps = tokensIn(sources.tokens, [neutralFamily, mode], ['color']);
    steps.forEach(({ path, token }, index) => {
      if (path.join('.') !== String(index + 1))
        throw new SourceError(`tokens: ${token.id}: neutral steps must run 1, 2, 3, … in order`);
    });
    return steps.map(({ token }) => colorOf(token.id, token.$value));
  };

  const neutralScales = modes.map((mode) => ({ mode, steps: neutralScale(mode) }));

  const roleKeys = families.flatMap((family) =>
    roles.slots
      .filter((slot) => family === neutralFamily || usesFamily(slot))
      .map((slot) => key(fill(slot, family))),
  );

  for (const [role, step] of Object.entries(config.neutralRoles)) {
    if (!roleKeys.includes(role))
      throw new SourceError(`config/neutral-roles.json: ${role}: not a role`);
    for (const { mode, steps } of neutralScales)
      if (!steps[step - 1])
        throw new SourceError(
          `config/neutral-roles.json: ${role}: step ${step} is not in the ${mode} scale`,
        );
  }

  const tailwind = tailwindNames(sources, naming);

  const roleEntries = families.flatMap((family) =>
    roles.slots
      .filter((slot) => family === neutralFamily || usesFamily(slot))
      .map((slot) => {
        const segments = fill(slot, family);
        const [property = ''] = segments;
        const step = config.neutralRoles[key(segments)];
        return {
          name: name(segments),
          variable: name(['color', ...segments]),
          property,
          family,
          slot: templateKey(slot),
          theme: neutralScales.map(({ mode, steps }) => ({
            mode,
            variable: name(['theme', mode, ...segments]),
            fallback: step === undefined ? null : (steps[step - 1] ?? null),
          })),
          tailwind: tailwind(property, segments.slice(1)),
        };
      }),
  );

  const scheme = roles.scheme;

  for (const redirect of scheme.redirects) {
    requireSlot('scheme.redirects.from', redirect.from);
    requireSlot('scheme.redirects.to', redirect.to);
    if (!families.includes(redirect.family))
      throw new SourceError(
        `config/color-roles.json: scheme.redirects: ${redirect.family} is not a family`,
      );
  }

  const schemeTarget = (family: string, slot: readonly string[]) => {
    const redirect = scheme.redirects.find(
      ({ family: redirected, from }) =>
        redirected === family && templateKey(from) === templateKey(slot),
    );
    return key(fill(redirect?.to ?? slot, family));
  };

  const schemeSlots = roles.slots.filter(usesFamily);

  const stateOpacityKey = (opacity: readonly string[], phase: string) => {
    const id = [...opacity, phase].join('.');
    tokenAt(tokens, id, 'number');
    return key(segmentsOf(idPath(id).slice(1)));
  };

  const layerVariable = (...phase: string[]) => name(['state', 'layer', scheme.family, ...phase]);

  return {
    familyGroups: Object.entries(roles.families).map(([group, members]) => ({
      name: name([group]),
      list: name([group, ...config.targets.collections.familyGroup]),
      families: members,
    })),
    families: families.map((family) => name([family])),
    slots: roles.slots.map((slot) => ({
      property: slot[0] ?? '',
      usesFamily: usesFamily(slot),
      neutralOnly: !usesFamily(slot),
      template: { key: templateKey(slot) },
    })),
    roles: roleEntries,
    neutralScales,
    neutralSteps: Object.entries(config.neutralRoles).map(([role, step]) => ({ role, step })),
    scheme: {
      family: name([scheme.family]),
      roles: schemeSlots.map((slot) => {
        const segments = fill(slot, scheme.family);
        const [property = ''] = segments;
        return {
          name: name(segments),
          variable: name(['color', ...segments]),
          slot: templateKey(slot),
          tailwind: tailwind(property, segments.slice(1)),
          targets: families.map((family) => ({ family, role: schemeTarget(family, slot) })),
        };
      }),
      utilities: families.map((family) => {
        const layer = scheme.stateLayer.families[family] ?? scheme.stateLayer.default;
        if ('role' in layer.color) requireSlot(`scheme.stateLayer (${family})`, layer.color.role);
        return {
          family,
          name: name([scheme.family, family]),
          layer: {
            variable: layerVariable(),
            color:
              'role' in layer.color
                ? { kind: 'role' as const, role: key(fill(layer.color.role, family)) }
                : { kind: 'keyword' as const, keyword: layer.color.keyword },
            hover: {
              variable: layerVariable('hover'),
              opacity: stateOpacityKey(layer.opacity, 'hover'),
            },
            press: {
              variable: layerVariable('press'),
              opacity: stateOpacityKey(layer.opacity, 'press'),
            },
          },
        };
      }),
    },
  };
}

function tailwindNames(sources: Sources, naming: Naming) {
  const namespaces = sources.config.colorRoles.tailwindNamespaces;
  return (property: string, rest: readonly string[]) => {
    const declared = namespaces[property];
    if (!declared)
      throw new SourceError(`config/color-roles.json: tailwindNamespaces: ${property}: missing`);
    return declared.map((namespace) => naming.name([...segmentsOf([namespace]), ...rest]));
  };
}

function buildState(tokens: TokenNormalizedSet, naming: Naming) {
  const { name } = naming;
  const entries = tokensIn(tokens, ['state'], ['number', 'color']).map(({ path, token }) => {
    const names = {
      name: name(segmentsOf(path)),
      variable: name(['state', ...segmentsOf(path)]),
      tailwind: [],
    };
    return token.$type === 'number'
      ? {
          kind: 'opacity' as const,
          ...names,
          ratio: token.$value,
          percent: new Decimal(token.$value).times(100).toNumber(),
        }
      : { kind: 'color' as const, ...names, color: colorOf(token.id, token.$value) };
  });
  if (entries.filter(({ kind }) => kind === 'color').length !== 1)
    throw new SourceError('tokens: state: needs exactly one color, the fill layer color');
  return { tokens: entries };
}

function buildShadows(tokens: TokenNormalizedSet, naming: Naming) {
  return tokensIn(tokens, ['shadow'], ['shadow']).map(({ path, token }) => ({
    name: naming.name(segmentsOf(path)),
    variable: naming.name(['shadow', ...segmentsOf(path)]),
    tailwind: [],
    layers: token.$value.map((layer) => ({
      offsetX: dimensionOf(layer.offsetX),
      offsetY: dimensionOf(layer.offsetY),
      blur: dimensionOf(layer.blur),
      spread: dimensionOf(layer.spread),
      color: colorOf(token.id, layer.color),
    })),
  }));
}

function buildComponentTokens(
  sources: Sources,
  naming: Naming,
  modes: readonly string[],
  roleKeys: readonly string[],
) {
  const { name } = naming;
  const tailwind = tailwindNames(sources, naming);
  const file = 'config/component-tokens.json';
  const shadowSteps = tokensIn(sources.tokens, ['shadow'], ['shadow']).map(({ path }) =>
    path.join('.'),
  );

  const entries = Object.entries(sources.config.componentTokens).map(([token, byMode]) => {
    const [property = '', ...part] = segmentsOf([token]);
    for (const mode of modes)
      if (!byMode[mode]) throw new SourceError(`${file}: ${token}.${mode}: missing`);
    for (const mode of Object.keys(byMode))
      if (!modes.includes(mode)) throw new SourceError(`${file}: ${token}.${mode}: not a mode`);
    return { token, property, part, byMode };
  });

  const componentColors = entries.flatMap(({ token, property, part, byMode }) => {
    const roles = modes.map((mode) => {
      const value = byMode[mode];
      if (!value || !('role' in value)) return null;
      if (!roleKeys.includes(value.role))
        throw new SourceError(`${file}: ${token}.${mode}: ${value.role} is not a role`);
      return { mode, role: value.role };
    });
    if (roles.every((role) => role === null)) return [];
    if (roles.some((role) => role === null))
      throw new SourceError(
        `${file}: ${token}: every mode must point to a role, or every mode to a shadow`,
      );
    return [
      {
        name: name(segmentsOf([token])),
        variable: name(['color', ...segmentsOf([token])]),
        property,
        part: name(part),
        tailwind: tailwind(property, part),
        modes: roles.filter((role) => role !== null),
      },
    ];
  });

  const componentShadows = entries.flatMap(({ token, property, part, byMode }) => {
    const steps = modes.map((mode) => {
      const value = byMode[mode];
      if (!value || !('shadow' in value)) return null;
      if (!shadowSteps.includes(value.shadow))
        throw new SourceError(
          `${file}: ${token}.${mode}: shadow ${value.shadow} is not a shadow step`,
        );
      return { mode, shadow: value.shadow };
    });
    if (steps.some((step) => step === null)) return [];
    return [
      {
        name: name(segmentsOf([token])),
        variable: name(segmentsOf([token])),
        part: name(part),
        tailwind: tailwind(property, part),
        modes: steps.filter((step) => step !== null),
      },
    ];
  });

  return { componentColors, componentShadows };
}

function lineHeightOf(value: DimensionValue | number): LineHeight {
  return typeof value === 'number'
    ? { kind: 'multiplier', multiplier: value }
    : { kind: 'length', length: dimensionOf(value) };
}

function buildTypography(sources: Sources, naming: Naming) {
  const { tokens } = sources;
  const { name } = naming;

  const theme = themeNames(sources.config.css, naming);
  const { textStyleParts } = sources.config.css.typography;

  const entry = (group: string, path: readonly string[], namespace?: ThemeGroup) => ({
    name: name(segmentsOf(path)),
    variable: name([...segmentsOf([group]), ...segmentsOf(path)]),
    tailwind: theme(namespace, segmentsOf(path)),
  });

  const bundledFamilyOf = bundledFamilyResolver(sources);

  return {
    fontSizes: tokensIn(tokens, ['font-size'], ['dimension']).map(({ path, token }) => ({
      ...entry('font-size', path, 'fontSizes'),
      value: dimensionOf(token.$value),
    })),
    fontWeights: tokensIn(tokens, ['font-weight'], ['fontWeight']).map(({ path, token }) => ({
      ...entry('font-weight', path, 'fontWeights'),
      value: fontWeightOf(token.id, token.$value),
    })),
    lineHeights: tokensIn(tokens, ['line-height'], ['dimension', 'number']).map(
      ({ path, token }) => ({
        ...entry('line-height', path, 'lineHeights'),
        value: lineHeightOf(token.$value),
      }),
    ),
    letterSpacings: tokensIn(tokens, ['letter-spacing'], ['dimension']).map(({ path, token }) => ({
      ...entry('letter-spacing', path, 'letterSpacings'),
      value: dimensionOf(token.$value),
    })),
    fontFamilies: tokensIn(tokens, ['font-family'], ['fontFamily']).map(({ path, token }) => ({
      ...entry('font-family', path, 'fontFamilies'),
      stack: token.$value,
      flutter: flutterFamily(sources, token.id, token.$value, bundledFamilyOf),
    })),
    fontSizeAdjusts: tokensIn(tokens, ['font-size-adjust'], ['number']).map(({ path, token }) => ({
      ...entry('font-size-adjust', path),
      value: token.$value,
    })),
    textStyles: tokensIn(tokens, ['text'], ['typography']).map(({ path, token }) => {
      const { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } = token.$value;
      const size = pixels(token.id, dimensionOf(fontSize));
      const height = lineHeightOf(lineHeight);
      const spacing = dimensionOf(letterSpacing);
      const [primaryFamily] = fontFamily;
      if (!primaryFamily) throw new SourceError(`tokens: ${token.id}: fontFamily is empty`);
      const style = entry('text', path, 'textStyles');
      return {
        ...style,
        fontFamily: primaryFamily,
        fontSize: dimensionOf(fontSize),
        fontWeight: fontWeightOf(token.id, fontWeight),
        lineHeight: height,
        letterSpacing: spacing,
        parts: TEXT_STYLE_PARTS.map((part) => ({
          part,
          variable: name(style.variable.segments, textStyleParts[part]),
          tailwind: style.tailwind.map((tailwind) => name(tailwind.segments, textStyleParts[part])),
        })),
        flutter: {
          fontSize: size,
          height:
            height.kind === 'multiplier'
              ? height.multiplier
              : pixels(token.id, height.length) / size,
          letterSpacing: Number(
            (spacing.unit === 'em' ? spacing.value * size : pixels(token.id, spacing)).toFixed(
              ROUNDING_FLUTTER_KEEPS,
            ),
          ),
        },
      };
    }),
  };
}

function bundledFamilyResolver(sources: Sources) {
  const { bundled } = sources.config.fonts;
  return (family: string) =>
    Object.entries(bundled).find(
      ([bundledFamily, { aliases }]) => bundledFamily === family || aliases.includes(family),
    )?.[0];
}

const FLUTTER_PACKAGE_FONT_DIRECTORY = 'packages';

function flutterFamily(
  sources: Sources,
  id: string,
  stack: readonly string[],
  bundledFamilyOf: (family: string) => string | undefined,
) {
  const flutterPackage = sources.manifests.dart.name;
  const unnamed = sources.config.fonts.flutter.unnamedGenericFamilies;
  const qualified = (family: string) =>
    [FLUTTER_PACKAGE_FONT_DIRECTORY, flutterPackage, family].join('/');

  const [primary, ...rest] = stack;
  if (!primary) throw new SourceError(`tokens: ${id}: the font stack is empty`);
  const bundledPrimary = bundledFamilyOf(primary);

  const fallback = uniq(
    rest
      .filter((family) => !unnamed.includes(family))
      .map((family) => bundledFamilyOf(family) ?? family)
      .filter((family) => family !== bundledPrimary)
      .map((family) => (bundledFamilyOf(family) ? qualified(family) : family)),
  );

  return {
    family: bundledPrimary ?? primary,
    package: bundledPrimary ? flutterPackage : null,
    qualifiedFamily: bundledPrimary ? qualified(bundledPrimary) : primary,
    fallback,
  };
}

function buildFonts(sources: Sources) {
  const { bundled } = sources.config.fonts;
  const declared = sources.manifests.dart.flutter.fonts;
  const file = 'config/fonts.json';

  for (const family of Object.keys(bundled))
    if (!declared.some((font) => font.family === family))
      throw new SourceError(
        `${file}: bundled.${family}: not declared in the Flutter pubspec fonts`,
      );

  return {
    bundled: declared.map(({ family, fonts }) => {
      const config = bundled[family];
      if (!config) throw new SourceError(`${file}: bundled: pubspec font ${family} has no entry`);
      const [asset, ...more] = fonts;
      if (!asset || more.length > 0)
        throw new SourceError(`pubspec: fonts.${family}: needs exactly one asset`);
      return {
        family,
        aliases: config.aliases,
        font: { from: config.font, to: asset.asset },
        license: config.license,
      };
    }),
  };
}

function buildPaletteModel(sources: Sources, naming: Naming) {
  const { steps, statusPalettes, series } = sources.config.paletteModel;
  return {
    steps,
    series: Object.entries(series).map(([key, coefficients]) => {
      if (coefficients.length !== steps.length)
        throw new SourceError(`config/palette-model.json: series.${key}: needs one row per step`);
      return { name: naming.name(segmentsOf([key])), coefficients };
    }),
    statusPalettes: statusPalettes.map((palette) => ({
      name: naming.name([palette]),
      colors: steps.map((step) => {
        const token = tokenAt(sources.tokens, [palette, step].join('.'), 'color');
        return colorOf(token.id, token.$value);
      }),
    })),
  };
}

type ThemeGroup = keyof CssConfig['theme'];

function themeNames(css: CssConfig, naming: Naming) {
  return (group: ThemeGroup | undefined, segments: Segments) =>
    group === undefined ? [] : [naming.name([...css.theme[group], ...segments])];
}

interface CssInputs {
  modes: readonly string[];
  radius: readonly DimensionToken[];
  size: readonly DimensionToken[];
  typography: Ir['typography'];
}

function buildCss(sources: Sources, naming: Naming, inputs: CssInputs): Ir['css'] {
  const { name, key } = naming;
  const { css } = sources.config;
  const file = 'config/css.json';

  for (const mode of css.modeVariants)
    if (!inputs.modes.includes(mode))
      throw new SourceError(`${file}: modeVariants: ${mode} is not a mode`);

  const radiusKeys = inputs.radius.map((entry) => entry.name.css.identifier);
  for (const kept of css.scale.radiusTheProviderLeavesAlone)
    if (!radiusKeys.includes(kept))
      throw new SourceError(`${file}: scale.radiusTheProviderLeavesAlone: ${kept} is not a radius`);

  const utility = name(css.concentric.utility);
  const isPixels = (value: Dimension) => value.unit === 'px';
  const valueOfPart = (style: Ir['typography']['textStyles'][number], part: string) =>
    part === 'fontSize'
      ? style.fontSize
      : style.lineHeight.kind === 'length'
        ? style.lineHeight.length
        : null;

  const lengthsOf = {
    textStyles: () =>
      inputs.typography.textStyles.flatMap((style) =>
        style.parts
          .filter(({ part }) => css.scale.textStyleParts.includes(part))
          .flatMap(({ part, variable }) => {
            const value = valueOfPart(style, part);
            return value && isPixels(value) ? [{ variable, value }] : [];
          }),
      ),
    fontSizes: () =>
      inputs.typography.fontSizes.map(({ variable, value }) => ({ variable, value })),
    lineHeights: () =>
      inputs.typography.lineHeights.flatMap(({ variable, value }) =>
        value.kind === 'length' && isPixels(value.length)
          ? [{ variable, value: value.length }]
          : [],
      ),
    size: () => inputs.size.map(({ variable, value }) => ({ variable, value })),
  };

  return {
    attributes: css.attributes,
    modeVariants: css.modeVariants.map((mode) => ({
      name: name([mode]),
      mode,
      others: inputs.modes.filter((other) => other !== mode),
    })),
    focusRing: {
      variant: css.focusRing.variant,
      triggers: css.focusRing.triggers.map((trigger) =>
        'pseudo' in trigger
          ? { kind: 'pseudo' as const, pseudo: trigger.pseudo }
          : 'attribute' in trigger
            ? {
                kind: 'attribute' as const,
                attribute: trigger.attribute,
                ...(trigger.unlessPseudo ? { unlessPseudo: trigger.unlessPseudo } : {}),
              }
            : {
                kind: 'focusedInside' as const,
                attribute: trigger.focusedInsideExceptPopups,
                exceptIn: css.attributes.popover,
              },
      ),
    },
    concentric: {
      utility,
      classPrefix: [utility.css.identifier, ''].join('-'),
      nested: name(css.concentric.nested),
      spacing: name(css.scale.spacing),
      pads: css.concentric.pads.map((pad) => ({
        pad,
        className: key([...css.concentric.utility, String(pad)]),
      })),
      overlayDepths: css.concentric.overlayDepths,
    },
    typographyOrder: css.typography.order,
    scale: {
      factor: name(css.scale.factor),
      spacing: name(css.scale.spacing),
      spacingUnit: css.scale.spacingUnit,
      wholePixel: css.scale.wholePixel,
      cornerRadiusScale: name(css.scale.cornerRadiusScale),
      providerRadius: inputs.radius
        .filter(
          (entry) => !css.scale.radiusTheProviderLeavesAlone.includes(entry.name.css.identifier),
        )
        .map((entry) => ({
          variable: entry.variable,
          provider: name([...css.scale.providerRadius, ...entry.name.segments]),
          fallback: entry.value,
        })),
      lengths: css.scale.lengths.flatMap((group) => lengthsOf[group]()),
    },
  };
}

type TargetConfig = TargetsConfig['targets'][keyof TargetsConfig['targets']];

const targetOf = (naming: Naming, target: TargetConfig) => ({
  symbols: naming.symbols(target.symbols),
  outputs: target.outputs,
  ...('modules' in target ? { modules: target.modules } : {}),
});

const packageDirectory = (manifest: string) => posix.join(posix.dirname(manifest), posix.sep);

export function buildIr(sources: Sources): Ir {
  const ir = buildIrUnchecked(sources);
  const result = v.safeParse(IrSchema, ir);
  if (!result.success)
    throw new Error(
      result.issues.map((issue) => `ir: ${v.getDotPath(issue)}: ${issue.message}`).join('\n'),
    );
  return result.output;
}
