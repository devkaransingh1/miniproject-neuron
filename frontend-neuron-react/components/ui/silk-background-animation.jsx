import { useEffect, useRef } from "react";

const MAX_RENDER_PIXELS = 80000;
const FRAME_INTERVAL = 1000 / 24;

function renderSilk(ctx, canvas, imageData, time) {
  const { width, height } = canvas;
  const data = imageData.data;
  const scale = 2;
  const timeOffset = 0.02 * time;

  for (let y = 0; y < height; y += 1) {
    const v = (y / height) * scale;
    for (let x = 0; x < width; x += 1) {
      const u = (x / width) * scale;
      const warpedV = v + 0.03 * Math.sin(8 * u - timeOffset);
      const pattern =
        0.6 +
        0.4 *
          Math.sin(
            5 * (u + warpedV + Math.cos(3 * u + 5 * warpedV) + 0.02 * timeOffset),
          ) +
        Math.sin(20 * (u + warpedV - 0.1 * timeOffset));
      const rawNoise =
        (2.71828 * Math.sin(2.71828 * x) * 2.71828 * Math.sin(2.71828 * y) * (1 + x)) %
        1;
      const noise = rawNoise < 0 ? rawNoise + 1 : rawNoise;
      const intensity = Math.min(1, Math.max(0, pattern - (noise / 15) * 0.8));
      const index = (y * width + x) * 4;

      data[index] = 8 + 115 * intensity;
      data[index + 1] = 8 + 108 * intensity;
      data[index + 2] = 12 + 120 * intensity;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const overlay = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height) / 2,
  );
  overlay.addColorStop(0, "rgba(0, 0, 0, 0.08)");
  overlay.addColorStop(1, "rgba(0, 0, 0, 0.42)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);
}

export function Component({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let imageData;
    let frameId = 0;
    let lastFrameTime = 0;
    let time = 0;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const renderScale = Math.min(
        0.5,
        Math.sqrt(MAX_RENDER_PIXELS / Math.max(1, width * height)),
      );
      canvas.width = Math.max(1, Math.round(width * renderScale));
      canvas.height = Math.max(1, Math.round(height * renderScale));
      imageData = ctx.createImageData(canvas.width, canvas.height);

      if (prefersReducedMotion) {
        renderSilk(ctx, canvas, imageData, 0);
      }
    };

    const animate = (timestamp) => {
      frameId = window.requestAnimationFrame(animate);
      if (timestamp - lastFrameTime < FRAME_INTERVAL) return;

      lastFrameTime = timestamp;
      time += 1;
      renderSilk(ctx, canvas, imageData, time);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    if (!prefersReducedMotion) {
      frameId = window.requestAnimationFrame(animate);
    }

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
