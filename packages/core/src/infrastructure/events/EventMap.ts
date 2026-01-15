/**
 * Type definition for event maps.
 * Maps event names to their argument tuples.
 *
 * @example
 * ```typescript
 * interface MyEvents extends EventMap {
 *   click: [event: MouseEvent];
 *   resize: [width: number, height: number];
 *   load: [];
 * }
 * ```
 */
export type EventMap = Record<string, unknown[]>;
