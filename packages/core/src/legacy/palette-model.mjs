const GENERATED = "// GENERATED — do not edit manually";

const listOf = (values) => `[${values.join(", ")}]`;

const quoted = (hexes) => listOf(hexes.map((hex) => `'${hex}'`));

const statusHexes = (palette, name) => palette.find((entry) => entry.name === name).hexes;
const namesOf = (palette) => palette.map((entry) => entry.name);

function moduleSource(model, palette) {
  const parts = Object.entries(model)
    .map(([name, steps]) => `  ${name}: [\n${steps.map((s) => `    ${listOf(s)},`).join("\n")}\n  ],`)
    .join("\n");
  const statuses = namesOf(palette).map(
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
  const statuses = namesOf(palette).map(
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

export function legacyPaletteModelOutputs({ model, statusPalettes }) {
  return {
    "../react/src/tokens/palette-model.ts": moduleSource(model, statusPalettes),
    "../flutter/lib/tokens/ids_palette_model.dart": dartSource(model, statusPalettes),
  };
}
