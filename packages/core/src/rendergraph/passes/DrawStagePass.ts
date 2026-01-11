import { Vector3 } from "@arcanvas/vector";
import type { Stage } from "../../Stage";
import { GridMesh } from "../../meshes/grid/Grid";
import { PlaneMesh } from "../../meshes/plane/PlaneMesh";
import { Mesh } from "../../objects/Mesh";
import { TransformationMatrix } from "../../utils/TransformationMatrix";
import { RenderPass, type PassContext } from "../RenderPass";

/**
 *
 */
export class DrawStagePass extends RenderPass {
  constructor(private stage: Stage) {
    super();
  }

  name(): string {
    return "DrawStage";
  }

  execute(ctx: PassContext): void {
    const gl = ctx.gl;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const camera = ctx.camera;

    // Debug: Log execution
    let meshCount = 0;
    const frameCounter = (this as { _frameCounter?: number })._frameCounter || 0;
    (this as { _frameCounter?: number })._frameCounter = frameCounter + 1;
    const isFirstFrame = frameCounter === 0;

    if (isFirstFrame) {
      console.log("DrawStagePass: Executing, camera:", camera ? "present" : "null");
    }

    // Compose view-projection matrix if camera is available
    let viewProjection: TransformationMatrix | null = null;
    let cameraPos: [number, number, number] | null = null;

    if (camera) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      let eye = camera.view.eye;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const center = camera.view.center;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      let eyeData = eye.data;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const centerData = center.data;

      if (isFirstFrame) {
        console.log("DrawStagePass: Camera eye:", eyeData[0], eyeData[1], eyeData[2]);
        console.log("DrawStagePass: Camera center:", centerData[0], centerData[1], centerData[2]);
        // Log the actual distance
        const initialDx = eyeData[0]! - centerData[0]!;
        const initialDy = eyeData[1]! - centerData[1]!;
        const initialDz = eyeData[2]! - centerData[2]!;
        const initialDistance = Math.sqrt(initialDx * initialDx + initialDy * initialDy + initialDz * initialDz);
        console.log("DrawStagePass: Initial camera distance:", initialDistance.toFixed(3));
      }

      // Ensure minimum distance between eye and center to prevent singular matrices
      // This is critical for grid rendering which needs to invert the view-projection matrix
      const MIN_DISTANCE = 2.0;
      const dx = eyeData[0]! - centerData[0]!;
      const dy = eyeData[1]! - centerData[1]!;
      const dz = eyeData[2]! - centerData[2]!;
      let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      // #region agent log
      fetch("http://127.0.0.1:7243/ingest/64fb5497-1ad3-44cb-9389-c348c826cc75", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "DrawStagePass.ts:70",
          message: "DrawStagePass camera distance check",
          data: { eye: [eyeData[0], eyeData[1], eyeData[2]], center: [centerData[0], centerData[1], centerData[2]], distance, minDistance: MIN_DISTANCE, needsAdjustment: distance < MIN_DISTANCE },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId: "E",
        }),
      }).catch(() => {});
      // #endregion

      if (distance < MIN_DISTANCE) {
        if (isFirstFrame) {
          console.warn(`DrawStagePass: Camera eye too close to center (${distance.toFixed(3)}), adjusting to minimum distance ${MIN_DISTANCE}`);
        }
        // Move eye away from center along the current direction (or default Z direction if too close)
        const direction = distance > 1e-6 ? [dx / distance, dy / distance, dz / distance] : [0, 0, 1]; // Default to looking along +Z
        const newEye = new Vector3(new Float32Array([centerData[0]! + direction[0]! * MIN_DISTANCE, centerData[1]! + direction[1]! * MIN_DISTANCE, centerData[2]! + direction[2]! * MIN_DISTANCE]));

        // Set the eye and update the view matrix
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        camera.view.eye = newEye;
        // Force view matrix update to ensure it's applied immediately
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        camera.view.update();

        // Get fresh references after update - view.eye returns a clone, so we need to get it again
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const updatedEye = camera.view.eye;
        const updatedEyeData = updatedEye.data;

        // Recalculate distance after adjustment using the updated eye
        const newDx = updatedEyeData[0]! - centerData[0]!;
        const newDy = updatedEyeData[1]! - centerData[1]!;
        const newDz = updatedEyeData[2]! - centerData[2]!;
        const newDistance = Math.sqrt(newDx * newDx + newDy * newDy + newDz * newDz);

        if (isFirstFrame) {
          console.log("DrawStagePass: Camera eye adjusted to:", updatedEyeData[0], updatedEyeData[1], updatedEyeData[2], "distance:", newDistance);
        }

        // Update our local references for the rest of the function
        eye = updatedEye;
        eyeData = updatedEyeData;
        distance = newDistance;
      }

      // TypeScript/ESLint may have circular dependency issues with Camera type
      // These are false positives - the types are correct at runtime
      // Get FRESH view reference AFTER potential adjustment
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const projection = camera.projection;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const view = camera.view;

      // Final safety check: don't compute view-projection if distance is still too small
      // Use the distance we calculated above (which may have been updated after adjustment)
      if (distance < MIN_DISTANCE) {
        if (isFirstFrame) {
          console.error(`DrawStagePass: Camera distance still too small after adjustment (${distance.toFixed(3)}), skipping view-projection computation`);
          console.error(
            `DrawStagePass: Eye: [${eyeData[0]?.toFixed(3)}, ${eyeData[1]?.toFixed(3)}, ${eyeData[2]?.toFixed(3)}], Center: [${centerData[0]?.toFixed(3)}, ${centerData[1]?.toFixed(3)}, ${centerData[2]?.toFixed(3)}]`
          );
        }
        viewProjection = null;
      } else {
        try {
          // Validate view and projection matrices before composition
          const viewData = view.data;
          const projData = projection.data;
          let viewHasInvalid = false;
          let projHasInvalid = false;

          for (let i = 0; i < 16; i++) {
            if (!isFinite(viewData[i])) {
              viewHasInvalid = true;
              if (isFirstFrame) {
                console.error(`DrawStagePass: View matrix has invalid value at index ${i}:`, viewData[i]);
              }
              break;
            }
            if (!isFinite(projData[i])) {
              projHasInvalid = true;
              if (isFirstFrame) {
                console.error(`DrawStagePass: Projection matrix has invalid value at index ${i}:`, projData[i]);
              }
              break;
            }
          }

          if (viewHasInvalid || projHasInvalid) {
            if (isFirstFrame) {
              console.error("DrawStagePass: Cannot compose view-projection - view or projection matrix is invalid");
            }
            viewProjection = null;
          } else {
            // Log view and projection matrices before composition
            if (isFirstFrame) {
              const viewData = view.data;
              const projData = projection.data;
              console.log("DrawStagePass: View matrix:");
              console.log(
                "  Row 0:",
                Array.from(viewData.slice(0, 4)).map((v) => v.toFixed(6))
              );
              console.log(
                "  Row 1:",
                Array.from(viewData.slice(4, 8)).map((v) => v.toFixed(6))
              );
              console.log(
                "  Row 2:",
                Array.from(viewData.slice(8, 12)).map((v) => v.toFixed(6))
              );
              console.log(
                "  Row 3:",
                Array.from(viewData.slice(12, 16)).map((v) => v.toFixed(6))
              );
              console.log("DrawStagePass: Projection matrix:");
              console.log(
                "  Row 0:",
                Array.from(projData.slice(0, 4)).map((v) => v.toFixed(6))
              );
              console.log(
                "  Row 1:",
                Array.from(projData.slice(4, 8)).map((v) => v.toFixed(6))
              );
              console.log(
                "  Row 2:",
                Array.from(projData.slice(8, 12)).map((v) => v.toFixed(6))
              );
              console.log(
                "  Row 3:",
                Array.from(projData.slice(12, 16)).map((v) => v.toFixed(6))
              );
            }

            viewProjection = TransformationMatrix.composeViewProjection(projection, view);

            // Validate view-projection matrix immediately after creation
            if (viewProjection) {
              const vpData = viewProjection.data;
              let hasInvalid = false;
              for (let i = 0; i < 16; i++) {
                if (!isFinite(vpData[i]!)) {
                  hasInvalid = true;
                  console.error(`DrawStagePass: View-projection matrix has invalid value at index ${i}:`, vpData[i]);
                  break;
                }
              }

              // Check for zero rows (which make matrix singular)
              const hasZeroRow = [0, 4, 8, 12].some((start) => {
                const row = vpData.slice(start, start + 4);
                return row.every((v) => Math.abs(v) < 1e-10);
              });

              if (hasInvalid) {
                console.error("DrawStagePass: View-projection matrix contains invalid values, setting to null");
                viewProjection = null;
              } else if (hasZeroRow) {
                console.error("DrawStagePass: View-projection matrix has a zero row - matrix is singular!");
                if (isFirstFrame) {
                  console.error("DrawStagePass: View-projection matrix:");
                  console.error(
                    "  Row 0:",
                    Array.from(vpData.slice(0, 4)).map((v) => v.toFixed(6))
                  );
                  console.error(
                    "  Row 1:",
                    Array.from(vpData.slice(4, 8)).map((v) => v.toFixed(6))
                  );
                  console.error(
                    "  Row 2:",
                    Array.from(vpData.slice(8, 12)).map((v) => v.toFixed(6))
                  );
                  console.error(
                    "  Row 3:",
                    Array.from(vpData.slice(12, 16)).map((v) => v.toFixed(6))
                  );
                }
                viewProjection = null;
              } else if (isFirstFrame) {
                console.log("DrawStagePass: View-projection matrix is valid");
                // Log first row of matrix for debugging
                console.log(
                  "DrawStagePass: View-projection matrix (first row):",
                  Array.from(vpData.slice(0, 4)).map((v) => v.toFixed(3))
                );
              }
            }
          }
        } catch (error) {
          console.error("DrawStagePass: Failed to compose view-projection matrix:", error);
          if (error instanceof Error) {
            console.error("DrawStagePass: Error details:", error.message);
          }
          viewProjection = null;
        }
      }

      if (!viewProjection && isFirstFrame) {
        console.warn("DrawStagePass: View-projection matrix is null - meshes may not render correctly");
      }
      // Get camera position from view matrix's eye (use already computed eye/eyeData from above)
      if (eyeData && Array.isArray(eyeData) && eyeData.length >= 3) {
        const x = Number(eyeData[0]);
        const y = Number(eyeData[1]);
        const z = Number(eyeData[2]);
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          cameraPos = [x, y, z];
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.stage.traverse((node) => {
      if (node instanceof Mesh) {
        meshCount++;

        // Set view-projection matrix for meshes that support it
        // Only set if matrix is valid (not null and contains valid values)
        if (viewProjection !== null) {
          // Double-check matrix is valid before setting
          const vpData = viewProjection.data;
          let isValid = true;
          for (let i = 0; i < 16; i++) {
            if (!isFinite(vpData[i]!)) {
              isValid = false;
              if (isFirstFrame) {
                console.error(`DrawStagePass: View-projection matrix invalid at index ${i} for ${node.constructor.name}`);
              }
              break;
            }
          }

          if (isValid) {
            if (node instanceof GridMesh) {
              node.setViewProjection(viewProjection);
              node.setViewportSize(ctx.width, ctx.height);
              if (cameraPos !== null) {
                node.setCameraPosition(cameraPos[0], cameraPos[1], cameraPos[2]);
              }
              if (isFirstFrame) {
                console.log(
                  `DrawStagePass: Set view-projection for GridMesh (viewport: ${ctx.width}x${ctx.height}, camera: [${cameraPos?.[0]?.toFixed(2)}, ${cameraPos?.[1]?.toFixed(2)}, ${cameraPos?.[2]?.toFixed(2)}])`
                );
              }
            } else if (node instanceof PlaneMesh) {
              node.setViewProjection(viewProjection);
              if (isFirstFrame) {
                console.log(`DrawStagePass: Set view-projection for PlaneMesh`);
              }
            } else if ("setViewProjection" in node && typeof (node as { setViewProjection: (m: TransformationMatrix | null) => void }).setViewProjection === "function") {
              (node as { setViewProjection: (m: TransformationMatrix | null) => void }).setViewProjection(viewProjection);
            } else if ("setProjectionMatrix" in node && typeof (node as { setProjectionMatrix: (m: TransformationMatrix | null) => void }).setProjectionMatrix === "function") {
              (node as { setProjectionMatrix: (m: TransformationMatrix | null) => void }).setProjectionMatrix(viewProjection);
            }
          } else {
            if (isFirstFrame) {
              console.warn(`DrawStagePass: Skipping ${node.constructor.name} - view-projection matrix is invalid`);
            }
          }
        } else {
          if (isFirstFrame && meshCount <= 2) {
            // Only log for first few meshes to avoid spam
            console.warn(`DrawStagePass: View-projection matrix is null for ${node.constructor.name} - mesh may not render correctly`);
          }
        }

        // Render the mesh (program is optional, meshes can use their own)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const program: WebGLProgram | undefined = ctx.program ?? undefined;
        node.render(gl, program);
        // Check for WebGL errors after rendering
        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
          const errorNames: Record<number, string> = {
            0x0500: "INVALID_ENUM",
            0x0501: "INVALID_VALUE",
            0x0502: "INVALID_OPERATION",
            0x0503: "INVALID_FRAMEBUFFER_OPERATION",
            0x0505: "OUT_OF_MEMORY",
          };
          console.error(`DrawStagePass WebGL Error (render ${node.constructor.name}):`, errorNames[error] || `0x${error.toString(16)}`);
        }
      }
    });

    // Debug: Log mesh rendering (only on first few frames to avoid spam)
    if (isFirstFrame) {
      console.log(`DrawStagePass: Rendered ${meshCount} meshes`);
      if (meshCount === 0) {
        console.warn("DrawStagePass: No meshes found in stage");
      }
      if (viewProjection === null) {
        console.warn("DrawStagePass: View-projection matrix is null");
      }
    }
  }
}
