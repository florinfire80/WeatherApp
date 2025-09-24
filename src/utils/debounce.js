// Debounce utility: delay function execution until user stops triggering it for `delay` ms.
export function debounce(fn, delay = 300) {
  let t;
  return function debounced(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), delay);
  };
}
