import { Arcanvas } from "@arcanvas/core";

/**
 * Setup Arcanvas events.
 */
export function setupArcanvasEvents(arc: Arcanvas): void {
  arc.on("resize", (width: number, height: number) => {
    console.log(`Canvas resized to ${width}x${height}`);
  });

  arc.on("focus", () => {
    console.log("Canvas focused");
  });

  arc.on("blur", () => {
    console.log("Canvas blurred");
  });
}

/**
 * Setup keyboard controls.
 */
export function setupKeyboardControls(arc: Arcanvas): void {
  document.addEventListener("keydown", (e) => {
    if (e.key === "r" || e.key === "R") {
      // Test resize event
      const newWidth = Math.floor(Math.random() * 400) + 400;
      const newHeight = Math.floor(Math.random() * 300) + 300;
      arc.resize(newWidth, newHeight);
      console.log(`Manual resize to ${newWidth}x${newHeight}`);
    }
  });
}
