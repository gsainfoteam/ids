import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { clampChroma, converter, differenceEuclidean, formatHex, parse } from "culori";

const GENERATED = "// GENERATED — do not edit manually";
const OUTPUT = "../react/src/tokens/palette-model.ts";

const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const ANCHOR_STEP = STEPS.indexOf("500");
const STATUS_PALETTE_NAMES = ["red", "yellow", "green", "sky"];

const HARMONIC_COUNTS = [1, 2, 3, 4, 5, 6, 7];
const SMOOTHNESS_WEIGHTS = [1e-2, 3e-3, 1e-3, 3e-4, 1e-4];
const SIMPLER_WINS_WITHIN = 1.01;
const SIGNIFICANT_DIGITS = 3;
const BEYOND_SRGB_CHROMA = 0.5;
const DELTA_E_SCALE = 100;
const DEGREES = Math.PI / 180;

const toOklch = converter("oklch");
const oklabDistance = differenceEuclidean("oklab");

const signedHueDelta = (from, to) => ((((to - from) % 360) + 540) % 360) - 180;

export const gamutChroma = (l, h) =>
  clampChroma({ mode: "oklch", l, c: BEYOND_SRGB_CHROMA, h }, "oklch").c;

const shadeOf = (hex) => {
  const { l, c, h } = toOklch(parse(hex));
  return { l, c, h: h ?? 0 };
};

export function readPalettes(path = new URL("./tokens/palette.json", import.meta.url)) {
  const tokens = JSON.parse(readFileSync(path, "utf8"));
  return Object.entries(tokens)
    .filter(([name]) => name !== "neutral")
    .map(([name, steps]) => ({ name, hexes: STEPS.map((step) => steps[step].$value) }));
}

const COMPONENTS = {
  lightness: {
    value: (shade) => shade.l,
    weight: () => 1,
  },
  chroma: {
    value: (shade) => shade.c / gamutChroma(shade.l, shade.h),
    weight: (shade) => gamutChroma(shade.l, shade.h) ** 2,
  },
  hueShift: {
    value: (shade, hue) => signedHueDelta(hue, shade.h),
    weight: (shade) => (shade.c * DEGREES) ** 2,
  },
};

const harmonicsAt = (hue, count) => {
  const row = [1];
  for (let harmonic = 1; harmonic <= count; harmonic++)
    row.push(Math.cos(harmonic * hue * DEGREES), Math.sin(harmonic * hue * DEGREES));
  return row;
};

export const seriesAt = (coefficients, hue) =>
  harmonicsAt(hue, (coefficients.length - 1) / 2).reduce(
    (sum, term, index) => sum + term * coefficients[index],
    0,
  );

function solveLinear(matrix, vector) {
  const size = vector.length;
  const rows = matrix.map((row, index) => [...row, vector[index]]);
  for (let column = 0; column < size; column++) {
    let pivot = column;
    for (let row = column + 1; row < size; row++)
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    for (let row = 0; row < size; row++) {
      if (row === column) continue;
      const factor = rows[row][column] / rows[column][column];
      for (let entry = column; entry <= size; entry++)
        rows[row][entry] -= factor * rows[column][entry];
    }
  }
  return rows.map((row, index) => row[size] / row[index]);
}

const roughnessOf = (count) => [
  0,
  ...Array.from({ length: count }, (_, index) => [(index + 1) ** 4, (index + 1) ** 4]).flat(),
];

function fitSeries(samples, count, smoothness) {
  const size = 2 * count + 1;
  const normal = Array.from({ length: size }, () => new Array(size).fill(0));
  const moment = new Array(size).fill(0);
  const totalWeight = samples.reduce((sum, sample) => sum + sample.weight, 0);

  for (const { hue, value, weight } of samples) {
    const row = harmonicsAt(hue, count);
    const share = weight / totalWeight;
    for (let i = 0; i < size; i++) {
      moment[i] += share * row[i] * value;
      for (let j = 0; j < size; j++) normal[i][j] += share * row[i] * row[j];
    }
  }

  roughnessOf(count).forEach((roughness, index) => {
    normal[index][index] += smoothness * roughness;
  });

  return solveLinear(normal, moment);
}

const samplesOf = (palettes, component, stepIndex) =>
  palettes.map((palette) => {
    const shade = palette.shades[stepIndex];
    return {
      hue: palette.hue,
      value: component.value(shade, palette.hue),
      weight: component.weight(shade),
    };
  });

function leaveOneOutError(samples, count, smoothness) {
  const squared = samples.map((left, index) => {
    const others = samples.filter((_, other) => other !== index);
    const residual = seriesAt(fitSeries(others, count, smoothness), left.hue) - left.value;
    return residual ** 2 * left.weight;
  });
  return squared.reduce((sum, value) => sum + value, 0);
}

function chooseShape(palettes, component) {
  let best;
  for (const count of HARMONIC_COUNTS)
    for (const smoothness of SMOOTHNESS_WEIGHTS) {
      const error = STEPS.reduce(
        (sum, _, stepIndex) =>
          sum + leaveOneOutError(samplesOf(palettes, component, stepIndex), count, smoothness),
        0,
      );
      if (best === undefined || error * SIMPLER_WINS_WITHIN < best.error)
        best = { count, smoothness, error };
    }
  return best;
}

const prepared = (palettes) =>
  palettes.map(({ name, hexes }) => {
    const shades = hexes.map(shadeOf);
    return { name, hexes, shades, hue: shades[ANCHOR_STEP].h };
  });

export function fitPaletteModel(palettes = readPalettes()) {
  const ready = prepared(palettes);
  const model = {};
  const shapes = {};
  for (const [name, component] of Object.entries(COMPONENTS)) {
    const shape = chooseShape(ready, component);
    shapes[name] = shape;
    model[name] = STEPS.map((_, stepIndex) =>
      fitSeries(samplesOf(ready, component, stepIndex), shape.count, shape.smoothness).map(
        (coefficient) => Number(coefficient.toPrecision(SIGNIFICANT_DIGITS)) || 0,
      ),
    );
  }
  return { model, shapes };
}

export function paletteAt(model, hue) {
  return STEPS.map((_, stepIndex) => {
    const l = seriesAt(model.lightness[stepIndex], hue);
    const h = hue + seriesAt(model.hueShift[stepIndex], hue);
    const share = Math.min(1, Math.max(0, seriesAt(model.chroma[stepIndex], hue)));
    return formatHex(clampChroma({ mode: "oklch", l, c: share * gamutChroma(l, h), h }, "oklch"));
  });
}

export function fitErrors(model, palettes = readPalettes()) {
  return prepared(palettes).map(({ name, hexes, hue }) => {
    const distances = paletteAt(model, hue).map(
      (hex, index) => oklabDistance(hex, hexes[index]) * DELTA_E_SCALE,
    );
    return {
      name,
      mean: distances.reduce((sum, distance) => sum + distance, 0) / distances.length,
      max: Math.max(...distances),
    };
  });
}

const listOf = (values) => `[${values.join(", ")}]`;

const quoted = (hexes) => listOf(hexes.map((hex) => `'${hex}'`));

function moduleSource(model, palettes) {
  const parts = Object.entries(model)
    .map(([name, steps]) => `  ${name}: [\n${steps.map((s) => `    ${listOf(s)},`).join("\n")}\n  ],`)
    .join("\n");
  const statuses = STATUS_PALETTE_NAMES.map((name) => {
    const { hexes } = palettes.find((palette) => palette.name === name);
    return `  ${name}: ${quoted(hexes)},`;
  }).join("\n");

  return `${GENERATED}

export const PALETTE_MODEL = {
${parts}
} as const;

export const STATUS_PALETTES = {
${statuses}
} as const;
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const palettes = readPalettes();
  const { model, shapes } = fitPaletteModel(palettes);
  writeFileSync(new URL(OUTPUT, import.meta.url), moduleSource(model, palettes));

  const errors = fitErrors(model, palettes);
  const shapeLine = Object.entries(shapes)
    .map(([name, { count, smoothness }]) => `${name} ${count} harmonics, smoothness ${smoothness}`)
    .join("; ");
  const worst = errors.reduce((a, b) => (b.max > a.max ? b : a));
  console.log(`✔︎ ${OUTPUT}: ${shapeLine}`);
  console.log(
    `  fit ΔE_OK×100: mean ${(errors.reduce((sum, e) => sum + e.mean, 0) / errors.length).toFixed(2)}, max ${worst.max.toFixed(2)} (${worst.name})`,
  );
}
