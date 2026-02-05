/**
 * @arcanvas/webgl2 - WebGL2 Sampler Implementation
 */

import type { GfxSampler, GfxSamplerDescriptor, AddressMode, FilterMode } from "@arcanvas/gfx";
import { GfxValidationError } from "@arcanvas/gfx";
import { getGLCompareFunc } from "../constants.js";

/**
 * WebGL2 sampler wrapper implementing GfxSampler.
 */
export class WebGL2Sampler implements GfxSampler {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _sampler: WebGLSampler;
  private readonly _label: string | undefined;

  private constructor(gl: WebGL2RenderingContext, sampler: WebGLSampler, label?: string) {
    this._gl = gl;
    this._sampler = sampler;
    this._label = label;
  }

  static create(gl: WebGL2RenderingContext, descriptor: GfxSamplerDescriptor = {}): WebGL2Sampler {
    const sampler = gl.createSampler();
    if (!sampler) {
      throw new GfxValidationError("Failed to create WebGL2 sampler");
    }

    // Address modes
    const wrapS = getGLAddressMode(descriptor.addressModeU ?? "clamp-to-edge", gl);
    const wrapT = getGLAddressMode(descriptor.addressModeV ?? "clamp-to-edge", gl);
    const wrapR = getGLAddressMode(descriptor.addressModeW ?? "clamp-to-edge", gl);

    gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, wrapS);
    gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, wrapT);
    gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, wrapR);

    // Filter modes
    const magFilter = getGLMagFilter(descriptor.magFilter ?? "linear", gl);
    const minFilter = getGLMinFilter(descriptor.minFilter ?? "linear", descriptor.mipmapFilter ?? "linear", gl);

    gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, minFilter);

    // LOD
    if (descriptor.lodMinClamp !== undefined) {
      gl.samplerParameterf(sampler, gl.TEXTURE_MIN_LOD, descriptor.lodMinClamp);
    }
    if (descriptor.lodMaxClamp !== undefined) {
      gl.samplerParameterf(sampler, gl.TEXTURE_MAX_LOD, descriptor.lodMaxClamp);
    }

    // Compare function (for depth textures)
    if (descriptor.compare) {
      gl.samplerParameteri(sampler, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
      gl.samplerParameteri(sampler, gl.TEXTURE_COMPARE_FUNC, getGLCompareFunc(descriptor.compare, gl));
    }

    // Anisotropy
    if (descriptor.maxAnisotropy !== undefined && descriptor.maxAnisotropy > 1) {
      const ext = gl.getExtension("EXT_texture_filter_anisotropic");
      if (ext) {
        const maxAniso = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
        const aniso = Math.min(descriptor.maxAnisotropy, maxAniso);
        gl.samplerParameterf(sampler, ext.TEXTURE_MAX_ANISOTROPY_EXT, aniso);
      }
    }

    return new WebGL2Sampler(gl, sampler, descriptor.label);
  }

  get label(): string | undefined {
    return this._label;
  }

  get native(): WebGLSampler {
    return this._sampler;
  }

  destroy(): void {
    this._gl.deleteSampler(this._sampler);
  }
}

/**
 * Get WebGL2 address mode for a GFX address mode.
 */
function getGLAddressMode(mode: AddressMode, gl: WebGL2RenderingContext): GLenum {
  const modes: Record<AddressMode, GLenum> = {
    "clamp-to-edge": gl.CLAMP_TO_EDGE,
    repeat: gl.REPEAT,
    "mirror-repeat": gl.MIRRORED_REPEAT,
  };
  return modes[mode];
}

/**
 * Get WebGL2 mag filter for a GFX filter mode.
 */
function getGLMagFilter(filter: FilterMode, gl: WebGL2RenderingContext): GLenum {
  return filter === "nearest" ? gl.NEAREST : gl.LINEAR;
}

/**
 * Get WebGL2 min filter for GFX min and mipmap filter modes.
 */
function getGLMinFilter(minFilter: FilterMode, mipFilter: FilterMode, gl: WebGL2RenderingContext): GLenum {
  if (minFilter === "nearest") {
    return mipFilter === "nearest" ? gl.NEAREST_MIPMAP_NEAREST : gl.NEAREST_MIPMAP_LINEAR;
  } else {
    return mipFilter === "nearest" ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR_MIPMAP_LINEAR;
  }
}
