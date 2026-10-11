"use client";

import { useEffect, useRef } from "react";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  color?: string;
}

export function Particles({
  className = "",
  quantity = 40,
  staticity = 50,
  ease = 50,
  color = "#A9874A",
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<
    Array<{
      x: number;
      y: number;
      translateX: number;
      translateY: number;
      size: number;
      alpha: number;
      targetAlpha: number;
      dx: number;
      dy: number;
      magnetism: number;
    }>
  >([]);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  useEffect(() => {
    if (!canvasRef.current) return;
    context.current = canvasRef.current.getContext("2d");

    const initCanvas = () => {
      if (!canvasRef.current || !context.current) return;
      circles.current = [];
      canvasSize.current.w = canvasRef.current.offsetWidth;
      canvasSize.current.h = canvasRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      context.current.scale(dpr, dpr);

      for (let i = 0; i < quantity; i++) {
        const x = Math.floor(Math.random() * canvasSize.current.w);
        const y = Math.floor(Math.random() * canvasSize.current.h);
        const size = Math.floor(Math.random() * 2) + 0.8;
        const alpha = 0.1 + Math.random() * 0.4;
        const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
        const dx = (Math.random() - 0.5) * 0.2;
        const dy = (Math.random() - 0.5) * 0.2;
        const magnetism = 0.1 + Math.random() * 4;
        circles.current.push({
          x,
          y,
          translateX: 0,
          translateY: 0,
          size,
          alpha,
          targetAlpha,
          dx,
          dy,
          magnetism,
        });
      }
    };

    const drawCircle = (circle: (typeof circles.current)[0]) => {
      if (!context.current) return;
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      context.current.fillStyle = color;
      context.current.globalAlpha = alpha;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let animationFrameId: number;
    const animate = () => {
      if (!context.current) return;
      context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);

      for (let i = 0; i < circles.current.length; i++) {
        const circle = circles.current[i];
        if (!circle) continue;
        // Handle edges
        if (circle.x < -circle.size) circle.x = canvasSize.current.w + circle.size;
        else if (circle.x > canvasSize.current.w + circle.size) circle.x = -circle.size;

        if (circle.y < -circle.size) circle.y = canvasSize.current.h + circle.size;
        else if (circle.y > canvasSize.current.h + circle.size) circle.y = -circle.size;

        circle.x += circle.dx;
        circle.y += circle.dy;
        circle.translateX +=
          (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease;
        circle.translateY +=
          (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease;

        drawCircle(circle);
      }
      animationFrameId = window.requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = e.clientX - rect.left - w / 2;
      const y = e.clientY - rect.top - h / 2;
      mouse.current.x = x;
      mouse.current.y = y;
    };

    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", initCanvas);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [quantity, color, staticity, ease, dpr]);

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
