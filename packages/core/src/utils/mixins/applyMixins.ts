/**
 * Applies mixins to a derived class by copying prototype methods from base classes.
 *
 * @param derivedCtor The derived class constructor.
 * @param baseCtors Array of base class constructors (mixins) to apply.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyMixins(derivedCtor: any, baseCtors: any[]): void {
  baseCtors.forEach((baseCtor) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      if (name !== "constructor") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        derivedCtor.prototype[name] = baseCtor.prototype[name];
      }
    });
  });
}
