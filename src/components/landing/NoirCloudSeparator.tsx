"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface NoirCloudSeparatorProps {
  className?: string;
}

export function NoirCloudSeparator({ className = "" }: NoirCloudSeparatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || 400;

    // Direct WebGL2 / WebGL context acquisition with low-power profile to avoid driver context loss
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

    if (!gl) return;

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

    // Uniforms with cursor coordinates and scroll parallax
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uSpeed: { value: prefersReducedMotion ? 0.03 : 0.15 },
    };

    // Vertex Shader
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Fragment Shader: Inigo Quilez Domain-Warped FBM with Glassy Refraction & Cursor Caustics
    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uScroll;

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

      // Fractional Brownian Motion
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
        vec2 p = uv * vec2(aspect * 2.2, 2.2);

        float t = uTime * 0.16;

        // Interactive mouse curl & liquid glass disturbance
        vec2 mouseDist = uv - uMouse;
        float mouseEffect = exp(-dot(mouseDist, mouseDist) * 12.0) * 0.5;

        // Scroll parallax displacement
        p.y += uScroll * 0.8;

        // Inigo Quilez Domain Warping for liquid glass smoke tendrils
        vec2 q = vec2(
          fbm(p + vec2(0.0, t * 0.6) + mouseEffect),
          fbm(p + vec2(5.2, t * 0.4))
        );

        vec2 r = vec2(
          fbm(p + 3.4 * q + vec2(1.7 - t * 0.25, 9.2 + t * 0.3)),
          fbm(p + 3.4 * q + vec2(8.3 + t * 0.2, 2.8 - t * 0.15))
        );

        float f = fbm(p + 3.8 * r + vec2(t * 0.12, t * 0.18));
        f = clamp((f + 0.3) * 1.5, 0.0, 1.0);

        // Estimate normal gradient for liquid glass specular caustics
        float eps = 0.02;
        float fx = fbm(p + vec2(eps, 0.0) + 3.4 * q) - fbm(p - vec2(eps, 0.0) + 3.4 * q);
        float fy = fbm(p + vec2(0.0, eps) + 3.4 * q) - fbm(p - vec2(0.0, eps) + 3.4 * q);
        vec3 normal = normalize(vec3(fx, fy, 0.18));

        // Light vector derived from cursor coordinates
        vec3 lightDir = normalize(vec3(uMouse.x - uv.x, (uMouse.y - uv.y) * 0.6, 0.4));
        float spec = pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 10.0);

        // Volumetric Noir Palette:
        // Deep Oxblood / Burgundy: #2D0D12 (0.176, 0.051, 0.071)
        // Rich Crimson: #A7192D (0.655, 0.098, 0.176)
        // Warm Ivory Fog: #E8DCC8 (0.910, 0.863, 0.784)
        vec3 colBurgundy = vec3(0.24, 0.06, 0.09);
        vec3 colCrimson  = vec3(0.75, 0.13, 0.22);
        vec3 colIvory    = vec3(0.92, 0.87, 0.79);

        // Layered cloud color mixing
        vec3 color = mix(colBurgundy, colCrimson, clamp(length(r.x) * 1.2, 0.0, 1.0) * 0.7);
        color = mix(color, colIvory, pow(f, 2.0) * 0.55);

        // Liquid glass caustic specular reflection (moves with cursor)
        vec3 colGlassSheen = vec3(1.0, 0.95, 0.88) * spec * 0.85;
        color += colGlassSheen;

        // Smooth vertical edge feathering so top and bottom melt into #100D0D
        float verticalMask = smoothstep(0.0, 0.22, uv.y) * smoothstep(1.0, 0.78, uv.y);

        // Dense, billowing volumetric alpha
        float alpha = clamp(f * 1.5 + spec * 0.4, 0.0, 1.0) * verticalMask * 0.95;

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

    // Track mouse coordinates for liquid glass caustics
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      uniforms.uMouse.value.set(Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y)));
    };

    window.addEventListener("pointermove", handlePointerMove);

    // Track scroll for 3D parallax cloud billowing
    const handleScroll = () => {
      const scrollY = window.scrollY;
      uniforms.uScroll.value = scrollY * 0.0004;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

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

    // Teardown
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();

      canvas.removeEventListener("webglcontextlost", handleContextLost);
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
      className={`relative w-full h-80 sm:h-96 md:h-[450px] pointer-events-none overflow-hidden select-none z-20 ${className}`}
      aria-hidden="true"
    >
      {/* Foundational WebGL Canvas (Full dimensions directly bound) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none z-10"
      />

      {/* Layered CSS Volumetric Fog Gradient Behind WebGL */}
      <div
        className="absolute inset-0 pointer-events-none opacity-85 z-0"
        style={{
          background: `
            radial-gradient(ellipse 900px 320px at 20% 50%, rgba(167, 25, 45, 0.32) 0%, rgba(38, 13, 16, 0.6) 45%, transparent 75%),
            radial-gradient(ellipse 1000px 350px at 80% 50%, rgba(232, 220, 200, 0.18) 0%, rgba(38, 13, 16, 0.5) 45%, transparent 75%)
          `,
        }}
      />

      {/* Seamless Top & Bottom Edge Fade Gradients */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#100D0D] to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#100D0D] to-transparent z-20 pointer-events-none" />

      {/* Floating 3D Glassmorphism Evidence Capsule (Organic, curved 3D pill with NO harsh straight lines) */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center pointer-events-none px-6 sm:px-12">
        <div className="relative group flex items-center gap-3 rounded-full border border-[#A7192D]/70 bg-[#181414]/85 px-6 py-2 backdrop-blur-xl shadow-[0_0_35px_rgba(167,25,45,0.4)] transition-all">
          <span className="h-2 w-2 rounded-full bg-[#A7192D] animate-ping" />
          <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#E8DCC8] font-bold">
            NO SHIT SHERLOCK {"//"} EVIDENCE VAULT ARCHIVE
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#E8DCC8] opacity-75" />
        </div>
      </div>
    </div>
  );
}
