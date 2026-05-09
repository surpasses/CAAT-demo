import { useCurrentFrame, useVideoConfig, Img, staticFile, AbsoluteFill } from "remotion";
import { useRef, useEffect } from "react";

const FilmGrain = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef(null);
  const grainW = Math.floor(width / 2);
  const grainH = Math.floor(height / 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(grainW, grainH);

    // LCG seeded per-frame for deterministic rendering
    let seed = ((frame * 1664525 + 1013904223) >>> 0) ^ 0xdeadbeef;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed >>> 0;
    };

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = rand();
      const noise = r & 0xff;
      imageData.data[i] = noise;
      imageData.data[i + 1] = noise;
      imageData.data[i + 2] = noise;
      imageData.data[i + 3] = 28;
    }
    ctx.putImageData(imageData, 0, 0);
  }, [frame, grainW, grainH]);

  return (
    <canvas
      ref={canvasRef}
      width={grainW}
      height={grainH}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        mixBlendMode: "overlay",
        opacity: 0.5,
        pointerEvents: "none",
      }}
    />
  );
};

export const MotionBackground = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow breathing pulse — always slightly zoomed in so edges never show
  const breathScale = 1.04 + 0.025 * Math.sin((frame / (fps * 4)) * Math.PI * 2);

  // Gentle independent drift on each axis (different periods)
  const driftX = 14 * Math.sin((frame / (fps * 7)) * Math.PI * 2);
  const driftY = 9 * Math.cos((frame / (fps * 5.3)) * Math.PI * 2);

  // Vignette breathes subtly with a different phase
  const vignetteOpacity = 0.42 + 0.06 * Math.sin((frame / (fps * 6)) * Math.PI * 2);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* Image placed portrait-sized, then rotated 90° → becomes 1920×1080 */}
      <div
        style={{
          position: "absolute",
          width: 1080,
          height: 1920,
          top: "50%",
          left: "50%",
          transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) rotate(90deg) scale(${breathScale})`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={staticFile("bg.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Vignette — deep radial that pulses slightly */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 90% 80% at 50% 50%, transparent 25%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Film grain overlay */}
      <FilmGrain />
    </AbsoluteFill>
  );
};
