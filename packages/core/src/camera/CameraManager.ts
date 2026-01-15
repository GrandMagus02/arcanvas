import type { IArcanvasContext } from "../infrastructure/interfaces/IArcanvasContext";
import { AbstractManager } from "../utils/Manager";
import type { Camera } from "./Camera";
import { CameraEventKey } from "./CameraEvents";

/**
 * The camera manager.
 */
export class CameraManager extends AbstractManager<Camera> {
  private _arc: IArcanvasContext;
  private _activeCamera: Camera | null = null;

  constructor(arc: IArcanvasContext) {
    super();
    this._arc = arc;
  }

  get active(): Camera | null {
    return this._activeCamera;
  }

  setActive(id: Camera | string | null): void {
    if (!id) {
      this._activeCamera?.emit(CameraEventKey.Deactivate);
      this._activeCamera = null;
      return;
    }
    if (typeof id === "string") {
      const camera = this.get(id);
      if (!camera) return;
      this._activeCamera?.emit(CameraEventKey.Deactivate);
      this._activeCamera = camera;
    } else {
      this._activeCamera?.emit(CameraEventKey.Deactivate);
      this._activeCamera = id;
    }
    this._activeCamera.arcanvas = this._arc;
    this._activeCamera.emit(CameraEventKey.Activate);
  }
}
