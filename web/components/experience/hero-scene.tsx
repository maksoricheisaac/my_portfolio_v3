"use client";

/**
 * RM signature structure — a faceted metallic icosahedron that assembles from its own shards,
 * wrapped by a technical wireframe cage, three thin orbit rings and a sparse particle shell.
 *
 * Budget: no shadows, no post-processing, one environment map (RoomEnvironment, generated
 * locally — no network asset). The render loop is paused while the canvas is off-screen and
 * switched to on-demand when the visitor prefers reduced motion.
 *
 * Timeline (t in seconds since mount):
 *   0.3 → 2.3  shards fly in from the exploded state to their resting position (ease-out)
 *   1.2 → 2.2  cage, rings and particles fade in
 * Pointer: the group eases toward the pointer (max ~0.35 rad) with exponential damping, and
 * otherwise drifts very slowly — no incessant motion.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const SIGNAL = new THREE.Color("#5b9cff");

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function setEnvironment(scene: THREE.Scene, texture: THREE.Texture | null) {
  scene.environment = texture;
  scene.environmentIntensity = 0.55;
}

/** One generated environment map, used only for reflections on the metal. */
function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = new RoomEnvironment();
    const target = pmrem.fromScene(env, 0.04);
    setEnvironment(scene, target.texture);
    return () => {
      setEnvironment(scene, null);
      target.dispose();
      pmrem.dispose();
      env.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** The 20 faces of an icosahedron as separate shards, each with its outward direction. */
function buildShards() {
  const src = new THREE.IcosahedronGeometry(1, 0); // detail 0 is already non-indexed
  const pos = src.getAttribute("position");
  const shards: { geometry: THREE.BufferGeometry; dir: THREE.Vector3 }[] = [];
  for (let f = 0; f < pos.count / 3; f++) {
    const verts = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, f * 3 + k));
    const centroid = verts.reduce((a, v) => a.add(v), new THREE.Vector3()).divideScalar(3);
    const g = new THREE.BufferGeometry().setFromPoints(verts.map((v) => v.clone().sub(centroid)));
    g.computeVertexNormals();
    shards.push({ geometry: g, dir: centroid });
  }
  src.dispose();
  return shards;
}

/** Deterministic pseudo-random shell of particles. */
function buildParticles(count: number) {
  const arr = new Float32Array(count * 3);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    const r = 2.3 + rnd() * 1.9;
    const theta = rnd() * Math.PI * 2;
    const phi = Math.acos(2 * rnd() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.cos(phi) * 0.8;
    arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  return g;
}

function Structure({ reduced, particleCount }: { reduced: boolean; particleCount: number }) {
  const group = useRef<THREE.Group>(null);
  const shardRefs = useRef<(THREE.Mesh | null)[]>([]);
  const cage = useRef<THREE.LineSegments>(null);
  const core = useRef<THREE.LineSegments>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const points = useRef<THREE.Points>(null);
  const invalidate = useThree((s) => s.invalidate);
  const clock = useRef<{ t: number | null; spin: number }>({ t: null, spin: 0.5 });
  const pointer = useRef({ x: 0, y: 0 });

  const shards = useMemo(() => buildShards(), []);
  const particles = useMemo(() => buildParticles(particleCount), [particleCount]);
  const cageGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.75, 1)),
    [],
  );
  const coreGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.012, 0)),
    [],
  );

  // Release GPU buffers on unmount.
  useEffect(
    () => () => {
      shards.forEach((s) => s.geometry.dispose());
      particles.dispose();
      cageGeometry.dispose();
      coreGeometry.dispose();
    },
    [shards, particles, cageGeometry, coreGeometry],
  );

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  const update = (t: number, dt: number) => {
    const assemble = reduced ? 1 : easeOutCubic(clamp01((t - 0.3) / 2));
    const fade = reduced ? 1 : clamp01((t - 1.2) / 1);
    const axis = new THREE.Vector3();

    shards.forEach((s, i) => {
      const m = shardRefs.current[i];
      if (!m) return;
      m.position.copy(s.dir).multiplyScalar(1.004 + (1 - assemble) * 3.2);
      m.scale.setScalar(0.35 + 0.65 * assemble);
      m.quaternion.setFromAxisAngle(axis.copy(s.dir).normalize(), (1 - assemble) * 1.6);
    });

    const setOpacity = (o: THREE.Object3D | null, v: number) => {
      const mat = (o as THREE.Mesh | null)?.material as THREE.Material | undefined;
      if (mat) mat.opacity = v;
    };
    setOpacity(cage.current, 0.28 * fade);
    setOpacity(core.current, 0.9 * assemble);
    rings.current.forEach((r) => setOpacity(r, 0.55 * fade));
    setOpacity(points.current, 0.8 * fade);

    const g = group.current;
    if (g) {
      const k = 1 - Math.exp(-dt * 3);
      if (!reduced) clock.current.spin += dt * 0.08;
      g.rotation.x += (0.25 + pointer.current.y * 0.35 - g.rotation.x) * k;
      g.rotation.y += (clock.current.spin + pointer.current.x * 0.45 - g.rotation.y) * k;
      g.position.x += (pointer.current.x * 0.12 - g.position.x) * k;
    }
    if (!reduced) {
      rings.current.forEach((r, i) => {
        if (r) r.rotation.z += dt * (0.06 + i * 0.03);
      });
    }
  };

  // The entrance follows wall-clock time (a slow device still finishes in ~2 s of real time);
  // only the damping step is clamped so a hitch cannot make the group jump.
  useFrame((state, dt) => {
    clock.current.t ??= state.clock.elapsedTime;
    update(state.clock.elapsedTime - clock.current.t, Math.min(dt, 0.05));
  });

  // Reduced motion: frameloop is "demand" — draw the final composition once.
  useEffect(() => {
    if (!reduced) return;
    update(10, 1);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- single static draw
  }, [reduced]);

  return (
    <group ref={group} rotation={[0.25, 0.5, 0.05]}>
      {shards.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            shardRefs.current[i] = el;
          }}
          geometry={s.geometry}
        >
          <meshStandardMaterial
            color="#c9ccd2"
            metalness={1}
            roughness={0.22}
            flatShading
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <lineSegments ref={core} geometry={coreGeometry}>
        <lineBasicMaterial color={SIGNAL} transparent opacity={0} />
      </lineSegments>
      <lineSegments ref={cage} geometry={cageGeometry}>
        <lineBasicMaterial color="#f2f1ec" transparent opacity={0} />
      </lineSegments>
      {[2.15, 2.6, 3.05].map((r, i) => (
        <mesh
          key={r}
          ref={(el) => {
            rings.current[i] = el;
          }}
          rotation={[Math.PI / 2 + i * 0.5, i * 0.7, 0]}
        >
          <torusGeometry args={[r, 0.006, 6, 160]} />
          <meshBasicMaterial color={i === 1 ? SIGNAL : "#969ba5"} transparent opacity={0} />
        </mesh>
      ))}
      <points ref={points} geometry={particles}>
        <pointsMaterial color="#f2f1ec" size={0.018} sizeAttenuation transparent opacity={0} />
      </points>
    </group>
  );
}

/** Pauses rendering while the hero is off-screen. */
function VisibilityGate({ reduced }: { reduced: boolean }) {
  const { gl, setFrameloop } = useThree();
  useEffect(() => {
    if (reduced) return;
    const io = new IntersectionObserver(([entry]) => {
      setFrameloop(entry.isIntersecting ? "always" : "never");
    });
    io.observe(gl.domElement);
    return () => io.disconnect();
  }, [gl, reduced, setFrameloop]);
  return null;
}

export default function HeroScene({
  reduced,
  small,
  onReady,
}: {
  reduced: boolean;
  small: boolean;
  onReady?: () => void;
}) {
  const [ready, setReady] = useState(false);
  return (
    <Canvas
      className={`transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
      frameloop={reduced ? "demand" : "always"}
      dpr={small ? 1 : [1, 1.75]}
      camera={{ position: [0, 0, 8.2], fov: 38 }}
      gl={{ antialias: !small, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => {
        setReady(true);
        onReady?.();
      }}
    >
      <Environment />
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 5, 6]} intensity={2.2} />
      <pointLight position={[-5, -2, 3]} intensity={18} color="#5b9cff" distance={14} />
      <Structure reduced={reduced} particleCount={small ? 120 : 380} />
      <VisibilityGate reduced={reduced} />
    </Canvas>
  );
}
