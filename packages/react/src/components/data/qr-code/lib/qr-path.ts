import { encode } from 'uqr';

export type QRCodeErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export type QRCodeModuleShape = 'square' | 'rounded' | 'dots';

export type QRCodeFinderShape = 'square' | 'rounded' | 'circle';

export type QRCodeMatrix = { version: number; modules: boolean[][] };

export type QRCodeArea = { start: number; span: number };

export type QRCodeGeometry = {
  version: number;
  viewBox: number;
  modules: string;
  finders: string;
  logo: QRCodeArea | undefined;
};

export type QRCodeGeometryOptions = {
  errorCorrection: QRCodeErrorCorrection;
  shape: QRCodeModuleShape;
  finderShape: QRCodeFinderShape;
  quietZone: number;
  logo: boolean;
};

const FINDER_SPAN = 7;
const LOGO_SHARE_OF_WIDTH = 0.22;
const LOGO_INSET = 1;
const HALF = 0.5;
const TOUCHING_DOT_RADIUS = HALF;

const format = (value: number) => String(Math.round(value * 1000) / 1000);

const point = (x: number, y: number) => `${format(x)} ${format(y)}`;

export function encodeQRCode(value: string, errorCorrection: QRCodeErrorCorrection): QRCodeMatrix {
  const { version, data } = encode(value, { ecc: errorCorrection, border: 0 });
  return { version, modules: data };
}

export function finderOrigins(size: number): [number, number][] {
  const far = size - FINDER_SPAN;
  return [
    [0, 0],
    [far, 0],
    [0, far],
  ];
}

const inFinder = (size: number, x: number, y: number) =>
  finderOrigins(size).some(
    ([fx, fy]) => x >= fx && x < fx + FINDER_SPAN && y >= fy && y < fy + FINDER_SPAN,
  );

export function logoArea(size: number): QRCodeArea {
  const rounded = Math.round(size * LOGO_SHARE_OF_WIDTH);
  const centeredOnTheGrid = (size - rounded) % 2 === 0;
  const span = centeredOnTheGrid ? rounded : rounded + 1;
  return { start: (size - span) / 2, span };
}

const inArea = (area: QRCodeArea | undefined, x: number, y: number) =>
  area !== undefined &&
  x >= area.start &&
  x < area.start + area.span &&
  y >= area.start &&
  y < area.start + area.span;

export function dataModules(modules: boolean[][], cleared?: QRCodeArea): boolean[][] {
  const size = modules.length;
  return modules.map((row, y) =>
    row.map((dark, x) => dark && !inFinder(size, x, y) && !inArea(cleared, x, y)),
  );
}

function squareRuns(modules: boolean[][], offset: number) {
  const runs: string[] = [];
  modules.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) {
        x += 1;
        continue;
      }
      const start = x;
      while (x < row.length && row[x]) x += 1;
      const width = x - start;
      runs.push(`M${point(start + offset, y + offset)}h${width}v1h-${width}z`);
    }
  });
  return runs.join('');
}

function roundedModule(x: number, y: number, corners: [boolean, boolean, boolean, boolean]) {
  const [topLeft, topRight, bottomRight, bottomLeft] = corners;
  const r = HALF;
  const arc = (toX: number, toY: number) => `A${format(r)} ${format(r)} 0 0 1 ${point(toX, toY)}`;
  return [
    `M${point(x, topLeft ? y + r : y)}`,
    topLeft ? arc(x + r, y) : '',
    `H${format(topRight ? x + 1 - r : x + 1)}`,
    topRight ? arc(x + 1, y + r) : '',
    `V${format(bottomRight ? y + 1 - r : y + 1)}`,
    bottomRight ? arc(x + 1 - r, y + 1) : '',
    `H${format(bottomLeft ? x + r : x)}`,
    bottomLeft ? arc(x, y + 1 - r) : '',
    'Z',
  ].join('');
}

function roundedModules(modules: boolean[][], offset: number) {
  const dark = (x: number, y: number) => modules[y]?.[x] === true;
  const paths: string[] = [];
  modules.forEach((row, y) =>
    row.forEach((isDark, x) => {
      if (!isDark) return;
      const top = dark(x, y - 1);
      const right = dark(x + 1, y);
      const bottom = dark(x, y + 1);
      const left = dark(x - 1, y);
      paths.push(
        roundedModule(x + offset, y + offset, [
          !top && !left,
          !top && !right,
          !bottom && !right,
          !bottom && !left,
        ]),
      );
    }),
  );
  return paths.join('');
}

function circle(cx: number, cy: number, r: number) {
  return `M${point(cx - r, cy)}a${format(r)} ${format(r)} 0 1 0 ${format(r * 2)} 0a${format(r)} ${format(r)} 0 1 0 -${format(r * 2)} 0z`;
}

function dotModules(modules: boolean[][], offset: number) {
  const paths: string[] = [];
  modules.forEach((row, y) =>
    row.forEach((isDark, x) => {
      if (isDark) paths.push(circle(x + offset + HALF, y + offset + HALF, TOUCHING_DOT_RADIUS));
    }),
  );
  return paths.join('');
}

export function modulesPath(modules: boolean[][], shape: QRCodeModuleShape, offset = 0): string {
  if (shape === 'rounded') return roundedModules(modules, offset);
  if (shape === 'dots') return dotModules(modules, offset);
  return squareRuns(modules, offset);
}

function roundedRect(x: number, y: number, side: number, r: number) {
  if (r === 0) return `M${point(x, y)}h${format(side)}v${format(side)}h-${format(side)}z`;
  const arc = (toX: number, toY: number) => `A${format(r)} ${format(r)} 0 0 1 ${point(toX, toY)}`;
  return [
    `M${point(x + r, y)}`,
    `H${format(x + side - r)}`,
    arc(x + side, y + r),
    `V${format(y + side - r)}`,
    arc(x + side - r, y + side),
    `H${format(x + r)}`,
    arc(x, y + side - r),
    `V${format(y + r)}`,
    arc(x + r, y),
    'Z',
  ].join('');
}

const FINDER_RINGS = [
  { inset: 0, side: 7, radius: { square: 0, rounded: 2 } },
  { inset: 1, side: 5, radius: { square: 0, rounded: 1.25 } },
  { inset: 2, side: 3, radius: { square: 0, rounded: 1 } },
] as const;

function finder(x: number, y: number, shape: QRCodeFinderShape) {
  if (shape === 'circle') {
    const center = FINDER_SPAN / 2;
    return FINDER_RINGS.map(({ side }) => circle(x + center, y + center, side / 2)).join('');
  }
  return FINDER_RINGS.map(({ inset, side, radius }) =>
    roundedRect(x + inset, y + inset, side, radius[shape]),
  ).join('');
}

export function findersPath(size: number, shape: QRCodeFinderShape, offset = 0): string {
  return finderOrigins(size)
    .map(([x, y]) => finder(x + offset, y + offset, shape))
    .join('');
}

export function qrCodeGeometry(value: string, options: QRCodeGeometryOptions): QRCodeGeometry {
  const { version, modules } = encodeQRCode(value, options.errorCorrection);
  const size = modules.length;
  const quietZone = Math.max(0, options.quietZone);
  const cleared = options.logo ? logoArea(size) : undefined;

  return {
    version,
    viewBox: size + quietZone * 2,
    modules: modulesPath(dataModules(modules, cleared), options.shape, quietZone),
    finders: findersPath(size, options.finderShape, quietZone),
    logo:
      cleared === undefined
        ? undefined
        : {
            start: cleared.start + quietZone + LOGO_INSET,
            span: cleared.span - LOGO_INSET * 2,
          },
  };
}
