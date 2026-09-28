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
const mapName = (color, mode) =>
  `_${color}${mode.charAt(0).toUpperCase() + mode.slice(1)}`;

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

const readColorEntriesWithoutCollision = (color, mode, palette) => {
  const json = JSON.parse(
    readFileSync(`./tokens/semantic/${color}.${mode}.json`, "utf8"),
  );
  return Object.entries(json.color ?? {}).map(([name, token]) => ({
    name,
    value: resolveRef(token.$value ?? token.value, palette),
  }));
};

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

const colorPairs = [
  ...new Map(
    readdirSync("./tokens/semantic").flatMap((f) => {
      const m = f.match(/^([^.]+)\.(light|dark)\.json$/);
      return m && m[1] !== "neutral" && m[1] !== "status"
        ? [[`${m[1]}.${m[2]}`, [m[1], m[2]]]]
        : [];
    }),
  ).values(),
];

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

const T_CSS_THEME = `@theme {
{{THEME}}
}
`;

const T_CSS_THEME_ROOT = `:root {
{{ROOT}}
}

@theme {
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

const T_DART_IDS_TOKENS = `${GENERATED}

import 'package:flutter/material.dart';
import 'ids_enums.dart';

class IdsTokens {
  IdsTokens._();

  static Color resolve({
    required IdsColor color,
    required IdsMode mode,
    required String token,
  }) {
    return switch ((color, mode)) {
{{CASES}}
    };
  }

{{MAPS}}
}
`;

const T_DART_COLOR_MAP = `  static const {{NAME}} = <String, Color>{
{{ENTRIES}}
  };`;

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

const buildColorBridgeCSS = (dictionary) => {
  const seen = new Set();
  const theme = dictionary.allTokens
    .filter((t) => {
      if (t.attributes?.category !== "color" || t.path[0] === "ids")
        return false;
      if (seen.has(slug(t))) return false;
      seen.add(slug(t));
      return true;
    })
    .map((t) => `  ${TW_NS.color}${slug(t)}: var(${idsVar("color", t)});`)
    .join("\n");
  return render(T_CSS_THEME, { THEME: theme });
};

const buildStaticCSS = (dictionary) => {
  const lines = ["motion", "radius", "size"].flatMap((cat) =>
    byCategory(dictionary, cat).map((t) => `  ${idsVar(cat, t)}: ${toVal(t)};`),
  );
  const roundedUsesIdsRadius = byCategory(dictionary, "radius").map(
    (t) => `  --radius-${slug(t)}: var(${idsVar("radius", t)});`,
  );
  return `:root {\n${lines.join("\n")}\n}\n\n@theme {\n${roundedUsesIdsRadius.join("\n")}\n}\n`;
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

@theme {
  --animate-progress-slide: ids-progress-slide 1.4s ease-in-out infinite;
  --animate-caret-blink: ids-caret-blink 1.25s ease-out infinite;
}
`;

const darkModeRegion = `[data-mode="dark"], [data-mode="dark"] *`;
const lightRegionInsideDark = `[data-mode="dark"] [data-mode="light"], [data-mode="dark"] [data-mode="light"] *`;

const T_CSS_VARIANTS = `@custom-variant dark (&:where(${darkModeRegion}):not(:where(${lightRegionInsideDark})));
`;

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

const T_CSS_UTILITIES = `@utility focus-ring {
  outline: none;

  ${focusRingTriggers("  ")} {
    @apply ring-[3px] ring-(--ids-color-primary)/40 inset-ring-(--ids-color-primary);
  }

  &[aria-invalid="true"],
  &[data-invalid] {
    @apply inset-ring-(--ids-color-danger);

    ${focusRingTriggers("    ")} {
      @apply ring-(--ids-color-danger)/40 inset-ring-(--ids-color-danger);
    }
  }
}

@utility font-mono {
  font-size-adjust: var(--ids-font-size-adjust-mono);
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
  border-radius: calc(
    var(--ids-radius-standard) + var(--ids-concentric-pad) + var(--ids-concentric-nested)
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

const buildColorThemeCSS = (dictionary, color, mode, selector) => {
  const lines = readColorEntriesWithoutCollision(color, mode, buildPalette(dictionary)).map(
    ({ name, value }) => `  --ids-color-${name}: ${value};`,
  );
  return `${selector} {\n${lines.join("\n")}\n}\n`;
};

const cssFormatter = ({ dictionary }) =>
  [
    buildColorBridgeCSS(dictionary),
    buildStaticCSS(dictionary),
    T_CSS_ANIMATIONS,
    T_CSS_VARIANTS,
    T_CSS_UTILITIES,
    buildConcentricCSS(),
    buildTypographyCSS(dictionary),
    ...colorPairs.map(([c, m]) =>
      buildColorThemeCSS(
        dictionary,
        c,
        m,
        `[data-color="${c}"][data-mode="${m}"]`,
      ),
    ),
    buildColorThemeCSS(dictionary, "neutral", "light", '[data-mode="light"]'),
    buildColorThemeCSS(dictionary, "neutral", "dark", '[data-mode="dark"]'),
    buildColorThemeCSS(dictionary, "status", "light", '[data-mode="light"]'),
    buildColorThemeCSS(dictionary, "status", "dark", '[data-mode="dark"]'),
  ].join("\n");

const tsTypesFormatter = ({ dictionary }) => {
  const enums = parseEnums(dictionary);
  return render(T_TS_FILE, {
    BODY: Object.entries(enums)
      .map(
        ([key, values]) =>
          `export type ${enumName(key)} = ${values.map((v) => `'${v}'`).join(" | ")};`,
      )
      .join("\n"),
  });
};

const dartEnumsFormatter = ({ dictionary }) => {
  const enums = parseEnums(dictionary);
  const blocks = Object.entries(enums)
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

const dartColorTokensFormatter = ({ dictionary }) => {
  const palette = buildPalette(dictionary);
  const toColorLine = ({ name, value }) =>
    `    '${name}': ${hexToFlutterColor(value)},`;

  const cases = colorPairs
    .map(
      ([c, m]) =>
        `      (IdsColor.${c}, IdsMode.${m}) => ${mapName(c, m)}[token] ?? Colors.transparent,`,
    )
    .join("\n");

  const maps = colorPairs
    .map(([c, m]) =>
      render(T_DART_COLOR_MAP, {
        NAME: mapName(c, m),
        ENTRIES: [
          ...readColorEntriesWithoutCollision(c, m, palette),
          ...readColorEntriesWithoutCollision("status", m, palette),
        ]
          .map(toColorLine)
          .join("\n"),
      }),
    )
    .join("\n\n");

  return render(T_DART_IDS_TOKENS, { CASES: cases, MAPS: maps });
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

const dartTypographyFormatter = ({ dictionary }) => {
  const palette = buildPalette(dictionary);
  const sansFontFamily = byPath(dictionary, "font-family")
    .find((t) => t.path[1] === "sans");
  const baseFontFamily = sansFontFamily
    ? val(sansFontFamily)[0]
    : "Pretendard GOV Variable";
  const fontFamily = baseFontFamily;
  const fontPackage = "ids_flutter";
  const members = [
    `  static const sansFontFamily = '${fontFamily}';`,
    `  static const sansFontPackage = '${fontPackage}';`,
    ...readTypographyEntries(palette).map(
      ({ name, fontSize, fontWeight, lineHeight, letterSpacing }) =>
        `  static const ${toCamel(name)} = ${render(T_DART_TEXT_STYLE, {
          FONT_FAMILY: fontFamily,
          FONT_PACKAGE: fontPackage,
          FONT_SIZE: parseFloat(fontSize),
          FONT_WEIGHT: parseInt(fontWeight),
          LINE_HEIGHT: parseFloat(lineHeight),
          LETTER_SPACING: letterSpacingToPx(letterSpacing, fontSize),
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
  ["ids/dart-enums", dartEnumsFormatter],
  ["ids/dart-color-tokens", dartColorTokensFormatter],
  ["ids/dart-motion", dartMotionFormatter],
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
      files: [{ destination: "../react/src/tokens/types.ts", format: "ids/ts-types" }],
    },
    dart: {
      transformGroup: "js",
      files: [
        { destination: "../flutter/lib/tokens/ids_enums.dart", format: "ids/dart-enums" },
        {
          destination: "../flutter/lib/tokens/ids_color_tokens.dart",
          format: "ids/dart-color-tokens",
        },
        { destination: "../flutter/lib/tokens/ids_motion.dart", format: "ids/dart-motion" },
        {
          destination: "../flutter/lib/tokens/ids_typography.dart",
          format: "ids/dart-typography",
        },
      ],
    },
  },
};
