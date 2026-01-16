import type { Meta, StoryObj } from "@storybook/html";
import { Arcanvas } from "@arcanvas/core";

interface EmptyCanvasArgs {
  canvasWidth: number;
  canvasHeight: number;
  clearColorR: number;
  clearColorG: number;
  clearColorB: number;
  clearColorA: number;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<EmptyCanvasArgs> = {
  title: "Core/Arcanvas/EmptyCanvas",
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
    canvasWidth: {
      control: { type: "number", min: 200, max: 1920, step: 10 },
      description: "Canvas width",
      defaultValue: 800,
    },
    canvasHeight: {
      control: { type: "number", min: 200, max: 1080, step: 10 },
      description: "Canvas height",
      defaultValue: 600,
    },
    clearColorR: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Clear color red component",
      defaultValue: 0.1,
    },
    clearColorG: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Clear color green component",
      defaultValue: 0.1,
    },
    clearColorB: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Clear color blue component",
      defaultValue: 0.15,
    },
    clearColorA: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Clear color alpha component",
      defaultValue: 1,
    },
  },
};

export default meta;
type Story = StoryObj<EmptyCanvasArgs>;

/**
 * Renders an empty canvas story.
 */
function render(args: EmptyCanvasArgs, id: string): HTMLElement {
  const existingCleanup = cleanupMap.get(id);
  if (existingCleanup) {
    existingCleanup();
    cleanupMap.delete(id);
  }

  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100vh";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.overflow = "hidden";

  const canvas = document.createElement("canvas");
  canvas.width = args.canvasWidth;
  canvas.height = args.canvasHeight;
  canvas.style.border = "1px solid #ccc";
  canvas.style.display = "block";
  container.appendChild(canvas);

  const updateCanvasSize = () => {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const docAspectRatio = args.canvasWidth / args.canvasHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let displayWidth: number;
    let displayHeight: number;

    if (containerAspectRatio > docAspectRatio) {
      displayHeight = containerHeight;
      displayWidth = displayHeight * docAspectRatio;
    } else {
      displayWidth = containerWidth;
      displayHeight = displayWidth / docAspectRatio;
    }

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
  };

  updateCanvasSize();

  // Initialize Arcanvas with clear color
  const arc = new Arcanvas(canvas, {
    width: args.canvasWidth,
    height: args.canvasHeight,
    backend: "webgl",
    rendererOptions: {
      clearColor: [args.clearColorR, args.clearColorG, args.clearColorB, args.clearColorA],
    },
  });

  // Render loop - just clear the canvas
  let animationFrameId: number;
  const frame = () => {
    arc.renderer.renderOnce();
    animationFrameId = requestAnimationFrame(frame);
  };
  frame();

  const resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
  });
  resizeObserver.observe(container);

  const cleanup = () => {
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
    }
    resizeObserver.disconnect();
  };

  cleanupMap.set(id, cleanup);

  return container;
}

export const Default: Story = {
  render: (args) => render(args, "default"),
  args: {
    canvasWidth: 800,
    canvasHeight: 600,
    clearColorR: 0.1,
    clearColorG: 0.1,
    clearColorB: 0.15,
    clearColorA: 1,
  },
};
