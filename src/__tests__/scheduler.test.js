import {
  scheduleMicrotask,
  scheduleFrame,
  scheduleIdle,
} from '../components/scheduler/scheduler.js';

// We can't guarantee exact timing, but we can assert ordering relationships.

describe('scheduler utilities', () => {
  test('microtask runs before frame callback', done => {
    const events = [];
    scheduleFrame(() => {
      events.push('frame');
      expect(events[0]).toBe('micro');
      done();
    });
    scheduleMicrotask(() => events.push('micro'));
  });

  test('idle eventually runs (fallback safe)', done => {
    let ran = false;
    scheduleIdle(
      () => {
        ran = true;
        expect(ran).toBe(true);
        done();
      },
      { timeout: 100 }
    );
  });
});
