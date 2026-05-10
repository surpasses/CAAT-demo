import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
} from "remotion";
import { Video } from "@remotion/media";

// ─── Timing map (30 fps) ───────────────────────────────────────────────────
// 0:01  f30   zoom in  → Add School button (centered)
// 0:03  f90   pan      → search bar (centered, smooth, no zoom-out)
// 0:11  f330  zoom out → full view
// 0:23.68 f710 end

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
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: H,
        transformOrigin: `${focusX}px ${focusY}px`,
        transform: `translate(${W / 2 - focusX}px, ${H / 2 - focusY}px) scale(${zoom})`,
      }}
    >
      {children}
    </div>
  );
};

// ─── Cursor ────────────────────────────────────────────────────────────────
// On click frames the cursor briefly shrinks toward its tip — simulating
// the tactile "press" of a real mouse click — instead of drawing a ring.
const Cursor = ({ x, y, opacity, zoom, clickFrames = [] }) => {
  const frame = useCurrentFrame();

  let pressScale = 1;
  for (const cf of clickFrames) {
    const t = frame - cf;
    if (t >= -2 && t <= 6) {
      const s = interpolate(t, [-2, 0, 6], [1, 0.78, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      if (s < pressScale) pressScale = s;
    }
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={48}
      height={48}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${(1 / zoom) * pressScale})`,
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
};

// ─── Animation ────────────────────────────────────────────────────────────
const useAnimation = () => {
  const frame = useCurrentFrame();

  // Camera: zoom in on Add School → pan to search bar → zoom out once
  // the new University of Sydney card has appeared in the list (~11s)
  const camF =  [0,   12,  30,   70,   90,   330,  380, 710];
  const zooms = [1.0, 1.0, 2.5,  2.5,  1.5,  1.5,  1.0, 1.0];
  const fxs =   [960, 960, 1542, 1542, 1085, 1085, 960, 960];
  const fys =   [540, 540, 192,  192,  264,  264,  540, 540];
  const zoom   = tween(frame, camF, zooms);
  const focusX = tween(frame, camF, fxs);
  const focusY = tween(frame, camF, fys);

  // Cursor — follows actions in video
  // f0-f30:  enters → Add School (clicks at f50)
  // f70-f95: pans to search bar (clicks at f95)
  // f95-f240: at search bar (typing happens)
  // f260 (8:20): clicks "University of Sydney" dropdown row
  // f260-f335: stays at dropdown while camera zooms out
  // f335-f363: glides to LEFT edge of "Researching" pill, arriving at 12:11
  // f363-f422: hovers on the pill, drifting slightly right, clicks at 14:05
  // f470: smoothly arrives at calendar icon, clicks instantly
  // f470-f510: glides into the picker, lands on "May 2026" header at 17s
  // f510-f519: sweeps to "1" (17:09)
  // f519-f521: tiny shift to "2" (17:11)
  // f521-f540: drifts to "10" and clicks at 18:01
  const cF =   [0,    12,   30,   65,   95,   240,  260,  335,  363,  422,  470,  510,  519,  521,  540,  600,  700];
  const cxs =  [2050, 2050, 1542, 1542, 1085, 1085, 1085, 1085, 1213, 1252, 1470, 1535, 1522, 1554, 1586, 1586, 1586];
  const cys =  [400,  400,  192,  192,  264,  264,  313,  313,  314,  314,  314,  365,  418,  418,  448,  448,  448];
  const cx = tween(frame, cF, cxs);
  const cy = tween(frame, cF, cys);
  const cOpacity = interpolate(
    frame,
    [10, 30, 660, 700],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return { zoom, focusX, focusY, cx, cy, cOpacity };
};

// ─── Composition ───────────────────────────────────────────────────────────
export const ManageDemo = () => {
  const { zoom, focusX, focusY, cx, cy, cOpacity } = useAnimation();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera focusX={focusX} focusY={focusY} zoom={zoom}>
        <Video
          src={staticFile("manage.mov")}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        />
        <Cursor
          x={cx}
          y={cy}
          opacity={cOpacity}
          zoom={zoom}
          clickFrames={[50, 95, 270, 422, 470, 540]}
        />
      </Camera>
    </AbsoluteFill>
  );
};
