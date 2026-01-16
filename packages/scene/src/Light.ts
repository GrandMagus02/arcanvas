/**
 * Type of light source.
 */
export type LightType = "directional" | "point" | "spot";

/**
 * Options for creating a Light.
 */
export interface LightOptions {
  type: LightType;
  position?: [number, number, number];
  direction?: [number, number, number];
  color?: [number, number, number];
  intensity?: number;
}

/**
 * Light source in the scene.
 */
export class Light {
  type: LightType;
  position?: [number, number, number];
  direction?: [number, number, number];
  color: [number, number, number];
  intensity: number;

  constructor(options: LightOptions) {
    this.type = options.type;
    this.position = options.position;
    this.direction = options.direction;
    this.color = options.color ?? [1, 1, 1];
    this.intensity = options.intensity ?? 1;
  }
}
