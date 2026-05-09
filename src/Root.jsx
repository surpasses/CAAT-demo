import "./index.css";
import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { MotionBackground } from "./MotionBackground";
import { OpeningHook } from "./OpeningHook";
import { VideoDemo } from "./VideoDemo";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="VideoDemo"
        component={VideoDemo}
        durationInFrames={575}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="OpeningHook"
        component={OpeningHook}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MotionBackground"
        component={MotionBackground}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "black",
        }}
      />
      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
