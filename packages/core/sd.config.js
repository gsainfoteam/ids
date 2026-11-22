import { readFileSync, readdirSync } from "node:fs";
import { StyleDictionary } from "style-dictionary-utils";

const GENERATED = "// GENERATED — do not edit manually";

const slug = (t) => t.path.slice(1).join("-");
const val = (t) => t.$value ?? t.value;
const toVal = (t) => {
  const v = val(t);
  return Array.isArray(v) ? v.join(", ") : v;
};
const idsVar = (prefix, t) => `--ids-${prefix}-${slug(t)}`;
const toCamel = (str) =>
  str.replace(/-([a-zA-Z0-9]+)/g, (_, s) => s.charAt(0).toUpperCase() + s.slice(1));
const enumName = (key) => `Ids${key.charAt(0).toUpperCase() + key.slice(1)}`;
const hexToFlutterColor = (hex) =>
  `const Color(0xFF${hex.replace("#", "").toUpperCase()})`;

const render = (template, vars) =>
  Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{{${k}}}`, v),
    template,
  );

const byCategory = (dictionary, cat) =>
  dictionary.allTokens.filter((t) => t.attributes?.category === cat);

const byPath = (dictionary, key) =>
  dictionary.allTokens.filter((t) => t.path[0] === key);

const buildPalette = (dictionary) => {
  const p = {};
  for (const t of dictionary.allTokens.filter(
    (t) => !t.filePath.includes("semantic"),
  ))
    p[t.path.join(".")] = val(t);
  return p;
};

const resolveRef = (value, palette) => {
  if (typeof value !== "string") return value;
  const m = value.match(/^\{([^}]+)\}$/);
  return m ? (palette[m[1]] ?? value) : value;
};

const NEUTRAL_ROLE_STEPS = JSON.parse(readFileSync("./neutral-roles.json", "utf8"));

const isTypographyToken = (node) =>
  node &&
  typeof node === "object" &&
  (node.$type === "typography" ||
    (node.$value && typeof node.$value === "object" && "fontSize" in node.$value));

const flattenTypography = (node, path = []) => {
  if (isTypographyToken(node)) {
    const raw = node.$value ?? node.value;
    return [
      {
        name: path.join("-"),
        fontSize: raw.fontSize,
        fontWeight: raw.fontWeight,
        lineHeight: raw.lineHeight,
        letterSpacing: raw.letterSpacing,
      },
    ];
  }
  if (!node || typeof node !== "object") return [];
  return Object.entries(node).flatMap(([key, child]) =>
    flattenTypography(child, [...path, key]),
  );
};

const readTypographyEntries = (palette) => {
  const json = JSON.parse(
    readFileSync("./tokens/semantic/typography.json", "utf8"),
  );
  return flattenTypography(json.text ?? {}).map((entry) => ({
    name: entry.name,
    fontSize: resolveRef(entry.fontSize, palette),
    fontWeight: resolveRef(entry.fontWeight, palette),
    lineHeight: resolveRef(entry.lineHeight, palette),
    letterSpacing: resolveRef(entry.letterSpacing, palette),
  }));
};

const lineHeightAsMultiplier = (lineHeight, fontSize) => {
  const raw = String(lineHeight);
  if (raw.endsWith("px")) return parseFloat(raw) / parseFloat(fontSize);
  return parseFloat(raw);
};

const isPixelLength = (value) => String(value).endsWith("px");

const letterSpacingToPx = (letterSpacing, fontSize) => {
  const raw = String(letterSpacing);
  if (raw.endsWith("em")) return parseFloat(raw) * parseFloat(fontSize);
  return parseFloat(raw);
};

const parseEnums = (dictionary) => {
  const result = {};
  for (const t of dictionary.allTokens.filter((t) => t.path[0] === "ids")) {
    const values = val(t);
    if (Array.isArray(values)) result[t.path[1]] = values;
  }
  return result;
};

const COLOR_ROLES = JSON.parse(readFileSync("./color-roles.json", "utf8"));

const COLOR_FAMILIES = Object.values(COLOR_ROLES.families).flat();

const NEUTRAL_ONLY_SLOTS = COLOR_ROLES.neutralOnly;

const TEMPLATE_SLOTS = Object.entries(COLOR_ROLES.slots).flatMap(([property, names]) =>
  names.map((name) => ({ property, name, slot: `${property}-${name}` })),
);

const slotsOf = (family) =>
  TEMPLATE_SLOTS.filter(
    ({ slot }) => family === "neutral" || !NEUTRAL_ONLY_SLOTS.includes(slot),
  ).map(({ property, name, slot }) => ({
    property,
    name: name.replaceAll("{family}", family),
    slot: slot.replaceAll("{family}", family),
  }));

const FAMILY_SLOTS = COLOR_FAMILIES.flatMap((family) =>
  slotsOf(family).map((entry) => ({ ...entry, family })),
);

const colorVar = (slot) => `--ids-color-${slot}`;

const SCHEME = "scheme";

const SCHEME_SLOTS = TEMPLATE_SLOTS.filter(({ slot }) => !NEUTRAL_ONLY_SLOTS.includes(slot));

const NEUTRAL_SCHEME_REDIRECTS = COLOR_ROLES.scheme.neutral;

const schemeTarget = (family, slot) =>
  (family === "neutral" ? (NEUTRAL_SCHEME_REDIRECTS[slot] ?? slot) : slot).replaceAll(
    "{family}",
    family,
  );

const SCHEME_LAYER_IN_TEXT_COLOR = ["neutral"];

const MODES = ["light", "dark"];

const readTokenFile = (file, key) =>
  Object.entries(JSON.parse(readFileSync(`./tokens/${file}`, "utf8"))[key]);

const SHADOW_STEPS = readTokenFile("shadow.json", "shadow").map(([step, token]) => ({
  step,
  layers: token.$value,
}));

const COMPONENT_TOKENS = readTokenFile("component.json", "component").map(([name, token]) => ({
  name,
  property: name.slice(0, name.indexOf("-")),
  part: name.slice(name.indexOf("-") + 1),
  modes: token.$value,
}));

const COMPONENT_COLORS = COMPONENT_TOKENS.filter(({ property }) => property !== "shadow");

const COMPONENT_SHADOWS = COMPONENT_TOKENS.filter(({ property }) => property === "shadow");

const shadowStepOf = (reference) => reference.match(/^\{shadow\.([^}]+)\}$/)[1];

const shadowVar = (name) => `--ids-shadow-${name}`;

const px = (n) => (n === 0 ? "0" : `${n}px`);

const NO_SHADOW_THAT_STILL_COMPOSES = "0 0 #0000";

const cssShadow = (layers) =>
  layers.length === 0
    ? NO_SHADOW_THAT_STILL_COMPOSES
    : layers
        .map(({ x, y, blur, spread, color }) => `${px(x)} ${px(y)} ${px(blur)} ${px(spread)} ${color}`)
        .join(", ");

const themeVar = (mode, slot) => `--ids-theme-${mode}-${slot}`;

const TW_NS = {
  color: "--color-",
  spacing: "--spacing-",
  "font-size": "--text-",
  "font-family": "--font-",
  "font-weight": "--font-weight-",
  "letter-spacing": "--tracking-",
  "line-height": "--leading-",
  "tab-size": "--tab-size-",
  breakpoint: "--breakpoint-",
  container: "--container-",
  radius: "--radius-",
  "border-radius": "--radius-",
  shadow: "--shadow-",
  "inset-shadow": "--inset-shadow-",
  "drop-shadow": "--drop-shadow-",
  blur: "--blur-",
  perspective: "--perspective-",
  zoom: "--zoom-",
  aspect: "--aspect-",
  ease: "--ease-",
  animate: "--animate-",
};

const TYPOGRAPHY_CATS = [
  "font-size",
  "font-family",
  "font-weight",
  "letter-spacing",
  "line-height",
];
const TYPOGRAPHY_CATS_TAILWIND_HAS_NO_THEME_FOR = ["font-size-adjust"];

const T_CSS_THEME = `@theme inline {
{{THEME}}
}
`;

const T_CSS_THEME_ROOT = `:root {
{{ROOT}}
}

@theme inline {
{{THEME}}
}
`;

const T_DART_CLASS = `${GENERATED}

class {{NAME}} {
  {{NAME}}._();

{{MEMBERS}}
}
`;

const T_DART_ABSTRACT_CLASS = `${GENERATED}

import 'package:flutter/material.dart';

abstract final class {{NAME}} {
{{MEMBERS}}
}
`;

const T_DART_ENUM = `enum {{NAME}} {
{{VALUES}},
}`;

const T_TS_FILE = `${GENERATED}

{{BODY}}
`;

const T_CSS_TEXT_THEME = `  --text-{{NAME}}: var(--ids-text-{{NAME}});
  --text-{{NAME}}--font-weight: var(--ids-text-{{NAME}}--font-weight);
  --text-{{NAME}}--line-height: var(--ids-text-{{NAME}}--line-height);
  --text-{{NAME}}--letter-spacing: var(--ids-text-{{NAME}}--letter-spacing);`;

const T_CSS_TEXT_ROOT = `  --ids-text-{{NAME}}: {{FONT_SIZE}};
  --ids-text-{{NAME}}--font-weight: {{FONT_WEIGHT}};
  --ids-text-{{NAME}}--line-height: {{LINE_HEIGHT}};
  --ids-text-{{NAME}}--letter-spacing: {{LETTER_SPACING}};`;

const T_DART_TEXT_STYLE = `TextStyle(fontFamily: '{{FONT_FAMILY}}', package: '{{FONT_PACKAGE}}', fontSize: {{FONT_SIZE}}, fontWeight: FontWeight.w{{FONT_WEIGHT}}, height: {{LINE_HEIGHT}}, letterSpacing: {{LETTER_SPACING}})`;

const bridgeLines = ({ property, name, slot }) =>
  COLOR_ROLES.namespaces[property].map(
    (namespace) => `  ${namespace}-${name}: var(${colorVar(slot)});`,
  );

const SCHEME_BRIDGE_SLOTS = SCHEME_SLOTS.map(({ property, name, slot }) => ({
  property,
  name: name.replaceAll("{family}", SCHEME),
  slot: slot.replaceAll("{family}", SCHEME),
}));

const COMPONENT_BRIDGE_SLOTS = COMPONENT_COLORS.map(({ property, part, name }) => ({
  property,
  name: part,
  slot: name,
}));

const buildColorBridgeCSS = () =>
  render(T_CSS_THEME, {
    THEME: [
      ...[...FAMILY_SLOTS, ...SCHEME_BRIDGE_SLOTS, ...COMPONENT_BRIDGE_SLOTS].flatMap(bridgeLines),
      ...COMPONENT_SHADOWS.map(({ name, part }) => `  --shadow-${part}: var(--ids-${name});`),
    ].join("\n"),
  });

const schemeLayer = (family) =>
  SCHEME_LAYER_IN_TEXT_COLOR.includes(family)
    ? ["currentColor", "var(--ids-state-hover)", "var(--ids-state-press)"]
    : [`var(${colorVar(`bg-${family}-solid`)})`, "var(--ids-state-tint-hover)", "var(--ids-state-tint-press)"];

const buildSchemeCSS = () =>
  COLOR_FAMILIES.map((family) => {
    const [layer, hover, press] = schemeLayer(family);
    const lines = [
      ...SCHEME_SLOTS.map(
        ({ slot }) =>
          `  ${colorVar(slot.replaceAll("{family}", SCHEME))}: var(${colorVar(schemeTarget(family, slot))});`,
      ),
      `  --ids-state-layer-${SCHEME}: ${layer};`,
      `  --ids-state-layer-${SCHEME}-hover: ${hover};`,
      `  --ids-state-layer-${SCHEME}-press: ${press};`,
    ];
    return `@utility ${SCHEME}-${family} {\n${lines.join("\n")}\n}\n`;
  }).join("\n");

const buildStaticCSS = (dictionary) => {
  const lines = [
    ...["motion", "radius", "size", "state"].flatMap((cat) =>
      byCategory(dictionary, cat).map((t) => `  ${idsVar(cat, t)}: ${toVal(t)};`),
    ),
    ...SHADOW_STEPS.map(({ step, layers }) => `  ${shadowVar(step)}: ${cssShadow(layers)};`),
  ];
  const roundedUsesIdsRadius = byCategory(dictionary, "radius").map(
    (t) => `  --radius-${slug(t)}: var(${idsVar("radius", t)});`,
  );
  return `:root {\n${lines.join("\n")}\n}\n\n@theme inline {\n${roundedUsesIdsRadius.join("\n")}\n}\n`;
};

const T_CSS_ANIMATIONS = `@keyframes ids-progress-slide {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(400%);
  }
}

@keyframes ids-caret-blink {
  0%,
  70%,
  100% {
    opacity: 1;
  }
  20%,
  50% {
    opacity: 0;
  }
}

@keyframes ids-skeleton-pulse {
  50% {
    background-color: var(--ids-color-bg-block);
  }
}

@keyframes ids-skeleton-wave {
  from {
    background-position: -100% 0;
  }
  60%,
  to {
    background-position: 200% 0;
  }
}

@keyframes ids-shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0% 0;
  }
}

@keyframes ids-marquee {
  to {
    translate: var(--marquee-translate, -50%);
  }
}

@theme {
  --animate-progress-slide: ids-progress-slide 1.4s ease-in-out infinite;
  --animate-caret-blink: ids-caret-blink 1.25s ease-out infinite;
  --animate-skeleton-pulse: ids-skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  --animate-skeleton-wave: ids-skeleton-wave 2s ease-in-out infinite;
}
`;

const T_CSS_ANIMATIONS_READING_THE_ELEMENTS_VARIABLES = `@theme inline {
  --animate-marquee: ids-marquee var(--marquee-duration, 20s) linear infinite var(--marquee-direction, normal) var(--marquee-play-state, running);
}
`;

const darkModeRegion = `[data-mode="dark"], [data-mode="dark"] *`;
const lightRegionInsideDark = `[data-mode="dark"] [data-mode="light"], [data-mode="dark"] [data-mode="light"] *`;


const focusedInsideButNotInItsPopups = (marker) =>
  `&:has([${marker}]:focus-visible):not(:has([popover] [${marker}]:focus-visible))`;

const FOCUS_RING_TRIGGERS = {
  formControl: "&:focus-visible",
  useInteractive: "&[data-focus-visible]",
  shellAroundFieldInput: focusedInsideButNotInItsPopups("data-field-input"),
  textField: focusedInsideButNotInItsPopups("data-text-field-input"),
  textArea: focusedInsideButNotInItsPopups("data-text-area-input"),
};

const focusRingTriggers = (indent) =>
  Object.values(FOCUS_RING_TRIGGERS).join(`,\n${indent}`);

const T_CSS_VARIANTS = `@custom-variant dark (&:where(${darkModeRegion}):not(:where(${lightRegionInsideDark})));

@custom-variant focus-ring-visible {
  ${focusRingTriggers("  ")} {
    @slot;
  }
}
`;

const focusRingUtility = (name, line) => `@utility ${name} {
  outline: none;

  ${focusRingTriggers("  ")} {
    @apply ring-[3px] ring-${line}/40 inset-ring-${line};
  }

  &[aria-invalid="true"],
  &[data-invalid] {
    @apply inset-ring-danger-strong;

    ${focusRingTriggers("    ")} {
      @apply ring-danger-strong/40 inset-ring-danger-strong;
    }
  }
}
`;

const T_CSS_UTILITIES = `${focusRingUtility("focus-ring", "primary-strong")}
${focusRingUtility("focus-ring-scheme", "scheme-strong")}
${focusRingUtility("focus-ring-current", "current")}

@utility state-layer {
  background-image: linear-gradient(
    color-mix(in srgb, var(--ids-state-color, currentColor) var(--ids-state-opacity), transparent),
    color-mix(in srgb, var(--ids-state-color, currentColor) var(--ids-state-opacity), transparent)
  );
}

@utility state-hover {
  --ids-state-opacity: var(--ids-state-layer-hover, var(--ids-state-hover));
}

@utility state-press {
  --ids-state-opacity: var(--ids-state-layer-press, var(--ids-state-press));
}

@utility state-scheme {
  --ids-state-color: var(--ids-state-layer-scheme);
  --ids-state-layer-hover: var(--ids-state-layer-scheme-hover);
  --ids-state-layer-press: var(--ids-state-layer-scheme-press);
}

@utility state-fill {
  --ids-state-color: var(--ids-state-fill-color);
  --ids-state-layer-hover: var(--ids-state-fill-hover);
  --ids-state-layer-press: var(--ids-state-fill-press);
}

@utility font-mono {
  font-size-adjust: var(--ids-font-size-adjust-mono);
}

@utility shimmer {
  background-image: linear-gradient(
    90deg,
    currentColor calc(50% - var(--ids-shimmer-spread, 3em)),
    var(--ids-shimmer-color, var(--ids-color-text-neutral-strong)) 50%,
    currentColor calc(50% + var(--ids-shimmer-spread, 3em))
  );
  background-size: calc(200% + 2 * var(--ids-shimmer-spread, 3em)) 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ids-shimmer var(--ids-shimmer-duration, 2s) linear infinite;

  @variant rtl {
    animation-direction: reverse;
  }

  @media (prefers-reduced-motion: reduce) {
    background-image: none;
    -webkit-text-fill-color: currentColor;
    animation: none;
  }
}

@utility document-text {
  & > :where(* + *) {
    @apply mt-5;
  }
  & > :where(* + :is(h1, h2)) {
    @apply mt-9;
  }
  & > :where(* + :is(h3, h4, h5, h6)) {
    @apply mt-7;
  }
  & > :where(:is(h1, h2, h3, h4, h5, h6) + *) {
    @apply mt-3;
  }
  & :where(li + li, li > * + *, blockquote > * + *) {
    @apply mt-2;
  }

  & :where(h1) {
    @apply text-headline-h4-semibold;
  }
  & :where(h2) {
    @apply text-headline-h5-semibold;
  }
  & :where(h3) {
    @apply text-headline-h6-semibold;
  }
  & :where(h4) {
    @apply text-body-b1-semibold tracking-snug;
  }
  & :where(h5, h6) {
    @apply text-body-b2-semibold tracking-snug;
  }

  & :where(ul, ol) {
    @apply ps-6;
  }
  & :where(ul) {
    @apply list-disc marker:text-(--ids-color-border-neutral-strong);
  }
  & :where(ul ul) {
    list-style-type: circle;
  }
  & :where(ol) {
    @apply list-decimal marker:text-neutral;
  }
  & :where(blockquote) {
    @apply border-s-2 border-neutral ps-4 text-neutral;
  }
  & :where(pre:not(figure pre)) {
    @apply rounded-standard border border-neutral px-4 py-3 font-mono leading-b2 whitespace-pre-wrap;
  }
  & :where(:not(pre) > code) {
    @apply rounded-indicator border border-neutral bg-neutral-soft px-1.5 py-px font-mono;
  }
  & :where(a) {
    @apply font-medium underline decoration-(--ids-color-border-neutral-strong) underline-offset-4 hover:decoration-current;
  }
  & :where(hr) {
    @apply border-neutral;
  }
}
`;

const CONCENTRIC_PADS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8];

const PAGE_OVERLAY_AND_OVERLAY_IN_OVERLAY = [0, 1, 2];

const concentricClass = (n) => `.concentric-p-${String(n).replace(".", "\\.")}`;

const withinPopovers = (depth) => {
  const path = Array(depth).fill("[popover]").join(" ");
  return `${path}, ${path} *`;
};

const nestedChains = [
  ...CONCENTRIC_PADS.map((a) => ({ sum: a, sel: concentricClass(a) })),
  ...CONCENTRIC_PADS.flatMap((a) =>
    CONCENTRIC_PADS.map((b) => ({
      sum: a + b,
      sel: `:where(${concentricClass(a)}) ${concentricClass(b)}`,
    })),
  ),
];

const nestedRulesAt = (depth) => {
  const containerDepth = depth === 0 ? "" : `:is(${withinPopovers(depth)})`;
  const notBehindAnotherPopover = `:not(${withinPopovers(depth + 1)})`;
  const sums = [...new Set(nestedChains.map((c) => c.sum))].sort((x, y) => x - y);
  return sums.map((sum) => {
    const chains = nestedChains
      .filter((c) => c.sum === sum)
      .map((c) => `${c.sel}${notBehindAnotherPopover}`);
    return `  [class*="concentric-p-"]${containerDepth}:has(\n    ${chains.join(",\n    ")}\n  ) {\n    --ids-concentric-nested: calc(var(--spacing) * ${sum});\n  }`;
  });
};

const buildConcentricCSS = () => {

  return `@property --ids-concentric-pad {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@property --ids-concentric-nested {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@utility concentric-p-* {
  --ids-concentric-pad: --spacing(--value(number));
  padding: var(--ids-concentric-pad);
  border-radius: min(
    var(--ids-radius-standard) +
      (var(--ids-concentric-pad) + var(--ids-concentric-nested)) * var(--ids-corner-radius-scale, 1),
    var(--ids-radius-container)
  );
}

@layer utilities {
${PAGE_OVERLAY_AND_OVERLAY_IN_OVERLAY.flatMap(nestedRulesAt).join("\n")}
}
`;
};

const buildTypographyCSS = (dictionary) => {
  const palette = buildPalette(dictionary);
  const entries = readTypographyEntries(palette);

  const themePrimitiveLines = TYPOGRAPHY_CATS.flatMap((cat) =>
    byPath(dictionary, cat).map(
      (t) => `  ${TW_NS[cat]}${slug(t)}: var(${idsVar(cat, t)});`,
    ),
  );

  return render(T_CSS_THEME_ROOT, {
    THEME: [
      ...entries.map(({ name }) => render(T_CSS_TEXT_THEME, { NAME: name })),
      ...themePrimitiveLines,
    ].join("\n"),
    ROOT: [
      ...entries.map(
        ({ name, fontSize, fontWeight, lineHeight, letterSpacing }) =>
          render(T_CSS_TEXT_ROOT, {
            NAME: name,
            FONT_SIZE: fontSize,
            FONT_WEIGHT: fontWeight,
            LINE_HEIGHT: lineHeight,
            LETTER_SPACING: letterSpacing,
          }),
      ),
      ...[...TYPOGRAPHY_CATS, ...TYPOGRAPHY_CATS_TAILWIND_HAS_NO_THEME_FOR].flatMap((cat) =>
        byPath(dictionary, cat).map((t) => `  ${idsVar(cat, t)}: ${toVal(t)};`),
      ),
    ].join("\n"),
  });
};

const neutralFallbacks = (dictionary, mode) => {
  const scale = neutralScale(dictionary, mode);
  return Object.fromEntries(
    Object.entries(NEUTRAL_ROLE_STEPS).map(([slot, step]) => [slot, scale[step - 1]]),
  );
};

const providerValue = (mode, slot, fallbacks) => {
  if (slot in fallbacks) return `var(${themeVar(mode, slot)}, ${fallbacks[slot]})`;
  return `var(${themeVar(mode, slot)})`;
};

const buildColorRolesCSS = (dictionary, mode) => {
  const fallbacks = neutralFallbacks(dictionary, mode);
  const lines = [
    ...FAMILY_SLOTS.map(({ slot }) => `  ${colorVar(slot)}: ${providerValue(mode, slot, fallbacks)};`),
    ...COMPONENT_COLORS.map(({ name, modes }) => `  ${colorVar(name)}: var(${colorVar(modes[mode])});`),
    ...COMPONENT_SHADOWS.map(
      ({ name, modes }) => `  --ids-${name}: var(${shadowVar(shadowStepOf(modes[mode]))});`,
    ),
  ];
  return block(`[data-mode="${mode}"]`, lines);
};

const T_CSS_CORNER_SHAPE = `@layer base {
  [data-mode],
  [data-mode] * {
    corner-shape: var(--ids-corner-shape, round);
  }

  [data-mode]::before,
  [data-mode]::after,
  [data-mode] *::before,
  [data-mode] *::after {
    corner-shape: inherit;
  }
}

@utility rounded-full {
  corner-shape: round;
}

@supports (corner-shape: squircle) {
  [data-mode] {
    --ids-corner-radius-scale: var(--ids-theme-corner-radius-scale, 1);
  }
}
`;

const T_CSS_BACKGROUND_UNDERNEATH = `@layer base {
  [data-mode]:not([data-mode] [data-mode]),
  [data-mode].bg-base {
    --ids-bg-current: var(--ids-color-bg-base);
  }

  .bg-surface {
    --ids-bg-current: var(--ids-color-bg-surface);
  }

  .bg-block {
    --ids-bg-current: var(--ids-color-bg-block);
  }
}
`;

const T_CSS_STATE_LAYER_PROPERTIES = `@property --ids-state-opacity {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}

@property --ids-state-color {
  syntax: "*";
  inherits: false;
}

@property --ids-state-layer-hover {
  syntax: "*";
  inherits: false;
}

@property --ids-state-layer-press {
  syntax: "*";
  inherits: false;
}
`;

const LENGTHS_SCRIPTS_READ_IN_PIXELS = ["--scroll-area-thickness", "--scroll-area-gap"];

const T_CSS_REGISTERED_LENGTHS = LENGTHS_SCRIPTS_READ_IN_PIXELS.map(
  (name) => `@property ${name} {\n  syntax: "<length>";\n  inherits: true;\n  initial-value: 0px;\n}\n`,
).join("\n");

const SCALE = "var(--ids-scale, 1)";

const SPACING_UNIT = "0.25rem";

const scaled = (value) => `calc(${value} * ${SCALE})`;

const scaledToWholePixels = (value) => `round(${scaled(value)}, 1px)`;

const radiusFromTheProvider = (dictionary) =>
  byCategory(dictionary, "radius")
    .filter((t) => slug(t) !== "full")
    .map(
      (t) =>
        `  ${idsVar("radius", t)}: ${scaledToWholePixels(`var(--ids-theme-radius-${slug(t)}, ${toVal(t)}) * var(--ids-corner-radius-scale, 1)`)};`,
    );

const lengthsTheScaleMultiplies = (dictionary) => [
  ...readTypographyEntries(buildPalette(dictionary)).flatMap(({ name, fontSize, lineHeight }) => [
    [`--ids-text-${name}`, fontSize],
    ...(isPixelLength(lineHeight) ? [[`--ids-text-${name}--line-height`, lineHeight]] : []),
  ]),
  ...byPath(dictionary, "font-size").map((t) => [idsVar("font-size", t), toVal(t)]),
  ...byPath(dictionary, "line-height")
    .filter((t) => isPixelLength(toVal(t)))
    .map((t) => [idsVar("line-height", t), toVal(t)]),
  ...byCategory(dictionary, "size").map((t) => [idsVar("size", t), toVal(t)]),
];

const scaledLengths = (dictionary) => [
  `  --spacing: ${scaled(SPACING_UNIT)};`,
  ...lengthsTheScaleMultiplies(dictionary).map(
    ([name, value]) => `  ${name}: ${scaledToWholePixels(value)};`,
  ),
];

const block = (selector, lines) => `${selector} {\n${lines.join("\n")}\n}\n`;

const buildScaleCSS = (dictionary) =>
  [
    block("[data-mode]", radiusFromTheProvider(dictionary)),
    block("[data-scale]", scaledLengths(dictionary)),
  ].join("\n");

const cssFormatter = ({ dictionary }) =>
  [
    buildColorBridgeCSS(),
    buildStaticCSS(dictionary),
    T_CSS_ANIMATIONS,
    T_CSS_ANIMATIONS_READING_THE_ELEMENTS_VARIABLES,
    T_CSS_VARIANTS,
    T_CSS_UTILITIES,
    buildSchemeCSS(),
    buildConcentricCSS(),
    buildTypographyCSS(dictionary),
    T_CSS_CORNER_SHAPE,
    T_CSS_BACKGROUND_UNDERNEATH,
    buildScaleCSS(dictionary),
    T_CSS_REGISTERED_LENGTHS,
    T_CSS_STATE_LAYER_PROPERTIES,
    buildColorRolesCSS(dictionary, "light"),
    buildColorRolesCSS(dictionary, "dark"),
  ].join("\n");

const ENUMS_THE_APP_DEFINES_IN_REACT = ["color"];

const tsTypesFormatter = ({ dictionary }) => {
  const enums = Object.fromEntries(
    Object.entries(parseEnums(dictionary)).filter(
      ([key]) => !ENUMS_THE_APP_DEFINES_IN_REACT.includes(key),
    ),
  );
  return render(T_TS_FILE, {
    BODY: Object.entries(enums)
      .map(
        ([key, values]) =>
          `export type ${enumName(key)} = ${values.map((v) => `'${v}'`).join(" | ")};`,
      )
      .join("\n"),
  });
};


const tsList = (values) => `[${values.map((v) => `'${v}'`).join(", ")}]`;

const tsRecord = (entries, indent) =>
  `{\n${Object.entries(entries)
    .map(([key, value]) => `${indent}  '${key}': ${value},`)
    .join("\n")}\n${indent}}`;

const neutralScale = (dictionary, mode) =>
  byPath(dictionary, "neutral")
    .filter((t) => t.path[1] === mode)
    .sort((a, b) => Number(a.path[2]) - Number(b.path[2]))
    .map(val);

const stateTokens = (dictionary, type) =>
  byCategory(dictionary, "state").filter((t) => (t.$type ?? t.type) === type);

const stateOpacity = (dictionary) =>
  Object.fromEntries(stateTokens(dictionary, "number").map((t) => [toCamel(slug(t)), parseFloat(val(t)) / 100]));

const stateFillColor = (dictionary) => val(stateTokens(dictionary, "color").find((t) => slug(t) === "fill-color"));

const tsColorRolesFormatter = ({ dictionary }) =>
  render(T_TS_FILE, {
    BODY: [
      ...Object.entries(COLOR_ROLES.families).map(
        ([group, families]) =>
          `export const IDS_${group.toUpperCase()}_FAMILIES = ${tsList(families)} as const;`,
      ),
      `export const IDS_COLOR_FAMILIES = ${tsList(COLOR_FAMILIES)} as const;`,
      `export const IDS_FAMILY_SLOTS = ${tsList(TEMPLATE_SLOTS.map(({ slot }) => slot))} as const;`,
      `export const IDS_NEUTRAL_ONLY_SLOTS = ${tsList(NEUTRAL_ONLY_SLOTS)} as const;`,
      `export const IDS_STATE_OPACITY = ${tsRecord(stateOpacity(dictionary), "")} as const;`,
      `export const IDS_STATE_FILL_COLOR = '${stateFillColor(dictionary)}';`,
      `export const IDS_NEUTRAL_SCALES = {\n${MODES.map(
        (mode) => `  ${mode}: ${tsList(neutralScale(dictionary, mode))},`,
      ).join("\n")}\n} as const;`,
      `export const IDS_NEUTRAL_STEPS = ${tsRecord(NEUTRAL_ROLE_STEPS, "")} as const;`,
    ].join("\n\n"),
  });

const dartEnumsFormatter = ({ dictionary }) => {
  const enums = parseEnums(dictionary);
  const blocks = Object.entries(enums)
    .filter(([key]) => key !== "color")
    .map(([key, values]) => [key, key === "mode" ? [...values, "system"] : values])
    .map(([key, values]) =>
      render(T_DART_ENUM, {
        NAME: enumName(key),
        VALUES: values
          .map(
            (v) =>
              `  ${toCamel(v.replace(/^(\d+)x*/, (_, n) => "x".repeat(Number(n))))}`,
          )
          .join(",\n"),
      }),
    )
    .join("\n\n");
  return `${GENERATED}\n\n${blocks}\n`;
};

const dartList = (values) => `<String>[${values.map((v) => `'${v}'`).join(", ")}]`;

const dartRoleField = (slot) => toCamel(slot);

const T_DART_COLOR_ROLES = `${GENERATED}

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import 'ids_enums.dart';

abstract final class IdsColorRoles {
{{LISTS}}

  static const neutralScales = <IdsMode, List<Color>>{
{{NEUTRAL_SCALES}}
  };

  static const neutralSteps = <String, int>{
{{NEUTRAL_STEPS}}
  };

  static List<String> slotsOf(String family) => [
    for (final slot in familySlots)
      if (family == 'neutral' || !neutralOnlySlots.contains(slot))
        slot.replaceAll('{family}', family),
  ];
}

abstract final class IdsStateOpacity {
{{STATE_OPACITY}}
}

abstract final class IdsStateLayer {
  static const fillColor = Color({{STATE_FILL_COLOR}});
}

@immutable
class IdsColors {
  const IdsColors({
{{PARAMS}}
  });

  factory IdsColors.fromRoles(Map<String, Color> roles) {
    Color role(String name) =>
        roles[name] ?? (throw ArgumentError.value(name, 'roles', 'is missing'));
    return IdsColors(
{{FROM_ROLES}}
    );
  }

{{FIELDS}}

  Map<String, Color> get roles => {
{{ROLES}}
  };

  Color operator [](String role) =>
      roles[role] ?? (throw ArgumentError.value(role, 'role', 'is not an IDS color role'));

  @override
  bool operator ==(Object other) =>
      other is IdsColors &&
{{EQUALS}};

  @override
  int get hashCode => Object.hashAll(roles.values);
}
`;

const dartColorRolesFormatter = ({ dictionary }) => {
  const allSlots = FAMILY_SLOTS.map(({ slot }) => slot);
  const lists = [
    ...Object.entries(COLOR_ROLES.families).map(
      ([group, families]) => `  static const ${group}Families = ${dartList(families)};`,
    ),
    `  static const families = ${dartList(COLOR_FAMILIES)};`,
    `  static const familySlots = ${dartList(TEMPLATE_SLOTS.map(({ slot }) => slot))};`,
    `  static const neutralOnlySlots = ${dartList(NEUTRAL_ONLY_SLOTS)};`,
    `  static const all = ${dartList(allSlots)};`,
  ];
  const scales = MODES.map(
    (mode) =>
      `    IdsMode.${mode}: [\n${neutralScale(dictionary, mode)
        .map((hex) => `      ${hexToFlutterColor(hex).replace(/^const /, "")},`)
        .join("\n")}\n    ],`,
  );
  const steps = Object.entries(NEUTRAL_ROLE_STEPS).map(
    ([slot, step]) => `    '${slot}': ${step},`,
  );
  return render(T_DART_COLOR_ROLES, {
    LISTS: lists.join("\n"),
    NEUTRAL_SCALES: scales.join("\n"),
    NEUTRAL_STEPS: steps.join("\n"),
    STATE_FILL_COLOR: `0xFF${stateFillColor(dictionary).slice(1).toUpperCase()}`,
    STATE_OPACITY: Object.entries(stateOpacity(dictionary))
      .map(([name, value]) => `  static const double ${name} = ${value};`)
      .join("\n"),
    PARAMS: allSlots.map((slot) => `    required this.${dartRoleField(slot)},`).join("\n"),
    FROM_ROLES: allSlots
      .map((slot) => `      ${dartRoleField(slot)}: role('${slot}'),`)
      .join("\n"),
    FIELDS: allSlots.map((slot) => `  final Color ${dartRoleField(slot)};`).join("\n"),
    ROLES: allSlots.map((slot) => `    '${slot}': ${dartRoleField(slot)},`).join("\n"),
    EQUALS: allSlots
      .map((slot) => `      other.${dartRoleField(slot)} == ${dartRoleField(slot)}`)
      .join(" &&\n"),
  });
};

const tsComponentTokensFormatter = () =>
  render(T_TS_FILE, {
    BODY: [
      `export const IDS_SHADOWS = ${tsRecord(
        Object.fromEntries(SHADOW_STEPS.map(({ step, layers }) => [step, `'${cssShadow(layers)}'`])),
        "",
      )} as const;`,
      `export const IDS_COMPONENT_COLORS = ${tsRecord(
        Object.fromEntries(
          COMPONENT_COLORS.map(({ name, modes }) => [
            name,
            `{ ${MODES.map((mode) => `${mode}: '${modes[mode]}'`).join(", ")} }`,
          ]),
        ),
        "",
      )} as const;`,
      `export const IDS_COMPONENT_SHADOWS = ${tsRecord(
        Object.fromEntries(
          COMPONENT_SHADOWS.map(({ name, modes }) => [
            name,
            `{ ${MODES.map((mode) => `${mode}: '${shadowStepOf(modes[mode])}'`).join(", ")} }`,
          ]),
        ),
        "",
      )} as const;`,
    ].join("\n\n"),
  });

const dartColor = (hex) => {
  const [r, g, b, a = "ff"] = hex.slice(1).match(/../g);
  return `Color(0x${(a + r + g + b).toUpperCase()})`;
};

const dartBoxShadow = ({ x, y, blur, spread, color }) =>
  `BoxShadow(color: ${dartColor(color)}, offset: Offset(${x}, ${y}), blurRadius: ${blur}, spreadRadius: ${spread})`;

const dartModeMap = (type, entries) =>
  `<IdsMode, Map<String, ${type}>>{\n${MODES.map(
    (mode) =>
      `    IdsMode.${mode}: {\n${entries
        .map(([name, value]) => `      '${name}': ${value(mode)},`)
        .join("\n")}\n    },`,
  ).join("\n")}\n  }`;

const T_DART_COMPONENT_TOKENS = `${GENERATED}

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import 'ids_color_roles.dart';
import 'ids_enums.dart';

abstract final class IdsShadows {
  static const steps = <String, List<BoxShadow>>{
{{SHADOW_STEPS}}
  };
}

abstract final class IdsComponentTokens {
  static const colorRoles = {{COLOR_ROLES}};

  static const shadowSteps = {{SHADOW_TOKENS}};

  static Map<String, T> inMode<T>(Map<IdsMode, Map<String, T>> table, IdsMode mode) =>
      table[mode] ?? (throw ArgumentError.value(mode, 'mode', 'is not light or dark'));
}

@immutable
class IdsComponentColors {
  const IdsComponentColors({
{{COLOR_PARAMS}}
  });

  factory IdsComponentColors.of(IdsColors colors, IdsMode mode) {
    final roles = IdsComponentTokens.inMode(IdsComponentTokens.colorRoles, mode);
    Color token(String name) => colors[roles[name]!];
    return IdsComponentColors(
{{COLOR_FROM}}
    );
  }

{{COLOR_FIELDS}}

  Map<String, Color> get tokens => {
{{COLOR_TOKENS}}
  };

  @override
  bool operator ==(Object other) =>
      other is IdsComponentColors &&
{{COLOR_EQUALS}};

  @override
  int get hashCode => Object.hashAll(tokens.values);
}

@immutable
class IdsComponentShadows {
  const IdsComponentShadows({
{{SHADOW_PARAMS}}
  });

  factory IdsComponentShadows.of(IdsMode mode) {
    final steps = IdsComponentTokens.inMode(IdsComponentTokens.shadowSteps, mode);
    List<BoxShadow> token(String name) => IdsShadows.steps[steps[name]!]!;
    return IdsComponentShadows(
{{SHADOW_FROM}}
    );
  }

{{SHADOW_FIELDS}}

  @override
  bool operator ==(Object other) =>
      other is IdsComponentShadows &&
{{SHADOW_EQUALS}};

  @override
  int get hashCode => Object.hashAll([{{SHADOW_HASH}}]);
}
`;

const dartComponentTokensFormatter = () => {
  const colors = COMPONENT_COLORS.map(({ name }) => [name, toCamel(name)]);
  const shadows = COMPONENT_SHADOWS.map(({ name }) => [name, toCamel(name)]);
  return render(T_DART_COMPONENT_TOKENS, {
    SHADOW_STEPS: SHADOW_STEPS.map(
      ({ step, layers }) =>
        `    '${step}': <BoxShadow>[${layers.map(dartBoxShadow).join(", ")}],`,
    ).join("\n"),
    COLOR_ROLES: dartModeMap(
      "String",
      COMPONENT_COLORS.map(({ name, modes }) => [name, (mode) => `'${modes[mode]}'`]),
    ),
    SHADOW_TOKENS: dartModeMap(
      "String",
      COMPONENT_SHADOWS.map(({ name, modes }) => [name, (mode) => `'${shadowStepOf(modes[mode])}'`]),
    ),
    COLOR_PARAMS: colors.map(([, field]) => `    required this.${field},`).join("\n"),
    COLOR_FROM: colors.map(([name, field]) => `      ${field}: token('${name}'),`).join("\n"),
    COLOR_FIELDS: colors.map(([, field]) => `  final Color ${field};`).join("\n"),
    COLOR_TOKENS: colors.map(([name, field]) => `    '${name}': ${field},`).join("\n"),
    COLOR_EQUALS: colors.map(([, field]) => `      other.${field} == ${field}`).join(" &&\n"),
    SHADOW_PARAMS: shadows.map(([, field]) => `    required this.${field},`).join("\n"),
    SHADOW_FROM: shadows.map(([name, field]) => `      ${field}: token('${name}'),`).join("\n"),
    SHADOW_FIELDS: shadows.map(([, field]) => `  final List<BoxShadow> ${field};`).join("\n"),
    SHADOW_EQUALS: shadows
      .map(([, field]) => `      listEquals(other.${field}, ${field})`)
      .join(" &&\n"),
    SHADOW_HASH: shadows.map(([, field]) => `...${field}`).join(", "),
  });
};

const dartMotionFormatter = ({ dictionary }) =>
  render(T_DART_CLASS, {
    NAME: "IdsMotion",
    MEMBERS: byCategory(dictionary, "motion")
      .map(
        (t) =>
          `  static const Duration ${t.path[1]} = Duration(milliseconds: ${parseFloat(val(t))});`,
      )
      .join("\n"),
  });

const fontStack = (dictionary, name) =>
  val(byPath(dictionary, "font-family").find((t) => t.path[1] === name));

const FAMILIES_FLUTTER_CANNOT_NAME = ["sans-serif", "ui-monospace"];

const bundledFontPath = (fontFamily, fontPackage) => `packages/${fontPackage}/${fontFamily}`;

const flutterFallback = (stack, monoFontFamily, sansFontFamily, fontPackage) => [
  ...new Set(
    stack
      .filter((name) => !FAMILIES_FLUTTER_CANNOT_NAME.includes(name))
      .filter((name) => !monoFontFamily.startsWith(name))
      .map((name) =>
        name.startsWith("Pretendard") ? bundledFontPath(sansFontFamily, fontPackage) : name,
      ),
  ),
];

const dartTypographyFormatter = ({ dictionary }) => {
  const palette = buildPalette(dictionary);
  const [sansFontFamily] = fontStack(dictionary, "sans");
  const [monoFontFamily, ...monoFallback] = fontStack(dictionary, "mono");
  const fontPackage = "ids_flutter";
  const members = [
    `  static const sansFontFamily = '${sansFontFamily}';`,
    `  static const sansFontPackage = '${fontPackage}';`,
    `  static const monoFontFamily = '${bundledFontPath(monoFontFamily, fontPackage)}';`,
    `  static const monoFontFamilyFallback = ${dartList(
      flutterFallback(monoFallback, monoFontFamily, sansFontFamily, fontPackage),
    )};`,
    ...readTypographyEntries(palette).map(
      ({ name, fontSize, fontWeight, lineHeight, letterSpacing }) =>
        `  static const ${toCamel(name)} = ${render(T_DART_TEXT_STYLE, {
          FONT_FAMILY: sansFontFamily,
          FONT_PACKAGE: fontPackage,
          FONT_SIZE: parseFloat(fontSize),
          FONT_WEIGHT: parseInt(fontWeight),
          LINE_HEIGHT: lineHeightAsMultiplier(lineHeight, fontSize),
          LETTER_SPACING: Number(letterSpacingToPx(letterSpacing, fontSize).toFixed(4)),
        })};`,
    ),
  ];
  return render(T_DART_ABSTRACT_CLASS, {
    NAME: "IdsTypography",
    MEMBERS: members.join("\n"),
  });
};

for (const [name, format] of [
  ["ids/css", cssFormatter],
  ["ids/ts-types", tsTypesFormatter],
  ["ids/ts-color-roles", tsColorRolesFormatter],
  ["ids/dart-enums", dartEnumsFormatter],
  ["ids/dart-color-roles", dartColorRolesFormatter],
  ["ids/dart-motion", dartMotionFormatter],
  ["ids/ts-component-tokens", tsComponentTokensFormatter],
  ["ids/dart-component-tokens", dartComponentTokensFormatter],
  ["ids/dart-typography", dartTypographyFormatter],
]) {
  StyleDictionary.registerFormat({ name, format });
}

export default {
  log: { warnings: "disabled" },
  source: ["tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      prefix: "ids",
      files: [{ destination: "../css/dist/ids.css", format: "ids/css" }],
    },
    ts: {
      transformGroup: "js",
      files: [
        { destination: "../react/src/tokens/types.ts", format: "ids/ts-types" },
        { destination: "../react/src/tokens/color-roles.ts", format: "ids/ts-color-roles" },
        { destination: "../react/src/tokens/component-tokens.ts", format: "ids/ts-component-tokens" },
      ],
    },
    dart: {
      transformGroup: "js",
      files: [
        { destination: "../flutter/lib/tokens/ids_enums.dart", format: "ids/dart-enums" },
        {
          destination: "../flutter/lib/tokens/ids_color_roles.dart",
          format: "ids/dart-color-roles",
        },
        { destination: "../flutter/lib/tokens/ids_motion.dart", format: "ids/dart-motion" },
        {
          destination: "../flutter/lib/tokens/ids_component_tokens.dart",
          format: "ids/dart-component-tokens",
        },
        {
          destination: "../flutter/lib/tokens/ids_typography.dart",
          format: "ids/dart-typography",
        },
      ],
    },
  },
};
