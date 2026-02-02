import type { BaseMaterial, DebugOptions, DrawArgs, IRenderBackend, Mesh, VertexAttributeDesc } from "@arcanvas/graphics";
import { DEFAULT_DEBUG_OPTIONS, generateTriangleColor } from "@arcanvas/graphics";
import { ProgramCache } from "./ProgramCache";
import { isShaderProvider, type CustomBlendMode, type UniformContext } from "./ShaderProvider";
import { ShaderRegistry } from "./ShaderRegistry";

interface MeshCacheEntry {
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer | null;
  indexType: number | null;
  version: number;
}

interface DebugMeshCacheEntry {
  vertexBuffer: WebGLBuffer;
  vertexCount: number;
  version: number;
}

interface ProgramInfo {
  program: WebGLProgram;
  attribLocations: Map<string, number>;
  uniformLocations: {
    model: WebGLUniformLocation | null;
    view: WebGLUniformLocation | null;
    proj: WebGLUniformLocation | null;
    baseColor: WebGLUniformLocation | null;
  };
}

interface CustomProgramInfo {
  program: WebGLProgram;
  attribLocation: number;
  uvLocation?: number;
}

interface DebugProgramInfo {
  program: WebGLProgram;
  positionLocation: number;
  colorLocation: number;
  modelLocation: WebGLUniformLocation | null;
  viewLocation: WebGLUniformLocation | null;
  projLocation: WebGLUniformLocation | null;
}

/**
 * WebGL implementation of the render backend.
 */
export class WebGLBackend implements IRenderBackend {
  private readonly programCache = new ProgramCache();
  private readonly meshCache = new WeakMap<Mesh, MeshCacheEntry>();
  private readonly debugMeshCache = new WeakMap<Mesh, DebugMeshCacheEntry>();
  private readonly programInfoCache = new Map<string, ProgramInfo>();
  private readonly customProgramCache = new Map<string, CustomProgramInfo>();
  private debugProgramInfo: DebugProgramInfo | null = null;
  private debugOptions: DebugOptions = { ...DEFAULT_DEBUG_OPTIONS };
  private viewportWidth = 1;
  private viewportHeight = 1;

  constructor(private gl: WebGLRenderingContext) {
    // Enable derivatives extension for AA in custom shaders
    gl.getExtension("OES_standard_derivatives");
    // Enable depth test and blending
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
  }

  /**
   * Sets the debug visualization mode.
   */
  setDebugMode(options: DebugOptions): void {
    this.debugOptions = { ...DEFAULT_DEBUG_OPTIONS, ...options };
  }

  /**
   * Gets the current debug options.
   */
  getDebugMode(): DebugOptions {
    return { ...this.debugOptions };
  }

  beginFrame(viewportWidth: number, viewportHeight: number): void {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.gl.viewport(0, 0, viewportWidth, viewportHeight);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  endFrame(): void {
    // no-op for WebGL
  }

  prepareMesh(mesh: Mesh): void {
    const cached = this.meshCache.get(mesh);
    if (cached && cached.version === mesh.version) return;

    const vertexBuffer = cached?.vertexBuffer ?? this.gl.createBuffer();
    if (!vertexBuffer) throw new Error("Failed to create vertex buffer");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, mesh.vertices, this.gl.STATIC_DRAW);

    let indexBuffer: WebGLBuffer | null = null;
    let indexType: number | null = null;
    if (mesh.indices.length > 0) {
      indexBuffer = cached?.indexBuffer ?? this.gl.createBuffer();
      if (!indexBuffer) throw new Error("Failed to create index buffer");
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indices, this.gl.STATIC_DRAW);
      indexType = mesh.indices instanceof Uint32Array ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT;
    }

    this.meshCache.set(mesh, {
      vertexBuffer,
      indexBuffer,
      indexType,
      version: mesh.version,
    });
  }

  prepareMaterial(material: BaseMaterial): void {
    // Handle textures
    if (material.baseColorTexture) {
      const texture = material.baseColorTexture.source;
      if (texture instanceof WebGLTexture) {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      }
    }

    // Handle blend modes for LayerMaterial
    if ("blendMode" in material && typeof (material as { blendMode?: string }).blendMode === "string") {
      this.setBlendMode((material as { blendMode: string }).blendMode);
    }
  }

  /**
   * Applies a custom blend mode and returns the previous state for restoration.
   */
  private applyCustomBlendMode(blendMode: CustomBlendMode): boolean {
    switch (blendMode) {
      case "premultiplied":
        // Premultiplied alpha: src.rgb already multiplied by src.a
        // Final = src.rgb + dst.rgb * (1 - src.a)
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        break;
      case "additive":
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        break;
      case "none":
        this.gl.disable(this.gl.BLEND);
        break;
      case "normal":
      default:
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        break;
    }
    return true;
  }

  /**
   * Restores the default blend mode after custom rendering.
   */
  private restoreBlendMode(): void {
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  private setBlendMode(blendMode: string): void {
    // WebGL blend equations and functions
    // For Normal mode, use standard alpha blending
    // For Multiply, Screen, Overlay - we need shader-based blending
    // For MVP, we'll use blend equations where possible

    switch (blendMode) {
      case "normal":
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.blendEquation(this.gl.FUNC_ADD);
        break;
      case "multiply":
        // Multiply can be approximated with blend func, but not perfect
        // For proper multiply, we need shader-based blending
        this.gl.blendFunc(this.gl.DST_COLOR, this.gl.ZERO);
        this.gl.blendEquation(this.gl.FUNC_ADD);
        break;
      case "screen":
        // Screen: 1 - (1-a)(1-b) = a + b - ab
        // Can use blend func ONE, ONE_MINUS_SRC_COLOR with subtract
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_COLOR);
        this.gl.blendEquation(this.gl.FUNC_ADD);
        break;
      case "overlay":
        // Overlay is complex and needs shader-based blending
        // For MVP, fall back to normal
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.blendEquation(this.gl.FUNC_ADD);
        break;
      default:
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.blendEquation(this.gl.FUNC_ADD);
    }
  }

  drawMesh(args: DrawArgs): void {
    // Check for debug mode first
    if (this.debugOptions.mode !== "none") {
      this.drawWithDebugMode(args);
      return;
    }

    const { material } = args;

    if (isShaderProvider(material)) {
      this.drawWithCustomShader(args);
      return;
    }

    // Handle depth test override for default shaders
    const depthTest = (material as { depthTest?: boolean }).depthTest ?? true;
    if (!depthTest) {
      this.gl.disable(this.gl.DEPTH_TEST);
    }

    this.drawWithDefaultShader(args);

    // Restore depth test
    if (!depthTest) {
      this.gl.enable(this.gl.DEPTH_TEST);
    }
  }

  private drawWithCustomShader(args: DrawArgs): void {
    const { mesh, material } = args;

    if (!isShaderProvider(material)) return;

    this.prepareMesh(mesh);
    this.prepareMaterial(material);
    const entry = this.meshCache.get(mesh);
    if (!entry) return;

    const shaderSource = material.getShaderSource();
    const drawConfig = material.getDrawConfig();

    // Use shaderKey if provided, otherwise fall back to shadingModel
    const programKey = drawConfig.shaderKey ? `custom:${drawConfig.shaderKey}` : `custom:${material.shadingModel}`;
    let programInfo = this.customProgramCache.get(programKey);

    if (!programInfo) {
      const program = this.programCache.getOrCreate(this.gl, programKey, shaderSource.vertex, shaderSource.fragment);
      if (!program) {
        console.error(`Failed to create program for ${material.shadingModel}`);
        return;
      }

      const positionLoc = this.gl.getAttribLocation(program, "a_position");
      const uvLoc = this.gl.getAttribLocation(program, "a_uv");

      programInfo = {
        program,
        attribLocation: positionLoc,
        uvLocation: uvLoc,
      };
      this.customProgramCache.set(programKey, programInfo);
    }

    this.gl.useProgram(programInfo.program);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, entry.vertexBuffer);
    if (entry.indexBuffer) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, entry.indexBuffer);
    }

    // Bind position attribute
    if (programInfo.attribLocation >= 0) {
      this.gl.enableVertexAttribArray(programInfo.attribLocation);
      // Calculate stride based on layout (position + UV = 2 + 2 = 4 floats)
      const stride = mesh.layout.stride;
      this.gl.vertexAttribPointer(programInfo.attribLocation, drawConfig.positionComponents, this.gl.FLOAT, false, stride, 0);
    }

    // Bind UV attribute if present
    if (programInfo.uvLocation !== undefined && programInfo.uvLocation >= 0) {
      this.gl.enableVertexAttribArray(programInfo.uvLocation);
      const stride = mesh.layout.stride;
      const uvAttr = mesh.layout.attributes.find((attr) => {
        const semantic = attr.semantic;
        return semantic === "uv" || (semantic as string) === "texcoord" || (semantic as string) === "texture";
      });
      const uvOffset = uvAttr?.offset ?? drawConfig.positionComponents * 4;
      this.gl.vertexAttribPointer(programInfo.uvLocation, 2, this.gl.FLOAT, false, stride, uvOffset);
    }

    const uniformContext: UniformContext = {
      viewMatrix: args.viewMatrix,
      projMatrix: args.projMatrix,
      modelMatrix: args.modelMatrix,
      cameraPosition: args.cameraPosition,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
    };

    if (drawConfig.setUniforms) {
      drawConfig.setUniforms(this.gl, programInfo.program, material, uniformContext);
    }

    if (drawConfig.disableDepthTest) {
      this.gl.disable(this.gl.DEPTH_TEST);
    }
    if (drawConfig.disableDepthWrite) {
      this.gl.depthMask(false);
    }

    // Apply custom blend mode
    const prevBlendMode = drawConfig.blendMode ? this.applyCustomBlendMode(drawConfig.blendMode) : null;

    if (mesh.indices.length > 0 && entry.indexType !== null) {
      this.gl.drawElements(this.gl.TRIANGLES, mesh.indices.length, entry.indexType, 0);
    } else {
      this.gl.drawArrays(this.gl.TRIANGLES, 0, mesh.vertexCount);
    }

    // Restore blend mode
    if (prevBlendMode !== null) {
      this.restoreBlendMode();
    }

    if (drawConfig.disableDepthWrite) {
      this.gl.depthMask(true);
    }
    if (drawConfig.disableDepthTest) {
      this.gl.enable(this.gl.DEPTH_TEST);
    }
  }

  private drawWithDefaultShader(args: DrawArgs): void {
    const { mesh, material } = args;

    this.prepareMesh(mesh);
    const entry = this.meshCache.get(mesh);
    if (!entry) return;

    const programInfo = this.getProgramInfo(material, mesh);
    this.gl.useProgram(programInfo.program);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, entry.vertexBuffer);
    if (entry.indexBuffer) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, entry.indexBuffer);
    }

    this.bindAttributes(mesh.layout.attributes, mesh.layout.stride, programInfo.attribLocations);

    const baseColor = material.baseColor ?? [1, 1, 1, 1];
    if (programInfo.uniformLocations.model) {
      this.gl.uniformMatrix4fv(programInfo.uniformLocations.model, false, args.modelMatrix);
    }
    if (programInfo.uniformLocations.view) {
      this.gl.uniformMatrix4fv(programInfo.uniformLocations.view, false, args.viewMatrix);
    }
    if (programInfo.uniformLocations.proj) {
      this.gl.uniformMatrix4fv(programInfo.uniformLocations.proj, false, args.projMatrix);
    }
    if (programInfo.uniformLocations.baseColor) {
      this.gl.uniform4f(programInfo.uniformLocations.baseColor, baseColor[0], baseColor[1], baseColor[2], baseColor[3]);
    }

    const drawMode = material.wireframe ? this.gl.LINES : this.toGLDrawMode(mesh.drawMode);
    if (mesh.indices.length > 0 && entry.indexType !== null) {
      this.gl.drawElements(drawMode, mesh.indices.length, entry.indexType, 0);
    } else {
      this.gl.drawArrays(drawMode, 0, mesh.vertexCount);
    }
  }

  private getProgramInfo(material: BaseMaterial, mesh: Mesh): ProgramInfo {
    const positionAttr = mesh.layout.attributes.find((attr) => attr.semantic === "position");
    const positionComponents = positionAttr?.components ?? 3;
    const key = `${material.shadingModel}:pos${positionComponents}`;
    const cached = this.programInfoCache.get(key);
    if (cached) return cached;

    const registration = ShaderRegistry.getInstance().get(material.shadingModel);
    if (!registration) {
      const unlitReg = ShaderRegistry.getInstance().get("unlit");
      if (!unlitReg) throw new Error("No shader registered for unlit");
      return this.createProgramInfo(key, unlitReg.source.vertex, unlitReg.source.fragment);
    }

    return this.createProgramInfo(key, registration.source.vertex, registration.source.fragment);
  }

  private createProgramInfo(key: string, vertexSource: string, fragmentSource: string): ProgramInfo {
    const program = this.programCache.getOrCreate(this.gl, key, vertexSource, fragmentSource);
    if (!program) throw new Error("Failed to build WebGL program");

    const info: ProgramInfo = {
      program,
      attribLocations: new Map([["position", this.gl.getAttribLocation(program, "a_position")]]),
      uniformLocations: {
        model: this.gl.getUniformLocation(program, "u_model"),
        view: this.gl.getUniformLocation(program, "u_view"),
        proj: this.gl.getUniformLocation(program, "u_proj"),
        baseColor: this.gl.getUniformLocation(program, "u_baseColor"),
      },
    };

    this.programInfoCache.set(key, info);
    return info;
  }

  private bindAttributes(attributes: VertexAttributeDesc[], stride: number, locations: Map<string, number>): void {
    for (const attr of attributes) {
      const location = locations.get(attr.semantic === "position" ? "position" : attr.semantic) ?? -1;
      if (location < 0) continue;
      this.gl.enableVertexAttribArray(location);
      this.gl.vertexAttribPointer(location, attr.components, this.toGLType(attr.type), attr.normalized, stride, attr.offset);
    }
  }

  private toGLType(type: VertexAttributeDesc["type"]): number {
    switch (type) {
      case "uint8":
        return this.gl.UNSIGNED_BYTE;
      case "uint16":
        return this.gl.UNSIGNED_SHORT;
      case "float":
      default:
        return this.gl.FLOAT;
    }
  }

  private toGLDrawMode(mode: Mesh["drawMode"]): number {
    switch (mode) {
      case "lines":
        return this.gl.LINES;
      case "points":
        return this.gl.POINTS;
      case "triangles":
      default:
        return this.gl.TRIANGLES;
    }
  }

  /**
   * Draws a mesh with debug visualization.
   */
  private drawWithDebugMode(args: DrawArgs): void {
    switch (this.debugOptions.mode) {
      case "triangles":
        this.drawWithTriangleColors(args);
        break;
      case "wireframe":
        this.drawWithWireframe(args);
        break;
      case "normals":
        this.drawWithNormalColors(args);
        break;
      case "uv":
        this.drawWithUVColors(args);
        break;
      case "depth":
        this.drawWithDepthVisualization(args);
        break;
      default:
        // Fall back to normal rendering
        this.drawWithDefaultShader(args);
    }

    // Draw wireframe overlay if requested
    if (this.debugOptions.wireframeOverlay && this.debugOptions.mode !== "wireframe") {
      this.drawWithWireframe(args);
    }
  }

  /**
   * Creates or retrieves the debug shader program for triangle colors.
   */
  private getDebugProgram(): DebugProgramInfo {
    if (this.debugProgramInfo) return this.debugProgramInfo;

    const program = this.programCache.getOrCreate(this.gl, "debug:triangles", DEBUG_VERTEX_SOURCE, DEBUG_FRAGMENT_SOURCE);
    if (!program) throw new Error("Failed to create debug program");

    this.debugProgramInfo = {
      program,
      positionLocation: this.gl.getAttribLocation(program, "a_position"),
      colorLocation: this.gl.getAttribLocation(program, "a_color"),
      modelLocation: this.gl.getUniformLocation(program, "u_model"),
      viewLocation: this.gl.getUniformLocation(program, "u_view"),
      projLocation: this.gl.getUniformLocation(program, "u_proj"),
    };

    return this.debugProgramInfo;
  }

  /**
   * Creates a debug mesh with per-triangle colors.
   * Converts indexed geometry to non-indexed with vertex colors.
   */
  private getOrCreateDebugMesh(mesh: Mesh): DebugMeshCacheEntry {
    const cached = this.debugMeshCache.get(mesh);
    if (cached && cached.version === mesh.version) return cached;

    const vertices = mesh.vertices;
    const indices = mesh.indices;
    const layout = mesh.layout;

    // Find position attribute
    const posAttr = layout.attributes.find((a) => a.semantic === "position");
    if (!posAttr) throw new Error("Mesh has no position attribute");

    const posComponents = posAttr.components;
    const stride = layout.stride / 4; // Convert bytes to floats
    const posOffset = posAttr.offset / 4;

    // Calculate number of triangles
    const numTriangles = indices.length > 0 ? indices.length / 3 : Math.floor(vertices.length / stride / 3);

    // Create new vertex data: 3 vertices per triangle, each with position (3) + color (4)
    const debugStride = 7; // 3 position + 4 color
    const debugVertices = new Float32Array(numTriangles * 3 * debugStride);

    const seed = this.debugOptions.colorSeed;

    for (let t = 0; t < numTriangles; t++) {
      const color = generateTriangleColor(t, seed);

      for (let v = 0; v < 3; v++) {
        let srcIndex: number;
        if (indices.length > 0) {
          srcIndex = indices[t * 3 + v]!;
        } else {
          srcIndex = t * 3 + v;
        }

        const srcBase = srcIndex * stride + posOffset;
        const dstBase = (t * 3 + v) * debugStride;

        // Copy position
        debugVertices[dstBase] = vertices[srcBase]!;
        debugVertices[dstBase + 1] = vertices[srcBase + 1]!;
        debugVertices[dstBase + 2] = posComponents >= 3 ? vertices[srcBase + 2]! : 0;

        // Set color
        debugVertices[dstBase + 3] = color[0];
        debugVertices[dstBase + 4] = color[1];
        debugVertices[dstBase + 5] = color[2];
        debugVertices[dstBase + 6] = color[3];
      }
    }

    // Create or update buffer
    const vertexBuffer = cached?.vertexBuffer ?? this.gl.createBuffer();
    if (!vertexBuffer) throw new Error("Failed to create debug vertex buffer");

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, debugVertices, this.gl.DYNAMIC_DRAW);

    const entry: DebugMeshCacheEntry = {
      vertexBuffer,
      vertexCount: numTriangles * 3,
      version: mesh.version,
    };

    this.debugMeshCache.set(mesh, entry);
    return entry;
  }

  /**
   * Draws mesh with unique colors per triangle.
   */
  private drawWithTriangleColors(args: DrawArgs): void {
    const { mesh, modelMatrix, viewMatrix, projMatrix } = args;

    const programInfo = this.getDebugProgram();
    const debugMesh = this.getOrCreateDebugMesh(mesh);

    this.gl.useProgram(programInfo.program);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, debugMesh.vertexBuffer);

    // Position attribute
    if (programInfo.positionLocation >= 0) {
      this.gl.enableVertexAttribArray(programInfo.positionLocation);
      this.gl.vertexAttribPointer(programInfo.positionLocation, 3, this.gl.FLOAT, false, 7 * 4, 0);
    }

    // Color attribute
    if (programInfo.colorLocation >= 0) {
      this.gl.enableVertexAttribArray(programInfo.colorLocation);
      this.gl.vertexAttribPointer(programInfo.colorLocation, 4, this.gl.FLOAT, false, 7 * 4, 3 * 4);
    }

    // Set uniforms
    if (programInfo.modelLocation) {
      this.gl.uniformMatrix4fv(programInfo.modelLocation, false, modelMatrix);
    }
    if (programInfo.viewLocation) {
      this.gl.uniformMatrix4fv(programInfo.viewLocation, false, viewMatrix);
    }
    if (programInfo.projLocation) {
      this.gl.uniformMatrix4fv(programInfo.projLocation, false, projMatrix);
    }

    // Draw triangles (non-indexed)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, debugMesh.vertexCount);
  }

  /**
   * Draws mesh as wireframe.
   */
  private drawWithWireframe(args: DrawArgs): void {
    const { mesh, modelMatrix, viewMatrix, projMatrix, material } = args;

    // Prepare the mesh normally
    this.prepareMesh(mesh);
    const entry = this.meshCache.get(mesh);
    if (!entry) return;

    const programInfo = this.getProgramInfo(material, mesh);
    this.gl.useProgram(programInfo.program);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, entry.vertexBuffer);
    if (entry.indexBuffer) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, entry.indexBuffer);
    }

    this.bindAttributes(mesh.layout.attributes, mesh.layout.stride, programInfo.attribLocations);

    // Use white color for wireframe
    if (programInfo.uniformLocations.model) {
      this.gl.uniformMatrix4fv(programInfo.uniformLocations.model, false, modelMatrix);
    }
    if (programInfo.uniformLocations.view) {
      this.gl.uniformMatrix4fv(programInfo.uniformLocations.view, false, viewMatrix);
    }
    if (programInfo.uniformLocations.proj) {
      this.gl.uniformMatrix4fv(programInfo.uniformLocations.proj, false, projMatrix);
    }
    if (programInfo.uniformLocations.baseColor) {
      this.gl.uniform4f(programInfo.uniformLocations.baseColor, 1, 1, 1, 1);
    }

    // Draw as lines
    if (mesh.indices.length > 0 && entry.indexType !== null) {
      this.gl.drawElements(this.gl.LINES, mesh.indices.length, entry.indexType, 0);
    } else {
      this.gl.drawArrays(this.gl.LINES, 0, mesh.vertexCount);
    }
  }

  /**
   * Draws mesh with normals visualized as colors.
   */
  private drawWithNormalColors(args: DrawArgs): void {
    // For now, fall back to triangle colors
    // TODO: Implement proper normal visualization
    this.drawWithTriangleColors(args);
  }

  /**
   * Draws mesh with UV coordinates visualized as colors.
   */
  private drawWithUVColors(args: DrawArgs): void {
    // For now, fall back to triangle colors
    // TODO: Implement proper UV visualization
    this.drawWithTriangleColors(args);
  }

  /**
   * Draws mesh with depth visualization.
   */
  private drawWithDepthVisualization(args: DrawArgs): void {
    // For now, fall back to triangle colors
    // TODO: Implement proper depth visualization
    this.drawWithTriangleColors(args);
  }

  dispose(): void {
    this.programCache.dispose(this.gl);
    this.programInfoCache.clear();
    this.customProgramCache.clear();
    this.debugProgramInfo = null;
  }
}

// Debug shader for triangle coloring
const DEBUG_VERTEX_SOURCE = `
  attribute vec3 a_position;
  attribute vec4 a_color;
  uniform mat4 u_model;
  uniform mat4 u_view;
  uniform mat4 u_proj;
  varying vec4 v_color;
  void main() {
    gl_Position = u_proj * u_view * u_model * vec4(a_position, 1.0);
    v_color = a_color;
  }
`;

const DEBUG_FRAGMENT_SOURCE = `
  precision mediump float;
  varying vec4 v_color;
  void main() {
    gl_FragColor = v_color;
  }
`;
