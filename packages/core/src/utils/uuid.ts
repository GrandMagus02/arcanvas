/**
 * Generate a random UUID.
 */
export function uuid(): string {
  return crypto?.randomUUID() ?? `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
}
