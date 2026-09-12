"use client";
import { useEffect, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { BoxHelper, Color, Material, Mesh, MeshBasicMaterial, Vector3 } from "three";
import type { OrbitControls } from "three-stdlib";

export default function MountainWorldDiagnostics() {
  const { scene, gl, camera } = useThree();
  const [colors, setColors] = useState(false);
  const [bounds, setBounds] = useState(false);
  const sweep = useRef({ time: 0, active: false, offset: new Vector3() });
  useEffect(() => {
    const originals: { mesh: Mesh; material: Material | Material[]; debug: Material }[] = [];
    const helpers: BoxHelper[] = [];
    scene.updateMatrixWorld(true);
    scene.traverse(object => {
      if (!(object instanceof Mesh)) return;
      const ground = object.userData.cameraGround;
      const shell = object.userData.backgroundMountain;
      if (!ground && !shell) return;
      if (colors) {
        const debug = new MeshBasicMaterial({ color: ground ? "#ff2020" : "#20ff40" });
        originals.push({ mesh: object, material: object.material, debug });
        object.material = debug;
      }
      if (bounds) helpers.push(new BoxHelper(object, ground ? 0x00ffff : 0x00ff00));
    });
    helpers.forEach(h => scene.add(h));
    const css = getComputedStyle(gl.domElement);
    if (!scene.getObjectByName("continuous-mountain-world-shell") || camera.far < 600 ||
      (scene.background instanceof Color && Math.min(scene.background.r, scene.background.g, scene.background.b) > .9))
      console.error("[ASCEND WORLD BOUNDARY] WHITE/EMPTY WORLD DETECTED");
    console.info("[ASCEND WORLD BOUNDARY]", { background: scene.background, clearColor: gl.getClearColor(new Color()).getHexString(), alpha: gl.getClearAlpha(), canvasCSS: css.backgroundColor, bodyCSS: getComputedStyle(document.body).backgroundColor, near: camera.near, far: camera.far, fog: scene.fog, terrain: scene.getObjectByName("mountain-trail-terrain")?.matrixWorld.elements, shell: !!scene.getObjectByName("continuous-mountain-world-shell") });
    return () => {
      originals.forEach(o => { o.mesh.material = o.material; o.debug.dispose(); });
      helpers.forEach(h => { scene.remove(h); h.geometry.dispose(); (h.material as Material).dispose(); });
    };
  }, [colors, bounds, scene, gl, camera]);
  useFrame(({ camera, controls, gl }, delta) => {
    const s = sweep.current, orbit = controls as OrbitControls | undefined;
    if (!s.active || !orbit) return;
    s.time += Math.min(delta, .05);
    const t = Math.min(s.time / 16, 1);
    const angle = t < .5 ? t*4*Math.PI : (1-t)*4*Math.PI;
    const radius = 5.5 + 36.5 * (.5 - .5*Math.cos(t*4*Math.PI));
    const phi = .42 + (1.42-.42)*(.5+.5*Math.sin(t*8*Math.PI));
    s.offset.setFromSphericalCoords(radius, phi, angle);
    camera.position.copy(orbit.target).add(s.offset);
    gl.domElement.dataset.boundarySweep = JSON.stringify({ progress: t, angle, radius, phi });
    if (t === 1) s.active = false;
  }, -.25);
  return <Html fullscreen calculatePosition={(_, __, size) => [size.width / 2, size.height / 2, 0]} style={{ pointerEvents: "none" }}><div style={{ position: "absolute", top: 150, left: 12, pointerEvents: "auto", background: "#14252c", color: "white", padding: 6, fontSize: 11 }}>
    <button onClick={() => setColors(v => !v)}>Debug colors {colors ? "ON" : "OFF"}</button>{" | "}
    <button onClick={() => setBounds(v => !v)}>World bounds {bounds ? "ON" : "OFF"}</button>{" | "}
    <button onClick={() => { sweep.current.time = 0; sweep.current.active = true; }}>Test 360 orbit</button>
  </div></Html>;
}
