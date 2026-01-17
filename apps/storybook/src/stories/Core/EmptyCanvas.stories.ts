import type { Meta, StoryObj } from "@storybook/html";
import { Arcanvas, AutoResizePlugin } from "@arcanvas/core";

interface EmptyCanvasArgs {
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
  container.style.overflow = "hidden";

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.appendChild(canvas);

  // Initialize Arcanvas with clear color
  const arc = new Arcanvas(canvas, {
    backend: "webgl",
    rendererOptions: {
      clearColor: [args.clearColorR, args.clearColorG, args.clearColorB, args.clearColorA],
    },
  });
  arc.use(AutoResizePlugin);

  // Render loop - just clear the canvas
  let animationFrameId: number;
  const frame = () => {
    arc.renderer.renderOnce();
    animationFrameId = requestAnimationFrame(frame);
  };
  frame();

  const cleanup = () => {
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
    }
  };

  cleanupMap.set(id, cleanup);

  return container;
}

export const Default: Story = {
  render: (args) => render(args, "default"),
  args: {
    clearColorR: 0.1,
    clearColorG: 0.1,
    clearColorB: 0.15,
    clearColorA: 1,
  },
};
