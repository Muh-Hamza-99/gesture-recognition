import { useRef, useState } from "react";
import WebCamera from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import * as fingerpose from "fingerpose";

import { drawHand } from "./utilities";
import victory from "./victory.png";
import thumbsUp from "./thumbsUp.png";

const App = () => {
  const webCameraRef = useRef(null);
  const canvasRef = useRef(null);
  const [emoji, setEmoji] = useState(null);
  const images = { thumbs_up: thumbsUp, victory: victory };
  const runHandpose = async () => {
    const handposeModel = await handpose.load();
    setInterval(() => {
      detectHand(handposeModel);
    }, 100);
  };
  const detectHand = async (handposeModel) => {
    if (typeof webCameraRef.current !== "undefined" && webCameraRef.current !== null && webCameraRef.current.video.readyState === 4) {
      const video = webCameraRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      webCameraRef.current.video.width = videoWidth;
      webCameraRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      const hand = await handposeModel.estimateHands(video);
      if (hand.length > 0) {
        const GE = new fingerpose.GestureEstimator([fingerpose.Gestures.VictoryGesture, fingerpose.Gestures.ThumbsUpGesture]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map((prediction) => prediction.confidence);
          const maxConfidence = confidence.indexOf(Math.max.apply(null, confidence));
          setEmoji(gesture.gestures[maxConfidence].name);
        };
      };
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    };
  };
  runHandpose();
  return (
    <div className="App">
      <header>
        <WebCamera ref={webCameraRef} style={{ position: "absolute", marginLeft: "auto", marginRight: "auto", left: 0, right: 0, textAlign: "center", zindex: 9, width: 640, height: 480, }} />
        <canvas ref={canvasRef} style={{ position: "absolute", marginLeft: "auto", marginRight: "auto", left: 0, right: 0, textAlign: "center", zindex: 9, width: 640, height: 480, }} />
        {emoji !== null ? (<img src={images[emoji]} style={{ position: "absolute", marginLeft: "auto", marginRight: "auto", left: 400, bottom: 500, right: 0, textAlign: "center", height: 100, }}/>) : ("")}
      </header>
    </div>
  );
};

export default App;