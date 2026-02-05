/**
 * @arcanvas/gfx - Hashing utilities
 *
 * Fast hashing for descriptor-keyed caching.
 */

// ============================================================================
// String Hashing
// ============================================================================

/**
 * Fast string hash (FNV-1a).
 */
export function hashString(str: string): number {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
  }
  return hash >>> 0; // Ensure unsigned
}

/**
 * Combine multiple hashes.
 */
export function combineHashes(...hashes: number[]): number {
  let result = 0;
  for (const h of hashes) {
    result = Math.imul(result, 31) + h;
  }
  return result >>> 0;
}

// ============================================================================
// Descriptor Hashing
// ============================================================================

/**
 * Hash a simple object (shallow, for descriptors).
 * Handles primitives, arrays, and nested objects.
 */
export function hashDescriptor(obj: unknown): number {
  if (obj === null || obj === undefined) {
    return 0;
  }

  if (typeof obj === "boolean") {
    return obj ? 1 : 0;
  }

  if (typeof obj === "number") {
    return hashNumber(obj);
  }

  if (typeof obj === "string") {
    return hashString(obj);
  }

  if (Array.isArray(obj)) {
    let hash = obj.length;
    for (let i = 0; i < obj.length; i++) {
      hash = combineHashes(hash, hashDescriptor(obj[i]));
    }
    return hash;
  }

  if (typeof obj === "object") {
    // Sort keys for consistent ordering
    const keys = Object.keys(obj).sort();
    let hash = keys.length;
    for (const key of keys) {
      hash = combineHashes(hash, hashString(key), hashDescriptor((obj as Record<string, unknown>)[key]));
    }
    return hash;
  }

  return 0;
}

/**
 * Hash a floating-point number.
 */
export function hashNumber(n: number): number {
  if (Number.isInteger(n)) {
    return n >>> 0;
  }
  // Convert float to integer bits
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, n, true);
  return combineHashes(view.getUint32(0, true), view.getUint32(4, true));
}

// ============================================================================
// Cache Key Utilities
// ============================================================================

/**
 * Generate a cache key string from a descriptor.
 * More readable than numeric hash for debugging.
 */
export function descriptorToKey(obj: unknown, seen = new WeakSet<object>()): string {
  if (obj === null) return "null";
  if (obj === undefined) return "undefined";
  if (typeof obj === "boolean") return obj ? "true" : "false";
  if (typeof obj === "number") return String(obj);
  if (typeof obj === "string") return `"${obj}"`;

  if (Array.isArray(obj)) {
    return `[${obj.map((v) => descriptorToKey(v, seen)).join(",")}]`;
  }

  if (typeof obj === "object") {
    // Handle circular references
    if (seen.has(obj)) {
      return "[circular]";
    }
    seen.add(obj);

    // Check for objects with ID/label
    const asAny = obj as Record<string, unknown>;
    if ("label" in asAny && typeof asAny.label === "string") {
      return `@${asAny.label}`;
    }
    if ("id" in asAny) {
      return `#${String(asAny.id)}`;
    }

    // Serialize object
    const keys = Object.keys(obj).sort();
    const pairs = keys.map((k) => `${k}:${descriptorToKey(asAny[k], seen)}`);
    return `{${pairs.join(",")}}`;
  }

  return "?";
}

// ============================================================================
// Typed Array Hashing
// ============================================================================

/**
 * Hash a typed array.
 */
export function hashTypedArray(arr: ArrayBufferView): number {
  const view = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  let hash = view.length;
  for (let i = 0; i < view.length; i++) {
    hash = combineHashes(hash, view[i] ?? 0);
  }
  return hash >>> 0;
}
