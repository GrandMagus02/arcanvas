import type { Interaction } from "./Interaction";

/**
 * Interactive wrapper.
 */
export class Interactive {
  private __elements: HTMLElement[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private __interactions: Set<Interaction<any>> = new Set();

  constructor(elements?: HTMLElement | HTMLElement[]) {
    if (elements) {
      this.__elements = Array.isArray(elements) ? elements : [elements];
    }
  }

  public get elements(): Readonly<HTMLElement[]> {
    return Object.freeze(this.__elements);
  }

  public watch(element: HTMLElement): void {
    this.__elements.push(element);
    // Also attach existing interactions to this new element
    for (const interaction of this.__interactions) {
      interaction.watch(element);
    }
  }

  public unwatch(element: HTMLElement): void {
    this.__elements = this.__elements.filter((e) => e !== element);
    // Detach interactions from this element
    for (const interaction of this.__interactions) {
      interaction.unwatch(element);
    }
  }

  public unwatchAll(): void {
    // Detach all interactions from all elements
    for (const interaction of this.__interactions) {
      for (const element of this.__elements) {
        interaction.unwatch(element);
      }
    }
    this.__elements = [];
  }

  public destroy(): void {
    this.unwatchAll();
    this.__interactions.clear();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(interaction: Interaction<any>): void {
    this.__interactions.add(interaction);
    for (const element of this.__elements) {
      interaction.watch(element);
    }
  }

  public off(event: string, listener: (event: Event) => void): void {
    this.__elements.forEach((element) => {
      element.removeEventListener(event, listener);
    });
  }
}
