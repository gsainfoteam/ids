export type GripPlacement = 'edge' | 'inside';

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

const ARC_INSET: Record<GripPlacement, number> = {
  edge: 0,
  inside: GRIP_HALO + GRIP_STROKE / 2,
};

const TARGET_INSET: Record<GripPlacement, number> = {
  edge: ARC_INSET.edge,
  inside: GRIP_TARGET / 2,
};

const SHORTEST_REACH: Record<GripPlacement, number> = {
  edge: 0,
  inside: GRIP_TARGET,
};

const TARGET_OUTSIDE: Record<GripPlacement, number> = {
  edge: GRIP_TARGET / 2,
  inside: 0,
};

const hundredths = (value: number) => Math.round(value * 100) / 100;

function bend(vertex: number, { inset, radius, reach }: Bend) {
  const line = hundredths(vertex - inset);
  const turn = hundredths(vertex - inset - radius);
  const end = hundredths(vertex - reach);
  const r = hundredths(radius);
  return `M${end} ${line}H${turn}A${r} ${r} 0 0 0 ${line} ${turn}V${end}`;
}

export function gripArc(cornerRadius: number, placement: GripPlacement): GripArc {
  const inset = ARC_INSET[placement];
  const radius = Math.max(cornerRadius - inset, TIGHTEST_BEND);
  const runForTheEdgePillLength = (EDGE_PILL_LENGTH - GRIP_STROKE - (Math.PI * radius) / 2) / 2;
  const runToFillTheTarget = SHORTEST_REACH[placement] - GRIP_STROKE / 2 - inset - radius;
  const run = Math.max(runForTheEdgePillLength, runToFillTheTarget, SHORTEST_RUN);

  const reach = inset + radius + run;
  const size = hundredths(reach + GRIP_STROKE / 2);
  const bleed = TARGET_OUTSIDE[placement];
  const vertex = size + bleed;
  const targetInset = TARGET_INSET[placement];

  return {
    size,
    bleed,
    view: hundredths(size + 2 * bleed),
    arc: bend(vertex, { inset, radius, reach }),
    target: bend(vertex, {
      inset: targetInset,
      radius: Math.max(cornerRadius - targetInset, TIGHTEST_BEND),
      reach: size,
    }),
  };
}
