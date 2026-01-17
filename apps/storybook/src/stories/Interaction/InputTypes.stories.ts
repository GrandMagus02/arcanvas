import {
  ClickDetector,
  InputDevice,
  InputState,
  LongPressDetector,
  MouseButton,
  normalizeEvent,
  PanGesture,
  PinchGesture,
  RotateGesture,
  ShortcutContext,
  ShortcutEngine,
  SwipeGesture,
} from "@arcanvas/interaction";
import type { Meta, StoryObj } from "@storybook/html";

interface InputTypesArgs {
  showKeyboard: boolean;
  showMouse: boolean;
  showTouch: boolean;
  showPen: boolean;
  showGestures: boolean;
  showClicks: boolean;
  showLongPress: boolean;
  showShortcuts: boolean;
}

const cleanupMap = new Map<string, () => void>();

const meta: Meta<InputTypesArgs> = {
  title: "Interaction/Input Types",
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
    showKeyboard: {
      control: { type: "boolean" },
      description: "Show keyboard input",
      defaultValue: true,
    },
    showMouse: {
      control: { type: "boolean" },
      description: "Show mouse input",
      defaultValue: true,
    },
    showTouch: {
      control: { type: "boolean" },
      description: "Show touch input",
      defaultValue: true,
    },
    showPen: {
      control: { type: "boolean" },
      description: "Show pen input",
      defaultValue: true,
    },
    showGestures: {
      control: { type: "boolean" },
      description: "Show gesture detection",
      defaultValue: true,
    },
    showClicks: {
      control: { type: "boolean" },
      description: "Show multi-click detection",
      defaultValue: true,
    },
    showLongPress: {
      control: { type: "boolean" },
      description: "Show long press detection",
      defaultValue: true,
    },
    showShortcuts: {
      control: { type: "boolean" },
      description: "Show shortcut detection",
      defaultValue: true,
    },
  },
};

export default meta;
type Story = StoryObj<InputTypesArgs>;

/**
 * Creates a demo input area with status display.
 */
function createInputDemo(args: InputTypesArgs, storyId: string): HTMLElement {
  const container = document.createElement("div");
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  // Main demo area
  const demoArea = document.createElement("div");
  demoArea.setAttribute("tabindex", "0");
  demoArea.style.cssText = `
    width: 100%;
    height: 133px;
    background: #f0f0f0;
    border: 2px solid #ccc;
    border-radius: 8px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    touch-action: none;
    outline: none;
  `;
  demoArea.addEventListener("focus", () => {
    demoArea.style.border = "2px solid #2196F3";
  });
  demoArea.addEventListener("blur", () => {
    demoArea.style.border = "2px solid #ccc";
  });
  // Focus on click for better UX
  demoArea.addEventListener("click", () => {
    demoArea.focus();
  });

  const demoText = document.createElement("div");
  demoText.style.cssText = `
    text-align: center;
    color: #666;
    font-size: 18px;
    pointer-events: none;
  `;
  demoText.textContent = "Interact with this area (click to focus for keyboard)";
  demoArea.appendChild(demoText);

  // Status display
  const statusDiv = document.createElement("div");
  statusDiv.style.cssText = `
    padding: 15px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  `;

  const statusTitle = document.createElement("div");
  statusTitle.style.cssText = `font-weight: bold; margin-bottom: 10px; font-size: 14px;`;
  statusTitle.textContent = "Current State:";
  statusDiv.appendChild(statusTitle);

  const currentStateDiv = document.createElement("div");
  currentStateDiv.id = `current-state-${storyId}`;
  currentStateDiv.style.cssText = `
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 11px;
    line-height: 1.6;
  `;
  statusDiv.appendChild(currentStateDiv);

  const eventsTitle = document.createElement("div");
  eventsTitle.style.cssText = `font-weight: bold; margin-bottom: 10px; font-size: 14px;`;
  eventsTitle.textContent = "Event Log:";
  statusDiv.appendChild(eventsTitle);

  const statusContent = document.createElement("div");
  statusContent.id = `input-status-${storyId}`;
  statusContent.style.cssText = `
    max-height: 200px;
    overflow-y: auto;
  `;
  statusDiv.appendChild(statusContent);

  container.appendChild(demoArea);
  container.appendChild(statusDiv);

  // Initialize interaction system
  const state = new InputState();

  const updateDemoText = () => {
    const keys = Array.from(state.keysDown).sort();
    const modifiers = state.modifiers;
    const pointers = Array.from(state.activePointers.values());

    const parts: string[] = [];

    // Modifiers
    if (modifiers.length > 0) {
      parts.push(modifiers.join(" + "));
    }

    // Keys
    if (keys.length > 0) {
      parts.push(keys.join(", "));
    }

    // Pointers/Buttons
    if (pointers.length > 0) {
      const buttonInfo = pointers.map((p) => {
        const buttonNames = p.buttons.map((b) => {
          if (b === MouseButton.Left) return "Left";
          if (b === MouseButton.Middle) return "Middle";
          if (b === MouseButton.Right) return "Right";
          return `Button${b}`;
        });
        return buttonNames.join(", ") || "none";
      });
      parts.push(buttonInfo.join("; "));
    }

    if (parts.length > 0) {
      demoText.textContent = parts.join(" | ");
    } else {
      demoText.textContent = "Interact with this area (click to focus for keyboard)";
    }
  };

  const updateCurrentState = () => {
    const currentStateEl = document.getElementById(`current-state-${storyId}`);
    if (!currentStateEl) return;

    const keys = Array.from(state.keysDown).sort();
    const modifiers = state.modifiers;
    const pointers = Array.from(state.activePointers.values());
    const lastPos = state.lastPosition;

    let html = "";

    // Keys
    if (keys.length > 0) {
      html += `<div><strong>Keys:</strong> ${keys.join(", ")}</div>`;
    } else {
      html += `<div><strong>Keys:</strong> <span style="color: #999;">none</span></div>`;
    }

    // Modifiers
    if (modifiers.length > 0) {
      html += `<div><strong>Modifiers:</strong> ${modifiers.join(", ")}</div>`;
    } else {
      html += `<div><strong>Modifiers:</strong> <span style="color: #999;">none</span></div>`;
    }

    // Mouse buttons / Pointers
    if (pointers.length > 0) {
      const buttonInfo = pointers.map((p) => {
        const buttonNames = p.buttons.map((b) => {
          if (b === MouseButton.Left) return "Left";
          if (b === MouseButton.Middle) return "Middle";
          if (b === MouseButton.Right) return "Right";
          return `Button${b}`;
        });
        return `Pointer ${p.id} (${buttonNames.join(", ") || "none"}) at (${p.position.x.toFixed(0)}, ${p.position.y.toFixed(0)})`;
      });
      html += `<div><strong>Pointers:</strong> ${buttonInfo.join("; ")}</div>`;
    } else {
      html += `<div><strong>Pointers:</strong> <span style="color: #999;">none</span></div>`;
    }

    // Last position
    if (lastPos) {
      html += `<div><strong>Last Position:</strong> (${lastPos.x.toFixed(0)}, ${lastPos.y.toFixed(0)})</div>`;
    } else {
      html += `<div><strong>Last Position:</strong> <span style="color: #999;">none</span></div>`;
    }

    currentStateEl.innerHTML = html;
    updateDemoText();
  };

  const updateStatus = (text: string, color: string = "#4CAF50") => {
    const statusEl = document.getElementById(`input-status-${storyId}`);
    if (statusEl) {
      const time = new Date().toLocaleTimeString();
      statusEl.innerHTML = `<div style="color: ${color}; margin-bottom: 5px;">[${time}] ${text}</div>${statusEl.innerHTML}`;
      // Keep only last 20 entries
      const entries = statusEl.children;
      if (entries.length > 20) {
        statusEl.removeChild(entries[entries.length - 1] as Node);
      }
    }

    // Update current state display (which also updates demo text)
    updateCurrentState();
  };

  // Initialize current state display (which also updates demo text)
  updateCurrentState();

  // Keyboard detection
  if (args.showKeyboard) {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Prevent default browser behavior when demoArea is focused
      if (document.activeElement === demoArea) {
        e.preventDefault();
      }
      const normalized = normalizeEvent(e, demoArea);
      if (normalized) {
        state.update(normalized);
        updateStatus(`Keyboard: ${normalized.type} - Key: ${normalized.key || "N/A"}`, "#2196F3");
        updateCurrentState();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    window.addEventListener("keyup", handleKeyboard);
    cleanupMap.set(`input-${storyId}-keyboard`, () => {
      window.removeEventListener("keydown", handleKeyboard);
      window.removeEventListener("keyup", handleKeyboard);
    });
  }

  // Mouse detection
  if (args.showMouse) {
    const handleMouse = (e: MouseEvent) => {
      const normalized = normalizeEvent(e, demoArea);
      if (normalized) {
        state.update(normalized);
        const buttonNames = normalized.buttons.map((b) => {
          if (b === MouseButton.Left) return "Left";
          if (b === MouseButton.Middle) return "Middle";
          if (b === MouseButton.Right) return "Right";
          return `Button${b}`;
        });
        updateStatus(`Mouse: ${normalized.type} - Buttons: ${buttonNames.join(", ") || "None"}`, "#FF9800");
        updateCurrentState();
      }
    };

    demoArea.addEventListener("mousedown", handleMouse);
    demoArea.addEventListener("mouseup", handleMouse);
    demoArea.addEventListener("mousemove", handleMouse);
    const handleWheel = (e: WheelEvent) => {
      const normalized = normalizeEvent(e, demoArea);
      if (normalized) {
        state.update(normalized);
        updateStatus(`Wheel: deltaY=${normalized.deltaY}`, "#9C27B0");
        updateCurrentState();
      }
    };
    demoArea.addEventListener("wheel", handleWheel);
    cleanupMap.set(`input-${storyId}-mouse`, () => {
      demoArea.removeEventListener("mousedown", handleMouse);
      demoArea.removeEventListener("mouseup", handleMouse);
      demoArea.removeEventListener("mousemove", handleMouse);
      demoArea.removeEventListener("wheel", handleWheel);
    });
  }

  // Pointer detection (includes pen)
  if (args.showPen || args.showMouse) {
    const handlePointer = (e: PointerEvent) => {
      const normalized = normalizeEvent(e, demoArea);
      if (normalized) {
        state.update(normalized);
        if (normalized.device === InputDevice.Pen && args.showPen) {
          const pressure = normalized.pen?.pressure ?? 0;
          const isEraser = normalized.pen?.isEraser ?? false;
          updateStatus(`Pen: ${normalized.type} - Pressure: ${pressure.toFixed(2)} - Eraser: ${isEraser}`, "#E91E63");
        } else if (normalized.device === InputDevice.Mouse && args.showMouse) {
          // Already handled by mouse events
        }
        updateCurrentState();
      }
    };

    demoArea.addEventListener("pointerdown", handlePointer);
    demoArea.addEventListener("pointerup", handlePointer);
    demoArea.addEventListener("pointermove", handlePointer);
    cleanupMap.set(`input-${storyId}-pointer`, () => {
      demoArea.removeEventListener("pointerdown", handlePointer);
      demoArea.removeEventListener("pointerup", handlePointer);
      demoArea.removeEventListener("pointermove", handlePointer);
    });
  }

  // Touch detection
  if (args.showTouch) {
    const handleTouch = (e: TouchEvent) => {
      const normalized = normalizeEvent(e, demoArea);
      if (normalized) {
        state.update(normalized);
        const touchCount = normalized.touches?.length ?? 0;
        updateStatus(`Touch: ${normalized.type} - Touches: ${touchCount}`, "#00BCD4");
        updateCurrentState();
      }
    };

    demoArea.addEventListener("touchstart", handleTouch, { passive: false });
    demoArea.addEventListener("touchend", handleTouch, { passive: false });
    demoArea.addEventListener("touchmove", handleTouch, { passive: false });
    cleanupMap.set(`input-${storyId}-touch`, () => {
      demoArea.removeEventListener("touchstart", handleTouch);
      demoArea.removeEventListener("touchend", handleTouch);
      demoArea.removeEventListener("touchmove", handleTouch);
    });
  }

  // Gestures
  if (args.showGestures) {
    const panGesture = new PanGesture({
      threshold: 5,
      onStart: (startPos) => {
        updateStatus(`Pan Gesture: Started at (${startPos.x.toFixed(0)}, ${startPos.y.toFixed(0)})`, "#FF5722");
      },
      onUpdate: (dx, dy) => {
        updateStatus(`Pan Gesture: Delta (${dx.toFixed(0)}, ${dy.toFixed(0)})`, "#FF5722");
      },
      onEnd: (dx, dy, totalDistance) => {
        updateStatus(`Pan Gesture: Ended - Total distance: ${totalDistance.toFixed(0)}px`, "#FF5722");
      },
    });

    const pinchGesture = new PinchGesture({
      minDistance: 10,
      onStart: (centerX, centerY, distance) => {
        updateStatus(`Pinch Gesture: Started - Distance: ${distance.toFixed(0)}px`, "#3F51B5");
      },
      onUpdate: (scale) => {
        updateStatus(`Pinch Gesture: Scale: ${scale.toFixed(2)}`, "#3F51B5");
      },
      onEnd: (scale) => {
        updateStatus(`Pinch Gesture: Ended - Final scale: ${scale.toFixed(2)}`, "#3F51B5");
      },
    });

    const rotateGesture = new RotateGesture({
      minAngle: 5,
      onStart: (centerX, centerY, angle) => {
        updateStatus(`Rotate Gesture: Started - Angle: ${angle.toFixed(1)}°`, "#009688");
      },
      onUpdate: (angle, deltaAngle) => {
        updateStatus(`Rotate Gesture: Angle: ${angle.toFixed(1)}° - Delta: ${deltaAngle.toFixed(1)}°`, "#009688");
      },
      onEnd: (totalAngle) => {
        updateStatus(`Rotate Gesture: Ended - Total rotation: ${totalAngle.toFixed(1)}°`, "#009688");
      },
    });

    const swipeGesture = new SwipeGesture({
      minVelocity: 0.5,
      minDistance: 50,
      direction: "both",
      onSwipe: (direction, distance, velocity) => {
        updateStatus(`Swipe Gesture: ${direction} - Distance: ${distance.toFixed(0)}px - Velocity: ${velocity.toFixed(2)}`, "#795548");
      },
    });

    const handleGestureEvent = (e: Event) => {
      const normalized = normalizeEvent(e, demoArea);
      if (normalized) {
        // Update state first (gestures need current state)
        state.update(normalized);
        panGesture.handle(normalized, state);
        pinchGesture.handle(normalized, state);
        rotateGesture.handle(normalized, state);
        swipeGesture.handle(normalized, state);
        updateCurrentState();
      }
    };

    demoArea.addEventListener("mousedown", handleGestureEvent);
    demoArea.addEventListener("mousemove", handleGestureEvent);
    demoArea.addEventListener("mouseup", handleGestureEvent);
    demoArea.addEventListener("pointerdown", handleGestureEvent);
    demoArea.addEventListener("pointermove", handleGestureEvent);
    demoArea.addEventListener("pointerup", handleGestureEvent);
    demoArea.addEventListener("touchstart", handleGestureEvent, { passive: false });
    demoArea.addEventListener("touchmove", handleGestureEvent, { passive: false });
    demoArea.addEventListener("touchend", handleGestureEvent, { passive: false });
    cleanupMap.set(`input-${storyId}-gestures`, () => {
      demoArea.removeEventListener("mousedown", handleGestureEvent);
      demoArea.removeEventListener("mousemove", handleGestureEvent);
      demoArea.removeEventListener("mouseup", handleGestureEvent);
      demoArea.removeEventListener("pointerdown", handleGestureEvent);
      demoArea.removeEventListener("pointermove", handleGestureEvent);
      demoArea.removeEventListener("pointerup", handleGestureEvent);
      demoArea.removeEventListener("touchstart", handleGestureEvent);
      demoArea.removeEventListener("touchmove", handleGestureEvent);
      demoArea.removeEventListener("touchend", handleGestureEvent);
    });
  }

  // Multi-click detection
  if (args.showClicks) {
    const clickDetector = new ClickDetector({
      timeout: 300,
      radius: 5,
      onClick: (position) => {
        updateStatus(`Click: Single click at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`, "#4CAF50");
      },
      onDoubleClick: (position) => {
        updateStatus(`Click: Double click at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`, "#8BC34A");
      },
      onTripleClick: (position) => {
        updateStatus(`Click: Triple click at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`, "#CDDC39");
      },
      onNClick: (count, position) => {
        updateStatus(`Click: ${count}x click at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`, "#CDDC39");
      },
    });

    const handleClickEvent = (e: Event) => {
      const normalized = normalizeEvent(e, demoArea);
      if (normalized) {
        // Update state first (click detector needs current state)
        state.update(normalized);
        clickDetector.handle(normalized, state);
        updateCurrentState();
      }
    };

    demoArea.addEventListener("mousedown", handleClickEvent);
    demoArea.addEventListener("pointerdown", handleClickEvent);
    demoArea.addEventListener("touchstart", handleClickEvent, { passive: false });
    cleanupMap.set(`input-${storyId}-clicks`, () => {
      demoArea.removeEventListener("mousedown", handleClickEvent);
      demoArea.removeEventListener("pointerdown", handleClickEvent);
      demoArea.removeEventListener("touchstart", handleClickEvent);
    });
  }

  // Long press detection
  if (args.showLongPress) {
    const longPressDetector = new LongPressDetector({
      duration: 500,
      tolerance: 10,
      onStart: (position) => {
        updateStatus(`Long Press: Started at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`, "#FFC107");
      },
      onUpdate: (position, elapsed) => {
        // Update less frequently to avoid spam
        if (elapsed % 100 < 16) {
          updateStatus(`Long Press: Holding... ${elapsed}ms`, "#FFC107");
        }
      },
      onLongPress: (position, elapsed) => {
        updateStatus(`Long Press: Detected! Held for ${elapsed}ms`, "#FF9800");
      },
      onEnd: (position) => {
        updateStatus(`Long Press: Ended at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`, "#FFC107");
      },
      onCancel: (reason) => {
        updateStatus(`Long Press: Cancelled - ${reason}`, "#FFC107");
      },
    });

    const handleLongPressEvent = (e: Event) => {
      const normalized = normalizeEvent(e, demoArea);
      console.log("handleLongPressEvent", normalized);
      if (normalized) {
        // Update state first (long press detector needs current state)
        state.update(normalized);
        longPressDetector.handle(normalized, state);
        updateCurrentState();
      }
    };

    demoArea.addEventListener("mousedown", handleLongPressEvent);
    demoArea.addEventListener("mousemove", handleLongPressEvent);
    demoArea.addEventListener("mouseup", handleLongPressEvent);
    demoArea.addEventListener("pointerdown", handleLongPressEvent);
    demoArea.addEventListener("pointermove", handleLongPressEvent);
    demoArea.addEventListener("pointerup", handleLongPressEvent);
    demoArea.addEventListener("touchstart", handleLongPressEvent, { passive: false });
    demoArea.addEventListener("touchmove", handleLongPressEvent, { passive: false });
    demoArea.addEventListener("touchend", handleLongPressEvent, { passive: false });
    cleanupMap.set(`input-${storyId}-longpress`, () => {
      demoArea.removeEventListener("mousedown", handleLongPressEvent);
      demoArea.removeEventListener("mousemove", handleLongPressEvent);
      demoArea.removeEventListener("mouseup", handleLongPressEvent);
      demoArea.removeEventListener("pointerdown", handleLongPressEvent);
      demoArea.removeEventListener("pointermove", handleLongPressEvent);
      demoArea.removeEventListener("pointerup", handleLongPressEvent);
      demoArea.removeEventListener("touchstart", handleLongPressEvent);
      demoArea.removeEventListener("touchmove", handleLongPressEvent);
      demoArea.removeEventListener("touchend", handleLongPressEvent);
    });
  }

  // Shortcuts
  if (args.showShortcuts) {
    const shortcutEngine = new ShortcutEngine(state, {
      sequenceTimeout: 1000,
      currentContext: ShortcutContext.Global as string,
    });

    shortcutEngine.bind("Ctrl+Shift+H", "TestAction1", ShortcutContext.Global as string);
    shortcutEngine.bind(["Ctrl+K", "Ctrl+C"], "TestSequence", ShortcutContext.Global as string);
    shortcutEngine.bind("Ctrl+LeftClick", "TestMouseChord", ShortcutContext.Global as string);
    shortcutEngine.bind("Alt+RightClick", "TestRightClick", ShortcutContext.Global as string);
    shortcutEngine.bind("A + S + D", "KeySequenceASD", ShortcutContext.Global as string);

    let matchedShortcut = false;

    shortcutEngine.onAction((actionEvent) => {
      matchedShortcut = true;
      updateStatus(`Shortcut: ${actionEvent.actionId} (Context: ${actionEvent.context})`, "#9C27B0");
    });

    const handleShortcutKeydown = (e: KeyboardEvent) => {
      // Prevent default browser behavior when demoArea is focused
      if (document.activeElement === demoArea) {
        e.preventDefault();
      }
      matchedShortcut = false;
      const normalized = normalizeEvent(e, demoArea);
      if (normalized) {
        // Update state first (needed for proper modifier tracking)
        state.update(normalized);
        // Process shortcut (this may trigger onAction synchronously)
        shortcutEngine.process(normalized);
        // If a shortcut was matched, also stop propagation
        if (matchedShortcut) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
        updateCurrentState();
      }
    };

    const handleShortcutKeyup = (e: KeyboardEvent) => {
      // Prevent default browser behavior when demoArea is focused
      if (document.activeElement === demoArea) {
        e.preventDefault();
      }
      const normalized = normalizeEvent(e, demoArea);
      if (normalized) {
        // Update state for keyup events (needed for proper state tracking)
        state.update(normalized);
        updateCurrentState();
      }
    };

    const handleShortcutMouse = (e: MouseEvent | PointerEvent) => {
      matchedShortcut = false;
      const normalized = normalizeEvent(e, demoArea);
      if (normalized) {
        // Update state first
        state.update(normalized);
        // Process shortcut (this may trigger onAction synchronously)
        shortcutEngine.process(normalized);
        // If a shortcut was matched, prevent default browser behavior
        if (matchedShortcut) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
        updateCurrentState();
      }
    };

    // Use capture phase to intercept before other handlers
    window.addEventListener("keydown", handleShortcutKeydown, true);
    window.addEventListener("keyup", handleShortcutKeyup, true);
    demoArea.addEventListener("mousedown", handleShortcutMouse, true);
    demoArea.addEventListener("pointerdown", handleShortcutMouse, true);
    cleanupMap.set(`input-${storyId}-shortcuts`, () => {
      window.removeEventListener("keydown", handleShortcutKeydown, true);
      window.removeEventListener("keyup", handleShortcutKeyup, true);
      demoArea.removeEventListener("mousedown", handleShortcutMouse, true);
      demoArea.removeEventListener("pointerdown", handleShortcutMouse, true);
    });
  }

  // Instructions
  const instructions = document.createElement("div");
  instructions.style.cssText = `
    padding: 15px;
    background: #e3f2fd;
    border-left: 4px solid #2196F3;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.6;
  `;
  instructions.innerHTML = `
    <strong>Try these interactions:</strong><br/>
    • Keyboard: Press any key<br/>
    • Mouse: Click, drag, scroll wheel<br/>
    • Touch: Tap, pinch, rotate (on touch devices)<br/>
    • Pen: Use a stylus (if available)<br/>
    • Gestures: Drag for pan, pinch for zoom, rotate with two fingers<br/>
    • Clicks: Single, double, triple click<br/>
    • Long Press: Hold for 500ms<br/>
    • Shortcuts: Ctrl+Shift+H, Ctrl+K then Ctrl+C, Ctrl+LeftClick, Alt+RightClick, A + S + D (key sequence)
  `;
  container.insertBefore(instructions, statusDiv);

  return container;
}

/**
 * Renders a story with the given arguments and story ID.
 * Manages cleanup of event listeners and resources.
 */
function renderStory(args: InputTypesArgs, storyId: string): HTMLElement {
  const existingCleanup = cleanupMap.get(storyId);
  if (existingCleanup) {
    existingCleanup();
    cleanupMap.delete(storyId);
  }

  // Clear any existing cleanup functions for this story
  const keysToRemove: string[] = [];
  cleanupMap.forEach((_, key) => {
    if (key.startsWith(`input-${storyId}-`)) {
      keysToRemove.push(key);
    }
  });
  keysToRemove.forEach((key) => {
    const cleanup = cleanupMap.get(key);
    if (cleanup) cleanup();
    cleanupMap.delete(key);
  });

  const element = createInputDemo(args, storyId);
  const cleanupFunctions: Array<() => void> = [];

  // Collect all cleanup functions for this story
  Array.from(cleanupMap.entries())
    .filter(([k]) => k.startsWith(`input-${storyId}-`))
    .forEach(([, cleanupFn]) => cleanupFunctions.push(cleanupFn));

  cleanupMap.set(storyId, () => {
    cleanupFunctions.forEach((fn) => fn());
    cleanupMap.delete(storyId);
  });

  return element;
}

export const AllInputTypes: Story = {
  args: {
    showKeyboard: true,
    showMouse: true,
    showTouch: true,
    showPen: true,
    showGestures: true,
    showClicks: true,
    showLongPress: true,
    showShortcuts: true,
  },
  render: (args) => renderStory(args, "all-input-types"),
};

export const KeyboardOnly: Story = {
  args: {
    showKeyboard: true,
    showMouse: false,
    showTouch: false,
    showPen: false,
    showGestures: false,
    showClicks: false,
    showLongPress: false,
    showShortcuts: false,
  },
  render: (args) => renderStory(args, "keyboard-only"),
};

export const MouseOnly: Story = {
  args: {
    showKeyboard: false,
    showMouse: true,
    showTouch: false,
    showPen: false,
    showGestures: false,
    showClicks: false,
    showLongPress: false,
    showShortcuts: false,
  },
  render: (args) => renderStory(args, "mouse-only"),
};

export const GesturesOnly: Story = {
  args: {
    showKeyboard: false,
    showMouse: true,
    showTouch: true,
    showPen: false,
    showGestures: true,
    showClicks: false,
    showLongPress: false,
    showShortcuts: false,
  },
  render: (args) => renderStory(args, "gestures-only"),
};
