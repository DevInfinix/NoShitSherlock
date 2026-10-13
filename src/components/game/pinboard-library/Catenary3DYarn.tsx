"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createWoolYarnTextures } from "./textures";

interface Catenary3DYarnProps {
  points: Array<[number, number, number]>;
  isHovered?: boolean;
}

/**
 * 3D Catenary Gravitational Curve between two 3D pin anchors.
 * Computes realistic downward catenary sag in Y, subtle forward clearance in Z,
 * and slight micro-wave natural thread variation.
 */
class PhysicalCatenaryCurve extends THREE.Curve<THREE.Vector3> {
  private p1: THREE.Vector3;
  private p2: THREE.Vector3;
  private sag: number;

  constructor(p1: THREE.Vector3, p2: THREE.Vector3, slack = 0.08) {
    super();
    this.p1 = p1;
    this.p2 = p2;
    const dist = p1.distanceTo(p2);
    // Gravitational sag depth proportional to span distance and slack factor
    this.sag = slack * (0.06 + dist * 0.045);
  }

  override getPoint(t: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    const point = optionalTarget;
    // Linear interpolation baseline
    point.lerpVectors(this.p1, this.p2, t);

    // Physical gravitational catenary sag in -Y (parabolic profile, max at t=0.5)
    const sagY = 4 * this.sag * t * (1 - t);
    point.y -= sagY;

    // Natural forward Z clearance so yarn floats above board and papers
    point.z += 0.016 * Math.sin(Math.PI * t);

    // Subtle natural spun thread micro-waviness
    point.x += 0.003 * Math.sin(Math.PI * 3 * t);

    return point;
  }
}

/**
 * Interconnected movie crime scene villain conspiracy yarn network.
 * Connects pins on case files directly to one another with authentic gravitational sag,
 * thin spun woolen thread (radius 0.009), and 2-ply fibrous texture.
 */
export function Catenary3DYarn({ points, isHovered = false }: Catenary3DYarnProps) {
  const groupRef = useRef<THREE.Group>(null);
  const springDisplacement = useRef(0);
  const springVelocity = useRef(0);

  // 1. Procedural 2-Ply Woolen Textures (diffuse, bump, roughness)
  const { diffuse, bump, roughness } = useMemo(() => createWoolYarnTextures(), []);

  // 2. High-Roughness Non-Plasticky Spun Wool Material
  const woolMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#9E1521"),
        map: diffuse,
        bumpMap: bump,
        bumpScale: 0.024,
        roughnessMap: roughness,
        roughness: 0.96,
        metalness: 0.0,
      }),
    [diffuse, bump, roughness],
  );

  useEffect(() => {
    return () => {
      diffuse.dispose();
      bump.dispose();
      roughness.dispose();
      woolMaterial.dispose();
    };
  }, [diffuse, bump, roughness, woolMaterial]);

  // Subtle physical breeze / spring reaction when card is hovered
  useEffect(() => {
    if (isHovered) {
      springVelocity.current += 0.035;
    }
  }, [isHovered]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const clampedDelta = Math.min(delta, 0.05);

    // Damped harmonic oscillator for hanging yarn tension
    const k = 14.0;
    const damping = 3.8;
    const springForce = -k * springDisplacement.current;
    const dampingForce = -damping * springVelocity.current;
    springVelocity.current += (springForce + dampingForce) * clampedDelta;
    springDisplacement.current += springVelocity.current * clampedDelta;

    groupRef.current.position.y = springDisplacement.current * 0.03;
  });

  // Interconnected case pin network connections (classic crime-scene movie web)
  const connections = useMemo(() => {
    if (!points || points.length < 2) return [];

    const pinVectors = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));

    // Define interconnected links between case pins:
    // Sequential links + suspect cross-links for iconic movie detective web
    const linkPairs: Array<{ from: number; to: number; slack: number }> = [
      // Direct progression links
      { from: 0, to: 1, slack: 0.085 },
      { from: 1, to: 2, slack: 0.075 },
      { from: 2, to: 3, slack: 0.078 },
      { from: 3, to: 4, slack: 0.088 },

      // Cross-case suspect conspiracy links
      { from: 0, to: 2, slack: 0.095 },
      { from: 1, to: 3, slack: 0.115 }, // deep lower gravitational sag
      { from: 2, to: 4, slack: 0.092 },
      { from: 0, to: 3, slack: 0.125 }, // dramatic long diagonal cross-thread
      { from: 1, to: 4, slack: 0.12 }, // dramatic long diagonal cross-thread
    ];

    return linkPairs
      .filter((pair) => pair.from < pinVectors.length && pair.to < pinVectors.length)
      .map((pair, idx) => {
        const pA = pinVectors[pair.from];
        const pB = pinVectors[pair.to];
        if (!pA || !pB) return null;
        const curve = new PhysicalCatenaryCurve(pA, pB, pair.slack);
        // Tube radius: 0.009 (fine 2-ply spun wool yarn, not thick plastic pipe!)
        const geometry = new THREE.TubeGeometry(curve, 48, 0.009, 8, false);
        return {
          key: `yarn-interconnect-${pair.from}-${pair.to}-${idx}`,
          geometry,
        };
      })
      .filter((item): item is { key: string; geometry: THREE.TubeGeometry } => item !== null);
  }, [points]);

  return (
    <group ref={groupRef}>
      {/* Interconnected Crimson Woolen Yarn Strands */}
      {connections.map(({ key, geometry }) => (
        <mesh key={key} geometry={geometry} material={woolMaterial} castShadow />
      ))}

      {/* Spun Yarn Wrapped Knots / Coils on Each Case Pin Anchor */}
      {points.map((p, idx) => (
        <mesh
          key={`yarn-pin-coil-${idx}`}
          position={[p[0], p[1], p[2] - 0.005]}
          rotation={[0, 0, idx * 0.4]}
          material={woolMaterial}
        >
          <torusGeometry args={[0.042, 0.01, 8, 16]} />
        </mesh>
      ))}
    </group>
  );
}
