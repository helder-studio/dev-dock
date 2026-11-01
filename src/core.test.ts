import { describe, expect, it, vi } from 'vitest';
import { devDock, dockLabel, sameStatuses } from './core';

describe('dockLabel', () => {
  it('lists active tool statuses', () => {
    expect(dockLabel([null, null])).toBe('🛠 Dev');
    expect(dockLabel(['flaky', null, 'Time warped: 31 Dec'])).toBe('🛠 flaky · Time warped: 31 Dec');
  });
});

describe('sameStatuses', () => {
  it('compares by position and value', () => {
    expect(sameStatuses(['a', null], ['a', null])).toBe(true);
    expect(sameStatuses(['a', null], ['a', 'b'])).toBe(false);
    expect(sameStatuses(['a'], ['a', null])).toBe(false);
  });
});

describe('devDock', () => {
  it('opens on a tab, remembers it, and notifies', () => {
    const listener = vi.fn();
    const unsubscribe = devDock.subscribe(listener);
    devDock.open('timewarp');
    expect(devDock.getState()).toEqual({ open: true, tabId: 'timewarp' });
    devDock.close();
    devDock.open();
    expect(devDock.getState()).toEqual({ open: true, tabId: 'timewarp' });
    devDock.select('network-chaos');
    expect(devDock.getState().tabId).toBe('network-chaos');
    unsubscribe();
    devDock.close();
    expect(listener).toHaveBeenCalledTimes(4);
  });
});
