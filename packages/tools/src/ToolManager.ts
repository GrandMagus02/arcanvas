import type { InputState, NormalizedInputEvent } from "@arcanvas/interaction";
import type { Tool } from "./Tool";

/**
 * Manages the currently active tool.
 * Forwards input events to the active tool.
 */
export class ToolManager {
  private _activeTool: Tool | null = null;
  private _tools: Map<string, Tool> = new Map();

  /**
   * Registers a tool.
   */
  register(tool: Tool): void {
    this._tools.set(tool.name, tool);
  }

  /**
   * Unregisters a tool.
   */
  unregister(name: string): void {
    const tool = this._tools.get(name);
    if (tool === this._activeTool) {
      this.setActiveTool(null);
    }
    this._tools.delete(name);
  }

  /**
   * Sets the active tool.
   * Deactivates the previous tool and activates the new one.
   */
  setActiveTool(tool: Tool | string | null): void {
    // Deactivate current tool
    if (this._activeTool) {
      this._activeTool.deactivate();
    }

    // Activate new tool
    if (tool === null) {
      this._activeTool = null;
      return;
    }

    const toolInstance = typeof tool === "string" ? this._tools.get(tool) : tool;
    if (toolInstance) {
      this._activeTool = toolInstance;
      this._activeTool.activate();
    } else {
      this._activeTool = null;
    }
  }

  /**
   * Gets the currently active tool.
   */
  getActiveTool(): Tool | null {
    return this._activeTool;
  }

  /**
   * Gets a tool by name.
   */
  getTool(name: string): Tool | undefined {
    return this._tools.get(name);
  }

  /**
   * Handles an input event by forwarding it to the active tool.
   */
  handleInput(event: NormalizedInputEvent, state: InputState): void {
    if (this._activeTool) {
      this._activeTool.handleInput(event, state);
    }
  }
}
