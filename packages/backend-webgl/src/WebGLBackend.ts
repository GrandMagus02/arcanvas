import type { IRenderBackend, DrawArgs, Mesh, BaseMaterial, VertexAttributeDesc } from "@arcanvas/graphics";
import { ProgramCache } from "./ProgramCache";
import { ShaderRegistry } from "./ShaderRegistry";
import { isShaderProvider, type UniformContext } from "./ShaderProvider";

interface MeshCacheEntry {
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer | null;
  indexType: number | null;
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
}

/**
 * WebGL implementation of the render backend.
 */
export class WebGLBackend implements IRenderBackend {
  private readonly programCache = new ProgramCache();
  private readonly meshCache = new WeakMap<Mesh, MeshCacheEntry>();
  private readonly programInfoCache = new Map<string, ProgramInfo>();
  private readonly customProgramCache = new Map<string, CustomProgramInfo>();
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

  prepareMaterial(_material: BaseMaterial): void {
    // Hook for textures/pipelines - no-op for now
  }

  drawMesh(args: DrawArgs): void {
    const { material } = args;

    if (isShaderProvider(material)) {
      this.drawWithCustomShader(args);
      return;
    }

    this.drawWithDefaultShader(args);
  }

  private drawWithCustomShader(args: DrawArgs): void {
    const { mesh, material } = args;

    if (!isShaderProvider(material)) return;

    this.prepareMesh(mesh);
    const entry = this.meshCache.get(mesh);
    if (!entry) return;

    const shaderSource = material.getShaderSource();
    const drawConfig = material.getDrawConfig();

    const programKey = `custom:${material.shadingModel}`;
    let programInfo = this.customProgramCache.get(programKey);

    if (!programInfo) {
      const program = this.programCache.getOrCreate(this.gl, programKey, shaderSource.vertex, shaderSource.fragment);
      if (!program) {
        console.error(`Failed to create program for ${material.shadingModel}`);
        return;
      }

      programInfo = {
        program,
        attribLocation: this.gl.getAttribLocation(program, "a_position"),
      };
      this.customProgramCache.set(programKey, programInfo);
    }

    this.gl.useProgram(programInfo.program);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, entry.vertexBuffer);
    if (entry.indexBuffer) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, entry.indexBuffer);
    }

    this.gl.enableVertexAttribArray(programInfo.attribLocation);
    this.gl.vertexAttribPointer(programInfo.attribLocation, drawConfig.positionComponents, this.gl.FLOAT, false, 0, 0);

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

    if (drawConfig.disableDepthWrite) {
      this.gl.depthMask(false);
    }

    if (mesh.indices.length > 0 && entry.indexType !== null) {
      this.gl.drawElements(this.gl.TRIANGLES, mesh.indices.length, entry.indexType, 0);
    } else {
      this.gl.drawArrays(this.gl.TRIANGLES, 0, mesh.vertexCount);
    }

    if (drawConfig.disableDepthWrite) {
      this.gl.depthMask(true);
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

  dispose(): void {
    this.programCache.dispose(this.gl);
    this.programInfoCache.clear();
    this.customProgramCache.clear();
  }
}
