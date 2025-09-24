'use strict';

// Lightweight event bus for decoupled communication
// Usage:
// import { on, off, emit } from '../events/eventBus';
// on('weather:location-refresh', detail => { ... })
// emit('weather:location-refresh', { city })

const listeners = new Map(); // eventName -> Set<handler>

export function on(eventName, handler) {
  if (!listeners.has(eventName)) listeners.set(eventName, new Set());
  listeners.get(eventName).add(handler);
  return () => off(eventName, handler);
}

export function off(eventName, handler) {
  const set = listeners.get(eventName);
  if (!set) return;
  set.delete(handler);
  if (set.size === 0) listeners.delete(eventName);
}

export function emit(eventName, detail) {
  const set = listeners.get(eventName);
  if (!set) return;
  for (const handler of Array.from(set)) {
    try {
      handler(detail);
    } catch (e) {
      // Fail soft; continue delivery to other handlers
      console.error('[eventBus] handler error for', eventName, e);
    }
  }
}

// Helper to listen once
export function once(eventName, handler) {
  const dispose = on(eventName, data => {
    dispose();
    handler(data);
  });
  return dispose;
}
