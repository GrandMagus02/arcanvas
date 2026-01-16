/**
 * Interface for objects that can be serialized to and from JSON.
 *
 * @template TJSON The JSON representation type.
 */
export interface JSONSerializable<TJSON> {
  /**
   * Serializes this object to a JSON-friendly structure.
   *
   * @returns The JSON representation of this object.
   */
  toJSON(): TJSON;
}
