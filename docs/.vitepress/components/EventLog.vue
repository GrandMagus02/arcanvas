<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';

export type ResizeDirection = 'none' | 'vertical' | 'horizontal' | 'both';

interface Props {
  /** Maximum number of events to store */
  maxSize?: number;
  /** Resize direction: 'none' | 'vertical' | 'horizontal' | 'both'. Default: 'vertical' */
  resizable?: ResizeDirection;
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 10,
  resizable: 'vertical',
});

const resizeStyle = computed(() => {
  if (props.resizable === 'none') return 'none';
  return props.resizable;
});

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

// Good color palette for dark backgrounds - distinct and visible
const GROUP_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange-red
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#0ea5e9', // Sky
  '#22c55e', // Emerald
  '#eab308', // Yellow
] as const;

// Unicode shapes for visual distinction
const GROUP_SHAPES = ['●', '▲', '■', '◆', '◉', '◈', '◐', '◑'] as const;

type EventLogEntry = {
  timestamp: string;
  message: string;
  level: LogLevel;
  group?: string;
  groupColor: string;
  groupShape: string;
};

const events = ref<EventLogEntry[]>([]);
const autoscroll = ref(true);
const logContainerRef = ref<HTMLElement | null>(null);

/**
 * Simple hash function to convert group name to a number.
 */
function hashGroup(group: string | number): number {
  const str = String(group);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get color and shape for a group.
 */
function getGroupStyle(group: string | number | undefined): { color: string; shape: string } {
  if (group === undefined) {
    return { color: '#888', shape: '' };
  }

  const hash = hashGroup(group);
  const colorIndex = hash % GROUP_COLORS.length;
  const shapeIndex = hash % GROUP_SHAPES.length;

  return {
    color: GROUP_COLORS[colorIndex]!,
    shape: GROUP_SHAPES[shapeIndex]!,
  };
}

/**
 * Add a new log entry to the event log.
 */
function log(message: string, level: LogLevel = 'INFO', group?: string | number) {
  const { color, shape } = getGroupStyle(group);
  events.value.push({
    timestamp: new Date().toISOString(),
    message,
    level,
    group: group !== undefined ? String(group) : undefined,
    groupColor: color,
    groupShape: shape,
  });

  // Remove oldest events if exceeding max size
  if (events.value.length > props.maxSize) {
    events.value.shift();
  }

  // Auto-scroll to bottom if enabled
  if (autoscroll.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
}

/**
 * Log an INFO message.
 */
function info(message: string, group?: string | number) {
  log(message, 'INFO', group);
}

/**
 * Log a WARN message.
 */
function warn(message: string, group?: string | number) {
  log(message, 'WARN', group);
}

/**
 * Log an ERROR message.
 */
function error(message: string, group?: string | number) {
  log(message, 'ERROR', group);
}

/**
 * Scroll the log container to show the last entry just before the gap.
 */
function scrollToBottom() {
  if (logContainerRef.value) {
    // Scroll to just before the gap starts - show last entry with minimal gap visible
    const scrollHeight = logContainerRef.value.scrollHeight;
    const clientHeight = logContainerRef.value.clientHeight;
    const paddingBottom = 120; // Match the padding-bottom value

    // Position viewport so bottom is at the start of padding (just before gap)
    // The padding starts at scrollHeight - paddingBottom
    // So scrollTop = (scrollHeight - paddingBottom) - clientHeight
    const targetScroll = scrollHeight - clientHeight - paddingBottom;

    // Ensure we don't scroll to negative position
    logContainerRef.value.scrollTop = Math.max(0, targetScroll);
  }
}

/**
 * Clear all events.
 */
function clear() {
  events.value = [];
}

// Expose log functions and clear function to parent component
defineExpose({
  log,
  info,
  warn,
  error,
  clear,
});
</script>

<template>
  <div class="event-log" :class="`event-log--resize-${resizable}`" :style="{ resize: resizeStyle }">
    <div class="log-header">
      <span>Log</span>
      <label class="autoscroll-control">
        <input type="checkbox" v-model="autoscroll" />
        <span>Auto-scroll</span>
      </label>
    </div>
    <div class="log-container" ref="logContainerRef">
      <div v-if="events.length === 0" class="log-empty">No events yet</div>
      <div v-for="(event, i) in events" :key="event.timestamp" class="log-entry"
        :class="`log-entry--${event.level.toLowerCase()}`">
        <span class="timestamp">{{ event.timestamp }}</span>
        <span class="log-level" :class="`log-level--${event.level.toLowerCase()}`">[{{ event.level }}]</span>
        <span v-if="event.groupShape" class="group-shape" :style="{ color: event.groupColor }">{{ event.groupShape
        }}</span>
        <span class="message">{{ event.message }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-log {
  width: 100%;
  background: #111;
  font-family: monospace;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

/* Resize handle styling */
.event-log--resize-vertical {
  resize: vertical;
  min-height: 140px;
  height: 180px;
}

.event-log--resize-horizontal {
  resize: horizontal;
  min-width: 200px;
}

.event-log--resize-both {
  resize: both;
  min-width: 200px;
  min-height: 100px;
}

.event-log--resize-none {
  resize: none;
}

.log-header {
  color: #e5e5e5;
  background: #2a2a2a;
  font-weight: bold;
  padding: 12px 16px;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.05em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  width: 100%;
  box-sizing: border-box;
}

.autoscroll-control {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: normal;
  text-transform: none;
  cursor: pointer;
  user-select: none;
  color: #b0b0b0;
}

.autoscroll-control:hover {
  color: #d0d0d0;
}

.autoscroll-control input[type="checkbox"] {
  cursor: pointer;
  margin: 0;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 8px 16px;
  padding-bottom: 120px;
  /* Add empty space at the end to show no more logs */
}

.log-empty {
  color: #555;
  font-style: italic;
  padding: 8px 0;
}

.log-entry {
  color: #e5e5e5;
  animation: fadeIn 0.2s ease-out;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.4;
}

.log-level {
  font-weight: bold;
  font-size: 11px;
  flex-shrink: 0;
}

.log-level--info {
  color: #3b82f6;
}

.log-level--warn {
  color: #f59e0b;
}

.log-level--error {
  color: #ef4444;
}

.timestamp {
  color: #888;
  font-size: 11px;
  flex-shrink: 0;
}

.group-shape {
  font-size: 10px;
  flex-shrink: 0;
  line-height: 1;
}

.message {
  flex: 1;
  word-break: break-word;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
