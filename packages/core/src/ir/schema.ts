import * as v from 'valibot';

export const IR_VERSION = 1;

const segment = v.pipe(v.string(), v.regex(/^[a-z0-9]+$/));

const identifier = v.pipe(v.string(), v.minLength(1));

export const NameSchema = v.object({
  segments: v.array(segment),
  css: v.object({ identifier, customProperty: identifier, themeProperty: identifier }),
  ts: v.object({ constant: identifier, member: identifier, type: identifier, key: identifier }),
  dart: v.object({ member: identifier, type: identifier, key: identifier }),
});

const channel = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(255));

export const ColorSchema = v.object({
  red: channel,
  green: channel,
  blue: channel,
  alpha: channel,
  hex: v.pipe(v.string(), v.regex(/^#[0-9a-f]{6}([0-9a-f]{2})?$/)),
});

export const DimensionSchema = v.object({
  value: v.number(),
  unit: v.picklist(['px', 'em', 'rem']),
});

export const LineHeightSchema = v.variant('kind', [
  v.object({ kind: v.literal('length'), length: DimensionSchema }),
  v.object({ kind: v.literal('multiplier'), multiplier: v.number() }),
]);

const variableEntry = { name: NameSchema, variable: NameSchema };

export const DimensionTokenSchema = v.object({ ...variableEntry, value: DimensionSchema });

export const ModeSchema = v.object({ name: NameSchema });

export const EnumSchema = v.object({
  name: NameSchema,
  ts: v.array(NameSchema),
  dart: v.array(NameSchema),
});

export const SlotSchema = v.object({
  property: segment,
  usesFamily: v.boolean(),
  neutralOnly: v.boolean(),
  template: v.object({ key: identifier }),
});

export const RoleSchema = v.object({
  name: NameSchema,
  variable: NameSchema,
  property: segment,
  family: segment,
  slot: identifier,
  theme: v.array(
    v.object({ mode: segment, variable: NameSchema, fallback: v.nullable(ColorSchema) }),
  ),
  tailwind: v.array(NameSchema),
});

export const SchemeRoleSchema = v.object({
  name: NameSchema,
  variable: NameSchema,
  slot: identifier,
  tailwind: v.array(NameSchema),
  targets: v.array(v.object({ family: segment, role: identifier })),
});

export const StateLayerColorSchema = v.variant('kind', [
  v.object({ kind: v.literal('role'), role: identifier }),
  v.object({ kind: v.literal('keyword'), keyword: identifier }),
]);

export const SchemeUtilitySchema = v.object({
  family: segment,
  name: NameSchema,
  layer: v.object({
    variable: NameSchema,
    color: StateLayerColorSchema,
    hover: v.object({ variable: NameSchema, opacity: identifier }),
    press: v.object({ variable: NameSchema, opacity: identifier }),
  }),
});

export const ColorRolesSchema = v.object({
  familyGroups: v.array(v.object({ name: NameSchema, families: v.array(segment) })),
  families: v.array(NameSchema),
  slots: v.array(SlotSchema),
  roles: v.array(RoleSchema),
  neutralScales: v.array(v.object({ mode: segment, steps: v.array(ColorSchema) })),
  neutralSteps: v.array(v.object({ role: identifier, step: v.pipe(v.number(), v.integer()) })),
  scheme: v.object({
    family: NameSchema,
    roles: v.array(SchemeRoleSchema),
    utilities: v.array(SchemeUtilitySchema),
  }),
});

export const StateTokenSchema = v.variant('kind', [
  v.object({
    kind: v.literal('opacity'),
    ...variableEntry,
    ratio: v.number(),
    percent: v.number(),
  }),
  v.object({ kind: v.literal('color'), ...variableEntry, color: ColorSchema }),
]);

export const StateSchema = v.object({ tokens: v.array(StateTokenSchema) });

export const ShadowLayerSchema = v.object({
  offsetX: DimensionSchema,
  offsetY: DimensionSchema,
  blur: DimensionSchema,
  spread: DimensionSchema,
  color: ColorSchema,
});

export const ShadowSchema = v.object({ ...variableEntry, layers: v.array(ShadowLayerSchema) });

export const ComponentColorSchema = v.object({
  ...variableEntry,
  property: segment,
  part: NameSchema,
  tailwind: v.array(NameSchema),
  modes: v.array(v.object({ mode: segment, role: identifier })),
});

export const ComponentShadowSchema = v.object({
  ...variableEntry,
  part: NameSchema,
  tailwind: v.array(NameSchema),
  modes: v.array(v.object({ mode: segment, shadow: identifier })),
});

export const DurationTokenSchema = v.object({ ...variableEntry, milliseconds: v.number() });

export const FontFamilyTokenSchema = v.object({
  ...variableEntry,
  stack: v.array(identifier),
  flutter: v.object({
    family: identifier,
    package: v.nullable(identifier),
    qualifiedFamily: identifier,
    fallback: v.array(identifier),
  }),
});

export const NumberTokenSchema = v.object({ ...variableEntry, value: v.number() });

export const LineHeightTokenSchema = v.object({ ...variableEntry, value: LineHeightSchema });

export const TextStyleSchema = v.object({
  ...variableEntry,
  fontFamily: identifier,
  fontSize: DimensionSchema,
  fontWeight: v.number(),
  lineHeight: LineHeightSchema,
  letterSpacing: DimensionSchema,
  flutter: v.object({ fontSize: v.number(), height: v.number(), letterSpacing: v.number() }),
});

export const TypographySchema = v.object({
  fontSizes: v.array(DimensionTokenSchema),
  fontWeights: v.array(NumberTokenSchema),
  lineHeights: v.array(LineHeightTokenSchema),
  letterSpacings: v.array(DimensionTokenSchema),
  fontFamilies: v.array(FontFamilyTokenSchema),
  fontSizeAdjusts: v.array(NumberTokenSchema),
  textStyles: v.array(TextStyleSchema),
});

export const FontFileSchema = v.object({ from: identifier, to: identifier });

export const FontsSchema = v.object({
  bundled: v.array(
    v.object({
      family: identifier,
      aliases: v.array(identifier),
      font: FontFileSchema,
      license: FontFileSchema,
    }),
  ),
});

export const PaletteModelSchema = v.object({
  steps: v.array(identifier),
  series: v.array(v.object({ name: NameSchema, coefficients: v.array(v.array(v.number())) })),
  statusPalettes: v.array(v.object({ name: NameSchema, colors: v.array(ColorSchema) })),
});

const directory = v.pipe(v.string(), v.endsWith('/'));

const PackageSchema = v.object({ name: identifier, directory });

export const PackagesSchema = v.object({
  css: PackageSchema,
  ts: PackageSchema,
  dart: PackageSchema,
});

const TargetSchema = v.object({
  symbols: v.record(v.string(), NameSchema),
  outputs: v.record(v.string(), identifier),
});

export const TargetsSchema = v.object({ css: TargetSchema, ts: TargetSchema, dart: TargetSchema });

export const IrSchema = v.object({
  version: v.literal(IR_VERSION),
  packages: PackagesSchema,
  targets: TargetsSchema,
  placeholders: v.object({ family: identifier }),
  modes: v.array(ModeSchema),
  enums: v.array(EnumSchema),
  color: ColorRolesSchema,
  state: StateSchema,
  shadows: v.array(ShadowSchema),
  componentColors: v.array(ComponentColorSchema),
  componentShadows: v.array(ComponentShadowSchema),
  motion: v.array(DurationTokenSchema),
  radius: v.array(DimensionTokenSchema),
  size: v.array(DimensionTokenSchema),
  spacing: v.array(DimensionTokenSchema),
  typography: TypographySchema,
  fonts: FontsSchema,
  paletteModel: PaletteModelSchema,
});

export const IR_DEFINITIONS = {
  Name: NameSchema,
  Color: ColorSchema,
  Dimension: DimensionSchema,
  LineHeight: LineHeightSchema,
  DimensionToken: DimensionTokenSchema,
  Shadow: ShadowSchema,
  ShadowLayer: ShadowLayerSchema,
  Role: RoleSchema,
  Slot: SlotSchema,
  TextStyle: TextStyleSchema,
};

export type Name = v.InferOutput<typeof NameSchema>;
export type Color = v.InferOutput<typeof ColorSchema>;
export type Dimension = v.InferOutput<typeof DimensionSchema>;
export type LineHeight = v.InferOutput<typeof LineHeightSchema>;
export type DimensionToken = v.InferOutput<typeof DimensionTokenSchema>;
export type Ir = v.InferOutput<typeof IrSchema>;
