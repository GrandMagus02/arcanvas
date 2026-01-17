import type { Meta, StoryObj } from "@storybook/html";
import { Arcanvas, AutoResizePlugin, Camera, Camera2DController, EngineRenderSystem, Plugin } from "@arcanvas/core";
import { Scene } from "@arcanvas/scene";

interface PluginRegistrationArgs {
  enablePlugin: boolean;
  logEvents: boolean;
}

const cleanupMap = new Map<string, () => void>();

// Example plugin that logs events
/**
 *
 */
class LoggingPlugin extends Plugin<{ enabled: boolean }> {
  private eventLog: string[] = [];
  private maxLogSize = 20;

  setup(): void {
    if (this.opts.enabled) {
      this.app.on("resize", () => {
        if (this.opts.enabled) {
          this.log("resize");
        }
      });
      this.app.on("focus", () => {
        if (this.opts.enabled) {
          this.log("focus");
        }
      });
      this.app.on("blur", () => {
        if (this.opts.enabled) {
          this.log("blur");
        }
      });
    }
  }

  destroy(): void {
    // Cleanup if needed
  }

  private log(event: string): void {
    this.eventLog.push(`${new Date().toLocaleTimeString()}: ${event}`);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
  }

  getLog(): string[] {
    return [...this.eventLog];
  }
}

const meta: Meta<PluginRegistrationArgs> = {
  title: "Core/Arcanvas/PluginRegistration",
  tags: ["autodocs"],
  parameters: {
    docs: {
      source: {
        type: "code",
        language: "typescript",
      },
    },
  },
  argTypes: {
    enablePlugin: {
      control: "boolean",
      description: "Enable the logging plugin",
      defaultValue: true,
    },
    logEvents: {
      control: "boolean",
      description: "Show event log",
      defaultValue: true,
    },
  },
};

export default meta;
type Story = StoryObj<PluginRegistrationArgs>;

/**
 * Renders the plugin registration story.
 */
function render(args: PluginRegistrationArgs, id: string): HTMLElement {
  const existingCleanup = cleanupMap.get(id);
  if (existingCleanup) {
    existingCleanup();
    cleanupMap.delete(id);
  }

  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100vh";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.overflow = "hidden";
  container.style.gap = "10px";
  container.style.padding = "10px";

  const canvasWrapper = document.createElement("div");
  canvasWrapper.style.flex = "1 1 auto";
  canvasWrapper.style.minHeight = "0";
  canvasWrapper.style.display = "flex";
  container.appendChild(canvasWrapper);

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvasWrapper.appendChild(canvas);

  // Create event log display
  const logContainer = document.createElement("div");
  logContainer.style.width = "100%";
  logContainer.style.maxHeight = "200px";
  logContainer.style.overflow = "auto";
  logContainer.style.backgroundColor = "#1a1a1a";
  logContainer.style.color = "#0f0";
  logContainer.style.fontFamily = "monospace";
  logContainer.style.fontSize = "12px";
  logContainer.style.padding = "10px";
  logContainer.style.border = "1px solid #333";
  logContainer.style.display = args.logEvents ? "block" : "none";
  logContainer.style.flexShrink = "0";
  container.appendChild(logContainer);

  // Initialize Arcanvas
  const arc = new Arcanvas(canvas);
  arc.use(AutoResizePlugin);

  // Register plugin
  let plugin: LoggingPlugin | undefined = undefined;
  if (args.enablePlugin) {
    // Use arc.use() to register the plugin
    arc.use(LoggingPlugin, { enabled: true });
    // Get the plugin instance to access its methods
    plugin = arc.get(LoggingPlugin) as LoggingPlugin | undefined;
  }

  // Create scene - will be updated on resize
  const scene = new Scene({ width: canvas.width || 800, height: canvas.height || 600 });

  // Setup camera
  const camera = new Camera(arc);
  camera.pixelsPerUnit = 100;
  arc.setCamera(camera);

  const controller = new Camera2DController();
  controller.zoom = 0.1;
  controller.attach(camera);
  controller.enable();

  // Create render system
  const renderSystem = new EngineRenderSystem(canvas, scene, camera, { backend: "webgl" });

  scene.viewport = { width: canvas.width || 800, height: canvas.height || 600 };

  // Update log display
  const updateLog = () => {
    if (plugin && args.logEvents) {
      const log = plugin.getLog();
      logContainer.textContent = log.length > 0 ? log.join("\n") : "No events yet. Try resizing the window or focusing the canvas.";
    }
  };

  arc.on("resize", () => {
    scene.viewport = { width: canvas.width, height: canvas.height };
    updateLog();
  });

  // Render loop
  let animationFrameId: number;
  const frame = () => {
    renderSystem.renderOnce();
    updateLog();
    animationFrameId = requestAnimationFrame(frame);
  };
  frame();

  const cleanup = () => {
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
    }
    // Plugin cleanup is handled by Arcanvas.destroy() if needed
    // For now, we just stop the render loop
  };

  cleanupMap.set(id, cleanup);

  return container;
}

export const Default: Story = {
  render: (args) => render(args, "default"),
  args: {
    enablePlugin: true,
    logEvents: true,
  },
};

export const PluginDisabled: Story = {
  render: (args) => render(args, "plugin-disabled"),
  args: {
    enablePlugin: false,
    logEvents: true,
  },
};
