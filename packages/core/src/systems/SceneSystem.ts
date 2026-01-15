import { Camera } from "../camera/Camera";
import { CameraManager } from "../camera/CameraManager";
import type { IArcanvasContext } from "../infrastructure/interfaces/IArcanvasContext";
import { Stage } from "../scene/Stage";

const DEFAULT_CAMERA_LABEL = "__DEFAULT__";

/**
 * Manages scene graph (Stage) and cameras.
 */
export class SceneSystem {
  private _stage: Stage;
  private _cameras: CameraManager;

  constructor(host: IArcanvasContext) {
    this._stage = new Stage(host);
    this._cameras = new CameraManager(host);

    this._cameras.add(DEFAULT_CAMERA_LABEL, new Camera(host));
    this._cameras.setActive(DEFAULT_CAMERA_LABEL);
  }

  get stage(): Stage {
    return this._stage;
  }

  get camera(): Camera | null {
    return this._cameras.active;
  }

  setCamera(camera: Camera | string | null): void {
    this._cameras.setActive(camera);
  }

  destroy(): void {
    this._cameras.clear();
  }
}
