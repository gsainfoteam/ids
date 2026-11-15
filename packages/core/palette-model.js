import { readFileSync, writeFileSync } from "node:fs";

const GENERATED = "// GENERATED — do not edit manually";
const OUTPUT = "../react/src/tokens/palette-model.ts";

const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const STATUS_PALETTE_NAMES = ["red", "yellow", "green", "sky"];

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));

const listOf = (values) => `[${values.join(", ")}]`;

const quoted = (hexes) => listOf(hexes.map((hex) => `'${hex}'`));

function moduleSource(model, palette) {
  const parts = Object.entries(model)
    .map(([name, steps]) => `  ${name}: [\n${steps.map((s) => `    ${listOf(s)},`).join("\n")}\n  ],`)
    .join("\n");
  const statuses = STATUS_PALETTE_NAMES.map(
    (name) => `  ${name}: ${quoted(STEPS.map((step) => palette[name][step].$value))},`,
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

writeFileSync(
  new URL(OUTPUT, import.meta.url),
  moduleSource(readJson("./palette-model.json"), readJson("./tokens/palette.json")),
);
console.log(`✔︎ ${OUTPUT}`);
