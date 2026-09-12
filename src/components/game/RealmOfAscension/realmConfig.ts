import { PlaneGeometry } from "three";

export const REALM = { width: 96, length: 132, centerZ: -22, segments: 96 };
export const realmHeight = (x: number, z: number) => {
  const terrace = Math.max(0, -z - 4) * .018;
  const ripple = Math.sin(x * .22 + z * .09) * .045 + Math.cos(z * .31) * .035;
  return terrace + ripple;
};
export function createRealmGeometry() {
  const geometry = new PlaneGeometry(REALM.width, REALM.length, REALM.segments, REALM.segments);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, REALM.centerZ);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) positions.setY(i, realmHeight(positions.getX(i), positions.getZ(i)));
  geometry.computeVertexNormals();
  return geometry;
}
