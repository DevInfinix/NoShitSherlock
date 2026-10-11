"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface FloatingDetectiveSceneProps {
  className?: string;
}

export function FloatingDetectiveScene({ className = "" }: FloatingDetectiveSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.set(0, 0, 18);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "default",
      });
    } catch {
      // Graceful fallback if WebGL unavailable
      return;
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost, false);

    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Dynamic Lighting simulating an antique desk lamp & crime scene torch
    const ambientLight = new THREE.AmbientLight(0x260d10, 1.2);
    scene.add(ambientLight);

    // Warm Brass Desk Lamp Light Cone
    const deskLamp = new THREE.PointLight(0xe8dcc8, 3.5, 35, 1.5);
    deskLamp.position.set(6, 8, 10);
    scene.add(deskLamp);

    // Deep Crimson Ambient Accent Light
    const crimsonTorch = new THREE.PointLight(0xa7192d, 4.0, 30, 2.0);
    crimsonTorch.position.set(-8, -6, 8);
    scene.add(crimsonTorch);

    // Helper: Create procedural vintage paper canvas texture
    const createPaperTexture = (bgColor: string, hasLines: boolean, stampText?: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 700;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Paper base
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 512, 700);

      // Aged paper vignette and noise
      const gradient = ctx.createRadialGradient(256, 350, 100, 256, 350, 400);
      gradient.addColorStop(0, "rgba(232, 220, 200, 0.05)");
      gradient.addColorStop(1, "rgba(16, 13, 13, 0.45)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 700);

      // Ruled ledger lines
      if (hasLines) {
        ctx.strokeStyle = "rgba(121, 96, 74, 0.25)";
        ctx.lineWidth = 1.5;
        for (let y = 100; y < 650; y += 32) {
          ctx.beginPath();
          ctx.moveTo(40, y);
          ctx.lineTo(472, y);
          ctx.stroke();
        }
      }

      // Red rubber stamp mark
      if (stampText) {
        ctx.save();
        ctx.translate(320, 180);
        ctx.rotate(-0.25);
        ctx.strokeStyle = "rgba(167, 25, 45, 0.75)";
        ctx.lineWidth = 4;
        ctx.strokeRect(-90, -30, 180, 60);
        ctx.fillStyle = "rgba(167, 25, 45, 0.75)";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(stampText, 0, 0);
        ctx.restore();
      }

      // Border rule
      ctx.strokeStyle = "rgba(121, 96, 74, 0.4)";
      ctx.lineWidth = 3;
      ctx.strokeRect(16, 16, 480, 668);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    // 3D Floating Objects Array
    interface FloatingItem {
      mesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseZ: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
      floatFreq: number;
      floatAmp: number;
    }

    const floatingItems: FloatingItem[] = [];

    // 1. Evidence Case File (Manila Folder)
    const folderTex = createPaperTexture("#2a221b", true, "EVIDENCE #01");
    const folderGeo = new THREE.PlaneGeometry(3.6, 4.8);
    const folderMat = new THREE.MeshStandardMaterial({
      map: folderTex,
      roughness: 0.85,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const folderMesh = new THREE.Mesh(folderGeo, folderMat);
    folderMesh.position.set(-6.5, 3.5, 2);
    folderMesh.rotation.set(0.15, 0.35, -0.2);
    scene.add(folderMesh);
    floatingItems.push({
      mesh: folderMesh,
      baseX: -6.5,
      baseY: 3.5,
      baseZ: 2,
      rotSpeedX: 0.0003,
      rotSpeedY: 0.0005,
      rotSpeedZ: 0.0002,
      floatFreq: 1.2,
      floatAmp: 0.35,
    });

    // 2. Coroner Report / Ledger Slip
    const reportTex = createPaperTexture("#1f1a17", true, "CONFIDENTIAL");
    const reportGeo = new THREE.PlaneGeometry(2.8, 3.8);
    const reportMat = new THREE.MeshStandardMaterial({
      map: reportTex,
      roughness: 0.9,
      metalness: 0.05,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const reportMesh = new THREE.Mesh(reportGeo, reportMat);
    reportMesh.position.set(7.5, -2.5, 1);
    reportMesh.rotation.set(-0.2, -0.3, 0.25);
    scene.add(reportMesh);
    floatingItems.push({
      mesh: reportMesh,
      baseX: 7.5,
      baseY: -2.5,
      baseZ: 1,
      rotSpeedX: 0.0004,
      rotSpeedY: 0.0003,
      rotSpeedZ: 0.0005,
      floatFreq: 0.9,
      floatAmp: 0.4,
    });

    // 3. Telegraph Cable Wiretap Slip
    const wiretapTex = createPaperTexture("#1a1512", false, "WIRETAP");
    const wiretapGeo = new THREE.PlaneGeometry(2.2, 3.2);
    const wiretapMat = new THREE.MeshStandardMaterial({
      map: wiretapTex,
      roughness: 0.8,
      metalness: 0.15,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const wiretapMesh = new THREE.Mesh(wiretapGeo, wiretapMat);
    wiretapMesh.position.set(-7, -4.5, 0.5);
    wiretapMesh.rotation.set(0.3, 0.2, 0.15);
    scene.add(wiretapMesh);
    floatingItems.push({
      mesh: wiretapMesh,
      baseX: -7,
      baseY: -4.5,
      baseZ: 0.5,
      rotSpeedX: 0.0005,
      rotSpeedY: 0.0004,
      rotSpeedZ: 0.0003,
      floatFreq: 1.4,
      floatAmp: 0.3,
    });

    // 4. Polaroid Crime Scene Photograph Frame
    const photoTex = createPaperTexture("#231e19", false, "EXHIBIT B");
    const photoGeo = new THREE.PlaneGeometry(2.4, 2.8);
    const photoMat = new THREE.MeshStandardMaterial({
      map: photoTex,
      roughness: 0.7,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.set(6.8, 4.2, 1.5);
    photoMesh.rotation.set(-0.15, 0.25, -0.1);
    scene.add(photoMesh);
    floatingItems.push({
      mesh: photoMesh,
      baseX: 6.8,
      baseY: 4.2,
      baseZ: 1.5,
      rotSpeedX: 0.0003,
      rotSpeedY: 0.0004,
      rotSpeedZ: 0.0002,
      floatFreq: 1.1,
      floatAmp: 0.35,
    });

    // Atmospheric Floating Dust Particles / Embers in Light Cone
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 30;
      particlePos[i + 1] = (Math.random() - 0.5) * 25;
      particlePos[i + 2] = (Math.random() - 0.5) * 15;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xe8dcc8,
      size: 0.12,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Tracking for Interactive 3D Parallax Tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouseX = (e.clientX - halfW) / halfW;
      mouseY = (e.clientY - halfH) / halfH;
      targetCameraX = mouseX * 1.5;
      targetCameraY = -mouseY * 1.2;
    };

    window.addEventListener("pointermove", handlePointerMove);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let clock = 0;
    const animate = () => {
      clock += prefersReducedMotion ? 0.002 : 0.012;

      // Smooth camera parallax easing
      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += (targetCameraY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Animate floating items (sinusoidal levitation & gentle rotation)
      floatingItems.forEach((item, i) => {
        if (!prefersReducedMotion) {
          item.mesh.position.y = item.baseY + Math.sin(clock * item.floatFreq + i) * item.floatAmp;
          item.mesh.position.x = item.baseX + Math.cos(clock * item.floatFreq * 0.7 + i) * 0.15;
          item.mesh.rotation.x += item.rotSpeedX;
          item.mesh.rotation.y += item.rotSpeedY;
          item.mesh.rotation.z += item.rotSpeedZ;
        }
      });

      // Slowly rotate particle dust motes
      particles.rotation.y = clock * 0.05;
      particles.rotation.x = clock * 0.02;

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    // Teardown
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      folderGeo.dispose();
      folderMat.dispose();
      folderTex.dispose();

      reportGeo.dispose();
      reportMat.dispose();
      reportTex.dispose();

      wiretapGeo.dispose();
      wiretapMat.dispose();
      wiretapTex.dispose();

      photoGeo.dispose();
      photoMat.dispose();
      photoTex.dispose();

      particleGeo.dispose();
      particleMat.dispose();

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
      className={`pointer-events-none sticky top-0 h-screen w-full overflow-hidden select-none opacity-85 -mb-[100vh] ${className}`}
      aria-hidden="true"
    />
  );
}
