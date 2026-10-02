import React from 'react';
import {Composition} from 'remotion';
import {StudioV20} from './studio-v20.jsx';

export const StudioV20Root = () => (
  <Composition
    id="StudioV20"
    component={StudioV20}
    durationInFrames={30 * 30}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{title: '', scenes: [], v20: {delivery: {fps: 30, rong: 1080, cao: 1920}}}}
    calculateMetadata={({props}) => {
      const delivery = props.v20.delivery;
      const frames = Math.max(1, Math.ceil((props.scenes || []).reduce(
        (total, scene) => total + Number(scene.giay || 0), 0) * Number(delivery.fps)));
      return {durationInFrames: frames, fps: Number(delivery.fps), width: Number(delivery.rong), height: Number(delivery.cao)};
    }}
  />
);
