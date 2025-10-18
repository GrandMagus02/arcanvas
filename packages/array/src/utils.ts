/**
 * Check if a value is iterable
 */
export function isIterable<T>(x: unknown): x is Iterable<T> {
  return x !== null && typeof (x as unknown as { [Symbol.iterator]: () => Iterator<T> })[Symbol.iterator] === "function";
}

/**
 * Convert a negative index to a positive index
 */
export function toIndex(i: number, len: number): number {
  if (!Number.isInteger(i)) {
    throw new TypeError("index must be an integer");
  }
  return i < 0 ? len + i : i;
}

/**
 * Check if an index is within bounds
 */
export function boundsCheck(idx: number, len: number): void {
  if (idx < 0 || idx >= len) {
    throw new RangeError(`Index ${idx} out of bounds for length ${len}`);
  }
}

/**
 * Set the name of a constructor
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function setClassName<T extends Function>(ctor: T, name: string): T {
  try {
    Object.defineProperty(ctor, "name", { value: name });
  } catch {
    // ignore
  }
  return ctor;
}

/**
 * Convert a value to a bigint
 */
export function toBigInt(x: unknown): bigint {
  if (typeof x === "bigint") return x;
  if (typeof x === "number") return BigInt(Math.trunc(x));
  if (typeof x === "string") return BigInt(x);
  throw new TypeError("Cannot convert value to bigint");
}
