import { ROUND_CORNER_EXPONENT, superellipseQuarter } from '../../lib/corner-shape';

export type ResizeBand = 'centered' | 'outward';

export type GripArc = {
  size: number;
  bleed: number;
  view: number;
  arc: string;
  target: string;
};

type Bend = { inset: number; radius: number; reach: number; exponent: number };

export const GRIP_STROKE = 4;
export const GRIP_HALO = 3;
export const GRIP_TARGET = 24;

const EDGE_PILL_LENGTH = 32;
const SHORTEST_RUN = 4;
const TIGHTEST_BEND = GRIP_STROKE / 2;

const TARGET_OUTSIDE_THE_LINE: Record<ResizeBand, number> = {
  centered: 0,
  outward: GRIP_TARGET / 2 - GRIP_STROKE / 2,
};

const hundredths = (value: number) => Math.round(value * 100) / 100;

function quarterLength(radius: number, exponent: number) {
  if (exponent === ROUND_CORNER_EXPONENT) return (Math.PI * radius) / 2;
  const points = superellipseQuarter(exponent);
  return points
    .slice(1)
    .reduce(
      (length, [x, y], index) =>
        length + radius * Math.hypot(x - points[index]![0], y - points[index]![1]),
      0,
    );
}

function corner(line: number, turn: number, radius: number, exponent: number) {
  if (exponent === ROUND_CORNER_EXPONENT) {
    const r = hundredths(radius);
    return `A${r} ${r} 0 0 0 ${line} ${turn}`;
  }
  return superellipseQuarter(exponent)
    .slice(1)
    .map(([x, y]) => `L${hundredths(turn + radius * x)} ${hundredths(turn + radius * y)}`)
    .join('');
}

function bend(vertex: number, { inset, radius, reach, exponent }: Bend) {
  const line = hundredths(vertex - inset);
  const turn = hundredths(vertex - inset - radius);
  const end = hundredths(vertex - reach);
  return `M${end} ${line}H${turn}${corner(line, turn, radius, exponent)}V${end}`;
}

export function gripArc(
  cornerRadius: number,
  band: ResizeBand,
  exponent: number = ROUND_CORNER_EXPONENT,
): GripArc {
  const radius = Math.max(cornerRadius, TIGHTEST_BEND);
  const run = Math.max(
    (EDGE_PILL_LENGTH - GRIP_STROKE - quarterLength(radius, exponent)) / 2,
    SHORTEST_RUN,
  );

  const reach = radius + run;
  const size = hundredths(reach + GRIP_STROKE / 2);
  const outside = TARGET_OUTSIDE_THE_LINE[band];
  const bleed = GRIP_TARGET / 2 + outside;
  const vertex = size + bleed;

  return {
    size,
    bleed,
    view: hundredths(size + 2 * bleed),
    arc: bend(vertex, { inset: 0, radius, reach, exponent }),
    target: bend(vertex, { inset: -outside, radius: radius + outside, reach: size, exponent }),
  };
}
