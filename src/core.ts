import type { ReactNode } from 'react';

/**
 * A tool shown as a tab. Tools define this shape themselves (no import of dev-dock needed):
 * `networkChaosTab` from `@helder-studio/network-chaos`, `timewarpTab` from `@helder-studio/timewarp`.
 */
export interface DevDockTab {
  id: string;
  title: string;
  /** Short status shown on the floating button while the tool is active; `null` when idle. */
  status?: () => string | null;
  /** Called with a listener whenever `status` may have changed; returns an unsubscribe. */
  subscribe?: (listener: () => void) => () => void;
  render: () => ReactNode;
}

/** `🛠 flaky · Time warped: 31 Dec` when tools are active, `🛠 Dev` otherwise. */
export function dockLabel(statuses: (string | null)[]): string {
  const active = statuses.filter((s): s is string => Boolean(s));
  return `🛠 ${active.length ? active.join(' · ') : 'Dev'}`;
}

type DockState = { open: boolean; tabId: string | null };

let state: DockState = { open: false, tabId: null };
const listeners = new Set<() => void>();

function set(next: DockState) {
  state = next;
  for (const listener of listeners) listener();
}

/** Open or close the dock from your own code, e.g. a shake handler or a dev menu item. */
export const devDock = {
  open: (tabId?: string) => set({ open: true, tabId: tabId ?? state.tabId }),
  close: () => set({ ...state, open: false }),
  select: (tabId: string) => set({ ...state, tabId }),
  getState: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
