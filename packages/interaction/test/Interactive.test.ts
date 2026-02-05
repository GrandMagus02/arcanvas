import { beforeAll, describe, expect, it } from "bun:test";
import { Window as HappyWindow } from "happy-dom";
import { Interactive } from "../src/Interactive";
import { click } from "../src/interactions/pointer/click/click";
import type { ClickEvent } from "../src/interactions/pointer/click/types";
import { hover } from "../src/interactions/pointer/hover/hover";

describe("Interactive", () => {
  beforeAll(() => {
    const window = new HappyWindow();
    global.document = window.document as unknown as Document;
    global.window = window as unknown as Window & typeof globalThis;
    global.HTMLElement = window.HTMLElement as unknown as typeof HTMLElement;
    global.Event = window.Event as unknown as typeof Event;
    global.MouseEvent = window.MouseEvent as unknown as typeof MouseEvent;
    global.PointerEvent = window.PointerEvent as unknown as typeof PointerEvent;
  });

  it("initializes properly", () => {
    const element = document.createElement("div");
    const i = new Interactive(element);
    let capturedEvent: ClickEvent | undefined;

    i.on(
      click((event) => {
        capturedEvent = event;
      })
    );
    expect(i.elements).toEqual([element]);

    // Trigger click using pointerdown and pointerup
    const pointerDown = new PointerEvent("pointerdown", { button: 0, bubbles: true });
    const pointerUp = new PointerEvent("pointerup", { button: 0, bubbles: true });
    element.dispatchEvent(pointerDown);
    element.dispatchEvent(pointerUp);

    expect(capturedEvent).toBeDefined();
    expect(capturedEvent?.type).toBe("click");
    expect(capturedEvent?.target).toBe(element);
    expect(capturedEvent?.duration).toBeGreaterThanOrEqual(0);

    // Cleanup
    i.destroy();
    expect(i.elements).toEqual([]);
  });

  it("handles dynamic element addition", () => {
    const i = new Interactive();
    let clickCount = 0;

    i.on(
      click(() => {
        clickCount++;
      })
    );

    const element = document.createElement("button");
    i.watch(element);

    const pointerDown = new PointerEvent("pointerdown", { button: 0, bubbles: true });
    const pointerUp = new PointerEvent("pointerup", { button: 0, bubbles: true });
    element.dispatchEvent(pointerDown);
    element.dispatchEvent(pointerUp);
    expect(clickCount).toBe(1);

    i.unwatch(element);
    element.dispatchEvent(pointerDown);
    element.dispatchEvent(pointerUp);
    expect(clickCount).toBe(1);
  });

  it("handles hover interaction", () => {
    const element = document.createElement("div");
    const i = new Interactive(element);
    const events: string[] = [];

    i.on(
      hover((event) => {
        events.push(event.type);
      })
    );

    const mouseEnter = new MouseEvent("mouseenter");
    element.dispatchEvent(mouseEnter);

    expect(events).toContain("hover:start");

    const mouseLeave = new MouseEvent("mouseleave");
    element.dispatchEvent(mouseLeave);

    expect(events).toContain("hover:end");
  });
});
