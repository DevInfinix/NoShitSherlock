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

    // Scene & Orthographic Camera for a 2D full-width volumetric smoke quad
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "default",
      });
    } catch {
      // Graceful fallback if WebGL fails
      return;
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost, false);

    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Uniforms for the procedural volumetric smoke / cloud shader
    const uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(container.clientWidth, container.clientHeight),
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

    // Fragment Shader: Multi-octave domain-warped FBM procedural smoke/cloud
    // Fades seamlessly into #100D0D at the top and bottom edges
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
        vec2 p = uv * vec2(aspect * 1.8, 1.8);

        float t = uTime * 0.15;

        // Interactive mouse curl
        vec2 mouseDist = uv - uMouse;
        float mouseEffect = exp(-dot(mouseDist, mouseDist) * 12.0) * 0.4;

        // Domain warping for organic, billowing cloud/smoke tendrils
        vec2 q = vec2(
          fbm(p + vec2(0.0, t * 0.6) + mouseEffect),
          fbm(p + vec2(5.2, t * 0.4))
        );

        vec2 r = vec2(
          fbm(p + 3.0 * q + vec2(1.7 - t * 0.2, 9.2 + t * 0.3)),
          fbm(p + 3.0 * q + vec2(8.3 + t * 0.2, 2.8 - t * 0.1))
        );

        float f = fbm(p + 3.5 * r + vec2(t * 0.1, t * 0.15));
        f = clamp((f + 0.3) * 1.4, 0.0, 1.0);

        // Noir palette tokens:
        // Charcoal ground: #100D0D (0.063, 0.051, 0.051)
        // Burgundy wash: #260D10 (0.149, 0.051, 0.063)
        // Rich Crimson: #A7192D (0.655, 0.098, 0.176)
        // Warm Ivory: #E8DCC8 (0.910, 0.863, 0.784)
        vec3 colCharcoal = vec3(0.063, 0.051, 0.051);
        vec3 colBurgundy = vec3(0.149, 0.051, 0.063);
        vec3 colCrimson  = vec3(0.655, 0.098, 0.176);
        vec3 colIvory    = vec3(0.910, 0.863, 0.784);

        // Mix colors based on smoke density and warping
        vec3 color = mix(colCharcoal, colBurgundy, clamp(q.x * 1.5, 0.0, 1.0));
        color = mix(color, colCrimson, clamp(length(r.x) * 0.85, 0.0, 1.0) * 0.55);
        color = mix(color, colIvory, pow(f, 3.2) * 0.22);

        // Flawless vertical edge feathering:
        // Top fades out to 0 alpha towards y=1.0
        // Bottom fades out to 0 alpha towards y=0.0
        float verticalMask = smoothstep(0.0, 0.35, uv.y) * smoothstep(1.0, 0.65, uv.y);

        // Cloud density mask
        float alpha = clamp(f * 1.2, 0.0, 1.0) * verticalMask * 0.85;

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

    // Pointer move listener for atmospheric smoke disturbance
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
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width, height);
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
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
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
      className={`relative w-full h-44 sm:h-56 md:h-64 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Subtle top edge blend gradient */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#100D0D] to-transparent z-10 pointer-events-none" />

      {/* Subtle bottom edge blend gradient */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#100D0D] to-transparent z-10 pointer-events-none" />

      {/* Thin brass atmospheric metadata rule centered inside fog */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none px-8">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#79604A]/30 to-transparent" />
        <div className="mx-4 flex items-center gap-2 border border-[#79604A]/30 bg-[#100D0D]/70 px-3 py-0.5 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#A7192D] animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#A69A8C]">
            NO SHIT SHERLOCK {"//"} EVIDENCE VAULT ARCHIVE
          </span>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#79604A]/30 to-transparent" />
      </div>
    </div>
  );
}
