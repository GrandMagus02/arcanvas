# Basic Interaction

The `@arcanvas/interaction` package provides a system for handling user interactions on DOM elements with typed metadata support.

<InteractionExample />

## Overview

The interaction system allows you to:

- Bind interaction handlers (Click, Hover, etc.) to DOM elements
- Attach metadata to elements for context-aware event handling
- Manage groups of interactive elements efficiently

## Usage

```typescript
import { Interactive, click, hover } from "@arcanvas/interaction";

// 1. Create an Interactive instance
const interactive = new Interactive<{ id: string }>();

// 2. Define interaction handlers
interactive.on(
  click((event) => {
    console.log("Clicked:", event.metadata?.id);
    console.log("Original Event:", event.originalEvent);
  })
);

interactive.on(
  hover((event) => {
    if (event.type === "hover:start") {
      console.log("Hover started:", event.metadata?.id);
    } else {
      console.log("Hover ended:", event.metadata?.id);
    }
  })
);

// 3. Watch elements with metadata
const element = document.getElementById("my-box");
interactive.watch(element, { id: "box-1" });

// 4. Cleanup when done
interactive.destroy();
```

## Metadata

One of the key features is the ability to attach strongly-typed metadata to elements. This allows you to retrieve context about the interacted element without relying on DOM attributes or global lookups.

```typescript
interface MyMetadata {
  id: string;
  role: "button" | "link";
  data: any;
}

const interactive = new Interactive<MyMetadata>();

interactive.watch(element, {
  id: "btn-1",
  role: "button",
  data: { foo: "bar" },
});
```

## Available Interactions

### Click

Triggers when an element is clicked.

```typescript
import { click } from "@arcanvas/interaction";

interactive.on(
  click((e) => {
    /* ... */
  })
);
```

### Hover

Triggers `hover:start` (mouseenter) and `hover:end` (mouseleave) events.

```typescript
import { hover } from "@arcanvas/interaction";

interactive.on(
  hover((e) => {
    if (e.type === "hover:start") {
      // Mouse entered
    } else {
      // Mouse left
    }
  })
);
```
