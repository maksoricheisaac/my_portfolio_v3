"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { network } from "@/components/three/network-geometry";

const SCALE = 1.9;

function Graph({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.InstancedMesh>(null);

  const lineGeometry = useMemo(() => {
    const pts: number[] = [];
    for (const [a, b] of network.edges) {
      pts.push(...network.nodes[a].position, ...network.nodes[b].position);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useEffect(() => {
    const mesh = nodes.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    network.nodes.forEach((n, i) => {
      m.makeTranslation(...n.position);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(n.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || !animate) return;
    g.rotation.y += delta * 0.12;
    // Gentle pointer parallax.
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, state.pointer.y * 0.25, 0.04);
    g.position.x = THREE.MathUtils.lerp(g.position.x, state.pointer.x * 0.15, 0.04);
  });

  return (
    <group ref={group} scale={SCALE} rotation={[0.35, 0.6, 0]}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#9aa3ad" transparent opacity={0.4} />
      </lineSegments>
      <instancedMesh ref={nodes} args={[undefined, undefined, network.nodes.length]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh scale={0.62}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#5b9bff" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export default function NetworkScene({
  animate,
  paused,
}: {
  animate: boolean;
  paused: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={paused ? "never" : animate ? "always" : "demand"}
      aria-hidden="true"
    >
      <Graph animate={animate} />
    </Canvas>
  );
}
