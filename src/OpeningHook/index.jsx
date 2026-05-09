import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "400", "700", "800", "900"],
  subsets: ["latin"],
});

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

// Single animated block: slides up + fades in, optionally fades out
const AnimText = ({ children, inAt = 0, outAt, style }) => {
  const frame = useCurrentFrame();

  const inT = interpolate(frame, [inAt, inAt + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  const outT =
    outAt != null
      ? interpolate(frame, [outAt, outAt + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: easeIn,
        })
      : 0;

  return (
    <div
      style={{
        opacity: inT * (1 - outT),
        transform: `translateY(${interpolate(inT, [0, 1], [50, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── Scene 1 ────────────────────────────────────────────────────────────────
// "Are you managing your college applications?"
// Text arrives, holds for the dramatic pause. Hard cut ends the scene.
const Scene1 = () => {
  const base = {
    fontFamily,
    color: "#ffffff",
    textAlign: "center",
    fontWeight: 300,
    lineHeight: 1.18,
    letterSpacing: "-0.025em",
    textShadow: "0 4px 80px rgba(0,0,0,0.9)",
  };
  return (
    <AbsoluteFill
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <AnimText inAt={0} style={{ ...base, fontSize: 100 }}>
        Are you managing
      </AnimText>
      <AnimText inAt={10} style={{ ...base, fontSize: 100 }}>
        your college applications?
      </AnimText>
    </AbsoluteFill>
  );
};

// ─── Scene 2 ────────────────────────────────────────────────────────────────
// "or are they managing you?"
// Hard cut in. "you?" lands on its own line — large, bold, red.
// Fades out before Scene 3.
const Scene2 = () => {
  const base = {
    fontFamily,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 1.1,
    textShadow: "0 4px 80px rgba(0,0,0,0.9)",
  };
  return (
    <AbsoluteFill
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}
    >
      <AnimText
        inAt={0}
        outAt={36}
        style={{ ...base, fontSize: 100, fontWeight: 300, letterSpacing: "-0.025em" }}
      >
        or are they managing
      </AnimText>
      <AnimText
        inAt={10}
        outAt={38}
        style={{
          ...base,
          fontSize: 170,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: "#e8251a",
          textShadow: "0 0 120px rgba(232,37,26,0.6), 0 4px 60px rgba(0,0,0,0.8)",
        }}
      >
        you?
      </AnimText>
    </AbsoluteFill>
  );
};

// ─── Scene 3 ────────────────────────────────────────────────────────────────
// Introducing CAAT
const Scene3 = () => {
  const frame = useCurrentFrame();

  const labelOpacity = interpolate(frame, [15, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  const caatOpacity = interpolate(frame, [28, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  const caatScale = interpolate(frame, [28, 58], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  const taglineOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  return (
    <AbsoluteFill
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <div
        style={{
          fontFamily,
          fontSize: 22,
          fontWeight: 400,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          opacity: labelOpacity,
          marginBottom: 4,
        }}
      >
        Introducing
      </div>

      <div
        style={{
          fontFamily,
          fontSize: 300,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 0.88,
          color: "#ffffff",
          opacity: caatOpacity,
          transform: `scale(${caatScale})`,
          textShadow: "0 0 200px rgba(232,37,26,0.35), 0 8px 80px rgba(0,0,0,0.8)",
        }}
      >
        CAAT
      </div>

      <div
        style={{
          fontFamily,
          fontSize: 30,
          fontWeight: 300,
          letterSpacing: "0.06em",
          color: "rgba(255,255,255,0.65)",
          opacity: taglineOpacity,
          marginTop: 20,
        }}
      >
        College Application Assistance Tool
      </div>
    </AbsoluteFill>
  );
};

// ─── Root composition ────────────────────────────────────────────────────────
export const OpeningHook = () => {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#000000" }} />

      <Sequence from={0} durationInFrames={60}>
        <Scene1 />
      </Sequence>

      <Sequence from={60} durationInFrames={60}>
        <Scene2 />
      </Sequence>

      <Sequence from={120} durationInFrames={90}>
        <Scene3 />
      </Sequence>
    </AbsoluteFill>
  );
};
