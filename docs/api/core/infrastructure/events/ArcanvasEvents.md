
# Interfaces

- [ArcanvasEvents](#arcanvasevents)

## ArcanvasEvents

Event map for Arcanvas events.
Defines all events that Arcanvas can emit and their argument types.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `resize` | `[width: number, height: number]` | Emitted when the canvas is resized. param: width - The new width in device pixels.param: height - The new height in device pixels. |
| `focus` | `[]` | Emitted when the canvas gains focus. |
| `blur` | `[]` | Emitted when the canvas loses focus. |


Examples:

```typescript
const app = new Arcanvas(canvas);
app.on("resize", (width, height) => {
  // TypeScript knows width and height are numbers
});
app.on("focus", () => {
  // No arguments
});
```

