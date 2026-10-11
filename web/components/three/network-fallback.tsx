import { network } from "@/components/three/network-geometry";

/** Static SVG projection of the same graph: used without WebGL, on low-power devices or before the scene loads. */
export function NetworkFallback({ className }: { className?: string }) {
  // Fixed rotation matching the WebGL scene's initial pose, then orthographic projection.
  const rx = 0.35;
  const ry = 0.6;
  const project = ([x, y, z]: [number, number, number]) => {
    const x1 = x * Math.cos(ry) + z * Math.sin(ry);
    const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
    const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
    return [100 + x1 * 62, 100 - y1 * 62] as const;
  };
  const pts = network.nodes.map((n) => project(n.position));

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g stroke="#9aa3ad" strokeOpacity="0.4" strokeWidth="0.6">
        {network.edges.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={pts[a][0]}
            y1={pts[a][1]}
            x2={pts[b][0]}
            y2={pts[b][1]}
          />
        ))}
      </g>
      {network.nodes.map((n, i) => (
        <circle key={i} cx={pts[i][0]} cy={pts[i][1]} r="2.2" fill={n.color} />
      ))}
    </svg>
  );
}
