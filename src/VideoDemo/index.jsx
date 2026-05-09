import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
} from "remotion";
import { Video } from "@remotion/media";

// ─── Timing map (all at 30 fps) ────────────────────────────────────────────
// 0:02 = f60   zoom in  → search bar
// 0:05 = f150  zoom out → full view
// 0:06 = f180  zoom in  → University of Sydney card
// 0:10 = f300  zoom out → full, then zoom in → Bookmarked tab
// 0:16 = f480  zoom out → full view
// 0:19.15 ≈ f574  end

const ease = Easing.bezier(0.4, 0, 0.2, 1);
const tween = (frame, frames, values) =>
  interpolate(frame, frames, values, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

// ─── Camera ────────────────────────────────────────────────────────────────
const Camera = ({ focusX, focusY, zoom, children }) => {
  const { width: W, height: H } = useVideoConfig();
  const cx = focusX;
  const cy = focusY;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: H,
        transformOrigin: `${cx}px ${cy}px`,
        transform: `translate(${W / 2 - cx}px, ${H / 2 - cy}px) scale(${zoom})`,
      }}
    >
      {children}
    </div>
  );
};

// ─── Cursor ────────────────────────────────────────────────────────────────
const Cursor = ({ x, y, opacity, zoom }) => (
  <svg
    viewBox="0 0 24 24"
    width={48}
    height={48}
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${1 / zoom})`,
      transformOrigin: "top left",
      opacity,
      pointerEvents: "none",
      filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.45))",
    }}
  >
    <path
      d="M3 2 L3 19 L8 14.5 L11 21 L13.5 19.7 L10.7 13.5 L17 13.5 Z"
      fill="#fff"
      stroke="#111"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Click pulse ───────────────────────────────────────────────────────────
const Click = ({ x, y, atFrame, zoom }) => {
  const frame = useCurrentFrame();
  const t = frame - atFrame;
  if (t < 0 || t > 22) return null;
  const scale = interpolate(t, [0, 22], [0.4, 2.0], { extrapolateRight: "clamp" });
  const opacity = interpolate(t, [0, 22], [0.6, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: x - 22,
        top: y - 22,
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "2.5px solid #333",
        background: "rgba(255,255,255,0.15)",
        transform: `scale(${scale * (1 / zoom)})`,
        transformOrigin: "center",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Animation ────────────────────────────────────────────────────────────
const useAnimation = () => {
  const frame = useCurrentFrame();

  // Camera zoom + focus
  // Stays zoomed in throughout — smooth pans between the three focal points
  // instead of returning to a wide shot. Only zooms out at the very end.
  // Beat: idle → search bar → (pan) → Sydney card → (pan) → bookmarked tab → out
  const camF =  [0,   50,  65,  140, 175, 285, 305, 470, 490];
  const zooms = [1.0, 1.0, 2.4, 2.4, 2.0, 2.0, 2.6, 2.6, 1.0];
  const fxs =   [960, 960, 880, 880, 735, 735, 707, 707, 960];
  const fys =   [540, 540, 237, 237, 432, 432, 188, 188, 540];
  const zoom   = tween(frame, camF, zooms);
  const focusX = tween(frame, camF, fxs);
  const focusY = tween(frame, camF, fys);

  // Cursor path — guides eye to actions happening in the video
  // f60 search bar | f230 bookmark icon | f335 bookmarked tab | f435 sydney row
  const cF =  [0,    35,   60,  135, 175, 230, 285, 320, 335, 400, 425, 470, 540];
  const cxs = [2000, 2000, 880, 880, 697, 697, 697, 707, 707, 707, 695, 695, 960];
  const cys = [540,  540,  237, 237, 500, 500, 500, 188, 188, 188, 282, 282, 600];
  const cx = tween(frame, cF, cxs);
  const cy = tween(frame, cF, cys);
  const cOpacity = interpolate(
    frame,
    [25, 50, 510, 560],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return { zoom, focusX, focusY, cx, cy, cOpacity };
};

// ─── Composition ───────────────────────────────────────────────────────────
export const VideoDemo = () => {
  const { zoom, focusX, focusY, cx, cy, cOpacity } = useAnimation();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera focusX={focusX} focusY={focusY} zoom={zoom}>
        <Video
          src={staticFile("demo.mov")}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        />
        {/* Click pulses timed to actions in the video */}
        <Click x={880} y={237} atFrame={62}  zoom={zoom} />  {/* focus search bar */}
        <Click x={697} y={500} atFrame={232} zoom={zoom} />  {/* bookmark icon */}
        <Click x={707} y={188} atFrame={335} zoom={zoom} />  {/* bookmarked tab */}
        <Click x={695} y={282} atFrame={428} zoom={zoom} />  {/* uni of sydney row */}
        <Cursor x={cx} y={cy} opacity={cOpacity} zoom={zoom} />
      </Camera>
    </AbsoluteFill>
  );
};
