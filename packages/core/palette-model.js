import { readFileSync, writeFileSync } from "node:fs";

const GENERATED = "// GENERATED — do not edit manually";
const OUTPUT = "../react/src/tokens/palette-model.ts";
const DART_OUTPUT = "../flutter/lib/tokens/ids_palette_model.dart";

const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const STATUS_PALETTE_NAMES = ["red", "yellow", "green", "sky"];

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));

const listOf = (values) => `[${values.join(", ")}]`;

const quoted = (hexes) => listOf(hexes.map((hex) => `'${hex}'`));

const statusHexes = (palette, name) => STEPS.map((step) => palette[name][step].$value);

function moduleSource(model, palette) {
  const parts = Object.entries(model)
    .map(([name, steps]) => `  ${name}: [\n${steps.map((s) => `    ${listOf(s)},`).join("\n")}\n  ],`)
    .join("\n");
  const statuses = STATUS_PALETTE_NAMES.map(
    (name) => `  ${name}: ${quoted(statusHexes(palette, name))},`,
  ).join("\n");

  return `${GENERATED}

export const PALETTE_MODEL = {
${parts}
} as const;

export const STATUS_PALETTES = {
${statuses}
} as const;
`;
}

const dartColor = (hex) => `Color(0xFF${hex.slice(1).toUpperCase()})`;

function dartSource(model, palette) {
  const parts = Object.entries(model)
    .map(
      ([name, steps]) =>
        `  static const ${name} = <List<double>>[\n${steps.map((s) => `    ${listOf(s)},`).join("\n")}\n  ];`,
    )
    .join("\n\n");
  const statuses = STATUS_PALETTE_NAMES.map(
    (name) =>
      `  static const ${name} = <Color>[\n${statusHexes(palette, name)
        .map((hex) => `    ${dartColor(hex)},`)
        .join("\n")}\n  ];`,
  ).join("\n\n");

  return `${GENERATED}

import 'package:flutter/painting.dart';

abstract final class IdsPaletteModel {
${parts}
}

abstract final class IdsStatusPalettes {
${statuses}
}
`;
}

const model = readJson("./palette-model.json");
const palette = readJson("./tokens/palette.json");
writeFileSync(new URL(OUTPUT, import.meta.url), moduleSource(model, palette));
writeFileSync(new URL(DART_OUTPUT, import.meta.url), dartSource(model, palette));
console.log(`✔︎ ${OUTPUT}, ${DART_OUTPUT}`);
