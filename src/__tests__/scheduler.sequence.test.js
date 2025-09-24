/** @jest-environment jsdom */
import {
  sequence,
  once,
  scheduleMicrotask,
} from '../components/scheduler/scheduler.js';

// Utility to flush microtasks
function flushMicrotasks() {
  return new Promise(resolve => scheduleMicrotask(resolve));
}

describe('sequence advanced behavior', () => {
  test('executes functions in order even with async and thrown errors', async () => {
    const calls = [];
    sequence(
      () => calls.push('a-sync-immediate'),
      async () => {
        calls.push('b-async-start');
        await Promise.resolve();
        calls.push('b-async-end');
      },
      () => {
        calls.push('c-throws');
        throw new Error('boom');
      },
      () => calls.push('d-after-error')
    );

    // Allow sequence microtask + inner async to settle
    await flushMicrotasks();
    await flushMicrotasks();

    expect(calls).toEqual([
      'a-sync-immediate',
      'b-async-start',
      'b-async-end',
      'c-throws',
      'd-after-error',
    ]);
  });
});

describe('once utility', () => {
  test('runs only the first time', () => {
    const spy = jest.fn();
    const init = once(spy);
    init('first');
    init('second');
    init();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('first');
  });
});
