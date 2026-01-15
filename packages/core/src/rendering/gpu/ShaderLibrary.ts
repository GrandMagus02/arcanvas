/**
 *
 */
export class ShaderLibrary {
  private modules = new Map<string, string>();

  add(id: string, source: string): void {
    this.modules.set(id, source);
  }

  get(id: string): string | undefined {
    return this.modules.get(id);
  }
}

