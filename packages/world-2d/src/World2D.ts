import type { Element2D } from "./Element2D";

/**
 *
 */
export class World2D {
  readonly elements: Element2D[] = [];

  constructor() {
    this.elements = [];
  }

  addElement(element: Element2D) {
    this.elements.push(element);
  }

  removeElement(element: Element2D) {
    this.elements.splice(this.elements.indexOf(element), 1);
  }

  getElement(id: string) {
    return this.elements.find((e) => e.id === id);
  }
}
