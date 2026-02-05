/**
 * @arcanvas/webgl2 - WebGL2 Texture Implementation
 */

import type { GfxTexture, GfxTextureView, GfxTextureDescriptor, GfxTextureViewDescriptor, TextureFormat, TextureDimension } from "@arcanvas/gfx";
import { GfxValidationError } from "@arcanvas/gfx";
import { getGLTextureFormat } from "../constants.js";

/**
 * WebGL2 texture wrapper implementing GfxTexture.
 */
export class WebGL2Texture implements GfxTexture {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _texture: WebGLTexture;
  private readonly _width: number;
  private readonly _height: number;
  private readonly _depthOrArrayLayers: number;
  private readonly _mipLevelCount: number;
  private readonly _sampleCount: number;
  private readonly _dimension: TextureDimension;
  private readonly _format: TextureFormat;
  private readonly _usage: number;
  private readonly _label: string | undefined;
  private readonly _target: GLenum;

  private constructor(gl: WebGL2RenderingContext, texture: WebGLTexture, descriptor: GfxTextureDescriptor, target: GLenum) {
    this._gl = gl;
    this._texture = texture;
    this._width = descriptor.size.width;
    this._height = descriptor.size.height ?? 1;
    this._depthOrArrayLayers = descriptor.size.depthOrArrayLayers ?? 1;
    this._mipLevelCount = descriptor.mipLevelCount ?? 1;
    this._sampleCount = descriptor.sampleCount ?? 1;
    this._dimension = descriptor.dimension ?? "2d";
    this._format = descriptor.format;
    this._usage = descriptor.usage;
    this._label = descriptor.label;
    this._target = target;
  }

  static create(gl: WebGL2RenderingContext, descriptor: GfxTextureDescriptor): WebGL2Texture {
    const texture = gl.createTexture();
    if (!texture) {
      throw new GfxValidationError("Failed to create WebGL2 texture");
    }

    const dimension = descriptor.dimension ?? "2d";
    const target = getGLTextureTarget(dimension, descriptor.size.depthOrArrayLayers ?? 1, gl);
    const glFormat = getGLTextureFormat(descriptor.format, gl);

    if (!glFormat) {
      throw new GfxValidationError(`Unsupported texture format: ${descriptor.format}`);
    }

    gl.bindTexture(target, texture);

    const width = descriptor.size.width;
    const height = descriptor.size.height ?? 1;
    const depth = descriptor.size.depthOrArrayLayers ?? 1;
    const levels = descriptor.mipLevelCount ?? 1;

    switch (target) {
      case gl.TEXTURE_2D:
        gl.texStorage2D(target, levels, glFormat.internalFormat, width, height);
        break;
      case gl.TEXTURE_2D_ARRAY:
      case gl.TEXTURE_3D:
        gl.texStorage3D(target, levels, glFormat.internalFormat, width, height, depth);
        break;
      case gl.TEXTURE_CUBE_MAP:
        gl.texStorage2D(target, levels, glFormat.internalFormat, width, height);
        break;
    }

    // Set default sampling parameters
    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, levels > 1 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(target, null);

    return new WebGL2Texture(gl, texture, descriptor, target);
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get depthOrArrayLayers(): number {
    return this._depthOrArrayLayers;
  }

  get mipLevelCount(): number {
    return this._mipLevelCount;
  }

  get sampleCount(): number {
    return this._sampleCount;
  }

  get dimension(): TextureDimension {
    return this._dimension;
  }

  get format(): TextureFormat {
    return this._format;
  }

  get usage(): number {
    return this._usage;
  }

  get label(): string | undefined {
    return this._label;
  }

  get native(): WebGLTexture {
    return this._texture;
  }

  get target(): GLenum {
    return this._target;
  }

  createView(descriptor?: GfxTextureViewDescriptor): GfxTextureView {
    return new WebGL2TextureView(this, descriptor);
  }

  destroy(): void {
    this._gl.deleteTexture(this._texture);
  }
}

/**
 * WebGL2 texture view.
 * Note: WebGL2 doesn't have true texture views like WebGPU.
 * We store the view parameters and apply them during binding.
 */
export class WebGL2TextureView implements GfxTextureView {
  private readonly _texture: WebGL2Texture;
  private readonly _label: string | undefined;
  readonly baseMipLevel: number;
  readonly mipLevelCount: number;
  readonly baseArrayLayer: number;
  readonly arrayLayerCount: number;

  constructor(texture: WebGL2Texture, descriptor?: GfxTextureViewDescriptor) {
    this._texture = texture;
    this._label = descriptor?.label;
    this.baseMipLevel = descriptor?.baseMipLevel ?? 0;
    this.mipLevelCount = descriptor?.mipLevelCount ?? texture.mipLevelCount;
    this.baseArrayLayer = descriptor?.baseArrayLayer ?? 0;
    this.arrayLayerCount = descriptor?.arrayLayerCount ?? texture.depthOrArrayLayers;
  }

  get label(): string | undefined {
    return this._label;
  }

  get texture(): WebGL2Texture {
    return this._texture;
  }

  get native(): WebGLTexture {
    return this._texture.native;
  }

  get target(): GLenum {
    return this._texture.target;
  }
}

/**
 * Determine WebGL texture target from dimension.
 */
function getGLTextureTarget(dimension: TextureDimension, depthOrArrayLayers: number, gl: WebGL2RenderingContext): GLenum {
  switch (dimension) {
    case "1d":
      // WebGL2 doesn't have 1D textures, use 2D with height=1
      return gl.TEXTURE_2D;
    case "2d":
      return depthOrArrayLayers > 1 ? gl.TEXTURE_2D_ARRAY : gl.TEXTURE_2D;
    case "3d":
      return gl.TEXTURE_3D;
    default:
      return gl.TEXTURE_2D;
  }
}
