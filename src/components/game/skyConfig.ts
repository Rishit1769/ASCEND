import { Vector3 } from "three";

export const SKY_ROTATION = 1.6;
// Brightest sun texel in the HDRI (1228,239 / 2048,1024), rotated with the visible dome.
const azimuth = (1228 / 2048 - .5) * Math.PI * 2;
const elevation = (.5 - 239 / 1024) * Math.PI;
export const SUN_DIRECTION = new Vector3(Math.cos(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.sin(azimuth) * Math.cos(elevation)).applyAxisAngle(new Vector3(0, 1, 0), SKY_ROTATION);
export const HDR_SKY = "/environment/kloofendal_48d_partly_cloudy_2k.hdr";
