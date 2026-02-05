<script setup lang="ts">
import { Interactive, click, hover } from '@arcanvas/interaction';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import EventLog from './EventLog.vue';

const containerRef = ref<HTMLElement | null>(null);
const eventLogRef = ref<InstanceType<typeof EventLog> | null>(null);

function addLog(msg: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO', group?: string | number) {
  console.log(msg);
  eventLogRef.value?.log(msg, level, group);
}

let interactive: Interactive | null = null;

onMounted(() => {
  if (!containerRef.value) return;

  // Create interactive instance
  interactive = new Interactive();

  // Define interactions
  interactive.on(click((event) => {
    // Group events by event type - all clicks have same color/shape
    // Display duration in milliseconds
    const label = event.metadata?.id ?? event.target?.textContent ?? 'element';
    addLog(`Click: ${label} (${event.duration}ms)`, 'INFO', 'click');

    // Visual feedback
    const target = event.target as HTMLElement;
    target.style.filter = 'brightness(1.5)';
    setTimeout(() => {
      target.style.filter = 'brightness(1)';
    }, 150);
  }));

  interactive.on(hover((event) => {
    const label = event.metadata?.id ?? event.target?.textContent ?? 'element';

    // Group hover events by event type
    if (event.type === 'hover:start') {
      addLog(`Hover Start: ${label}`, 'INFO', 'hover:start');
      event.target.style.transform = 'translate(-50%, -50%) scale(1.1)';
      event.target.style.zIndex = '10';
      event.target.style.border = '2px solid white';
    } else {
      addLog(`Hover End: ${label}`, 'INFO', 'hover:end');
      event.target.style.transform = 'translate(-50%, -50%) scale(1)';
      event.target.style.zIndex = '1';
      event.target.style.border = 'none';
    }
  }));

  // Find the interactive div and watch it
  const interactiveDiv = containerRef.value.querySelector('.interactive-div') as HTMLElement;
  if (interactiveDiv) {
    interactive?.watch(interactiveDiv);
  }
});

onBeforeUnmount(() => {
  interactive?.destroy();
});
</script>

<template>
  <div class="interaction-example">
    <div class="canvas-area" ref="containerRef">
      <div class="instruction">Hover and click the interactive div</div>
      <div class="interactive-div" style="background-color: #3b82f6;">Interactive div</div>
    </div>
    <div class="log-area">
      <EventLog ref="eventLogRef" :max-size="100" />
    </div>
  </div>
</template>

<style scoped>
.interaction-example {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
  width: 100%;
  max-width: none;
  min-width: 0;
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .interaction-example {
    /* Remove row layout for wide screens */
    flex-direction: column;
    min-height: 400px;
    /* Remove the previous fixed max-width for fill-width intent */
    max-width: none;
    width: 100%;
  }
}

.canvas-area {
  flex: none;
  position: relative;
  background: #252525;
  min-height: 300px;
  overflow: hidden;
  width: 100%;
}

.instruction {
  position: absolute;
  top: 16px;
  left: 16px;
  color: #666;
  font-size: 14px;
  pointer-events: none;
}

.interactive-div {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 120px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 16px;
}

.log-area {
  background: #181818;
  border-top: 1px solid #333;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
}
</style>
