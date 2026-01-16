# WorldEngineRenderSystem

WorldEngineRenderSystem is the top-level system for rendering large worlds.

It combines:
- WorldScene: manages objects with world-space coordinates
- WorldCamera: camera with world-space position
- WorldRenderer: handles camera-relative rendering

Usage:
```ts
const scene = new WorldScene({ width: 800, height: 600 });
const camera = new WorldCamera(arc);

// Add objects at world-space coordinates
const obj = new WorldRenderObject(mesh, material);
obj.setWorldPosition(1e12, 0, 0); // 1 trillion units away!
scene.addObject(obj);

// Create render system
const renderSystem = new WorldEngineRenderSystem(canvas, scene, camera, {
  backend: 'webgl'
});

// Render loop
function frame() {
  camera.move(10, 0, 0); // Camera can also be at huge coordinates
  renderSystem.renderOnce();
  requestAnimationFrame(frame);
}
```

The system handles all the complexity of:
- Floating origin / camera-relative rendering
- Automatic origin recentering when camera moves far
- Converting world coordinates to local coordinates for GPU
- Maintaining precision regardless of world scale

## Methods

- [renderOnce](#renderonce)
- [setScene](#setscene)
- [setCamera](#setcamera)

### renderOnce

Renders a single frame.

| Method | Type |
| ---------- | ---------- |
| `renderOnce` | `() => void` |

### setScene

Updates the scene reference.

| Method | Type |
| ---------- | ---------- |
| `setScene` | `(scene: WorldScene) => void` |

### setCamera

Updates the camera reference.

| Method | Type |
| ---------- | ---------- |
| `setCamera` | `(camera: Camera or WorldCamera) => void` |

# Interfaces

- [WorldEngineRenderSystemOptions](#worldenginerendersystemoptions)

## WorldEngineRenderSystemOptions

Options for WorldEngineRenderSystem.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `backend` | `BackendType` | The backend to use for rendering. |

