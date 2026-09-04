'use client';

import { useEffect, useRef } from 'react';

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let pointerX = 0;
    let pointerY = 0;
    const nodes = Array.from({ length: 28 }, (_, index) => ({
      x: ((index * 83) % 101) / 100,
      y: ((index * 47) % 97) / 100,
      drift: 0.3 + (index % 5) * 0.08,
    }));

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const pointer = (event: PointerEvent) => {
      pointerX = (event.clientX / width - 0.5) * 9;
      pointerY = (event.clientY / height - 0.5) * 9;
    };
    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      const points = nodes.map((node, index) => ({
        x: node.x * width + Math.sin(time * 0.00018 * node.drift + index) * 13 + pointerX,
        y: node.y * height + Math.cos(time * 0.0002 * node.drift + index) * 10 + pointerY,
      }));
      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const distance = Math.hypot(dx, dy);
          if (distance < 145) {
            context.strokeStyle = `rgba(101, 135, 255, ${0.12 * (1 - distance / 145)})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(points[i].x, points[i].y);
            context.lineTo(points[j].x, points[j].y);
            context.stroke();
          }
        }
        context.fillStyle = i % 6 === 0 ? 'rgba(232,255,79,.45)' : 'rgba(97,231,255,.35)';
        context.beginPath();
        context.arc(points[i].x, points[i].y, i % 6 === 0 ? 2 : 1.2, 0, Math.PI * 2);
        context.fill();
      }
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', pointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', pointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />;
}
