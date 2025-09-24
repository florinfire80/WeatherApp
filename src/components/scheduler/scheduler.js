// Lightweight scheduling helpers for performance-friendly task deferral
// Falls back gracefully if APIs not supported.
'use strict';

export function scheduleMicrotask(fn) {
  Promise.resolve()
    .then(fn)
    .catch(() => {
      // swallow microtask errors (optional: could log in debug mode)
    });
}

export function scheduleFrame(fn) {
  if (typeof requestAnimationFrame === 'function') {
    return requestAnimationFrame(fn);
  }
  return setTimeout(fn, 16);
}

export function scheduleIdle(fn, { timeout = 1500 } = {}) {
  if (typeof requestIdleCallback === 'function') {
    return requestIdleCallback(fn, { timeout });
  }
  // Fallback: defer a bit after a frame
  return setTimeout(fn, 50);
}

export function sequence(...fns) {
  // Start the sequence in a microtask and run tasks in an async loop.
  // This ensures predictable ordering and aligns with test expectations
  // that two "microtask flushes" are enough to observe async steps.
  scheduleMicrotask(() => {
    (async () => {
      for (const fn of fns) {
        try {
          // Await each step so async functions and thrown errors
          // are handled sequentially without aborting the chain.
          await fn();
        } catch {
          // swallow individual step errors to continue sequence
        }
      }
    })().catch(() => {
      // final safety catch; individual errors already handled
    });
  });
}

// Helper to wrap a function to ensure it only executes once (idempotent init patterns)
export function once(fn) {
  let done = false;
  return (...args) => {
    if (done) return;
    done = true;
    return fn(...args);
  };
}
