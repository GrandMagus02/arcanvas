/**
 * @arcanvas/webgl2 - WebGL2 Bind Group Implementation
 *
 * WebGL2 doesn't have bind groups like WebGPU. We emulate them by:
 * - Uniform buffers → UBOs bound to binding points
 * - Textures → Texture units
 * - Samplers → Sampler objects bound to texture units
 */

import type { GfxBindGroup, GfxBindGroupLayout, GfxBindGroupDescriptor, GfxBindGroupLayoutDescriptor, GfxBindGroupEntry, GfxBindGroupLayoutEntry, GfxSampler, GfxTextureView } from "@arcanvas/gfx";
import { isBufferBinding } from "@arcanvas/gfx";
import type { WebGL2Buffer } from "../resources/buffer.js";
import type { WebGL2TextureView } from "../resources/texture.js";
import type { WebGL2Sampler } from "../resources/sampler.js";

/**
 * Resolved binding for a buffer.
 */
export interface ResolvedBufferBinding {
  type: "buffer";
  buffer: WebGL2Buffer;
  offset: number;
  size: number;
  bindingPoint: number;
}

/**
 * Resolved binding for a texture.
 */
export interface ResolvedTextureBinding {
  type: "texture";
  textureView: WebGL2TextureView;
  textureUnit: number;
}

/**
 * Resolved binding for a sampler.
 */
export interface ResolvedSamplerBinding {
  type: "sampler";
  sampler: WebGL2Sampler;
  textureUnit: number;
}

/**
 *
 */
export type ResolvedBinding = ResolvedBufferBinding | ResolvedTextureBinding | ResolvedSamplerBinding;

/**
 * Type guard for sampler.
 */
function isSampler(resource: GfxBindGroupEntry["resource"]): resource is GfxSampler {
  return "native" in resource && !("texture" in resource) && !("buffer" in resource);
}

/**
 * Type guard for texture view.
 */
function isTextureView(resource: GfxBindGroupEntry["resource"]): resource is GfxTextureView {
  return "texture" in resource;
}

/**
 * WebGL2 bind group layout.
 */
export class WebGL2BindGroupLayout implements GfxBindGroupLayout {
  private readonly _entries: GfxBindGroupLayoutEntry[];
  private readonly _label: string | undefined;

  constructor(descriptor: GfxBindGroupLayoutDescriptor) {
    this._entries = [...descriptor.entries];
    this._label = descriptor.label;
  }

  get label(): string | undefined {
    return this._label;
  }

  get entries(): readonly GfxBindGroupLayoutEntry[] {
    return this._entries;
  }
}

/**
 * WebGL2 bind group.
 *
 * Stores bindings that will be applied when the bind group is set.
 */
export class WebGL2BindGroup implements GfxBindGroup {
  private readonly _layout: WebGL2BindGroupLayout;
  private readonly _bindings: Map<number, ResolvedBinding> = new Map();
  private readonly _label: string | undefined;

  constructor(descriptor: GfxBindGroupDescriptor) {
    this._layout = descriptor.layout as WebGL2BindGroupLayout;
    this._label = descriptor.label;

    // Resolve bindings
    for (const entry of descriptor.entries) {
      this.resolveBinding(entry);
    }
  }

  private resolveBinding(entry: GfxBindGroupEntry): void {
    const binding = entry.binding;
    const resource = entry.resource;

    if (isBufferBinding(resource)) {
      const bufferBinding = resource;
      this._bindings.set(binding, {
        type: "buffer",
        buffer: bufferBinding.buffer as WebGL2Buffer,
        offset: bufferBinding.offset ?? 0,
        size: bufferBinding.size ?? (bufferBinding.buffer as WebGL2Buffer).size,
        bindingPoint: binding,
      });
    } else if (isTextureView(resource)) {
      this._bindings.set(binding, {
        type: "texture",
        textureView: resource as WebGL2TextureView,
        textureUnit: binding,
      });
    } else if (isSampler(resource)) {
      this._bindings.set(binding, {
        type: "sampler",
        sampler: resource as WebGL2Sampler,
        textureUnit: binding,
      });
    }
  }

  get label(): string | undefined {
    return this._label;
  }

  get layout(): WebGL2BindGroupLayout {
    return this._layout;
  }

  get bindings(): ReadonlyMap<number, ResolvedBinding> {
    return this._bindings;
  }

  /**
   * Apply this bind group to the current WebGL state.
   */
  apply(gl: WebGL2RenderingContext, groupIndex: number): void {
    for (const [, resolved] of this._bindings) {
      switch (resolved.type) {
        case "buffer": {
          // Bind uniform buffer to binding point
          // Binding point = groupIndex * 16 + local binding (simplified)
          const globalBinding = groupIndex * 16 + resolved.bindingPoint;
          gl.bindBufferRange(gl.UNIFORM_BUFFER, globalBinding, resolved.buffer.native, resolved.offset, resolved.size);
          break;
        }
        case "texture": {
          // Bind texture to texture unit
          const unit = groupIndex * 16 + resolved.textureUnit;
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(resolved.textureView.target, resolved.textureView.native);
          break;
        }
        case "sampler": {
          // Bind sampler to texture unit
          const unit = groupIndex * 16 + resolved.textureUnit;
          gl.bindSampler(unit, resolved.sampler.native);
          break;
        }
      }
    }
  }
}
