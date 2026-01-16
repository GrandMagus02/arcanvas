/**
 * Interface for objects that have a lifecycle (can be started and stopped).
 */
export interface Lifecycle {
  /**
   * Starts the object's lifecycle (e.g., begins rendering loop).
   */
  start(): void;

  /**
   * Stops the object's lifecycle (e.g., stops rendering loop).
   */
  stop(): void;

  /**
   * Destroys the object and cleans up all resources.
   */
  destroy(): void;
}
