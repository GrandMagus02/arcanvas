import type { Camera } from "./Camera";

export enum CameraEventKey {
  Activate = "activate",
  Deactivate = "deactivate",
  Move = "move",
  Zoom = "zoom",
  Rotate = "rotate",
}

/**
 * Events emitted by the Camera class.
 */
export type CameraEvents = {
  [CameraEventKey.Activate]: (camera: Camera) => void;
  [CameraEventKey.Deactivate]: (camera: Camera) => void;
  [CameraEventKey.Move]: (camera: Camera) => void;
  [CameraEventKey.Zoom]: (camera: Camera) => void;
  [CameraEventKey.Rotate]: (camera: Camera) => void;
};
