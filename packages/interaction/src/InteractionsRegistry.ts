import type { Interaction } from "./Interaction";

/**
 * Interactions registry.
 */
class InteractionsRegistry {
  private __interactions: Map<string, Interaction> = new Map();

  constructor() {}

  public get interactions(): Readonly<Map<string, Interaction>> {
    return Object.freeze(this.__interactions);
  }

  public get(name: string): Interaction | undefined {
    return this.__interactions.get(name);
  }

  public register(interactions: Interaction | Interaction[]): void {
    if (Array.isArray(interactions)) {
      for (const interaction of interactions) {
        this.__interactions.set(interaction.name, interaction);
      }
    } else {
      this.__interactions.set(interactions.name, interactions);
    }
  }

  public unregister(interaction: Interaction | Interaction[]): void {
    if (Array.isArray(interaction)) {
      for (const i of interaction) {
        this.__interactions.delete(i.name);
      }
    } else {
      this.__interactions.delete(interaction.name);
    }
  }

  public unregisterAll(): void {
    this.__interactions.clear();
  }
}

export const interactions = new InteractionsRegistry();
