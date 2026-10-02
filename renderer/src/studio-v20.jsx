import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const COLORS = ['#07152f', '#422408', '#132d25', '#321424', '#18213a'];
function currentScene(scenes, second) {
  let elapsed = 0;
  for (let index = 0; index < scenes.length; index++) {
    const end = elapsed + Number(scenes[index].giay || 0);
    if (second < end || index === scenes.length - 1) return {scene: scenes[index], elapsed, index};
    elapsed = end;
  }
  return {scene: scenes[0], elapsed: 0, index: 0};
}
export const StudioV20 = ({title, scenes}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = currentScene(scenes, frame / fps);
  const sceneFrame = frame - at.elapsed * fps;
  const opacity = interpolate(sceneFrame, [0, fps * 0.4], [0, 1], {extrapolateRight: 'clamp'});
  const zoom = interpolate(sceneFrame, [0, Math.max(1, at.scene.giay * fps)], [1, 1.08], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{
    background: `radial-gradient(circle at 50% 25%, ${COLORS[at.index % COLORS.length]}, #05070d 75%)`,
    color: '#fff8eb', fontFamily: 'Arial, sans-serif', overflow: 'hidden'
  }}>
    <AbsoluteFill style={{transform: `scale(${zoom})`, opacity, padding: '12% 9%', justifyContent: 'space-between'}}>
      <div style={{fontSize: 38, letterSpacing: 8, color: '#e8a33c'}}>GITA 365</div>
      <div>
        <div style={{fontSize: 54, fontWeight: 700, marginBottom: 32}}>{at.scene.chuMan || title}</div>
        <div style={{fontSize: 42, lineHeight: 1.38, maxWidth: '90%'}}>{at.scene.loi}</div>
      </div>
      <div style={{fontSize: 30, opacity: 0.75}}>V20 · {at.scene.shot || 'medium'} · {at.scene.lens || '50mm'}</div>
    </AbsoluteFill>
  </AbsoluteFill>;
};
