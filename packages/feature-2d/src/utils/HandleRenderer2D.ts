import type { IHandleRenderer, RenderContext } from "@arcanvas/selection";
import type { Handle } from "@arcanvas/selection";
import type { HandleSet } from "@arcanvas/selection";
import { BoundingBox2D } from "./BoundingBox2D";
import type { BoundingBox } from "@arcanvas/selection";

/**
 * 2D handle renderer implementation.
 * Renders selection handles and outlines using WebGL or Canvas2D.
 */
export class HandleRenderer2D implements IHandleRenderer {
  /**
   * Size of handles in pixels.
   */
  handleSize: number = 8;

  /**
   * Color of handles (RGBA).
   */
  handleColor: [number, number, number, number] = [0.2, 0.6, 1.0, 1.0];

  /**
   * Color of selection outline (RGBA).
   */
  outlineColor: [number, number, number, number] = [0.2, 0.6, 1.0, 1.0];

  /**
   * Width of selection outline in pixels.
   */
  outlineWidth: number = 2;

  /**
   * Renders a single handle.
   * @param handle - The handle to render
   * @param context - Rendering context
   */
  renderHandle(handle: Handle, context: RenderContext): void {
    if (!this.canvasContext) {
      return;
    }

    const ctx = this.canvasContext;
    const canvas = (context.camera as { arcanvas?: { canvas: HTMLCanvasElement } })?.arcanvas?.canvas;
    if (!canvas) {
      return;
    }

    // Convert world to screen coordinates using helper method
    const screen = this.worldToScreen(handle.position, context);
    const screenSize = this.handleSize;

    // Save context state
    ctx.save();
    ctx.fillStyle = `rgba(${Math.round(this.handleColor[0] * 255)}, ${Math.round(this.handleColor[1] * 255)}, ${Math.round(this.handleColor[2] * 255)}, ${this.handleColor[3]})`;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;

    // Draw handle as a square
    const halfSize = screenSize / 2;
    ctx.fillRect(screen.x - halfSize, screen.y - halfSize, screenSize, screenSize);
    ctx.strokeRect(screen.x - halfSize, screen.y - halfSize, screenSize, screenSize);

    // Restore context state
    ctx.restore();
  }

  /**
   * Renders a set of handles.
   * @param handleSet - The set of handles to render
   * @param context - Rendering context
   */
  renderHandleSet(handleSet: HandleSet, context: RenderContext): void {
    // Render all handles in the set
    for (const handle of handleSet.handles) {
      this.renderHandle(handle, context);
    }
  }

  /**
   * Canvas2D context for rendering handles and outlines.
   * Set this to enable visual rendering.
   */
  canvasContext: CanvasRenderingContext2D | null = null;

  /**
   * Renders the selection outline (bounding box border).
   * @param bounds - The bounding box to outline (should be BoundingBox2D)
   * @param context - Rendering context
   */
  renderOutline(bounds: unknown, context: RenderContext): void {
    if (!(bounds instanceof BoundingBox2D)) {
      return;
    }

    if (!this.canvasContext) {
      return;
    }

    const ctx = this.canvasContext;
    const corners = bounds.getCorners();
    
    // Convert world coordinates to screen coordinates
    const camera = context.camera as { pixelsPerUnit?: number; position?: { x: number; y: number }; arcanvas?: { canvas: HTMLCanvasElement } };
    const pixelsPerUnit = camera?.pixelsPerUnit ?? 1;
    const canvas = camera?.arcanvas?.canvas;
    if (!canvas) {
      return;
    }

    // Save context state
    ctx.save();
    ctx.strokeStyle = `rgba(${Math.round(this.outlineColor[0] * 255)}, ${Math.round(this.outlineColor[1] * 255)}, ${Math.round(this.outlineColor[2] * 255)}, ${this.outlineColor[3]})`;
    ctx.lineWidth = this.outlineWidth;
    ctx.setLineDash([]);

    // Draw bounding box outline
    ctx.beginPath();
    for (let i = 0; i < corners.length; i++) {
      const corner = corners[i]!;
      // Convert world to screen using helper method
      const screen = this.worldToScreen(corner, context);
      
      if (i === 0) {
        ctx.moveTo(screen.x, screen.y);
      } else {
        ctx.lineTo(screen.x, screen.y);
      }
    }
    ctx.closePath();
    ctx.stroke();

    // Restore context state
    ctx.restore();
  }

  /**
   * Converts world coordinates to screen coordinates.
   * @param worldPoint - Point in world coordinates
   * @param context - Rendering context with camera
   * @returns Point in screen coordinates (pixels)
   */
  worldToScreen(worldPoint: { x: number; y: number }, context: RenderContext): { x: number; y: number } {
    // Use the same transformation pipeline as the renderer
    // Renderer uses: gl_Position = proj * view * model * vertex
    // Bounding box is already in world space (model applied), so we use: proj * view * worldPoint
    // Use getViewProjectionMatrix() which correctly computes proj * view
    const camera = context.camera as {
      getViewProjectionMatrix?: () => { toFloat32Array?: () => Float32Array; data: Float32Array };
      view?: { toFloat32Array: () => Float32Array };
      projection?: { toFloat32Array: () => Float32Array; left?: number; right?: number; top?: number; bottom?: number };
      pixelsPerUnit?: number;
      position: { x: number; y: number; z?: number };
      arcanvas?: { canvas: HTMLCanvasElement };
    };
    const viewport = context.viewport;
    
    // Get canvas to account for CSS scaling
    const canvas = camera.arcanvas?.canvas;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const displayWidth = canvas.clientWidth || canvasWidth;
    const displayHeight = canvas.clientHeight || canvasHeight;
    // Avoid division by zero
    const scaleX = canvasWidth > 0 ? displayWidth / canvasWidth : 1;
    const scaleY = canvasHeight > 0 ? displayHeight / canvasHeight : 1;
    
    // Try using getViewProjectionMatrix first (most reliable)
    if (camera.getViewProjectionMatrix) {
      try {
        const vpMatrix = camera.getViewProjectionMatrix();
        let vpData: Float32Array;
        // Prefer toFloat32Array() if available (most reliable)
        if (vpMatrix.toFloat32Array) {
          vpData = vpMatrix.toFloat32Array();
        } else if (vpMatrix.data instanceof Float32Array) {
          vpData = vpMatrix.data;
        } else {
          vpData = new Float32Array(vpMatrix.data);
        }
        
        if (vpData.length !== 16) {
          throw new Error(`Invalid matrix size: ${vpData.length}, expected 16`);
        }
        
        // Transform world point to clip space: [x', y', z', w'] = VP * [x, y, 0, 1]
        const x = worldPoint.x;
        const y = worldPoint.y;
        const z = 0;
        const w = 1;
        
        // Matrix is column-major: [m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33]
        const m00 = vpData[0]!;
        const m10 = vpData[1]!;
        const m20 = vpData[2]!;
        const m30 = vpData[3]!;
        const m01 = vpData[4]!;
        const m11 = vpData[5]!;
        const m21 = vpData[6]!;
        const m31 = vpData[7]!;
        const m02 = vpData[8]!;
        const m12 = vpData[9]!;
        const m22 = vpData[10]!;
        const m32 = vpData[11]!;
        const m03 = vpData[12]!;
        const m13 = vpData[13]!;
        const m23 = vpData[14]!;
        const m33 = vpData[15]!;
        
        const clipX = m00 * x + m01 * y + m02 * z + m03 * w;
        const clipY = m10 * x + m11 * y + m12 * z + m13 * w;
        const clipZ = m20 * x + m21 * y + m22 * z + m23 * w;
        const clipW = m30 * x + m31 * y + m32 * z + m33 * w;
        
        // Perspective divide to get NDC coordinates
        if (Math.abs(clipW) > 1e-6) {
          const ndcX = clipX / clipW;
          const ndcY = clipY / clipW;
          
          // Convert NDC [-1, 1] to screen coordinates [0, canvasWidth/Height]
          const pixelX = ((ndcX + 1) / 2) * canvasWidth;
          const pixelY = ((1 - ndcY) / 2) * canvasHeight; // Flip Y
          
          // Convert to display coordinates (CSS pixels) accounting for scaling
          const screenX = pixelX * scaleX;
          const screenY = pixelY * scaleY;
          
          return { x: screenX, y: screenY };
        }
      } catch (e) {
        console.warn("[HandleRenderer2D] Failed to use getViewProjectionMatrix, trying manual multiplication:", e);
      }
    }
    
    // Fallback: manual multiplication using separate matrices
    if (camera.view?.toFloat32Array && camera.projection?.toFloat32Array) {
      try {
        // Get matrices exactly as the renderer does
        const view = camera.view.toFloat32Array();
        const proj = camera.projection.toFloat32Array();
        
        if (view.length !== 16 || proj.length !== 16) {
          throw new Error(`Invalid matrix size: view=${view.length}, proj=${proj.length}, expected 16`);
        }
        
        // Multiply proj * view manually (column-major format)
        // Following Matrix.mult() implementation exactly:
        // C[i][j] = sum_k A[i][k] * B[k][j]
        // For A.mult(B): A[i][k] is at A[k*rows+i], B[k][j] is accessed via B.get(j,k) which is B[j*rows+k]
        // Result C[i][j] goes to result[j*rows+i]
        const vpData = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) {
              // proj[i][k] is at proj[k*4+i] (column k, row i)
              // view[k][j] is accessed via view.get(j,k) = view[j*4+k] (column j, row k, which is view[k][j])
              sum += proj[k * 4 + i]! * view[j * 4 + k]!;
            }
            // Result C[i][j] goes to vpData[j*4+i] (column j, row i)
            vpData[j * 4 + i] = sum;
          }
        }
        
        // Transform world point to clip space: [x', y', z', w'] = VP * [x, y, 0, 1]
        const x = worldPoint.x;
        const y = worldPoint.y;
        const z = 0;
        const w = 1;
        
        // Matrix is column-major: [m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33]
        const m00 = vpData[0]!;
        const m10 = vpData[1]!;
        const m20 = vpData[2]!;
        const m30 = vpData[3]!;
        const m01 = vpData[4]!;
        const m11 = vpData[5]!;
        const m21 = vpData[6]!;
        const m31 = vpData[7]!;
        const m02 = vpData[8]!;
        const m12 = vpData[9]!;
        const m22 = vpData[10]!;
        const m32 = vpData[11]!;
        const m03 = vpData[12]!;
        const m13 = vpData[13]!;
        const m23 = vpData[14]!;
        const m33 = vpData[15]!;
        
        const clipX = m00 * x + m01 * y + m02 * z + m03 * w;
        const clipY = m10 * x + m11 * y + m12 * z + m13 * w;
        const clipZ = m20 * x + m21 * y + m22 * z + m23 * w;
        const clipW = m30 * x + m31 * y + m32 * z + m33 * w;
        
        // Perspective divide to get NDC coordinates
        if (Math.abs(clipW) > 1e-6) {
          const ndcX = clipX / clipW;
          const ndcY = clipY / clipW;
          
          // Convert NDC [-1, 1] to screen coordinates [0, canvasWidth/Height]
          const pixelX = ((ndcX + 1) / 2) * canvasWidth;
          const pixelY = ((1 - ndcY) / 2) * canvasHeight; // Flip Y
          
          // Convert to display coordinates (CSS pixels) accounting for scaling
          const screenX = pixelX * scaleX;
          const screenY = pixelY * scaleY;
          
          return { x: screenX, y: screenY };
        }
      } catch (e) {
        console.warn("[HandleRenderer2D] Failed to use view/projection matrices, using fallback:", e);
      }
    }
    
    // Fallback: use projection bounds if view-projection matrix not available
    // Projection bounds are in camera-relative space (centered at camera position)
    const proj = camera.projection;
    if (proj && proj.left !== undefined && proj.right !== undefined && proj.top !== undefined && proj.bottom !== undefined) {
      const cameraPos = camera.position;
      const cameraX = cameraPos.x;
      const cameraY = cameraPos.y;
      
      // Convert world to camera-relative coordinates
      const cameraRelativeX = worldPoint.x - cameraX;
      const cameraRelativeY = worldPoint.y - cameraY;
      
      const worldWidth = proj.right - proj.left;
      const worldHeight = proj.top - proj.bottom;
      
      // Normalize camera-relative coordinates to [0, 1] range
      // Map from [left, right] to [0, 1] for X
      // Map from [bottom, top] to [0, 1] for Y (then flip for screen space)
      const normalizedX = (cameraRelativeX - proj.left) / worldWidth;
      const normalizedY = (cameraRelativeY - proj.bottom) / worldHeight; // Map from bottom to top
      
      // Convert to canvas internal pixel coordinates
      const pixelX = normalizedX * canvasWidth;
      const pixelY = (1 - normalizedY) * canvasHeight; // Flip Y: normalizedY=1 (top in world) -> pixelY=0 (top in screen)
      
      // Convert to display coordinates (CSS pixels) accounting for scaling
      const screenX = pixelX * scaleX;
      const screenY = pixelY * scaleY;
      
      return { x: screenX, y: screenY };
    }
    
    // Final fallback: use pixelsPerUnit and camera position
    const pixelsPerUnit = camera.pixelsPerUnit ?? 1;
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    const cameraPos = camera.position;
    const cameraX = cameraPos.x;
    const cameraY = cameraPos.y;
    
    const pixelX = centerX + (worldPoint.x - cameraX) * pixelsPerUnit;
    const pixelY = centerY - (worldPoint.y - cameraY) * pixelsPerUnit; // Flip Y axis
    
    // Convert to display coordinates
    const screenX = pixelX * scaleX;
    const screenY = pixelY * scaleY;
    
    return { x: screenX, y: screenY };
  }

  /**
   * Converts screen coordinates to world coordinates.
   * @param screenPoint - Point in screen coordinates (pixels)
   * @param context - Rendering context with camera
   * @returns Point in world coordinates
   */
  screenToWorld(screenPoint: { x: number; y: number }, context: RenderContext): { x: number; y: number } {
    // This would invert the camera's view-projection matrix
    // For now, return as-is (placeholder)
    return screenPoint;
  }
}
