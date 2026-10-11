"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface NoirCloudSeparatorProps {
  className?: string;
}

export function NoirCloudSeparator({ className = "" }: NoirCloudSeparatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || 280;

    // Safely pre-acquire 2D-only WebGL context with zero depth/stencil buffer requirements
    const canvas = document.createElement("canvas");
    let gl: RenderingContext | null = null;
    try {
      gl =
        canvas.getContext("webgl2", {
          alpha: true,
          depth: false,
          stencil: false,
          antialias: false,
          powerPreference: "low-power",
        }) ||
        canvas.getContext("webgl", {
          alpha: true,
          depth: false,
          stencil: false,
          antialias: false,
          powerPreference: "low-power",
        });
    } catch {
      gl = null;
    }

    if (!gl) {
      // Graceful fallback: CSS cloud layers provide seamless volumetric visual
      return;
    }

    // Scene & Orthographic Camera for a 2D full-width volumetric smoke quad
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl as WebGL2RenderingContext,
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, false);

    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    container.appendChild(canvas);

    // Uniforms for the procedural volumetric smoke / cloud shader with cursor tracking
    const uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(width, height),
      },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uSpeed: { value: prefersReducedMotion ? 0.02 : 0.12 },
    };

    // Vertex Shader: full-screen quad passing UV coordinates
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Fragment Shader: Multi-octave domain-warped FBM with glassy refractive highlights & cursor disturbance
    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;

      // Pseudo-random noise functions
      float hash(vec2 p) {
        p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
        return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      // Fractional Brownian Motion with 4 octaves
      float fbm(vec2 p) {
        float f = 0.0;
        float amp = 0.5;
        mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        for (int i = 0; i < 4; i++) {
          f += amp * noise(p);
          p = m * p;
          amp *= 0.5;
        }
        return f;
      }

      void main() {
        vec2 uv = vUv;
        float aspect = uResolution.x / max(uResolution.y, 1.0);
        vec2 p = uv * vec2(aspect * 2.0, 2.0);

        float t = uTime * 0.16;

        // Interactive mouse curl & glassy distortion following cursor
        vec2 mouseDist = uv - uMouse;
        float mouseEffect = exp(-dot(mouseDist, mouseDist) * 14.0) * 0.45;

        // Domain warping for organic, billowing cloud/smoke tendrils
        vec2 q = vec2(
          fbm(p + vec2(0.0, t * 0.55) + mouseEffect),
          fbm(p + vec2(5.2, t * 0.38))
        );

        vec2 r = vec2(
          fbm(p + 3.2 * q + vec2(1.7 - t * 0.22, 9.2 + t * 0.28)),
          fbm(p + 3.2 * q + vec2(8.3 + t * 0.18, 2.8 - t * 0.12))
        );

        float f = fbm(p + 3.6 * r + vec2(t * 0.1, t * 0.16));
        f = clamp((f + 0.28) * 1.5, 0.0, 1.0);

        // Noir palette tokens:
        // Rolling Smoke: #261D1A (0.149, 0.114, 0.102)
        // Deep Oxblood / Burgundy: #3D1016 (0.239, 0.063, 0.086)
        // Vivid Crimson: #A7192D (0.655, 0.098, 0.176)
        // Warm Ivory Fog: #E8DCC8 (0.910, 0.863, 0.784)
        vec3 colSmoke    = vec3(0.149, 0.114, 0.102);
        vec3 colBurgundy = vec3(0.239, 0.063, 0.086);
        vec3 colCrimson  = vec3(0.72, 0.11, 0.19);
        vec3 colIvory    = vec3(0.910, 0.863, 0.784);

        // Mix colors based on smoke density and warping
        vec3 color = mix(colBurgundy, colSmoke, clamp(q.x * 1.3, 0.0, 1.0));
        color = mix(color, colCrimson, clamp(length(r.x) * 1.0, 0.0, 1.0) * 0.6);
        color = mix(color, colIvory, pow(f, 2.2) * 0.45);

        // Glassy specular shimmer along cloud ridges
        float sheen = pow(clamp(f * 1.2, 0.0, 1.0), 3.0) * 0.35;
        color += colIvory * sheen;

        // Flawless vertical edge feathering:
        // Top fades out to 0 alpha towards y=1.0
        // Bottom fades out to 0 alpha towards y=0.0
        float verticalMask = smoothstep(0.0, 0.22, uv.y) * smoothstep(1.0, 0.78, uv.y);

        // Cloud density mask
        float alpha = clamp(f * 1.4, 0.0, 1.0) * verticalMask * 0.90;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Pointer move listener for atmospheric smoke disturbance following cursor
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      uniforms.uMouse.value.set(Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y)));
    };

    window.addEventListener("pointermove", handlePointerMove);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        renderer.setSize(w, h);
        uniforms.uResolution.value.set(w, h);
      }
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let clock = 0;
    const animate = () => {
      clock += uniforms.uSpeed.value * 0.1;
      uniforms.uTime.value = clock;
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    // Clean up
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();

      canvas.removeEventListener("webglcontextlost", handleContextLost);
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
      try {
        renderer.forceContextLoss();
      } catch {
        // Ignore if already lost
      }
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-60 sm:h-72 md:h-80 pointer-events-none overflow-hidden select-none z-20 ${className}`}
      aria-hidden="true"
    >
      {/* High-fidelity CSS Volumetric Fog Layers */}
      <div
        className="absolute inset-0 pointer-events-none opacity-75"
        style={{
          background: `
            radial-gradient(ellipse 900px 300px at 25% 50%, rgba(167, 25, 45, 0.28) 0%, rgba(38, 13, 16, 0.55) 45%, transparent 75%),
            radial-gradient(ellipse 1000px 320px at 75% 50%, rgba(232, 220, 200, 0.14) 0%, rgba(38, 13, 16, 0.45) 45%, transparent 75%)
          `,
        }}
      />

      {/* Top and bottom edge blend gradients */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#100D0D] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#100D0D] to-transparent z-10 pointer-events-none" />

      {/* Distinctive Brass Atmospheric Metadata Rule */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none px-6 sm:px-12">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#79604A]/60 to-transparent" />
        <div className="mx-4 flex items-center gap-2.5 border border-[#79604A]/70 bg-[#100D0D]/85 px-4 py-1.5 backdrop-blur-md shadow-2xl">
          <span className="h-2 w-2 rounded-full bg-[#A7192D] animate-ping" />
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#E8DCC8] font-bold">
            NO SHIT SHERLOCK {"//"} EVIDENCE VAULT ARCHIVE
          </span>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#79604A]/60 to-transparent" />
      </div>
    </div>
  );
}
