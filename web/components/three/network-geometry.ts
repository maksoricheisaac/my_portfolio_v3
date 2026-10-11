/**
 * Deterministic "distributed system" graph shared by the WebGL scene and the SVG fallback.
 * Upper hemisphere = application (Build, blue) · lower hemisphere = infrastructure (Run, violet).
 */
export const SIGNAL = "#5b9bff";
export const INFRA = "#b79bf0";

export type Vec3 = [number, number, number];

export interface NetworkGraph {
  nodes: { position: Vec3; color: string }[];
  edges: [number, number][];
}

const NODE_COUNT = 30;
const NEIGHBOURS = 3;

function build(): NetworkGraph {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const positions: Vec3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const y = 1 - (i / (NODE_COUNT - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions.push([Math.cos(theta) * radius, y, Math.sin(theta) * radius]);
  }

  const seen = new Set<string>();
  const edges: [number, number][] = [];
  positions.forEach((p, i) => {
    const nearest = positions
      .map((q, j) => ({
        j,
        d: (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2,
      }))
      .filter((n) => n.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, NEIGHBOURS);
    for (const { j } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  });

  return {
    nodes: positions.map((position) => ({
      position,
      color: position[1] >= 0 ? SIGNAL : INFRA,
    })),
    edges,
  };
}

export const network: NetworkGraph = build();
