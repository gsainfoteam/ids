import { readFileSync, readdirSync } from "node:fs";
import { StyleDictionary } from "style-dictionary-utils";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const GENERATED = "// GENERATED — do not edit manually";

const slug = (t) => t.path.slice(1).join("-");
const val = (t) => t.$value ?? t.value;
const toVal = (t) => {
  const v = val(t);
  return Array.isArray(v) ? v.join(", ") : v;
};
const idsVar = (prefix, t) => `--ids-${prefix}-${slug(t)}`;
const toCamel = (str) => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
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

// Extracts palette (non-semantic) tokens for reference resolution
const buildPalette = (dictionary) => {
  const p = {};
  for (const t of dictionary.allTokens.filter(
    (t) => !t.filePath.includes("semantic"),
  ))
    p[t.path.join(".")] = val(t);
  return p;
};

// Resolves {token.path} references against palette
const resolveRef = (value, palette) => {
  if (typeof value !== "string") return value;
  const m = value.match(/^\{([^}]+)\}$/);
  return m ? (palette[m[1]] ?? value) : value;
};

// Reads a semantic JSON file and returns color entries with resolved values
const readColorEntries = (color, mode, palette) => {
  const json = JSON.parse(
    readFileSync(`./tokens/semantic/${color}.${mode}.json`, "utf8"),
  );
  return Object.entries(json.color ?? {}).map(([name, token]) => ({
    name,
    value: resolveRef(token.$value ?? token.value, palette),
  }));
};

// Reads semantic/typography.json and returns resolved composite entries
const readTypographyEntries = (palette) => {
  const json = JSON.parse(
    readFileSync("./tokens/semantic/typography.json", "utf8"),
  );
  return Object.entries(json.text ?? {}).map(([name, token]) => {
    const raw = token.$value ?? token.value;
    return {
      name,
      fontSize: resolveRef(raw.fontSize, palette),
      fontWeight: resolveRef(raw.fontWeight, palette),
      lineHeight: resolveRef(raw.lineHeight, palette),
      letterSpacing: resolveRef(raw.letterSpacing, palette),
    };
  });
};

const parseEnums = (dictionary) => {
  const result = {};
  for (const t of dictionary.allTokens.filter((t) => t.path[0] === "ids")) {
    const values = val(t);
    if (Array.isArray(values)) result[t.path[1]] = values;
  }
  return result;
};

// Discover color pairs from semantic/ dir — excludes neutral, status
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

// Tailwind v4 @theme namespace — token path[0] → CSS var prefix
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

// ─── Templates ────────────────────────────────────────────────────────────────

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

const T_DART_TEXT_STYLE = `TextStyle(fontFamily: '{{FONT_FAMILY}}', fontSize: {{FONT_SIZE}}, fontWeight: FontWeight.w{{FONT_WEIGHT}}, height: {{LINE_HEIGHT}}, letterSpacing: {{LETTER_SPACING}})`;

// ─── CSS helpers ─────────────────────────────────────────────────────────────

// @theme { --color-primary: var(--ids-color-primary); ... } — Tailwind bridge
// deduplicates across color+mode files so each token name appears once
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

// @theme { --spacing-xs: var(--ids-spacing-xs); } + :root { --ids-spacing-xs: 4px; }
const buildStaticCSS = (dictionary) => {
  // const spacing = byCategory(dictionary, "spacing");
  const motion = byCategory(dictionary, "motion");
  return render(T_CSS_THEME_ROOT, {
    THEME: "", // spacing.map((t) => `  ${TW_NS.spacing}${slug(t)}: var(${idsVar("spacing", t)});`).join("\n"),
    ROOT: [
      // ...spacing.map((t) => `  ${idsVar("spacing", t)}: ${toVal(t)};`),
      ...motion.map((t) => `  ${idsVar("motion", t)}: ${toVal(t)};`),
    ].join("\n"),
  });
};

// @theme { --text-display: 32px; --text-display--font-weight: 700; ... }
// + :root { --ids-font-size-xxxl: 32px; ... } (primitives for internal use)
const buildTypographyCSS = (dictionary) => {
  const palette = buildPalette(dictionary);
  const entries = readTypographyEntries(palette);

  const themeFontLines = byPath(dictionary, "font-family").map(
    (t) =>
      `  ${TW_NS["font-family"]}${slug(t)}: var(${idsVar("font-family", t)});`,
  );

  return render(T_CSS_THEME_ROOT, {
    THEME: [
      ...entries.map(({ name }) => render(T_CSS_TEXT_THEME, { NAME: name })),
      ...themeFontLines,
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
      ...TYPOGRAPHY_CATS.flatMap((cat) =>
        byPath(dictionary, cat).map((t) => `  ${idsVar(cat, t)}: ${toVal(t)};`),
      ),
    ].join("\n"),
  });
};

// [data-color="blue"][data-mode="light"] { --ids-color-primary: #2563eb; ... }
// Reads source JSON directly — bypasses SD token collision from multi-theme files
const buildColorThemeCSS = (dictionary, color, mode, selector) => {
  const lines = readColorEntries(color, mode, buildPalette(dictionary)).map(
    ({ name, value }) => `  --ids-color-${name}: ${value};`,
  );
  return `${selector} {\n${lines.join("\n")}\n}\n`;
};

// ─── CSS formatter ────────────────────────────────────────────────────────────

const cssFormatter = ({ dictionary }) =>
  [
    buildColorBridgeCSS(dictionary),
    buildStaticCSS(dictionary),
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
  ].join("\n");

// ─── TS formatters ────────────────────────────────────────────────────────────

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

// ─── Dart formatters ──────────────────────────────────────────────────────────

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

// Reads source JSON directly — bypasses SD token collision from multi-theme files
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
        ENTRIES: readColorEntries(c, m, palette).map(toColorLine).join("\n"),
      }),
    )
    .join("\n\n");

  return render(T_DART_IDS_TOKENS, { CASES: cases, MAPS: maps });
};

const dartSpacingFormatter = ({ dictionary }) =>
  render(T_DART_CLASS, {
    NAME: "IdsSpacing",
    MEMBERS: byCategory(dictionary, "spacing")
      .map(
        (t) =>
          `  static const double ${toCamel(t.path[1])} = ${parseFloat(val(t))};`,
      )
      .join("\n"),
  });

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
  const fontFamily = sansFontFamily
    ? val(sansFontFamily)[0]
    : "Pretendard";
  return render(T_DART_ABSTRACT_CLASS, {
    NAME: "IdsTypography",
    MEMBERS: readTypographyEntries(palette)
      .map(
        ({ name, fontSize, fontWeight, lineHeight, letterSpacing }) =>
          `  static const ${toCamel(name)} = ${render(T_DART_TEXT_STYLE, {
            FONT_FAMILY: fontFamily,
            FONT_SIZE: parseFloat(fontSize),
            FONT_WEIGHT: parseInt(fontWeight),
            LINE_HEIGHT: parseFloat(lineHeight),
            LETTER_SPACING: parseFloat(letterSpacing),
          })};`,
      )
      .join("\n"),
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────

for (const [name, format] of [
  ["ids/css", cssFormatter],
  ["ids/ts-types", tsTypesFormatter],
  ["ids/dart-enums", dartEnumsFormatter],
  ["ids/dart-color-tokens", dartColorTokensFormatter],
  // ["ids/dart-spacing", dartSpacingFormatter],
  ["ids/dart-motion", dartMotionFormatter],
  ["ids/dart-typography", dartTypographyFormatter],
]) {
  StyleDictionary.registerFormat({ name, format });
}

// ─── Config ───────────────────────────────────────────────────────────────────

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
        // { destination: "../flutter/lib/tokens/ids_spacing.dart", format: "ids/dart-spacing" },
        { destination: "../flutter/lib/tokens/ids_motion.dart", format: "ids/dart-motion" },
        {
          destination: "../flutter/lib/tokens/ids_typography.dart",
          format: "ids/dart-typography",
        },
      ],
    },
  },
};
