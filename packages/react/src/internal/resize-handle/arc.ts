export type ResizeBand = 'centered' | 'outward';

export type GripArc = {
  size: number;
  bleed: number;
  view: number;
  arc: string;
  target: string;
};

type Bend = { inset: number; radius: number; reach: number };

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

function bend(vertex: number, { inset, radius, reach }: Bend) {
  const line = hundredths(vertex - inset);
  const turn = hundredths(vertex - inset - radius);
  const end = hundredths(vertex - reach);
  const r = hundredths(radius);
  return `M${end} ${line}H${turn}A${r} ${r} 0 0 0 ${line} ${turn}V${end}`;
}

export function gripArc(cornerRadius: number, band: ResizeBand): GripArc {
  const radius = Math.max(cornerRadius, TIGHTEST_BEND);
  const run = Math.max((EDGE_PILL_LENGTH - GRIP_STROKE - (Math.PI * radius) / 2) / 2, SHORTEST_RUN);

  const reach = radius + run;
  const size = hundredths(reach + GRIP_STROKE / 2);
  const outside = TARGET_OUTSIDE_THE_LINE[band];
  const bleed = GRIP_TARGET / 2 + outside;
  const vertex = size + bleed;

  return {
    size,
    bleed,
    view: hundredths(size + 2 * bleed),
    arc: bend(vertex, { inset: 0, radius, reach }),
    target: bend(vertex, { inset: -outside, radius: radius + outside, reach: size }),
  };
}
