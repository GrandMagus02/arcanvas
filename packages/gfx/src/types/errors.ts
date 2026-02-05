/**
 * @arcanvas/gfx - Error types
 *
 * Structured error reporting for GPU operations.
 */

// ============================================================================
// Error Types
// ============================================================================

/**
 * Category of GPU error.
 */
export type GfxErrorType = "validation" | "out-of-memory" | "internal" | "device-lost" | "unsupported" | "shader-compilation" | "pipeline-creation";

/**
 * Severity level for diagnostics.
 */
export type GfxDiagnosticSeverity = "error" | "warning" | "info";

/**
 * Base GPU error class.
 */
export class GfxError extends Error {
  readonly type: GfxErrorType;
  readonly details?: Record<string, unknown>;

  constructor(type: GfxErrorType, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "GfxError";
    this.type = type;
    this.details = details;
  }
}

/**
 * Validation error for invalid API usage.
 */
export class GfxValidationError extends GfxError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("validation", message, details);
    this.name = "GfxValidationError";
  }
}

/**
 * Out of memory error.
 */
export class GfxOutOfMemoryError extends GfxError {
  constructor(message: string = "GPU out of memory", details?: Record<string, unknown>) {
    super("out-of-memory", message, details);
    this.name = "GfxOutOfMemoryError";
  }
}

/**
 * Device lost error (unrecoverable).
 */
export class GfxDeviceLostError extends GfxError {
  readonly reason: "unknown" | "destroyed";

  constructor(reason: "unknown" | "destroyed" = "unknown", message?: string) {
    super("device-lost", message ?? `GPU device lost: ${reason}`);
    this.name = "GfxDeviceLostError";
    this.reason = reason;
  }
}

/**
 * Shader compilation error.
 */
export class GfxShaderError extends GfxError {
  readonly stage?: "vertex" | "fragment" | "compute";
  readonly lineNumber?: number;
  readonly columnNumber?: number;

  constructor(
    message: string,
    options?: {
      stage?: "vertex" | "fragment" | "compute";
      lineNumber?: number;
      columnNumber?: number;
      details?: Record<string, unknown>;
    }
  ) {
    super("shader-compilation", message, options?.details);
    this.name = "GfxShaderError";
    this.stage = options?.stage;
    this.lineNumber = options?.lineNumber;
    this.columnNumber = options?.columnNumber;
  }
}

/**
 * Unsupported operation error.
 */
export class GfxUnsupportedError extends GfxError {
  readonly feature?: string;

  constructor(message: string, feature?: string) {
    super("unsupported", message, feature ? { feature } : undefined);
    this.name = "GfxUnsupportedError";
    this.feature = feature;
  }
}

// ============================================================================
// Diagnostic Message
// ============================================================================

/**
 * A diagnostic message from the GPU layer.
 */
export interface GfxDiagnostic {
  /** Severity level */
  readonly severity: GfxDiagnosticSeverity;
  /** Message text */
  readonly message: string;
  /** Associated object label (if any) */
  readonly label?: string;
  /** Source location (if known) */
  readonly source?: {
    readonly file?: string;
    readonly line?: number;
    readonly column?: number;
  };
}

// ============================================================================
// Error Scope
// ============================================================================

/**
 * Error scope for grouping validation errors.
 */
export interface GfxErrorScope {
  /** Push an error scope filter */
  pushErrorScope(filter: "validation" | "out-of-memory" | "internal"): void;
  /** Pop and return any captured error */
  popErrorScope(): Promise<GfxError | null>;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Assert a condition, throwing a validation error if false.
 */
export function gfxAssert(condition: boolean, message: string, details?: Record<string, unknown>): asserts condition {
  if (!condition) {
    throw new GfxValidationError(message, details);
  }
}

/**
 * Wrap a function to catch and rethrow errors as GfxError.
 */
export function wrapGfxError<T>(fn: () => T, context: string): T {
  try {
    return fn();
  } catch (e) {
    if (e instanceof GfxError) {
      throw e;
    }
    throw new GfxError("internal", `${context}: ${String(e)}`, {
      originalError: e,
    });
  }
}
