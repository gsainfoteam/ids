import * as v from 'valibot';

const word = v.pipe(v.string(), v.regex(/^[a-z][a-z0-9]*$/, 'must be one lowercase word'));

const kebabId = v.pipe(v.string(), v.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be kebab-case'));

const FAMILY = '$family';

const slotSegment = v.union([word, v.literal(FAMILY)]);

const slotPath = v.pipe(v.array(slotSegment), v.minLength(2));

export const NAME_CASES = ['kebab', 'camel', 'pascal', 'constant', 'customProperty'] as const;

export type NameCase = (typeof NAME_CASES)[number];

export interface Spelling {
  case: NameCase;
  prefixed: boolean;
}

const nameCase = v.picklist(NAME_CASES);

const spelling = v.object({ case: nameCase, prefixed: v.boolean() });

const symbols = v.record(v.string(), v.array(word));

const outputKey = v.pipe(v.string(), v.regex(/^[a-z][A-Za-z0-9]*$/, 'must be camelCase'));

const outputs = v.record(outputKey, v.pipe(v.string(), v.minLength(1)));

const modules = v.record(outputKey, v.pipe(v.string(), v.minLength(1)));

export const TargetsConfigSchema = v.object({
  prefix: v.array(word),
  placeholders: v.object({ family: v.string() }),
  collections: v.object({ familyGroup: v.array(word) }),
  targets: v.object({
    css: v.object({
      manifest: v.string(),
      names: v.object({ identifier: spelling, customProperty: spelling, themeProperty: spelling }),
      subSeparator: v.pipe(v.string(), v.minLength(1)),
      symbols,
      outputs,
    }),
    ts: v.object({
      manifest: v.string(),
      names: v.object({ constant: spelling, member: spelling, type: spelling, key: spelling }),
      symbols,
      outputs,
      modules,
    }),
    dart: v.object({
      manifest: v.string(),
      names: v.object({ member: spelling, type: spelling, key: spelling }),
      symbols,
      outputs,
    }),
  }),
});

const stateLayer = v.object({
  color: v.union([
    v.object({ role: slotPath }),
    v.object({ keyword: v.picklist(['currentColor']) }),
  ]),
  opacity: v.array(word),
});

export const ColorRolesConfigSchema = v.object({
  families: v.record(word, v.array(word)),
  slots: v.array(slotPath),
  scheme: v.object({
    family: word,
    redirects: v.array(v.object({ family: word, from: slotPath, to: slotPath })),
    stateLayer: v.object({ default: stateLayer, families: v.record(word, stateLayer) }),
  }),
  tailwindNamespaces: v.record(word, v.array(kebabId)),
});

export const NeutralRolesConfigSchema = v.record(
  kebabId,
  v.pipe(v.number(), v.integer(), v.minValue(1)),
);

const componentModeValue = v.union([
  v.strictObject({ role: kebabId }),
  v.strictObject({ shadow: v.string() }),
]);

export const ComponentTokensConfigSchema = v.record(kebabId, v.record(word, componentModeValue));

export const EnumsConfigSchema = v.record(
  word,
  v.object({
    values: v.pipe(v.array(word), v.minLength(1)),
    extend: v.optional(
      v.object({ ts: v.optional(v.array(word)), dart: v.optional(v.array(word)) }),
    ),
  }),
);

const npmFile = v.pipe(
  v.string(),
  v.regex(/^[@a-z0-9][^\s]*\/[^\s]+$/, 'must be <npm package>/<path>'),
);

export const FontsConfigSchema = v.object({
  bundled: v.record(
    v.string(),
    v.object({
      aliases: v.array(v.string()),
      font: npmFile,
      license: v.object({ from: npmFile, to: v.string() }),
    }),
  ),
  flutter: v.object({ unnamedGenericFamilies: v.array(v.string()) }),
});

export const PaletteModelConfigSchema = v.object({
  steps: v.array(v.pipe(v.string(), v.regex(/^\d+$/))),
  statusPalettes: v.array(word),
  series: v.record(kebabId, v.array(v.array(v.number()))),
});

export const TYPOGRAPHY_GROUPS = [
  'fontSizes',
  'fontWeights',
  'lineHeights',
  'letterSpacings',
  'fontFamilies',
  'fontSizeAdjusts',
] as const;

export const TEXT_STYLE_PARTS = ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'] as const;

const typographyGroup = v.picklist(TYPOGRAPHY_GROUPS);

const textStylePart = v.picklist(TEXT_STYLE_PARTS);

const cssDimension = v.object({ value: v.number(), unit: v.picklist(['px', 'em', 'rem']) });

const focusRingTrigger = v.union([
  v.strictObject({ pseudo: kebabId }),
  v.strictObject({ attribute: kebabId }),
  v.strictObject({ focusedInsideExceptPopups: kebabId }),
]);

const segments = v.array(word);

export const CssConfigSchema = v.object({
  attributes: v.object({ mode: kebabId, scale: kebabId, popover: kebabId }),
  modeVariants: v.array(word),
  focusRing: v.object({ variant: kebabId, triggers: v.array(focusRingTrigger) }),
  concentric: v.object({
    utility: segments,
    nested: segments,
    pads: v.array(v.pipe(v.number(), v.minValue(0))),
    overlayDepths: v.pipe(v.number(), v.integer(), v.minValue(1)),
  }),
  theme: v.object({
    radius: segments,
    fontSizes: segments,
    fontFamilies: segments,
    fontWeights: segments,
    letterSpacings: segments,
    lineHeights: segments,
    textStyles: segments,
  }),
  typography: v.object({
    order: v.array(typographyGroup),
    textStyleParts: v.object({
      fontSize: segments,
      fontWeight: segments,
      lineHeight: segments,
      letterSpacing: segments,
    }),
  }),
  scale: v.object({
    factor: segments,
    spacing: segments,
    spacingUnit: cssDimension,
    wholePixel: cssDimension,
    cornerRadiusScale: segments,
    providerRadius: segments,
    radiusTheProviderLeavesAlone: v.array(kebabId),
    lengths: v.array(v.picklist(['textStyles', 'fontSizes', 'lineHeights', 'size'])),
    textStyleParts: v.array(textStylePart),
  }),
});

export const NpmManifestSchema = v.object({ name: v.string() });

export const PubManifestSchema = v.object({
  name: v.string(),
  flutter: v.object({
    fonts: v.array(
      v.object({ family: v.string(), fonts: v.array(v.object({ asset: v.string() })) }),
    ),
  }),
});

const language = v.pipe(
  v.string(),
  v.regex(/^[a-z]{2,3}$/, 'must be a 2 or 3 letter language code'),
);

const messageKey = v.pipe(v.string(), v.regex(/^[a-z][a-zA-Z0-9]*$/, 'must be a camelCase key'));

export const MessagesConfigSchema = v.object({
  fallback: language,
  catalog: v.array(word),
  ownCatalogs: v.array(messageKey),
});

export type MessageTree = { [key: string]: string | MessageTree };

const MessageTreeSchema: v.GenericSchema<MessageTree> = v.lazy(() =>
  v.record(messageKey, v.union([v.string(), MessageTreeSchema])),
);

export const MessageFileSchema = v.object({
  language,
  tag: v.pipe(v.string(), v.minLength(1)),
  messages: MessageTreeSchema,
});

export const CONFIG_FILES = {
  targets: { file: 'config/targets.json', schema: TargetsConfigSchema },
  colorRoles: { file: 'config/color-roles.json', schema: ColorRolesConfigSchema },
  neutralRoles: { file: 'config/neutral-roles.json', schema: NeutralRolesConfigSchema },
  componentTokens: { file: 'config/component-tokens.json', schema: ComponentTokensConfigSchema },
  enums: { file: 'config/enums.json', schema: EnumsConfigSchema },
  fonts: { file: 'config/fonts.json', schema: FontsConfigSchema },
  paletteModel: { file: 'config/palette-model.json', schema: PaletteModelConfigSchema },
  css: { file: 'config/css.json', schema: CssConfigSchema },
  messages: { file: 'config/messages.json', schema: MessagesConfigSchema },
} as const;

export { FAMILY as FAMILY_PLACEHOLDER };

export type TargetsConfig = v.InferOutput<typeof TargetsConfigSchema>;
export type ColorRolesConfig = v.InferOutput<typeof ColorRolesConfigSchema>;
export type NeutralRolesConfig = v.InferOutput<typeof NeutralRolesConfigSchema>;
export type ComponentTokensConfig = v.InferOutput<typeof ComponentTokensConfigSchema>;
export type EnumsConfig = v.InferOutput<typeof EnumsConfigSchema>;
export type FontsConfig = v.InferOutput<typeof FontsConfigSchema>;
export type PaletteModelConfig = v.InferOutput<typeof PaletteModelConfigSchema>;
export type CssConfig = v.InferOutput<typeof CssConfigSchema>;
export type MessagesConfig = v.InferOutput<typeof MessagesConfigSchema>;
export type MessageFile = v.InferOutput<typeof MessageFileSchema>;
export type PubManifest = v.InferOutput<typeof PubManifestSchema>;
